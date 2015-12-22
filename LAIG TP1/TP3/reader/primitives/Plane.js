
/** Represents a plane with nrDivs divisions along both axis, with center at (0,0) */
function Plane(scene, nrDivs, minS, maxS, minT, maxT) {
	CGFobject.call(this,scene);

	// nrDivs = 1 if not provided
	nrDivs = typeof nrDivs !== 'undefined' ? nrDivs : 1;

	this.nrDivs = nrDivs;
	this.patchLength = 1.0 / nrDivs;

	this.minS = minS || 0;
	this.maxS = maxS || 1;

	this.minT = minT || 0;
	this.maxT = maxT || 1;

	this.q = (this.maxS - this.minS) / this.nrDivs;
	this.w = (this.maxT - this.minT) / this.nrDivs;

	this.initBuffers();
};

Plane.prototype = Object.create(CGFobject.prototype);
Plane.prototype.constructor = Plane;

Plane.prototype.initBuffers = function() {
	// Generate vertices, normals, and texCoords
	this.vertices = [];
	this.normals = [];
	this.texCoords = [];

	var yCoord = 0.5;

	for (var j = 0; j <= this.nrDivs; j++) {
		var xCoord = -0.5;

		for (var i = 0; i <= this.nrDivs; i++) {
			this.vertices.push(xCoord, yCoord, 0);

			this.normals.push(0, 0, 1);

			this.texCoords.push(this.minS + i * this.q, this.minT + j * this.w);

			xCoord += this.patchLength;
		}

		yCoord -= this.patchLength;
	}
	
	// Generating indices
	this.indices = [];
	var ind = 0;

	for (var j = 0; j < this.nrDivs; j++) {
		for (var i = 0; i <= this.nrDivs; i++) {
			this.indices.push(ind);
			this.indices.push(ind + this.nrDivs + 1);

			ind++;
		}

		if (j + 1 < this.nrDivs) {
			this.indices.push(ind + this.nrDivs);
			this.indices.push(ind);
		}
	}
	
	this.primitiveType = this.scene.gl.TRIANGLE_STRIP;
	this.initGLBuffers();
};

Plane.prototype.setAmplifFactor = function(amplif_s, amplif_t) {}



/**
 * Plane
 * @param scene CGFscene where the Rectangle will be displayed
 * @param parts parts the plane is divided into along each axis
 * @constructor
 */
/*function Plane(scene, partsU, partsV) {
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

Plane.prototype = Object.create(Plane.prototype);
Plane.prototype.constructor=Plane;*/

/**
 * Updates the Plane amplification factors
 * @param amplif_s s domain amplification factor
 * @param amplif_t t domain amplification factor
 */
/*Plane.prototype.setAmplifFactor = function(amplif_s, amplif_t) {}

Plane.prototype.display = function () {
	this.patch.display();
};*/
