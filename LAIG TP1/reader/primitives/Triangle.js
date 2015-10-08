/**
 * Triangle
 * @param gl {WebGLRenderingContext}
 * @constructor
 */
function Triangle(scene, v1x, v1y, v1z, v2x, v2y, v2z, v3x, v3y, v3z) {
	CGFobject.call(this,scene);
	
	this.v1x = v1x;
	this.v1y = v1y;
	this.v1z = v1z;
	this.v2x = v2x;
	this.v2y = v2y;
	this.v2z = v2z;
	this.v3x = v3x;
	this.v3y = v3y;
	this.v3z = v3z;

	this.initBuffers();
};

Rectangle.prototype = Object.create(CGFobject.prototype);
Rectangle.prototype.constructor=Rectangle;

Rectangle.prototype.initBuffers = function () {
	this.vertices = [
            this.v1x, this.v1y, this.v1z,
            this.v2x, this.v2y, this.v2z,
            this.v3x, this.v3y, this.v3z
			];

	this.indices = [ 0, 1, 2 ];
	
	var nx = (v2y-v1y)*(v3z-v1z) - (v2z-v1z)*(v3y-v1y);
	var ny = (v2z-v1z)*(v3x-v1x) - (v2x-v1x)*(v3z-v1z);
	var nz = (v2x-v1x)*(v3y-v1y) - (v2y-v1y)*(v3x-v1x);

    this.normals = [
    nx, ny, nz,
    nx, ny, nz,
    nx, ny, nz ];
    
    // TODO interpolate texcoords
    
    this.texCoords = [
		this.minS, this.maxT,
		this.maxS, this.maxT,
		this.minS, this.minT
    ]
		
	this.primitiveType=this.scene.gl.TRIANGLES;
	this.initGLBuffers();
};
