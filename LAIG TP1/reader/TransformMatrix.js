/**
 * Represents the matrix of a transformation
 * @constructor
 */
function TransformMatrix() {
	this.matrix = mat4.create();
	mat4.identity(matrix);
}

/**
 * 
 */
function degToRad(deg) {
	return Math.PI*deg/180;
}

/**
 * @constructor
 * @param transforms
 */
function TransformMatrix(transforms) {
	this.matrix = mat4.create();
	this.matrix = mat4.identity(this.matrix);
	
	for(var i = 0; i < transforms.length; i++) {
		var transform = transforms[i];
		
		var type = transform["type"];
		
		switch(transform["type"]) {
		case "TRANSLATION":
			this.matrix = mat4.translate(this.matrix, this.matrix, [transform["x"], transform["y"], transform["z"]]);
			break;
		case "ROTATION":
			var axis = transform["axis"];
			
			if(axis == 'x')
				this.matrix = mat4.rotateX(this.matrix, this.matrix, degToRad(transform["angle"]));
			else if(axis == 'y')
				this.matrix = mat4.rotateY(this.matrix, this.matrix, degToRad(transform["angle"]));
			else if(axis == 'z')
				this.matrix = mat4.rotateZ(this.matrix, this.matrix, degToRad(transform["angle"]));
			
			break;
		case "SCALE":
			this.matrix = mat4.scale(this.matrix, this.matrix, [transform["sx"], transform["sy"], transform["sz"]]);
			break;
		}
	}
}