function Animation() {
	
}

Animation.prototype.constructor = Animation;

Animation.prototype.init = function(id) {
	this.id = id;
}

Animation.prototype.finished = function(t) {
	// Abstract
}