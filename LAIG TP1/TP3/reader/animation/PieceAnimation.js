PieceAnimation.prototype = new Animation();

function PieceAnimation(id, span, startPos, endPos, maxHeight) {
	this.init(id);
	this.span = span;
	this.startPos = startPos;
	this.endPos = endPos;
	this.a = 0.5;
	this.b = maxHeight;
}

PieceAnimation.prototype = Object.create(Animation.prototype);
PieceAnimation.prototype.constructor = PieceAnimation;

PieceAnimation.prototype.getMatrix = function(t) {
	var m = mat4.create();
	
	if (t > this.span) t = this.span;
	
	// Elliptic parametric equations
	var s = Math.PI * t / this.span;
	var x = 0.5 - this.a * Math.cos(s);
	var y = this.b * Math.sin(s);
	
	var pos = vec3.lerp(vec3.create(), this.startPos, this.endPos, x);
	vec3.add(pos, pos, [0, y, 0])
	mat4.translate(m, m, pos);
	mat4.translate(m, m, [0.5, 0, 0.5]);
	mat4.rotate(m, m, 2 * s, [1, 1, 1]);
	mat4.translate(m, m, [-0.5, 0, -0.5]);
	return m;
}

PieceAnimation.prototype.finished = function(t) {
	return t > this.span;
}