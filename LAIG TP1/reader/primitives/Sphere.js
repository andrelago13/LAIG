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
 	
 	for(var j = 0; j <= this.stacks; j++) {
 		alfa = 0;
 		
 		for(var i = 0; i <= this.slices; i++) {
 			x = this.radius * Math.cos(alfa) * Math.cos(beta);
			y = this.radius * Math.sin(alfa) * Math.cos(beta);
			z = this.radius * Math.sin(beta);
			
			this.vertices.push(x, y, z);
			this.normals.push(x, y, z);
			this.texCoords.push(0.5 + Math.atan2(z/this.radius, x/this.radius)/(2*Math.PI), 0.5 - Math.asin(y/this.radius)/Math.PI);
			verts++;
			
			if(i > 0 && j > 0) {
				this.indices.push(verts-1, verts-2, verts-this.slices-2);
				this.indices.push(verts-this.slices-3, verts-this.slices-2, verts-2);
			}
			
			alfa += ang;
 		}
 		beta += ang2;
 	}
 	
 	// FIXME corrigir a textura da última peça
	
	this.primitiveType = this.scene.gl.TRIANGLES;
 	this.initGLBuffers();
 };

 Sphere.prototype.setAmplifFactor = function(amplif_s, amplif_t) {}