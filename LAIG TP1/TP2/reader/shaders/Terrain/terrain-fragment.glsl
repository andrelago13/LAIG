#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;

uniform sampler2D uSampler; // Terrain
uniform sampler2D uSampler2; // Heightmap

void main()
{
	gl_FragColor = texture2D(uSampler, vTextureCoord);
}