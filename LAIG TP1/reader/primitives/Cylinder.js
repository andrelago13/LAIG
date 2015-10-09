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

	var ang = Math.PI*2/this.slices;
 	var alfa = 0;
 	
 	var radius = this.bottom_radius;

 	this.indices = [];
 	this.vertices = [];
 	this.normals = [];
	this.texCoords = [];
 	verts = 0;

 	for(j = 0; j <= this.stacks; j++)
	{
		this.vertices.push(1, 0, j / this.stacks);
		this.normals.push(1, 0, 0);
		this.texCoords.push(0, j / this.stacks);
		verts += 1;

		for(i = 1; i <= this.slices; i++)
		{
			alfa+=ang;
			x = Math.cos(alfa);
			y = Math.sin(alfa);
			this.vertices.push(x, y, j / this.stacks);
			this.normals.push(x, y, 0);
			this.texCoords.push(i / this.slices, j / this.stacks);
			verts++;

			if(j > 0 && i > 0)
			{
				this.indices.push(verts-1, verts-2, verts-this.slices-2);
				this.indices.push(verts-this.slices-3, verts-this.slices-2, verts-2);
			}
		}
	}
		
	this.primitiveType=this.scene.gl.TRIANGLES;
	this.initGLBuffers();
};
