function Skybox(scene, paths) {
	this.scene = scene;
	this.reversedSphere = new ReversedSphere(scene, 300, 5, 5);
	this.cubemap = new Cubemap(scene, paths);
};

Skybox.prototype.constructor = Skybox;

Skybox.prototype.display = function() {
	this.cubemap.bind();
	this.reversedSphere.display();
	this.cubemap.unbind();
}