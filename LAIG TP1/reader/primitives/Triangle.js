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
	
	this.minS = 0;
	this.minT = 0;
	this.maxS = 1;
	this.maxT = 1;

	this.initBuffers();
};

Triangle.prototype = Object.create(CGFobject.prototype);
Triangle.prototype.constructor=Triangle;

Triangle.prototype.initBuffers = function () {
	this.vertices = [
            this.v1x, this.v1y, this.v1z,
            this.v2x, this.v2y, this.v2z,
            this.v3x, this.v3y, this.v3z
			];

	this.indices = [ 0, 1, 2 ];
	
	var nx = (this.v2y-this.v1y)*(this.v3z-this.v1z) - (this.v2z-this.v1z)*(this.v3y-this.v1y);
	var ny = (this.v2z-this.v1z)*(this.v3x-this.v1x) - (this.v2x-this.v1x)*(this.v3z-this.v1z);
	var nz = (this.v2x-this.v1x)*(this.v3y-this.v1y) - (this.v2y-this.v1y)*(this.v3x-this.v1x);

    this.normals = [
    nx, ny, nz,
    nx, ny, nz,
    nx, ny, nz ];
    
    var ab = Math.sqrt(Math.pow(this.v2x-this.v1x, 2) + Math.pow(this.v2y-this.v1y, 2) + Math.pow(this.v2z-this.v1z, 2));
    var bc = Math.sqrt(Math.pow(this.v2x-this.v3x, 2) + Math.pow(this.v2y-this.v3y, 2) + Math.pow(this.v2z-this.v3z, 2));
    var ac = Math.sqrt(Math.pow(this.v1x-this.v3x, 2) + Math.pow(this.v1y-this.v3y, 2) + Math.pow(this.v1z-this.v3z, 2));
    var beta = Math.acos((Math.pow(bc, 2) + Math.pow(ab, 2) - Math.pow(ac, 2))/(2*ab*bc));
    
    console.log(ab);
    
    this.texCoords = [
		this.minS, this.minT,
		this.maxS, this.minT,
		(ab - bc*Math.cos(beta))/ab, bc*Math.sin(beta)/ab
    ];
    
    console.log("" + this.texCoords[0] + " - " + this.texCoords[1]);
    console.log("" + this.texCoords[2] + " - " + this.texCoords[3]);
    console.log("" + this.texCoords[4] + " - " + this.texCoords[5]);
    console.log("==");
		
	this.primitiveType=this.scene.gl.TRIANGLES;
	this.initGLBuffers();
};

Triangle.prototype.setAmplifFactor = function(amplif_factor) {
	// TODO
	
	
	this.updateTexCoordsGLBuffers();
}
