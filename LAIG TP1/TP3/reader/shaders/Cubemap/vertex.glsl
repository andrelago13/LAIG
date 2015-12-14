attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

varying vec3 vRay;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;

uniform samplerCube uCubemap;

void main() {
	vRay = normalize(aVertexPosition.xyz);
	gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
}

