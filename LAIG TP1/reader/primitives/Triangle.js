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
	
	var nx = (this.v2y-this.v1y)*(this.v3z-this.v1z) - this.(v2z-this.v1z)*(this.v3y-this.v1y);
	var ny = (this.v2z-this.v1z)*(this.v3x-this.v1x) - (this.v2x-this.v1x)*(this.v3z-this.v1z);
	var nz = (this.v2x-this.v1x)*(this.v3y-this.v1y) - (this.v2y-this.v1y)*(this.v3x-this.v1x);

    this.normals = [
    nx, ny, nz,
    nx, ny, nz,
    nx, ny, nz ];
    
    var planeNormal = new Math.Vector3(nx, ny, nz);
    planeNormal = planeNormal.normalize();
    
    var vecAB = new Math.Vector3(this.v2x-this.v1x, this.v2y-this.v1y, this.v2z-this.v1z);
    var vecAC = new Math.Vector3(this.v3x-this.v1x, this.v3y-this.v1y, this.v3z-this.v1z);
    var vecS = vecAB;
    var vecT = vecAB;
    vecS = vecS.dot(vecAC);
    vecT = vecAB.applyAxisAngle(planeNormal, Math.PI/2);
    
    this.texCoords = [
		this.minS, this.minT,
		this.maxS, this.minT,
		vecS.length, vecT.length
    ];
		
	this.primitiveType=this.scene.gl.TRIANGLES;
	this.initGLBuffers();
};
