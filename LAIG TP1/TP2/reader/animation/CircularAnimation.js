CircularAnimation.prototype = new Animation();

function CircularAnimation(id, span, center, radius, startang, rotang) {
	this.init(id);
}

CircularAnimation.prototype = Object.create(Animation.prototype);
CircularAnimation.prototype.constructor = CircularAnimation;

CircularAnimation.prototype.getMatrix = function(t) {
	var m = mat4.create();
	return m; // TODO
}