uniform vec3 uDepthColor;
uniform vec3 uSurfaceColor;
uniform float uColorOffset;
uniform float uColorMultiplier;

varying float vElevation;

void main()
{
  // vElevation only goes from -0.2 to 0.2, so need to add uColorOffset and uColorMultiplier to make it more variant
  float mixStrength = (vElevation + uColorOffset) * uColorMultiplier;
  vec3 color = mix(uDepthColor, uSurfaceColor,mixStrength);
  gl_FragColor = vec4(color,1.0);

  // Need to tell WebGlRenderer to output the color space (sRGB)
  #include <colorspace_fragment>
}

