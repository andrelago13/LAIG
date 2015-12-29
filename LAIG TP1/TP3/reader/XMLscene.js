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
	this.initScenarios();

	this.gl.clearColor(0.0, 0.0, 0.0, 1.0);

	this.gl.clearDepth(100.0);
	this.gl.enable(this.gl.DEPTH_TEST);
	//this.gl.enable(this.gl.CULL_FACE);
	//this.gl.depthFunc(this.gl.LEQUAL);
	this.gl.depthFunc(this.gl.LESS);
	this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
	this.gl.enable(this.gl.BLEND);

	this.defaultAppearance = new CGFappearance(this);

	this.axis=new CGFaxis(this);
	this.initialTransform = mat4.create();
	this.enableTextures(true);

	this.lightStatus = [false, false, false, false, false, false, false, false, false];
	this.timerStarted = false;
	this.startingTime = 0;
	this.currTime = 0;

	this.setUpdatePeriod(10);
	this.setPickEnabled(false);

	this.shader = new CGFshader(this.gl, "shaders/Gouraud/textured/multiple_light-vertex.glsl", "shaders/Gouraud/textured/fragment.glsl");
	this.setActiveShader(this.shader);

	this.modx = new Modx(this, application.interface);

	this.startGameDifficulty = '2 Players';
	this.startGameDifficulties = ['2 Players', 'vs. Easy CPU', 'vs. Hard CPU', 'CPU vs. CPU'];
	this.startGameDifficulties['2 Players'] = 0;
	this.startGameDifficulties['vs. Easy CPU'] = 1;
	this.startGameDifficulties['vs. Hard CPU'] = 2;
	this.startGameDifficulties['CPU vs. CPU'] = 3;
	this.startGameMaxScore = 8;
	this.startGamePlayTimeout = 30;
};

XMLscene.prototype.getCurrTime = function() {
	return this.currTime;
}

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
XMLscene.prototype.initScenarios = function () {
	var moonscenario = new MoonLandingScenario(this);
	var skyscenario = new AfternoonSkyScenario(this);

	this.scenarioNames = [skyscenario.getName(), moonscenario.getName()];
	this.scenarioName = this.scenarioNames[1];
	this.scenarios = [];

	this.scenarios[skyscenario.getName()] = skyscenario;
	this.scenarios[moonscenario.getName()] = moonscenario;
}

/**
 * 
 */
