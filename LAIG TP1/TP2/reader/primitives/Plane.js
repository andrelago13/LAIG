/**
 * Plane
 * @param scene CGFscene where the Rectangle will be displayed
 * @param parts parts the plane is divided into along each axis
 * @constructor
 */
function Plane(scene, parts) {
	this.scene = scene;
	if(typeof parts == 'undefined' || parts <= 0) {
		this.parts = 0;
	} else {
		this.parts = parts;
	}
	
	this.controlpoints = [[0, 0, 0],
	                      [1, 0, 0],
	                      [0, 0, 1],
	                      [1, 0, 1]];
	
	this.patch = new Patch(this.scene, 1, this.parts, this.parts, this.controlpoints);
};

Plane.prototype = Object.create(CGFobject.prototype);
Plane.prototype.constructor=Plane;

Plane.prototype.display = function() {
	this.patch.display();
};

/**
 * Updates the Plane amplification factors
 * @param amplif_s s domain amplification factor
 * @param amplif_t t domain amplification factor
 */
Plane.prototype.setAmplifFactor = function(amplif_s, amplif_t) {}
