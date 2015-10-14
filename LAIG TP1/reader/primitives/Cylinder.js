/**
 * Cylinder
 * @param gl {WebGLRenderingContext}
 * @constructor
 */
function Cylinder(scene, height, bottom_radius, top_radius, stacks, slices) {
	CGFobject.call(this,scene);
	
	this.height = height;
	this.bottom_radius = bottom_radius;
	this.top_radius = top_radius;
	this.stacks = stacks;
	this.slices = slices;

	this.initBuffers();
};

Cylinder.prototype = Object.create(CGFobject.prototype);
Cylinder.prototype.constructor=Cylinder;

Cylinder.prototype.initBuffers = function () {
	
	var delta = 2*Math.PI / this.slices;
	this.indices = [];
 	this.vertices = [];
 	this.normals = [];
	this.texCoords = [];
	var init_angle = this.bottom_radius;
	var ang_dif = (this.top_radius - this.bottom_radius)/this.stacks;
	
	for(var i = 0; i <= this.stacks; i++) {
		for(var j = 0; j <= this.slices; j++) {
			this.vertices.push((init_angle + i*ang_dif)*Math.cos(j*delta), (init_angle + i*ang_dif)*Math.sin(j*delta), this.height*i/this.stacks);
			if(this.height > 0)
				this.normals.push((init_angle + i*ang_dif)*Math.cos(j*delta), (init_angle + i*ang_dif)*Math.sin(j*delta), (this.top_radius-this.bottom_radius)*Math.sqrt(Math.pow((init_angle + i*ang_dif)*Math.cos(j*delta), 2) + Math.pow((init_angle + i*ang_dif)*Math.sin(j*delta), 2))/this.height);
			else
				this.normals.push((init_angle + i*ang_dif)*Math.cos(j*delta), (init_angle + i*ang_dif)*Math.sin(j*delta), 1);
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

Cylinder.prototype.setAmplifFactor = function(amplif_s, amplif_t) {}
