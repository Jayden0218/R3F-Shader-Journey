varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

uniform sampler2D uDayTexture;
uniform sampler2D uNightTexture;
uniform sampler2D uSpecularCloudsTexture;
uniform vec3 uSunDirection;
uniform vec3 uAtmosphereDayColor;
uniform vec3 uAtmosphereTwilightColor;

void main()
{
  vec3 viewDirection = normalize(vPosition - cameraPosition);
  vec3 normal = normalize(vNormal);
  vec3 color = vec3(vUv, 1.0);

  float sunOrientation = dot(uSunDirection,normal);

  float dayMix = smoothstep(-0.25,0.5,sunOrientation);
  vec3 dayColor = texture(uDayTexture,vUv).rgb;
  vec3 nightColor = texture(uNightTexture,vUv).rgb;
  color = mix(nightColor,dayColor,dayMix);

  vec2 specularCloudColor = texture(uSpecularCloudsTexture,vUv).rg;
  // color = vec3(specularCloudColor,0.0);

  float cloudsMix = smoothstep(0.5,1.0,specularCloudColor.g);
  // Make cloud disapper at night
  cloudsMix *= dayMix;
  color = mix(color, vec3(1.0),cloudsMix);

  // Fresnel
  float fresnel = dot(viewDirection, normal) + 1.0;
  fresnel = pow(fresnel, 2.0);
  
  // Check the sunlight throught the surface
  float atmosphereDayMix = smoothstep(-0.5,1.0,sunOrientation);
  vec3 atmosphereColor = mix(uAtmosphereTwilightColor,uAtmosphereDayColor,atmosphereDayMix);
  color = mix(color,atmosphereColor,fresnel*atmosphereDayMix);

  // Specular
  vec3 reflection = reflect(-uSunDirection, normal);
  float specular = - dot(reflection, viewDirection);
  specular = max(specular,0.0);
  specular = pow(specular, 32.0);
  specular *= specularCloudColor.r;
  
  vec3 specularColor = mix(vec3(1.0),atmosphereColor, fresnel);
  // Make the specular not too strong
  color+= specular * specularColor;

  gl_FragColor = vec4(color,1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}