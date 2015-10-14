SceneLeaf.protoype = SceneNode();
SceneLeaf.prototype.constructor = SceneLeaf;

function SceneLeaf(primitive, leafId, leafList) {
	SceneNode.apply(leafId, null, null, mat4.create);
		
	leafList[leafId] = this;
	this.primitive = primitive;
}

SceneLeaf.prototype.display = function () {
	this.primitive.display();
}

SceneLeaf.prototype.getMatrix = function () {
	return mat4.create();
}

SceneLeaf.prototype.getMaterial = function () {
	return this.material;
}

SceneLeaf.prototype.getTexture = function () {
	return this.texture;
}

SceneLeaf.prototype.setAmplifFactor = function(amplif_s, amplif_t) {
	this.primitive.setAmplifFactor(amplif_s, amplif_t);
}