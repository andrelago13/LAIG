/**
 * Plane
 * @param scene CGFscene where the Rectangle will be displayed
 * @constructor
 */
function Plane(scene, parts) {
	CGFobject.call(this,scene);
	
	if(typeof parts == 'undefined') {
		this.parts = 0;
	} else {
		this.parts = parts;
	}

	this.minS = 0;
	this.maxS = 1;
	this.minT = 0;
	this.maxT = 1;

	this.initBuffers();
};

Plane.prototype = Object.create(CGFobject.prototype);
Plane.prototype.constructor=Plane;

/**
 * Initializes the Plane buffers (vertices, indices, normals and texCoords)
 */
Plane.prototype.initBuffers = function () {
	
	this.vertices = [];
	this.indices = [];
	this.normals = [];
	this.texCoords = [];
	var verts = 0;
	
	for(var x = 0; x <= this.parts; ++x) {
		for(z = 0; z <= this.parts; ++z) {
			this.vertices.push(x/this.parts, 0, z/this.parts);
			this.texCoords.push(x/this.parts, 0, z/this.parts);
			++verts;
			this.normals.push(0, 1, 0);
			
			if(x > 0 && z > 0) {
				this.indices.push(verts-1, verts-2, verts-this.parts-2);
				this.indices.push(verts-2, verts-this.parts-3, verts-this.parts-2);
			}
		}
	}
     		
    this.primitiveType=this.scene.gl.TRIANGLES;
    this.initGLBuffers();
};

/**
 * Updates the Plane amplification factors
 * @param amplif_s s domain amplification factor
 * @param amplif_t t domain amplification factor
 */
Plane.prototype.setAmplifFactor = function(amplif_s, amplif_t) {
	
	// TODO
	
	/*var dist_s = Math.abs(this.left_top_x - this.right_bottom_x);
	var dist_t = Math.abs(this.left_top_y - this.right_bottom_y);
         
    this.texCoords = [
     		this.minS, this.maxT*dist_t/amplif_t,
     		this.maxS*dist_s/amplif_s, this.maxT*dist_t/amplif_t,
     		this.minS, this.minT,
     		this.maxS*dist_s/amplif_s, this.minT
    ];
	
	this.updateTexCoordsGLBuffers();*/
}
