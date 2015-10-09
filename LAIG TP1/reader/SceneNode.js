/*
 * Represents scene graph node
 */

function SceneNode() {
	this.id = null;
	this.material = null;
	this.texture = null;
	this.m = null;
	this.descendants = [];
}

SceneNode.prototype.constructor=SceneNode;

function SceneNode(id, material, texture, transforms) {
	this.id = id;
	this.material = material;
	this.texture = texture;
	this.m = transforms;
	this.descendants = [];
}

SceneNode.prototype.push = function(sceneNode) {
	this.descendants.push(sceneNode);
}

SceneNode.prototype.setMatrix = function(m) {
	this.m = mat4.clone(m);
	//console.log(this.m);
}

SceneNode.prototype.setMaterial = function(material) {
	this.material = material;
}

SceneNode.prototype.setTexture = function(tex) {
	this.texture = tex;
}

SceneNode.prototype.getMatrix = function() {
	return this.m;
}

SceneNode.prototype.getMaterial = function() {
	return this.material;
}

SceneNode.prototype.getTexture = function() {
	return this.texture;
}

SceneNode.prototype.getDescendants = function() {
	return this.descendants;
}