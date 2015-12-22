OoliteFont.prototype.constructor = OoliteFont;

function OoliteFont(scene) {
	this.scene = scene;
	this.shader = new CGFshader(scene.gl, "shaders/Font/font.vert", "shaders/Font/font.frag");
	this.shader.setUniformsValues({'dims': [16, 16]});
	this.appearance = new CGFappearance(scene);
	this.appearance.setAmbient(0.3, 0.3, 0.3, 1);
	this.appearance.setDiffuse(0.7, 0.7, 0.7, 1);
	this.appearance.setSpecular(0.0, 0.0, 0.0, 1);	
	this.appearance.setShininess(120);
	this.texture = new CGFtexture(scene, "fonts/oolite-font.png");
	this.appearance.setTexture(this.texture);
}

OoliteFont.prototype.getCharCoords = function(char) {
	var code = char.charCodeAt(0);
	if(code >= 97 && code <= 122) {	// small letter
		switch(char) {
		case "a":
			return [1, 6];
		case "b":
			return [2, 6];
		case "c":
			return [3, 6];
		case "d":
			return [4, 6];
		case "e":
			return [5, 6];
		case "f":
			return [6, 6];
		case "g":
			return [7, 6];
		case "h":
			return [8, 6];
		case "i":
			return [9, 6];
		case "j":
			return [10, 6];
		case "k":
			return [11, 6];
		case "l":
			return [12, 6];
		case "m":
			return [13, 6];
		case "n":
			return [14, 6];
		case "o":
			return [15, 6];
		case "p":
			return [0, 7];
		case "q":
			return [1, 7];
		case "r":
			return [2, 7];
		case "s":
			return [3, 7];
		case "t":
			return [4, 7];
		case "u":
			return [5, 7];
		case "v":
			return [6, 7];
		case "w":
			return [7, 7];
		case "x":
			return [8, 7];
		case "y":
			return [9, 7];
		case "z":
			return [10, 7];
		}
	} else if (code >= 65 && code <= 90) {	// capital letter
		switch(char) {
		case "A":
			return [1, 4];
		case "B":
			return [2, 4];
		case "C":
			return [3, 4];
		case "D":
			return [4, 4];
		case "E":
			return [5, 4];
		case "F":
			return [6, 4];
		case "G":
			return [7, 4];
		case "H":
			return [8, 4];
		case "I":
			return [9, 4];
		case "J":
			return [10, 4];
		case "K":
			return [11, 4];
		case "L":
			return [12, 4];
		case "M":
			return [13, 4];
		case "N":
			return [14, 4];
		case "O":
			return [15, 4];
		case "P":
			return [0, 5];
		case "Q":
			return [1, 5];
		case "R":
			return [2, 5];
		case "S":
			return [3, 5];
		case "T":
			return [4, 5];
		case "U":
			return [5, 5];
		case "V":
			return [6, 5];
		case "W":
			return [7, 5];
		case "X":
			return [8, 5];
		case "Y":
			return [9, 5];
		case "Z":
			return [10, 5];
		}
	} else if (code >= 48 && code <= 57){
		switch(char) {
		case "0":
			return [0, 3];
		case "1":
			return [1, 3];
		case "2":
			return [2, 3];
		case "3":
			return [3, 3];
		case "4":
			return [4, 3];
		case "5":
			return [5, 3];
		case "6":
			return [6, 3];
		case "7":
			return [7, 3];
		case "8":
			return [8, 3];
		case "9":
			return [9, 3];
		}
	} else {
		switch(char) {
		case ":":
			return [10, 3];
		case "!":
			return [1, 2];
		default:
			return [15, 0];
		}
	}
}

OoliteFont.prototype.getAppearance = function() {
	return this.appearance;
}

OoliteFont.prototype.getShader = function() {
	return this.shader;
}