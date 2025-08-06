// Points vertex shader
attribute float seed;
attribute vec3 color;

uniform sampler2D uPositions;
uniform float uTime;
uniform float uDpr;

varying float vSeed;
varying vec3 vColor;

const float MIN_PT_SIZE = 12.0;
const float LG_PT_SIZE = 24.0;
const float XL_PT_SIZE = 48.0;

void main() {
  // DPR adjusted point sizes (ensuring uniformity across devices)
  float minPtSize = MIN_PT_SIZE * uDpr;
  float lgPtSize = LG_PT_SIZE * uDpr;
  float xlPtSize = XL_PT_SIZE * uDpr;

  // Sample the position from the simulation texture using the UV
  vec4 simulationData = texture2D(uPositions, uv);
  vec3 pos = simulationData.xyz;
  
  // Transform the position into world space.
  vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
  // Transform to view and clip space.
  vec4 viewPosition = viewMatrix * worldPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;
  
  // Dynamic point size based on seed and distance from camera
  float stepSeed = step(0.95, seed); // Some of the points will be XL size
  float size = mix(mix(minPtSize, lgPtSize, seed), xlPtSize, stepSeed); // Random size based on seed

  float attenuationFactor = 1.0 / -viewPosition.z; // Size attenuation (get smaller as distance increases)
  float pointSize = size * attenuationFactor;

  vSeed = seed;
  vColor = color;

  gl_PointSize = pointSize;
  gl_Position = projectedPosition;
}