/*
 * Represents scene graph node
 */
/**
 * @constructor
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

/**
 * @constructor
 */
function SceneNode(id, material, texture, transforms, scene) {
	this.id = id;
	this.material = material;
	this.texture = texture;
	this.m = transforms;
	this.descendants = [];
	this.scene = scene;
}

/**
 * 
 * @param texture
 * @param parentAppearance
 */
SceneNode.prototype.display = function(texture, parentAppearance) {
	this.scene.pushMatrix();
	this.scene.multMatrix(this.m);
	for(var i = 0; i < this.descendants.length; i++) {
		var newTexture = texture;
		var newMaterial = parentAppearance;
		if (this.material != null) {
			this.material.apply();
			newMaterial = this.material;
		} else if(parentAppearance != null) {
			parentAppearance.apply();
		}
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
		this.descendants[i].display(newTexture, newMaterial);
		if(this.texture != null && this.texture !== "clear") this.texture.unbind();
	}
	if (texture != null) texture.bind();
	this.scene.popMatrix();
}

/**
 * 
 * @param sceneNode
 */
SceneNode.prototype.push = function(sceneNode) {
	this.descendants.push(sceneNode);
}

/**
 * 
 * @param m
 */
SceneNode.prototype.setMatrix = function(m) {
	this.m = mat4.clone(m);
	//console.log(this.m);
}

/**
 * 
 * @param material
 */
SceneNode.prototype.setMaterial = function(material) {
	this.material = material;
}

/**
 * 
 * @param tex
 */
SceneNode.prototype.setTexture = function(tex) {
	this.texture = tex;
}

/**
 * 
 * @returns the node's matrix
 */
SceneNode.prototype.getMatrix = function() {
	return this.m;
}

/**
 * 
 * @returns the node's material
 */
SceneNode.prototype.getMaterial = function() {
	return this.material;
}

/**
 * 
 * @returns the node's texture
 */
SceneNode.prototype.getTexture = function() {
	return this.texture;
}

/**
 * 
 * @returns {Array} the node's descendants
 */
SceneNode.prototype.getDescendants = function() {
	return this.descendants;
}
