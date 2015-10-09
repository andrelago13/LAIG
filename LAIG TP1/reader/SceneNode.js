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

function SceneNode(nodeId, nodeIdList, materialList, textureList, nodeList) {
	
	console.log("Create node");
	this.id = nodeId;
	nodeList[nodeId] = this;
	
	var nodeArray = nodeIdList[nodeId];
	this.material = materialList[nodeArray["material"]];
	this.texture = textureList[nodeArray["texture"]];
	this.m = nodeArray["transforms"].matrix;
	
	var desc = nodeArray["descendants"];
	// FIXME check for node in leafs
	for(var i = 0; i < desc.length; i++) {
		if(typeof nodeList[desc[i]] == 'undefined') {
			this.descendants.push(nodeList[desc[i]]);
		} else {
			this.descendants.push(new SceneNode(desc[i], nodeIdList, materialList, textureList, nodeList));
		}
	}
}

SceneNode.prototype.push = function(SceneNodename) {
	this.descendants.push(SceneNodename);
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