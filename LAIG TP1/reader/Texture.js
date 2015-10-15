function Texture(texture, s, t) {
	this.texture = texture;
	this.s = s;
	this.t = t;
}

Texture.prototype = Object.create(Texture.prototype);
Texture.prototype.constructor = Texture;