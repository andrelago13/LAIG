/**
 * Plane
 * @param scene CGFscene where the Rectangle will be displayed
 * @param left_top_x x coordinate of the left top vertex
 * @constructor
 */
function Plane(scene, parts) {
	CGFobject.call(this,scene);
	
	console.log(parts);
	
	if(typeof parts == 'undefined') {
		this.parts = 0;
	} else {
		this.parts = parts;
	}

	this.vertices = [];
	this.indices = [];
	this.normals = [];
	this.texCoords = [];
	var verts = 0;
	
	for(var x = 0; x <= this.parts; ++x) {
		for(z = 0; z <= this.parts; ++z) {
			this.vertices.push(x/this.parts, 0, z/this.parts);
			this.texCoords.push(x/this.parts, z/this.parts);
			++verts;
			this.normals.push(0, 1, 0);
			
			if(x > 0 && z > 0) {
				this.indices.push(verts-1, verts-2, verts-this.parts-2);
				this.indices.push(verts-2, verts-this.parts-3, verts-this.parts-2);
			}
		}
	}
	
	console.log(this.vertices);
     		
    this.primitiveType=this.scene.gl.TRIANGLES;
    this.initGLBuffers();
};

Plane.prototype = Object.create(CGFobject.prototype);
Plane.prototype.constructor=Plane;

Plane.prototype.initBuffers = function () {
	
	console.log("HI");
	
	this.vertices = [];
	this.indices = [];
	this.normals = [];
	this.texCoords = [];
	var verts = 0;
	
	for(var x = 0; x <= this.parts; ++x) {
		for(z = 0; z <= this.parts; ++z) {
			this.vertices.push(x/this.parts, 0, z/this.parts);
			this.texCoords.push(x/this.parts, z/this.parts);
			++verts;
			this.normals.push(0, 1, 0);
			
			if(x > 0 && z > 0) {
				this.indices.push(verts-1, verts-2, verts-this.parts-2);
				this.indices.push(verts-2, verts-this.parts-3, verts-this.parts-2);
			}
		}
	}
	
	console.log(this.vertices);
     		
    this.primitiveType=this.scene.gl.TRIANGLES;
    this.initGLBuffers();
};

Plane.prototype.setAmplifFactor = function(amplif_s, amplif_t) {
	if(typeof amplif_s == 'undefined' || amplif_s <= 0) {
		amplif_s = 1;
	}
	if(typeof amplif_t == 'undefined' || amplif_t <= 0) {
		amplif_t = 1;
	}
	
	this.texCoords = [];
	for(var x = 0; x <= this.parts; ++x) {
		for(z = 0; z <= this.parts; ++z) {
			this.texCoords.push(x/this.parts/amplif_s, z/this.parts/amplif_t);
		}
	}
	
	this.updateTexCoordsGLBuffers();
}
