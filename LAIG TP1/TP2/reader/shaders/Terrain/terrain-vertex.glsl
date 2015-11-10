vec3 aVertexPosition;
vec3 aVertexNormal;
vec2 aTextureCoord;

mat4 uMVMatrix;
mat4 uPMatrix;
mat4 uNMatrix;

varying vec2 vTextureCoord;

uniform sampler2D uSampler; // Terrain
uniform sampler2D uSampler2; // Heightmap

void main()
{
	gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition + Heightmap.r, 1.0);
	vTextureCoord = aTextureCoord;
}