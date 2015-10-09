SceneLeaf.protoype = new SceneNode();
SceneLeaf.constructor = SceneLeft;

function SceneLeaf(primitive) {
	this.m = mat4.create();
	this.primitive = primitive;
}

SceneLeaf.prototype.display = function () {
	this.primitive.display();
}