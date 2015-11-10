vec3 aVertexPosition;
vec3 aVertexNormal;
vec2 aTextureCoord;

mat4 uMVMatrix;
mat4 uPMatrix;
mat4 uNMatrix;

varying vec2 vTextureCoord;

attribute vec3 aHeight;

void main()
{
	gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition + aHeight, 1.0);
	vTextureCoord = aTextureCoord;
}