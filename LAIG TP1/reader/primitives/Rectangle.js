/**
 * Rectangle
 * @param gl {WebGLRenderingContext}
 * @constructor
 */
function Rectangle(scene, left_top_x, left_top_y, right_bottom_x, right_bottom_y) {
	CGFobject.call(this,scene);
	
	if(typeof left_top_x == 'undefined' || typeof left_top_y == 'undefined' || typeof right_bottom_x == 'undefined' || typeof right_bottom_y == 'undefined') {
		this.left_top_x = -1;
		this.left_top_y = 1;
		this.right_bottom_x = 1;
		this.right_bottom_y = -1;
	} else {
		this.left_top_x = left_top_x;
		this.left_top_y = left_top_y;
		this.right_bottom_x = right_bottom_x;
		this.right_bottom_y = right_bottom_y;
	}
	
	if(typeof minS == 'undefined' || typeof maxS == 'undefined' || typeof minT == 'undefined' || typeof maxT == 'undefined') {
		this.minS = 0;
		this.maxS = 1;
		this.minT = 0;
		this.maxT = 1;
	} else {
		this.minS = minS;
		this.maxS = maxS;
		this.minT = minT;
		this.maxT = maxT;
	}

	this.initBuffers();
};

Rectangle.prototype = Object.create(CGFobject.prototype);
Rectangle.prototype.constructor=Rectangle;

Rectangle.prototype.initBuffers = function () {
	
	this.vertices = [
	     this.left_top_x, this.right_bottom_y, 0,
	     this.right_bottom_x, this.right_bottom_y, 0,
	     this.left_top_x, this.left_top_y, 0,
	     this.right_bottom_x, this.left_top_y, 0
	];
	
	this.indices = [
	     0, 1, 2,
	     2, 1, 3
    ];
	
	this.normals = [
         0, 0, 1,
         0, 0, 1,
         0, 0, 1,
         0, 0, 1
    ];
         
    this.texCoords = [
     		this.minS, this.minT,
     		this.maxS, this.minT,
     		this.minS, this.maxT,
     		this.maxS, this.maxT
    ]
     		
    this.primitiveType=this.scene.gl.TRIANGLES;
    this.initGLBuffers();
};

Rectangle.prototype.setAmplifFactor = function(amplif_factor) {
	var dist_s = Math.abs(this.left_top_x - this.right_bottom_x);
	var dist_t = Math.abs(this.left_top_y - this.right_bottom_y);
	
	this.texCoords = [
	     this.minS, this.minT,
	     this.maxS*dist_s/amplif_factor, this.minT,
	     this.minS, this.maxT*dist_t/amplif_factor,
	     this.maxS*dist_s/amplif_factor, this.maxT*dist_t/amplif_factor
	];
	
	this.updateTexCoordsGLBuffers();
}
