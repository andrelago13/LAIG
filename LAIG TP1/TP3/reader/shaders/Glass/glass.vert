attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

struct materialProperties {
    vec4 ambient;                   // Default: (0, 0, 0, 1)
    vec4 diffuse;                   // Default: (0, 0, 0, 1)
    vec4 specular;                  // Default: (0, 0, 0, 1)
    vec4 emission;                  // Default: (0, 0, 0, 1)
    float shininess;                // Default: 0 (possible values [0, 128])
};

// Indices of refraction
const float Air = 1.0;
const float Glass = 1.51714;

// Air to glass ratio of the indices of refraction (Eta)
const float Eta = Air / Glass;

// see http://en.wikipedia.org/wiki/Refractive_index Reflectivity
const float R0 = ((Air - Glass) * (Air - Glass)) / ((Air + Glass) * (Air + Glass));

uniform mat4 uPMatrix;
uniform mat4 uMVMatrix;
uniform mat3 uNMatrix;
uniform vec4 uCameraPos;

uniform sampler2D uSampler;

uniform vec4 uGlobalAmbient;

uniform materialProperties uFrontMaterial;
uniform materialProperties uBackMaterial;

varying vec3 v_reflection;
varying vec3 v_refraction;
varying float v_fresnel;

void main(void)
{
	// We calculate in world space.
	
	vec4 vertex = uMVMatrix*vec4(aVertexPosition, 1.0);
	
	vec4 u_camera = vertex - uCameraPos;
	
	vec3 incident = normalize(vec3(vertex-u_camera));

	// Assume incoming normal is normalized.
	vec3 normal = aVertexNormal;
	
	v_refraction = refract(incident, normal, Eta);
	v_reflection = reflect(incident, normal);
	
	// see http://en.wikipedia.org/wiki/Schlick%27s_approximation
	v_fresnel = R0 + (1.0 - R0) * pow((1.0 - dot(-incident, normal)), 5.0);
		
	gl_Position = uPMatrix*vertex;
}