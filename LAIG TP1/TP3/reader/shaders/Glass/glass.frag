#ifdef GL_ES
precision highp float;
#endif

uniform samplerCube uCubeMap;

varying vec3 v_refraction;
varying vec3 v_reflection;
varying float v_fresnel;

void main(void)
{

	vec4 refractionColor = textureCube(uCubeMap, normalize(v_refraction));
	vec4 reflectionColor = textureCube(uCubeMap, normalize(v_reflection));
		
	gl_FragColor = mix(refractionColor, reflectionColor, v_fresnel);
}