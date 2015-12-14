#ifdef GL_ES
precision highp float;
#endif

varying vec3 vRay;

uniform samplerCube uCubemap;

void main() {
	gl_FragColor = textureCube(uCubemap, vRay);
}