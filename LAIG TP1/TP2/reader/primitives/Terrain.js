function Terrain(scene) {
	CGFobject.call(this,scene);

	this.initBuffers();
};

Terrain.prototype = Object.create(CGFobject.prototype);
Terrain.prototype.constructor=Terrain;