/**
 * Cylinder
 * @param scene CGFscene where the Cylinder will be displayed
 * @param height Cylinder height
 * @param bottom_radius radius of the bottom base of the cylinder, placed on the (0, 0, 0) point
 * @param top_radius radius of the top base of the cylinder
 * @param stacks ammount of stacks the Cylinder will be divided along it's height
 * @param slices ammount of slices the Cylinder will be divided into along it's perimeter
 * @constructor
 */
function Cylinder(scene, height, bottom_radius, top_radius, stacks, slices, half) {
	CGFobject.call(this,scene);
	
	this.height = height;
	this.bottom_radius = bottom_radius;
	this.top_radius = top_radius;
	this.stacks = stacks;
	this.slices = slices;
	this.half = typeof half == 'undefined' ? true : half;

	this.initBuffers();
};

Cylinder.prototype = Object.create(CGFobject.prototype);
Cylinder.prototype.constructor=Cylinder;

/**
 * Initializes the Cylinder buffers (vertices, indices, normals and texCoords)
 */
Cylinder.prototype.initBuffers = function () {
	
	var delta = 2*Math.PI / this.slices;
	if (!this.half) delta *= 2;
	this.indices = [];
 	this.vertices = [];
 	this.normals = [];
	this.texCoords = [];
	var init_radius = this.bottom_radius;
	var radius_dif = (this.top_radius - this.bottom_radius)/this.stacks;
	
	for(var i = 0; i <= this.stacks; i++) {
		for(var j = 0; j <= this.slices; j++) {
			this.vertices.push((init_radius + i*radius_dif)*Math.cos(j*delta), (init_radius + i*radius_dif)*Math.sin(j*delta), this.height*i/this.stacks);
			
			if(this.height > 0) {
				var temp = Math.atan(Math.abs(this.top_radius-this.bottom_radius)/this.height);
				this.normals.push(Math.cos(temp)*Math.cos(j*delta),
						Math.cos(temp)*Math.sin(j*delta),
						Math.sin(temp));
			} else
				this.normals.push(0, 0, 1);
			this.texCoords.push(j/this.slices, i/this.stacks);
			
			if(i > 0 && j > 0) {
				var verts = this.vertices.length / 3;
				this.indices.push(verts-1, verts-2, verts-this.slices-2);
				this.indices.push(verts-2, verts-this.slices-3, verts-this.slices-2);
			}

		}
	}
		
	this.primitiveType=this.scene.gl.TRIANGLES;
	this.initGLBuffers();
};

/**
 * Does nothing. Required because of inheritance purposes
 */
Cylinder.prototype.setAmplifFactor = function(amplif_s, amplif_t) {}
