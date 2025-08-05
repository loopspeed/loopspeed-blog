// Loop points vertex shader
attribute float seed;
attribute vec3 tealColor;
attribute vec3 orangeColor;

uniform sampler2D uPositions;
uniform float uTime;
uniform float uDpr;

varying float vSeed;
varying float vOrangeAmount;
varying vec3 vTealColor;
varying vec3 vOrangeColor;

const float MIN_PT_SIZE = 10.0;
const float LG_PT_SIZE = 28.0;
const float XL_PT_SIZE = 56.0;

void main() {
  // DPR adjusted point sizes
  float minPtSize = MIN_PT_SIZE * uDpr;
  float lgPtSize = LG_PT_SIZE * uDpr;
  float xlPtSize = XL_PT_SIZE * uDpr;

  // Sample the final, displaced position from the simulation texture.
  vec4 simulationData = texture2D(uPositions, uv);
  vec3 pos = simulationData.xyz;
  
  // Transform the position into world space.
  vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
  
  // Transform to view and clip space.
  vec4 viewPosition = viewMatrix * worldPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;
  
  // Compute point size based on seed and depth
  float stepSeed = step(0.95, seed); // X% of the points will be XL size
  float baseSize = mix(mix(minPtSize, lgPtSize, seed), xlPtSize, stepSeed); // random seed for point size

  float attenuationFactor = 1.0 / -viewPosition.z; // particles get smaller as they move away from the camera
  float pointSize = baseSize * attenuationFactor;

  vSeed = seed;
  vOrangeAmount = simulationData.w;
  vTealColor = tealColor;
  vOrangeColor = orangeColor;
  
  gl_PointSize = pointSize;
  gl_Position = projectedPosition;
}
