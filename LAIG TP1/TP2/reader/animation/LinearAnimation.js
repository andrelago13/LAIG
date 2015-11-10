function LinearAnimation(id, span, controlPoints) {
	this.init(id);
	this.span = span;
	this.controlPoints = controlPoints;

	this.totalDistance = 0;
	for (var i = 1; i < controlPoints.length; i++)
	{
		this.totalDistance += this.calculateDistance(controlPoints[i - 1], controlPoints[i]);
	}
}

LinearAnimation.prototype = Object.create(Animation.prototype);
LinearAnimation.prototype.constructor = LinearAnimation;

LinearAnimation.prototype.getMatrix = function(t) {
	var m = mat4.create();
	if (t > this.span)
	{
		mat4.translate(m, m, this.controlPoints[this.controlPoints.length - 1]);
		mat4.rotate(m, m, this.calculateRotation(this.controlPoints[this.controlPoints.length - 2], this.controlPoints[this.controlPoints.length - 1]), [0, 1, 0]);
		return m;
	}
	var totalS = this.totalDistance * t / this.span;
	var currentDist = 0;
	var i;
	var dist;
	for (i = 1; i < this.controlPoints.length; i++)
	{
		dist = this.calculateDistance(this.controlPoints[i - 1], this.controlPoints[i]);
		if (currentDist + dist < totalS)
			currentDist += dist;
		else
			break;
	}
	var s = totalS - currentDist;
	var interp = this.lerp(this.controlPoints[i - 1], this.controlPoints[i], s / dist);
	mat4.translate(m, m, interp);

	mat4.rotate(m, m, this.calculateRotation(this.controlPoints[i - 1], this.controlPoints[i]), [0, 1, 0]);

	return m;
}

LinearAnimation.prototype.calculateRotation = function(p1, p2) {
	return Math.atan2(p2[0] - p1[0], p2[2] - p1[2]);
}

LinearAnimation.prototype.calculateDistance = function(p1, p2) {
	return Math.sqrt(
			Math.pow(p2[0] - p1[0], 2) +
			Math.pow(p2[1] - p1[1], 2) +
			Math.pow(p2[2] - p1[2], 2));
}

LinearAnimation.prototype.lerp = function(p1, p2, t) {
	var result = [];
	for (var i = 0; i < p1.length; i++)
	{
		result[i] = p1[i] * (1.0 - t) + (p2[i] * t);
	}
	return result;
}