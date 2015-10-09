SceneLeaf.protoype = Object.create(SceneNode.prototype)
SceneLeaf.prototype.constructor = SceneLeaf;

function SceneLeaf(primitive, leafId, leafList) {
	//SceneNode.call(this, nodeId, nodeIdList, materialList, textureList, nodeList);
		
	this.id = leafId;
	leafList[leafId] = this;
	this.material = null;
	this.texture = null;
	this.m = mat4.create();
	this.descendants = [];

	this.primitive = primitive;
}

SceneLeaf.prototype.display = function () {
	this.primitive.display();
}