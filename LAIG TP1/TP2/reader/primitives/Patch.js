/*
this.makeSurface("3", 2, // degree on U: 3 control vertexes U
					3, // degree on V: 4 control vertexes on V
					[0, 0, 0, 1, 1, 1], // knots for U
					[0, 0, 0, 0, 1, 1, 1, 1], // knots for V
					[	// U = 0
						[ // V = 0..3;
							 [ -2.0, -2.0, 1.0, 1 ],
							 [ -2.0, -1.0, -2.0, 1 ],
							 [ -2.0, 1.0, 5.0, 1 ],
							 [ -2.0, 2.0, -1.0, 1 ]
						],
						// U = 1
						[ // V = 0..3
							 [ 0, -2.0, 0, 1 ],
							 [ 0, -1.0, -1.0, 5 ],
							 [ 0, 1.0, 1.5, 5 ],
							 [ 0, 2.0, 0, 1 ]
						],
						// U = 2
						[ // V = 0..3
							 [ 2.0, -2.0, -1.0, 1 ],
							 [ 2.0, -1.0, 2.0, 1 ],
							 [ 2.0, 1.0, -5.0, 1 ],
							 [ 2.0, 2.0, 1.0, 1 ]
						]
					], // translation of surface 
					[7.5,0,0]);
		
	var nurbsSurface = new CGFnurbsSurface(degree1, degree2, knots1, knots2, controlvertexes);
	getSurfacePoint = function(u, v) {
		return nurbsSurface.getPoint(u, v);
	};

	var obj = new CGFnurbsObject(this, getSurfacePoint, 20, 20 );
*/

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
	
	this.initBuffers();
};

Patch.prototype = Object.create(CGFobject.prototype);
Patch.prototype.constructor=Patch;

Patch.prototype.display = function () {
	this.obj.display();
};

/**
 * Initializes the Patch buffers (vertices, indices, normals and texCoords)
 */
Plane.prototype.initBuffers = function () {
	
	this.vertices = [];
	this.indices = [];
	this.normals = [];
	this.texCoords = [];
     		
    this.primitiveType=this.scene.gl.TRIANGLES;
    this.initGLBuffers();
};

/**
 * Does nothing
 */
Patch.prototype.setAmplifFactor = function(amplif_s, amplif_t) {}
