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
	
	var delta = Math.PI / this.slices;
	if (!this.half) delta *= 2;
	this.indices = [];
 	this.vertices = [];
 	this.normals = [];
	this.texCoords = [];
	var init_radius = this.bottom_radius;
	var radius_dif = (this.top_radius - this.bottom_radius)/this.stacks;
	
	for(var i = 0; i <= this.stacks; i++) {
		for(var j = 0; j <= this.slices; j++) {
			var vx = (init_radius + i*radius_dif)*Math.cos(j*delta);
			var vy = (init_radius + i*radius_dif)*Math.sin(j*delta);
			this.vertices.push(vx, vy, this.height*i/this.stacks);
			
			if(this.height > 0) {
				var temp = Math.atan(Math.abs(this.top_radius-this.bottom_radius)/this.height);
				this.normals.push(Math.cos(temp)*Math.cos(j*delta),
						Math.cos(temp)*Math.sin(j*delta),
						Math.sin(temp));
				this.texCoords.push(j/this.slices, i/this.stacks);
			} else {
				if(this.top_radius == 0) {
					this.normals.push(0, 0, 1);
					this.texCoords.push((vx+0.5), (vy+0.5));
				} else {
					this.normals.push(0, 0, -1);
					this.texCoords.push(1-(vx+0.5), 1-(vy+0.5));
				}
			}
			
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
