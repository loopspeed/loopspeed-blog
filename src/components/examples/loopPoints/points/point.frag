// Loop points fragment shader

uniform float uTime;
uniform float uScatteredAmount;
uniform float uAboutAmount;
uniform float uProcessAmount;

varying float vSeed;
varying float vOrangeAmount;
varying vec3 vTealColor;
varying vec3 vOrangeColor;

const float SCATTERED_ALPHA = 0.0;
const float MAX_ALPHA = 0.24;

float random(in float x) {
  return fract(sin(x) * 43758.5453123);
}

void main() {
  // gl_PointCoord is a vec2 containing the coordinates of the fragment within the point being rendered
  float softCircleAlpha = 1.0 - distance(gl_PointCoord, vec2(0.5));
  softCircleAlpha = pow(softCircleAlpha, 2.0);

  float sharpCircleAlpha = 1.0 - step(0.25, distance(gl_PointCoord, vec2(0.25)));
  softCircleAlpha += sharpCircleAlpha;

  // FADE IN AND OUT CYCLE
  // Use the seed (vSeed) to generate an offset so that not all points start at the same time.
  float offset = random(vSeed);
  float period = mix(0.5, 4.0, random(vSeed * 2.0));
  float tCycle = mod(uTime + offset * period, period);
  float fadeDuration = period * 0.3; // 30% of the period
  
  // Fade in and out based on the cycle time
  float fadeIn = smoothstep(0.0, fadeDuration, tCycle);
  float fadeOut = 1.0 - smoothstep(period - fadeDuration, period, tCycle);
  float flickerAlpha = fadeIn * fadeOut;
  float alpha = softCircleAlpha * flickerAlpha * mix(1.0, SCATTERED_ALPHA, uScatteredAmount) * MAX_ALPHA;

  // The vOrangeAmount comes from the simulation shader position 4th component
  vec3 accentColour = mix(vTealColor, vOrangeColor, vOrangeAmount);

  gl_FragColor = vec4(accentColour, alpha);
}



