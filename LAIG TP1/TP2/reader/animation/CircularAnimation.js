CircularAnimation.prototype = new Animation();

function CircularAnimation(id, span, center, radius, startang, rotang) {
	this.init(id);
	this.span = span;
	this.center = center;
	this.radius = radius;
	this.startang = startang;
	this.rotang = rotang;
}

CircularAnimation.prototype = Object.create(Animation.prototype);
CircularAnimation.prototype.constructor = CircularAnimation;

CircularAnimation.prototype.getMatrix = function(t) {
	var m = mat4.create();
	
	if (t > this.span) t = this.span;
	
	mat4.translate(m, m, this.center);
	mat4.rotate(m, m, this.startang + (t / this.span) * this.rotang, [0, 1, 0]);
	mat4.translate(m, m, [this.radius, 0, 0]);
	return m;
}