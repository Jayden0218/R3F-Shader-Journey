uniform sampler2D uTexture;
uniform vec3 uColor;

void main()
{
  // gl_PointCoord depend on each particles of the textures
  float textureAlpha = texture(uTexture, gl_PointCoord).r;
  gl_FragColor = vec4(uColor,textureAlpha);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}