/**
 * Plane
 * @param scene CGFscene where the Rectangle will be displayed
 * @param parts parts the plane is divided into along each axis
 * @constructor
 */
function Plane(scene, partsU, partsV) {
	this.scene = scene;
	if(typeof partsU == 'undefined' || partsU <= 0) {
		this.partsU = 0;
	} else {
		this.partsU = partsU;
	}
	if(typeof partsV == 'undefined' || partsV <= 0) {
		this.partsV = 0;
	} else {
		this.partsV = partsV;
	}
	
	this.controlpoints = [[0, 0, 0],
	                      [1, 0, 0],
	                      [0, 0, 1],
	                      [1, 0, 1]];
	
	this.patch = new Patch(this.scene, 1, this.partsU, this.partsV, this.controlpoints);
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
