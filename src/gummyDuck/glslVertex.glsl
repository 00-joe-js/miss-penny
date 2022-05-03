out vec3 Normal;
out vec3 FragPos;
out vec3 LightDir;
out vec3 CameraPos;

void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    CameraPos = cameraPosition;
    FragPos = vec3(modelViewMatrix * vec4(position, 1.0));
    Normal = normalize(normal);
    LightDir = normalize(CameraPos - FragPos);
}