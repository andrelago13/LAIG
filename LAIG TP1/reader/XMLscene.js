
function XMLscene() {
	CGFscene.call(this);
}

XMLscene.prototype = Object.create(CGFscene.prototype);
XMLscene.prototype.constructor = XMLscene;

XMLscene.prototype.init = function (application) {
	CGFscene.prototype.init.call(this, application);

	this.initCameras();

	this.gl.clearColor(0.0, 0.0, 0.0, 1.0);

	this.gl.clearDepth(100.0);
	this.gl.enable(this.gl.DEPTH_TEST);
	this.gl.enable(this.gl.CULL_FACE);
	this.gl.depthFunc(this.gl.LEQUAL);

	this.axis=new CGFaxis(this);
};

XMLscene.prototype.initLights = function () {

	this.shader.bind();

	for (var i = 0; i < this.graph.lights.length; i++)
	{
		this.lights[i].setPosition(this.graph.lights[i]["position"]["x"], this.graph.lights[i]["position"]["y"], this.graph.lights[i]["position"]["z"], this.graph.lights[i]["position"]["w"]);
		this.lights[i].setAmbient(this.graph.lights[i]["ambient"]["r"],this.graph.lights[i]["ambient"]["g"],this.graph.lights[i]["ambient"]["b"],this.graph.lights[i]["ambient"]["a"]);
		this.lights[i].setDiffuse(this.graph.lights[i]["diffuse"]["r"],this.graph.lights[i]["diffuse"]["g"],this.graph.lights[i]["diffuse"]["b"],this.graph.lights[i]["diffuse"]["a"]);
		this.lights[i].setSpecular(this.graph.lights[i]["specular"]["r"],this.graph.lights[i]["specular"]["g"],this.graph.lights[i]["specular"]["b"],this.graph.lights[i]["specular"]["a"]);
		if (this.graph.lights[i]["enable"])
			this.lights[i].enable();
		else
			this.lights[i].disable();
		this.lights[i].update();
	}

	this.shader.unbind();
};

XMLscene.prototype.initPrimitives = function () {
	this.primitives = [];
	for (var key in this.graph.leaves) {
		if (this.graph.leaves[key]["type"] == "rectangle")
		{
			this.primitives.push([key, new Rectangle(this, 0, 1, 0, 1)]);
		}
	}
}

XMLscene.prototype.initCameras = function () {
	this.camera = new CGFcamera(0.4, 0.1, 500, vec3.fromValues(15, 15, 15), vec3.fromValues(0, 0, 0));
};

XMLscene.prototype.setDefaultAppearance = function () {
	this.setAmbient(0.2, 0.4, 0.8, 1.0);
	this.setDiffuse(0.2, 0.4, 0.8, 1.0);
	this.setSpecular(0.2, 0.4, 0.8, 1.0);
	this.setShininess(10.0);	
};

//Handler called when the graph is finally loaded. 
//As loading is asynchronous, this may be called already after the application has started the run loop
XMLscene.prototype.onGraphLoaded = function () 
{
	this.gl.clearColor(0, 0, 0, 1);
	this.initLights();
	this.initPrimitives();
};

XMLscene.prototype.display = function () {
	// ---- BEGIN Background, camera and axis setup
	this.shader.bind();

	// Clear image and depth buffer everytime we update the scene
	this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
	this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

	// Initialize Model-View matrix as identity (no transformation
	this.updateProjectionMatrix();
	this.loadIdentity();

	// Apply transformations corresponding to the camera position relative to the origin
	this.applyViewMatrix();

	// Draw axis
	this.axis.display();

	this.setDefaultAppearance();

	// ---- END Background, camera and axis setup

	// it is important that things depending on the proper loading of the graph
	// only get executed after the graph has loaded correctly.
	// This is one possible way to do it
	if (this.graph.loadedOk)
	{
		for (var i = 0; i < this.primitives.length; i++)
		{
			this.primitives[i][1].display();
		}

		this.lights[0].update();
	};	

	this.shader.unbind();
};

