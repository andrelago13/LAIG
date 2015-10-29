SceneLeaf.protoype = SceneNode();
SceneLeaf.prototype.constructor = SceneLeaf;

/**
 * @constructor
 * @param primitive Primitive CGFobject to be represented by this leaf 
 * @param leafId	ID string to be given as this leaf's key on the leafList array
 * @param leafList	Array of graph leafs, where this will be added
 */
function SceneLeaf(primitive, leafId, leafList) {
	SceneNode.apply(leafId, null, null, mat4.create);
		
	leafList[leafId] = this;
	this.primitive = primitive;
}

/**
 * Displays the primitive, applying it's amplification factors
 * @param texture	Current texture applied, needed to get current amplifFactors
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
 * Updates the primitive's amplification factors
 * @param amplif_s s domain amplification factor
 * @param amplif_t t domain amplification factor
 */
SceneLeaf.prototype.setAmplifFactor = function(amplif_s, amplif_t) {
	this.primitive.setAmplifFactor(amplif_s, amplif_t);
}