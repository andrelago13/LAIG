/**
 * @constructor
 */
function XMLscene() {
	CGFscene.call(this);
}

XMLscene.prototype = Object.create(CGFscene.prototype);
XMLscene.prototype.constructor = XMLscene;

/**
 * 
 * @param application
 */
XMLscene.prototype.init = function (application) {
	CGFscene.prototype.init.call(this, application);
	this.ready = false;
	this.initCameras();

	this.gl.clearColor(0.0, 0.0, 0.0, 1.0);

	this.gl.clearDepth(100.0);
	this.gl.enable(this.gl.DEPTH_TEST);
	this.gl.enable(this.gl.CULL_FACE);
	this.gl.depthFunc(this.gl.LEQUAL);
	//this.gl.depthFunc(this.gl.LESS);
	//this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
	//this.gl.enable(this.gl.BLEND);
	
	this.axis=new CGFaxis(this);
	this.initialTransform = mat4.create();
	this.enableTextures(true);

	this.lightStatus = [false, false, false, false, false, false, false, false, false];
	this.timerStarted = false;
	this.startingTime = 0;
	this.currTime = 0;
	
	this.setUpdatePeriod(10);
	
	this.shader = new CGFshader(this.gl, "shaders/Gouraud/textured/multiple_light-vertex.glsl", "shaders/Gouraud/textured/fragment.glsl");
	this.setActiveShader(this.shader);
	//right, left, up, down, front, back
	this.test = new Skybox(this, ["scenes/tp3/textures/cubemap/right.jpg", 
	                              "scenes/tp3/textures/cubemap/left.jpg", 
	                              "scenes/tp3/textures/cubemap/up.jpg", 
	                              "scenes/tp3/textures/cubemap/down.jpg", 
	                              "scenes/tp3/textures/cubemap/front.jpg", 
	                              "scenes/tp3/textures/cubemap/back.jpg"]);
	
	this.modx = new Modx(this);
};

XMLscene.prototype.resetAnims = function() {
	this.timerStarted = false;
}

XMLscene.prototype.update = function(currTime) {
	if (!this.timerStarted && this.ready)
	{
		this.startingTime = currTime;
		this.timerStarted = true;
	}
	this.currTime = (currTime - this.startingTime) / 1000.0;
}

/**
 * 
 */
XMLscene.prototype.initLights = function () {

	var globalAmbient = this.graph.illumination["ambient"];
	if(typeof globalAmbient != 'undefined')
		this.setGlobalAmbientLight(globalAmbient["r"], globalAmbient["g"], globalAmbient["b"], globalAmbient["a"]);

	for (var i = 0; i < this.graph.lights.length; i++)
	{
		if(typeof this.graph.lights[i] == 'undefined')
			continue;
		this.lights[i].setPosition(this.graph.lights[i]["position"]["x"], this.graph.lights[i]["position"]["y"], this.graph.lights[i]["position"]["z"], this.graph.lights[i]["position"]["w"]);
		this.lights[i].setAmbient(this.graph.lights[i]["ambient"]["r"],this.graph.lights[i]["ambient"]["g"],this.graph.lights[i]["ambient"]["b"],this.graph.lights[i]["ambient"]["a"]);
		this.lights[i].setDiffuse(this.graph.lights[i]["diffuse"]["r"],this.graph.lights[i]["diffuse"]["g"],this.graph.lights[i]["diffuse"]["b"],this.graph.lights[i]["diffuse"]["a"]);
		this.lights[i].setSpecular(this.graph.lights[i]["specular"]["r"],this.graph.lights[i]["specular"]["g"],this.graph.lights[i]["specular"]["b"],this.graph.lights[i]["specular"]["a"]);
		if (this.graph.lights[i]["enable"])
		{
			this.lights[i].enable();
			this.lightStatus[i] = true;
		}
		else
		{
			this.lights[i].disable();
			this.lightStatus[i] = false;
		}
		this.lights[i].setVisible(false);
		this.lights[i].update();
		this.graph.interface.addLightToggler(i, this.graph.lights[i]["id"]);
	}
};

/**
 * 
 */
XMLscene.prototype.setInitials = function () {
	if(typeof this.graph.initials["frustum"] != 'undefined') {
		this.camera.near = this.graph.initials["frustum"]["near"];
		this.camera.far = this.graph.initials["frustum"]["far"];
	}

	if(typeof this.graph.initials["transform"] != 'undefined')
		this.initialTransform = mat4.clone(this.graph.initials["transform"]);
	else
		this.initialTransform = mat4.create();

	if(typeof this.graph.initials["reference"] != 'undefined' && this.graph.initials["reference"] <= 0) {
		this.axis = new CGFaxis(this, 0, 0);
	} else {
		this.axis = new CGFaxis(this, this.graph.initials["reference"]);
	}
}

/**
 * 
 */
XMLscene.prototype.initPrimitives = function () {
	this.primitives = [];
	for (var key in this.graph.leaves) {
		if (this.graph.leaves[key]["type"] == "rectangle")
		{
			this.primitives.push([key, new Rectangle(this, 0, 1, 0, 1)]);
		}
	}
}

/**
 * 
 */
XMLscene.prototype.initCameras = function () {
	this.camera = new CGFcamera(0.4, 0.1, 500, vec3.fromValues(15, 15, 15), vec3.fromValues(0, 0, 0));
};

/**
 * 
 */
XMLscene.prototype.setDefaultAppearance = function () {
	this.setAmbient(1.0, 1.0, 1.0, 1.0);
	this.setDiffuse(1.0, 1.0, 1.0, 1.0);
	this.setSpecular(1.0, 1.0, 1.0, 1.0);
	this.setShininess(1.0);	
};

/**
 * Handler called when the graph is finally loaded. 
 * As loading is asynchronous, this may be called already after the application has started the run loop
 */
XMLscene.prototype.onGraphLoaded = function () 
{
	var background = this.graph.illumination["background"];
	if(typeof background != 'undefined')
		this.gl.clearColor(background["r"], background["g"], background["b"], background["a"]);
	this.setInitials();
	this.initLights();
	this.initPrimitives();
	this.ready = true;
	console.log("Press SPACE to reset the animations.");
};

/**
 * 
 */
XMLscene.prototype.updateLights = function(){
	for(var i = 0; i < this.lights.length; i++)
	{
		if(this.lightStatus[i])	this.lights[i].enable();
		else this.lights[i].disable();

		this.lights[i].update();
	}
}

/**
 * 
 */
XMLscene.prototype.display = function () {
	
	// Clear image and depth buffer everytime we update the scene
	this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
	this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
	
	this.setActiveShader(this.shader);
	
	// Initialize Model-View matrix as identity (no transformation)
	this.updateProjectionMatrix();
	this.loadIdentity();
	
	// Apply transformations corresponding to the camera position relative to the origin
	this.applyViewMatrix();

	// Draw axis
	this.axis.display();
	
	this.test.display();

	this.setDefaultAppearance();

	// ---- END Background, camera and axis setup
	for (var i = 0; i < this.graph.lights.length; i++) {
		this.pushMatrix();
		this.multMatrix(this.initialTransform);
		this.updateLights();
		this.popMatrix();
	}
	
	// guarantees that the graph is only displayed when correctly loaded 
	if (this.ready) {
		this.modx.display();
	};
};
