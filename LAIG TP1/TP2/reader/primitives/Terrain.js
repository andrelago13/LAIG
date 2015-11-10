function Terrain(scene, texture, heightmap) {
	CGFobject.call(this,scene);

	this.initBuffers();
	this.texture = texture;
	this.heightmap = heightmap;
	
	this.shader = new CGFshader(this.scene.gl, "../shaders/Terrain/terrain-vertex.glsl", "../shaders/Terrain/terrain-fragment.glsl");
};

Terrain.prototype = Object.create(CGFobject.prototype);
Terrain.prototype.constructor=Terrain;

Terrain.prototype.display = function() {
	this.scene.setActiveShader(this.shader);
	
	this.scene.setActiveShader(this.scene.defaultShader);
}