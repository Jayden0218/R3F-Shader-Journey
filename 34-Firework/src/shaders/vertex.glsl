uniform float uSize;
uniform vec2 uResolution;
uniform float uProgress;

attribute float aSize;
attribute float aTimeMultiplier;

// Use remap to make 1->3 to 1->1.1 then wait until 3 with the same value
float remap(float value, float originMin, float originMax, float destinationMin, float destinationMax)
// value = value you want to remap
// originMin & Max = start and end of the range you want to transform
// destinationMin & Max = start and end of original range
{
    return destinationMin + (value - originMin) * (destinationMax - destinationMin) / (originMax - originMin);
}


void main()
{
  vec3 newPosition = position;

  float progress = uProgress * aTimeMultiplier;

  // Exploding
  float explodingProgress = remap(progress, 0.0,0.1,0.0,1.0);
  // Clamp the value so that it didnt move over the range
  explodingProgress = clamp(explodingProgress,0.0,1.0);
  // Previous was slow to fast, when add -, it become fast to slow
  explodingProgress = 1.0 - pow(1.0 - explodingProgress,3.0);
  newPosition = mix(vec3(0.0),newPosition,explodingProgress);

  // Falling
  float fallingProgress = remap(progress, 0.1,1.0,0.0,1.0);
  fallingProgress = clamp(fallingProgress,0.0,1.0);
  fallingProgress = 1.0 - pow(1.0 - fallingProgress,3.0);
  newPosition -= fallingProgress * 0.2;

  // Scalling
  float sizeOpeningProgress = remap(progress, 0.0,0.125,0.0,1.0);
  float sizeClosingProgress = remap(progress, 0.125 , 1.0, 1.0,0.0);
  // Get the min of these two
  float sizeProgress = min(sizeOpeningProgress,sizeClosingProgress);
  sizeProgress =clamp(sizeProgress,0.0,1.0);

  // Twinkling
  float twinklingProgress = remap(progress,0.2,0.8,0.0,1.0);
  twinklingProgress = clamp(twinklingProgress,0.0,1.0);
  float sizeTwinkling = sin(progress * 30.0) * 0.5 + 0.5;
  // there will be chance to get 0 which is dark only
  sizeTwinkling = 1.0 - sizeTwinkling * twinklingProgress;
  
  vec4 modelPosition = modelMatrix * vec4(newPosition,1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  gl_Position = projectionMatrix * viewPosition;

  // Deal with particles
  gl_PointSize = uSize * uResolution.y * aSize * sizeProgress * sizeTwinkling;
  // Add perspective to the particles (make them smaller when futher away)
  gl_PointSize *= 1.0 / - viewPosition.z;

  // Hide the particle completely when gl_pointSize is below 1.0
  if(gl_PointSize < 1.0)
    gl_Position = vec4(9999.9);
}