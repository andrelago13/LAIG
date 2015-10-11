/*
 * Represents scene graph node
 */

function SceneNode() {
	this.id = null;
	this.material = null;
	this.texture = null;
	this.m = null;
	this.descendants = [];
	this.scene = null;
}

SceneNode.prototype.constructor=SceneNode;

function SceneNode(id, material, texture, transforms, scene) {
	this.id = id;
	this.material = material;
	this.texture = texture;
	this.m = transforms;
	this.descendants = [];
	this.scene = scene;
}

SceneNode.prototype.display = function() {
	this.scene.pushMatrix();
	this.scene.multMatrix(this.m);
	var currTexture = this.scene.activeTexture;
	for(var i = 0; i < this.descendants.length; i++) {
		if (this.material !== null) this.material.apply();
		if (this.texture === "clear")
		{
			if (this.scene.activeTexture !== null)
				this.scene.activeTexture.unbind();
		}
		else if (this.texture === null)
		{
			if (currTexture !== null) currTexture.bind();
		}
		else
			this.texture.bind();
		this.descendants[i].display();
		if(this.texture !== null) this.texture.unbind();
	}
	if (currTexture !== null) currTexture.bind();
	this.scene.popMatrix();
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
