uniform float u_Rand;
uniform vec2 u_Resolution;
in vec3 FragPos;
in vec3 CameraPos;
in vec3 LightDir;
in vec3 Normal;

void main() {

  vec4 v_normPos = gl_FragCoord / vec4(vec2(u_Resolution), 1.0, 1.0);

  vec3 reflectDir = reflect(-LightDir, Normal);

  float spec = pow(max(dot(LightDir, reflectDir), 0.0), 64.0);
  float specular = 0.7 * spec;

  float leftRate = cos(v_normPos.x * 7.0);

  vec4 color = vec4(
    1.0 - leftRate, 
    1.2 - v_normPos.y, 
    leftRate - (u_Rand / 2.0), 
    1.0
  );

  color.a = 0.9;

  gl_FragColor = (color) * (0.9 + specular);
}