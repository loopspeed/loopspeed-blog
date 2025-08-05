#pragma glslify: noise = require('glsl-noise/simplex/2d')
#pragma glslify: snoise = require('glsl-noise/simplex/3d')
#pragma glslify: rotation3dX = require(glsl-rotate/rotation-3d-x)
#pragma glslify: rotation3dY = require(glsl-rotate/rotation-3d-y)
#pragma glslify: rotation3dZ = require(glsl-rotate/rotation-3d-z)

uniform float uTime; 
uniform sampler2D uScatteredPositions;
uniform sampler2D uLoopPositions;
uniform sampler2D uLeftSpherePositions;
uniform sampler2D uRightSpherePositions;
uniform sampler2D uProcessPositions;
uniform sampler2D uSeedTexture;

uniform float uScatteredAmount;
uniform float uAboutAmount;
uniform float uProcessAmount;

// Global tunnel uniforms passed in from the CPU.
uniform vec3 uGlobalCenter;
uniform vec3 uGlobalDir;

const float TUNNEL_STRENGTH = 0.4;   // 0.0 = no tunnel effect, 1.0 = full attraction
const float CURL_NOISE_SCALE = 0.8;

varying vec2 vUv;

vec3 snoiseVec3(in vec3 x) {
  float s  = snoise(vec3(x));
  float s1 = snoise(vec3(x.y - 19.1, x.z + 33.4, x.x + 47.2));
  float s2 = snoise(vec3(x.z + 74.2, x.x - 124.5, x.y + 99.4));
  return vec3(s, s1, s2);
}

vec3 curlNoise(in vec3 p) {
  const float divisor = 1.0 / (2.0 * CURL_NOISE_SCALE);
  
  // Pre-compute offsets
  vec3 dx = vec3(CURL_NOISE_SCALE, 0.0, 0.0);
  vec3 dy = vec3(0.0, CURL_NOISE_SCALE, 0.0);
  vec3 dz = vec3(0.0, 0.0, CURL_NOISE_SCALE);

  // Compute all noise samples
  vec3 p_x0 = snoiseVec3(p - dx);
  vec3 p_x1 = snoiseVec3(p + dx);
  vec3 p_y0 = snoiseVec3(p - dy);
  vec3 p_y1 = snoiseVec3(p + dy);
  vec3 p_z0 = snoiseVec3(p - dz);
  vec3 p_z1 = snoiseVec3(p + dz);

  // Compute curl components directly
  vec3 curl = vec3(
    p_y1.z - p_y0.z - p_z1.y + p_z0.y,
    p_z1.x - p_z0.x - p_x1.z + p_x0.z,
    p_x1.y - p_x0.y - p_y1.x + p_y0.x
  ) * divisor;
  
  return normalize(curl);
}

vec3 applyNoise(inout vec3 pos, in float time) {
  // Add noise to the computed position.
  vec3 noiseVec = curlNoise(pos * 0.5 + time * 0.3);
  float noiseStrength = 0.05 + (0.15 * (sin(time) * 0.5 + 0.5));
  pos += noiseVec * noiseStrength;
  return pos;
}

void main() {
  // Early exit optimization: sample scattered first for quick path
  vec3 scatteredPos = texture2D(uScatteredPositions, vUv).xyz;
  
  // If scattered amount is 1, use scatteredPos directly and return out.
  if (uScatteredAmount >= 1.0) {
    gl_FragColor = vec4(applyNoise(scatteredPos, uTime), 0.0);
    return;
  }
  
  // Conditional texture sampling based on blend amounts
  vec3 loopPos = texture2D(uLoopPositions, vUv).xyz;
  float seed = texture2D(uSeedTexture, vUv).r;
  
  vec3 pos;

  // In the About section we animate the particles between two spheres.
  vec3 aboutFlowPos = loopPos; // Default to loop position instead of zero
  float orangeAmount = 0.0;
    
  // Only run sphere/tunnel calculations if uAboutAmount is non-zero.
  if (uAboutAmount > 0.0) {
    // Sample sphere positions only when needed.
    vec3 leftSpherePos  = texture2D(uLeftSpherePositions, vUv).xyz;
    vec3 rightSpherePos = texture2D(uRightSpherePositions, vUv).xyz;
    
    // Pre-compute time-based values
    float timeOffset = uTime * 0.5;
    float spatialOffset = vUv.x * 5.0 + seed * 4.0;
    
    // Compute a raw flow factor between 0 and 1.
    float rawFlow = sin(spatialOffset + timeOffset) * 0.5 + 0.5;
    // Adjust 0.4 and 0.6 to control the flow range so that particles stay at either sphere for a period
    // Currently 33% of the points are in the tunnel.
    orangeAmount = smoothstep(0.33, 0.66, rawFlow) * uAboutAmount;

    // Interpolate between the sphere positions.
    aboutFlowPos = mix(leftSpherePos, rightSpherePos, orangeAmount);

    // Ease in and out the tunnel amount.
    float tunnelFactor = smoothstep(0.0, 0.1, orangeAmount) * (1.0 - smoothstep(0.9, 1.0, orangeAmount));

    // Project aboutFlowPos onto the global tunnel line.
    vec3 offset = aboutFlowPos - uGlobalCenter;
    float t = dot(offset, uGlobalDir);
    vec3 projGlobal = uGlobalCenter + t * uGlobalDir;
      
    // Blend aboutFlowPos toward the global tunnel.
    aboutFlowPos = mix(aboutFlowPos, projGlobal, TUNNEL_STRENGTH * tunnelFactor);
    // Apply rotation
    aboutFlowPos *= rotation3dX(timeOffset);
  }

  vec3 processPos = loopPos; // Default to loop position instead of zero

  // Process section - only compute if needed
  if (uProcessAmount > 0.0) {
    processPos = texture2D(uProcessPositions, vUv).xyz;
    processPos *= rotation3dZ(uTime * seed * 0.8);
  }

  if (uProcessAmount > 0.5) {
    // Set the orange amount so that those near the bottom of the ring are more orange.
    orangeAmount = mix(0.0, 1.0, clamp(0.0, 1.0, processPos.y + 0.2 * processPos.x ));
  }

  // Always non-orange when scatteredAmount is 1.0
  orangeAmount *= 1.0 - uScatteredAmount; 
  
  // Optimized position blending - start with default and only mix when needed
  pos = loopPos; // Default base position
  
  // Apply about flow if needed
  if (uAboutAmount > 0.0) {
    pos = mix(pos, aboutFlowPos, uAboutAmount);
  }
  
  // Apply process position if needed
  if (uProcessAmount > 0.0) {
    pos = mix(pos, processPos, uProcessAmount);
  }
  
  // Apply scattered position if needed (final override)
  if (uScatteredAmount > 0.0) {
    pos = mix(pos, scatteredPos, uScatteredAmount);
  }


  // Apply noise to the final position.
  pos = applyNoise(pos, uTime);
  
  gl_FragColor = vec4(pos, orangeAmount);
}
