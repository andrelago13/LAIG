//left, right, up, down, front, back
function Skybox(scene, paths) {
	this.scene = scene;
	this.reversedSphere = new ReversedSphere(scene, 300, 3, 3);
	this.cubemap = new Cubemap(scene, paths);
	this.cubemapShader = new CGFshader(this.scene.gl, "shaders/Cubemap/vertex.glsl", "shaders/Cubemap/fragment.glsl");
};

Skybox.prototype.constructor = Skybox;

Skybox.prototype.display = function() {
	this.cubemap.bind();
	var currentShader = this.scene.shader;
	this.scene.setActiveShader(this.cubemapShader);
	this.reversedSphere.display();
	this.scene.setActiveShader(currentShader);
	this.cubemap.unbind();
}