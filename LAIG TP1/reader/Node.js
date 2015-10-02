/*
 * Represents scene graph Node
 */

function Node() {
	this.material = null;
	this.texture = null;
	this.m = null;
	this.descendants = null;
}

Node.prototype.push = function(nodename) {
	this.descendants.push(nodename);
}

Node.prototype.setMatrix = function(m) {
	this.m = mat4.clone(m);
	//console.log(this.m);
}