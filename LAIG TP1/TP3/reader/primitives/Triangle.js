/**
 * Triangle
 * @param scene CGFscene where the Rectangle will be displayed
 * @param v1x x coordinate of the first triangle vertex
 * @param v1y y coordinate of the first triangle vertex
 * @param v1z z coordinate of the first triangle vertex
 * @param v2x x coordinate of the second triangle vertex
 * @param v2y y coordinate of the second triangle vertex
 * @param v2z z coordinate of the second triangle vertex
 * @param v3x x coordinate of the third triangle vertex
 * @param v3y y coordinate of the third triangle vertex
 * @param v3z z coordinate of the third triangle vertex
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

/**
 * Initializes the Triangle buffers (vertices, indices, normals and texCoords)
 */
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
    
    this.texCoords = [
		this.minS, this.maxT,
		this.maxS, this.maxT,
		(ab - bc*Math.cos(beta))/ab, (bc*Math.sin(beta)/ab)
    ];
		
	this.primitiveType=this.scene.gl.TRIANGLES;
	this.initGLBuffers();
};

/**
 * Updates the Triangle amplification factors
 * @param amplif_s s domain amplification factor
 * @param amplif_t t domain amplification factor
 */
Triangle.prototype.setAmplifFactor = function(amplif_s, amplif_t) {
    
    var ab = Math.sqrt(Math.pow(this.v2x-this.v1x, 2) + Math.pow(this.v2y-this.v1y, 2) + Math.pow(this.v2z-this.v1z, 2));
    var bc = Math.sqrt(Math.pow(this.v2x-this.v3x, 2) + Math.pow(this.v2y-this.v3y, 2) + Math.pow(this.v2z-this.v3z, 2));
    var ac = Math.sqrt(Math.pow(this.v1x-this.v3x, 2) + Math.pow(this.v1y-this.v3y, 2) + Math.pow(this.v1z-this.v3z, 2));
    var beta = Math.acos((Math.pow(bc, 2) + Math.pow(ab, 2) - Math.pow(ac, 2))/(2*ab*bc));
    
    this.texCoords = [
		this.minS, this.maxT,
		this.maxS, this.maxT*ab/amplif_s,
		((ab - bc*Math.cos(beta))/ab)*ab/amplif_s, 1 - (bc*Math.sin(beta)/ab)*ab/amplif_t
    ];	
	
	this.updateTexCoordsGLBuffers();
}
