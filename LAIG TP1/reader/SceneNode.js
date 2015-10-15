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

SceneNode.prototype.display = function(texture) {
	this.scene.pushMatrix();
	this.scene.multMatrix(this.m);
	for(var i = 0; i < this.descendants.length; i++) {
		var newTexture = texture;
		if (this.material != null) this.material.apply();
		if (this.texture == "clear")
		{
			if (texture != null)
			{
				texture.unbind();
				newTexture = null;
			}
		}
		else if (this.texture == null)
		{
			if (texture != null)
			{
				texture.bind();
				newTexture = texture;
			}
		}
		else
		{
			this.texture.bind();
			newTexture = this.texture;
		}
		this.descendants[i].display(newTexture);
		if(this.texture != null && this.texture !== "clear") this.texture.unbind();
	}
	if (texture != null) texture.bind();
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
