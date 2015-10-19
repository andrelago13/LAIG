SceneLeaf.protoype = SceneNode();
SceneLeaf.prototype.constructor = SceneLeaf;

/**
 * @constructor
 * @param primitive
 * @param leafId
 * @param leafList
 */
function SceneLeaf(primitive, leafId, leafList) {
	SceneNode.apply(leafId, null, null, mat4.create);
		
	leafList[leafId] = this;
	this.primitive = primitive;
}

/**
 * 
 * @param texture
 */
SceneLeaf.prototype.display = function (texture) {
	if (texture != null)
	{
		var amplifFactor = texture.getAmplifFactor();
		this.setAmplifFactor(amplifFactor[0], amplifFactor[1]);
	}
	this.primitive.display();
}

/**
 * 
 * @returns the identity matrix
 */
SceneLeaf.prototype.getMatrix = function () {
	return mat4.create();
}

/**
 * 
 * @returns the leaf's material
 */
SceneLeaf.prototype.getMaterial = function () {
	return this.material;
}

/**
 * 
 * @returns the leaf's texture
 */
SceneLeaf.prototype.getTexture = function () {
	return this.texture;
}

/**
 * 
 * @param amplif_s
 * @param amplif_t
 */
SceneLeaf.prototype.setAmplifFactor = function(amplif_s, amplif_t) {
	this.primitive.setAmplifFactor(amplif_s, amplif_t);
}