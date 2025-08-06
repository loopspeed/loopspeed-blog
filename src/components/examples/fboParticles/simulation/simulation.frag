#pragma glslify: noise = require('glsl-noise/simplex/2d')
#pragma glslify: snoise = require('glsl-noise/simplex/3d')
#pragma glslify: rotation3dX = require(glsl-rotate/rotation-3d-x)
#pragma glslify: rotation3dY = require(glsl-rotate/rotation-3d-y)
#pragma glslify: rotation3dZ = require(glsl-rotate/rotation-3d-z)

uniform sampler2D uScatteredPositions;
uniform sampler2D uModelPositions;
uniform sampler2D uSpherePositions;
uniform sampler2D uRingPositions;
uniform sampler2D uSeedTexture;

uniform float uTime;
uniform float uScatteredAmount;
uniform float uSphereAmount;
uniform float uRingAmount;

varying vec2 vUv;

const float CURL_NOISE_SCALE = 1.5;

// Noise related functions (not important for the main logic)

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
  vec3 noiseVec = curlNoise(pos * 0.5 + time * 0.3);
  float noiseStrength = 0.1 + (0.15 * (sin(time * 2.0) * 0.5 + 0.5));
  pos += noiseVec * noiseStrength;
  return pos;
}

void main() {
  // Sample the scattered positions texture
  vec3 scatteredPos = texture2D(uScatteredPositions, vUv).xyz;
  
  // If scattered amount is 1, use scatteredPos directly and return out
  if (uScatteredAmount >= 1.0) {
    gl_FragColor = vec4(scatteredPos, 0.0);
    return;
  }
  
  vec3 modelPos = texture2D(uModelPositions, vUv).xyz;
  vec3 pos = modelPos; // Default position is the model position

  // Conditional texture sampling based on blend amounts
  if (uSphereAmount > 0.0) {
    // Sample and apply sphere position if needed
    vec3 spherePos = texture2D(uSpherePositions, vUv).xyz;
    pos = mix(pos, spherePos, uSphereAmount);
  }

  if (uRingAmount > 0.0) {
    // Sample and apply ring position if needed
    vec3 ringPos = texture2D(uRingPositions, vUv).xyz;
    float seed = texture2D(uSeedTexture, vUv).r;
    pos = mix(pos, ringPos, uRingAmount);
    // Apply Z rotation to the ring
    pos *= rotation3dZ(uTime * seed * 0.8);
  }

  if (uScatteredAmount > 0.0) {
    pos = mix(pos, scatteredPos, uScatteredAmount);
  }
    
  pos = applyNoise(pos, uTime);
  
  gl_FragColor = vec4(pos, 1.0);
}
