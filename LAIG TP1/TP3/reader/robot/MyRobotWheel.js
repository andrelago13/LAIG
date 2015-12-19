/**
 * MyRobotWheel - slightly different from MyCylinderTopped because of texcoords
 * @constructor
 */
 function MyRobotWheel(scene, slices, stacks) {
 	CGFobject.call(this,scene);
 	
	this.slices=slices;
	this.stacks=stacks;
 	this.initBuffers();
 };
 MyRobotWheel.prototype = Object.create(CGFobject.prototype);
 MyRobotWheel.prototype.constructor = MyRobotWheel;
 
 MyRobotWheel.prototype.display = function() {
	 this.drawElements(this.primitiveType);
 }
 
 MyRobotWheel.prototype.initBuffers = function() {
 	var ang = Math.PI*2/this.slices;
 	var alfa = 0;
 	
 	/////////////////////////////////////////////////////////
 	////////// Draw the cylinder of the wheel ////////////
 	/////////////////////////////////////////////////////////

 	this.indices = [];
 	this.vertices = [];
 	this.normals = [];
	this.texCoords = [];
 	verts = 0;
 	
 	for(j = 0; j <= this.stacks; j++)
	{
		this.vertices.push(1, 0, j / this.stacks);
		this.normals.push(1, 0, 0);
		this.texCoords.push(0,(j / this.stacks)/10);
		verts += 1;

		for(i = 1; i <= this.slices; i++)
		{
			alfa+=ang;
			x = Math.cos(alfa);
			y = Math.sin(alfa);
			this.vertices.push(x, y, j / this.stacks);
			this.normals.push(x, y, 0);
			this.texCoords.push((i / this.slices)/10, (j / this.stacks)/10);
			verts++;

			if(j > 0 && i > 0)
			{
				this.indices.push(verts-1, verts-2, verts-this.slices-2);
				this.indices.push(verts-this.slices-3, verts-this.slices-2, verts-2);
			}
		}
	}

 	/////////////////////////////////////////////////////////
 	//////////// Draw the bottom of the cylinder ////////////
 	/////////////////////////////////////////////////////////
 	
 	this.vertices.push(0, 0, 0);
	this.normals.push(0, 0, -1);
	this.texCoords.push(0.5, 0.5);
	
	verts+=1;
	alfa=0;
	
	index = verts-1;

	for(i = 0; i < this.slices; i++)
	{
		x=Math.cos(alfa);
		y=Math.sin(alfa);
		this.vertices.push(x, y, 0);
		this.normals.push(0, 0, -1);
		this.texCoords.push(x/2+0.5, -y/2+0.5);
		
		alfa+=ang;
		verts++;

		if(i < this.slices-1)
			this.indices.push(index, verts, verts-1);
		else
			this.indices.push(index, index+1, verts-1);
	}
	

 	/////////////////////////////////////////////////////////
 	//////////// Draw the top of the cylinder ///////////////
 	/////////////////////////////////////////////////////////
	
	this.vertices.push(0, 0, 1);
	this.normals.push(0, 0, 1);
	this.texCoords.push(0.5, 0.5);
	
	verts+=1;
	alfa=0;
	
	index = verts-1;

	for(i = 0; i < this.slices; i++)
	{
		x=Math.cos(alfa);
		y=Math.sin(alfa);
		this.vertices.push(x, y, 1);
		this.normals.push(0, 0, 1);
		this.texCoords.push(x/2+0.5, -y/2+0.5);
		
		alfa+=ang;
		verts++;

		if(i < this.slices-1)
			this.indices.push(index, verts-1, verts);
		else
			this.indices.push(index, verts-1, index+1);
	}
	
 	this.primitiveType = this.scene.gl.TRIANGLES;
 	this.initGLBuffers();
 };