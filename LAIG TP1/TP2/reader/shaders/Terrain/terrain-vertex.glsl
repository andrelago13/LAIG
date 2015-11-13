attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;

varying vec2 vTextureCoord;

uniform sampler2D uSampler; // Terrain
uniform sampler2D uSampler2; // Heightmap

void main()
{
	vec4 newVertexPos = vec4(aVertexPosition.x, texture2D(uSampler2, aTextureCoord).r * 0.25, aVertexPosition.z, 1.0);
	gl_Position = uPMatrix * uMVMatrix * newVertexPos;
	vTextureCoord = aTextureCoord;
}