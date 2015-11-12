/**
 * AnimationSet
 * @constructor
 */
function AnimationSet(animations) {
	this.animationVec = [];
	if( (typeof animations) != 'undefined' && animations != null) {
		this.animationVec = animations;
	}
	this.totalSpan = 0;
	for(var i = 0; i < this.animationVec.length; ++i) {
		this.totalSpan += this.animationVec[i].span;
	}
};

AnimationSet.prototype.constructor=AnimationSet;

AnimationSet.prototype.getMatrix = function(time) {
	
	if(this.animationVec.length === 0)
		return mat4.create();
	
	if(time > this.totalSpan) {
		return this.animationVec[this.animationVec.length - 1].getMatrix(this.animationVec[this.animationVec.length - 1].span);
	}
	
	var matrix = mat4.create();
	var remainingTime = time;
	
	for(var i = 0; i < this.animationVec.length; ++i) {
		if(remainingTime < this.animationVec[i].span) {
			mat4.multiply(matrix, matrix, this.animationVec[i].getMatrix(remainingTime));
			break;
		} else {
			remainingTime -= this.animationVec[i].span;
		}
	}
	
	return matrix;
}