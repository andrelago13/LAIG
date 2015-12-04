/**
 * Patch
 * @param scene CGFscene where the Rectangle will be displayed
 * @constructor
 */
function Patch(scene, order, u_parts, v_parts, controlpoints) {
	CGFobject.call(this,scene);
	
	var knots1 = [];
	var knots2 = [];
	var controlvertexes = [];
	
	for(var i = 0; i < (order+1)*2; ++i) {
		knots1.push(Math.round(i/((order+1)*2), 0));
	}
	for(var i = 0; i < (order+1)*2; ++i) {
		knots2.push(Math.round(i/((order+1)*2), 0));
	}
	
	var vertex = 0;
	for(var i = 0; i < (order+1); ++i) {
		var temp = [];
		for(var j = 0; j < (order+1); ++j) {
			controlpoints[vertex].push(1);
			temp.push(controlpoints[vertex++]);
		}
		controlvertexes.push(temp);
	}
	
	this.nurbsSurface = new CGFnurbsSurface(order, order, knots1, knots2, controlvertexes);
	var nurbsSurface = this.nurbsSurface;
	getSurfacePoint = function(u, v) {
		return nurbsSurface.getPoint(u, v);
	};

	this.obj = new CGFnurbsObject(this.scene, getSurfacePoint, u_parts, v_parts);
};

Patch.prototype = Object.create(CGFobject.prototype);
Patch.prototype.constructor=Patch;

Patch.prototype.display = function () {
	this.obj.display();
};

/**
 * Does nothing
 */
Patch.prototype.setAmplifFactor = function(amplif_s, amplif_t) {}
