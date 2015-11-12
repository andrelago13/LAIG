function Terrain(scene, parts, texture, heightmap) {
	CGFobject.call(this,scene);
	this.initBuffers();
	this.texture = texture;
	this.heightmap = heightmap;
	this.plane = new Plane(scene, parts, parts);
	
	this.shader = new CGFshader(this.scene.gl, "../reader/shaders/Terrain/terrain-vertex.glsl", "../reader/shaders/Terrain/terrain-fragment.glsl");
	this.shader.setUniformsValues({uSampler2: 1});
};

Terrain.prototype = Object.create(CGFobject.prototype);
Terrain.prototype.constructor=Terrain;

Terrain.prototype.display = function() {
	this.scene.setActiveShader(this.shader);
		this.texture.bind();
		this.heightmap.bind(1);
		this.plane.display();
	this.scene.setActiveShader(this.scene.defaultShader);
}