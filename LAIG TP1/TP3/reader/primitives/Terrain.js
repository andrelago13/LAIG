function Terrain(scene, texture, heightmap) {
	CGFobject.call(this,scene);
	this.initBuffers();
	this.scene = scene;
	this.texture = texture;
	this.heightmap = heightmap;
	this.plane = null;
	
	this.shader = new CGFshader(this.scene.gl, "../reader/shaders/Terrain/terrain-vertex.glsl", "../reader/shaders/Terrain/terrain-fragment.glsl");
	this.shader.setUniformsValues({uSampler2: 1});
};

Terrain.prototype = Object.create(CGFobject.prototype);
Terrain.prototype.constructor=Terrain;

Terrain.prototype.display = function() {
	if (this.plane === null)
	{
		if (this.heightmap.texID == -1) return; // Texture not loaded
		this.plane = new Plane(this.scene, this.heightmap.image.width, this.heightmap.image.height);
	}
	var activeShader = this.scene.activeShader;
	this.scene.setActiveShader(this.shader);
	this.texture.bind();
	this.heightmap.bind(1);
	this.scene.gl.texParameteri(this.scene.gl.TEXTURE_2D, this.scene.gl.TEXTURE_WRAP_S, this.scene.gl["CLAMP_TO_EDGE"]);
	this.scene.gl.texParameteri(this.scene.gl.TEXTURE_2D, this.scene.gl.TEXTURE_WRAP_T, this.scene.gl["CLAMP_TO_EDGE"]);
	this.plane.display();
	this.scene.setActiveShader(activeShader);
}
