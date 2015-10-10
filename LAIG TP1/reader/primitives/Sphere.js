 function Sphere(scene, radius, slices, stacks) {
 	CGFobject.call(this,scene);
	
 	this.radius=radius;
	this.slices=slices;
	this.stacks=stacks;

 	this.initBuffers();
 };

Sphere.prototype = Object.create(CGFobject.prototype);
Sphere.prototype.constructor = Sphere;

Sphere.prototype.initBuffers = function() {
 	
	var ang = Math.PI*2/this.slices;
 	var alfa = 0;

	var ang2 = Math.PI/this.stacks;
 	var beta = -Math.PI/2;


 	this.indices = [];
 	this.vertices = [];
 	this.normals = [];
 	this.texCoords = [];
 	verts = 0;

	for(j = 0; j <= this.stacks; j++)
	{
		x = this.radius * Math.cos(beta);
		y = 0;
		z = this.radius * Math.sin(beta);
		this.vertices.push(x, y, z);
		this.normals.push(x, y, z);
		this.texCoords.push(this.radius * (Math.asin(x)/Math.PI + 0.5), this.radius * (Math.asin(y)/Math.PI + 0.5));
		verts++;

		for(i = 0; i < this.slices; i++)
		{
			alfa+=ang;
			x = this.radius * Math.cos(alfa) * Math.cos(beta);
			y = this.radius * Math.sin(alfa) * Math.cos(beta);
			z = this.radius * Math.sin(beta);
			this.vertices.push(x, y, z);
			this.normals.push(x, y, z);
			this.texCoords.push(this.radius * (Math.asin(x)/Math.PI + 0.5), this.radius * (Math.asin(y)/Math.PI + 0.5));
			verts++;

			if(j > 0)
			{
				this.indices.push(verts-1, verts-2, verts-this.slices-2);
				this.indices.push(verts-this.slices-3, verts-this.slices-2, verts-2);
			}
		}

		beta += ang2;
	}
 	this.primitiveType = this.scene.gl.TRIANGLES;
 	this.initGLBuffers();
 };

 Sphere.prototype.setAmplifFactor = function(amplif_factor) {
 	// TODO
		
		
	this.updateTexCoordsGLBuffers();
 }