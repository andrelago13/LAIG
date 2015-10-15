function Texture(texture, s, t) {
	this.texture = texture;
	this.s = s;
	this.t = t;
}

Texture.prototype.constructor = Texture;

Texture.prototype.bind = function() {
	this.texture.bind();
}

Texture.prototype.unbind = function() {
	this.texture.unbind();
}

Texture.prototype.getAmplifFactor = function() {
	return [this.s, this.t];
}