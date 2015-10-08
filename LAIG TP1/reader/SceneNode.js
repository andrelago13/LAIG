/*
 * Represents scene graph node
 */

function SceneNode() {
	this.material = null;
	this.texture = null;
	this.m = null;
	this.descendants = null;
}

function SceneNode(parsedNode) {
}

SceneNode.prototype.push = function(SceneNodename) {
	this.descendants.push(SceneNodename);
}

SceneNode.prototype.setMatrix = function(m) {
	this.m = mat4.clone(m);
	//console.log(this.m);
}