XMLscene.prototype.initCameras = function () {
	this.cameraName = "Player 1";
	this.cameraNames = [];
	this.cameraPositions = [];

	this.cameraTotalAnimTime = 0;
	this.cameraAnimStartTime = 0;
	this.cameraAnimTime = 0;

	this.cameraPositions[0] = vec3.fromValues(Board.size / 2, 2 * Board.size, 2.5 * Board.size + Board.size / 2);
	this.cameraPositions[1] = vec3.fromValues(Board.size / 2, 2 * Board.size, -2.5 * Board.size + Board.size / 2);
	this.cameraPositions[2] = vec3.fromValues(Board.size / 2 + 0.1, 4.5 * Board.size, Board.size / 2);

	this.oldCameraPosition = vec3.clone(this.cameraPositions[0]);
	this.newCameraPosition = vec3.clone(this.cameraPositions[0]);

	this.cameraNames[0] = "Player 1";
	this.cameraNames[1] = "Player 2";
	this.cameraNames[2] = "Top";
	this.cameraNames[this.cameraNames[0]] = 0;
	this.cameraNames[this.cameraNames[1]] = 1;
	this.cameraNames[this.cameraNames[2]] = 2;

	var position = vec3.create();
	vec3.copy(position, this.cameraPositions[0]);
	this.camera = new CGFcamera(0.4, 0.1, 500, position, vec3.fromValues(Board.size / 2, 0, Board.size / 2));
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
	this.graph.interface.initStartModX(false);
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

XMLscene.prototype.updateCameras = function(t) {
	if(this.cameraAnimTime < this.cameraTotalAnimTime)
	{
		var s = this.cameraAnimTime / this.cameraTotalAnimTime;
		/* C = camera, T = target, P = plane closest
		 * r = radius, h = height, d = distance
		 * 
		 *  P_r_C
		 *  |  /
		 * h| /d
		 *  |/
		 *  T
		 */
		var Pi = vec3.clone(this.camera.target);
		Pi[1] = this.oldCameraPosition[1];
		var Pf = vec3.clone(this.camera.target);
		Pf[1] = this.newCameraPosition[1];
		var P = vec3.lerp(vec3.create(), Pi, Pf, s);
		var PCi = vec3.sub(vec3.create(), this.oldCameraPosition, Pi);
		var PCf = vec3.sub(vec3.create(), this.newCameraPosition, Pf);
		var angle = 0;
		if (vec3.length(PCi) > 0 && vec3.length(PCf) > 0)
		{
			var dotProduct = vec3.dot(PCi, PCf);
			var angle = Math.acos(dotProduct / (vec3.length(PCi) * vec3.length(PCf))) * s;
			var crossProduct = vec3.cross(vec3.create(), PCi, PCf);
			if (vec3.dot(CGFcameraAxis.Y, crossProduct) > 0) angle = -angle;
		}
		var angleCos = Math.cos(angle);
		var angleSin = Math.sin(angle);
		var r = this.lerp(vec3.length(PCi), vec3.length(PCf), s);
		var PC = vec3.fromValues(PCi[0] * angleCos - PCi[2] * angleSin, PCi[1], PCi[0] * angleSin + PCi[2] * angleCos);
		PC = vec3.scale(vec3.create(), vec3.normalize(vec3.create(), PC), r);
		var C = vec3.add(vec3.create(), P, PC);

		this.camera.position = C;

		this.cameraAnimTime = t - this.cameraAnimStartTime;
	}
	else this.camera.position = vec3.clone(this.newCameraPosition);
}

XMLscene.prototype.lerp = function(a, b, t) {
	return a * (1.0 - t) + (b * t);
}

XMLscene.prototype.gameUndo = function() {
	if(typeof this.modx != "undefined" && this.modx != null)
		this.modx.undo();
}

XMLscene.prototype.gameRestart = function() {
	this.modx.setState(new StateStartingGame(this.modx));
	this.graph.interface.initStartModX();
}

XMLscene.prototype.startGame = function() {
	this.modx.getNewGame(this.startGameMaxScore, this.startGameDifficulties[this.startGameDifficulty]);
	this.graph.interface.removeFolder("Start Game");
	this.graph.interface.initPlayModX();
	this.modx.setPlayTimeout(this.startGamePlayTimeout);
}

XMLscene.prototype.endGame = function() {
	this.graph.interface.removeFolder("Play ModX");
	this.graph.interface.initStartModX(true);	
}

XMLscene.prototype.gameEndMovie = function() {
	this.graph.interface.initStartModX(true);
	this.modx.setState(new StateGameEnded(this.modx));
}

XMLscene.prototype.gameMovie = function() {
	if(typeof this.modx != "undefined" && this.modx != null)
	{
		this.graph.interface.removeFolder("Start Game");
		this.graph.interface.initGameMovie();	
		this.modx.gameMovie();
	}
}

/**
 * 
 */
XMLscene.prototype.display = function () {
	// Clear image and depth buffer everytime we update the scene
	this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
	this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

	// Initialize Model-View matrix as identity (no transformation)
	this.updateProjectionMatrix();
	this.loadIdentity();

	this.setActiveShaderSimple(this.shader);

	// Apply transformations corresponding to the camera position relative to the origin
	this.applyViewMatrix();

	// Draw axis
	this.axis.display();

	this.updateCameras(this.currTime);
	// ---- END Background, camera and axis setup
	for (var i = 0; i < this.graph.lights.length; i++) {
		this.pushMatrix();
		this.multMatrix(this.initialTransform);
		this.updateLights();
		this.popMatrix();
	}

	// guarantees that the graph is only displayed when correctly loaded 
	if (this.ready) {
		this.setDefaultAppearance();
		this.modx.display(this.currTime);
	};
	this.loadIdentity();

	// Display game hud
	if(this.ready) {
		this.pushMatrix();
		this.translate(-3.3,1,-10);
		this.modx.displayHUD(this.currTime);
		this.popMatrix();
		this.defaultAppearance.apply();
	}
};

XMLscene.prototype.setCameraByName = function(name) {
	if(typeof name == "undefined" || typeof this.cameraNames[name] == "undefined")
		return;

	this.graph.interface.camera.setValue(name);
}