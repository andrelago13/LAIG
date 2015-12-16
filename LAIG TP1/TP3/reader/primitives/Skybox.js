//left, right, up, down, front, back
function Skybox(scene, paths) {
	this.scene = scene;
	this.reversedSphere = new ReversedSphere(scene, 300, 3, 3);
	this.cubemap = new Cubemap(scene, paths);
	this.cubemapShader = new CGFshader(this.scene.gl, "shaders/Cubemap/vertex.glsl", "shaders/Cubemap/fragment.glsl");
	this.cubemapShader.setUniformsValues({uCubemap: 2});
};

Skybox.prototype.constructor = Skybox;

Skybox.prototype.display = function() {
	var currentShader = this.scene.activeShader;
	this.scene.setActiveShaderSimple(this.cubemapShader);
	this.cubemap.bind(2);
	this.reversedSphere.display();
	this.cubemap.unbind(2);
	this.scene.setActiveShaderSimple(currentShader);
}