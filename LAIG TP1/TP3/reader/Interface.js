/**
 * Interface
 * @constructor
 */


function Interface() {
	//call CGFinterface constructor 
	CGFinterface.call(this);
};

Interface.prototype = Object.create(CGFinterface.prototype);
Interface.prototype.constructor = Interface;

/**
 * init
 * @param {CGFapplication} application
 */
Interface.prototype.init = function(application) {
	CGFinterface.prototype.init.call(this, application);
	this.gui = new dat.GUI();
	this.lights = this.gui.addFolder("Lights");
	this.modxFolder = this.gui.addFolder("Play ModX");
	
	this.camera = this.modxFolder.add(this.scene, 'cameraName', this.scene.cameraNames).name("Camera");
	var scene = this.scene;
	this.camera.onChange(function(value) {
		scene.oldCameraPosition = vec3.clone(scene.camera.position);
		scene.newCameraPosition = vec3.clone(scene.cameraPositions[scene.cameraNames[value]]);
		scene.cameraAnimTime = 0;
		scene.cameraAnimStartTime = scene.currTime;
		scene.cameraTotalAnimTime = 1;
	});
	
	this.modxFolder.add(this.scene, 'scenarioName', this.scene.scenarioNames).name("Scenario");
	this.derp = 0;
	this.modx = null;
	
	this.modxFolder.open();
    //this.gui.__ul.removeChild(this.lights.domElement.parentNode);

	this.startGameFolder = this.gui.addFolder("Start ModX");
	this.startGameFolder.add(this.scene, 'startGameDifficulty', this.scene.startGameDifficulties).name("Game Type");
	this.startGameFolder.add(this.scene, "startGame").name("Start Game");
	
	return true;
};

Interface.prototype.addLightToggler = function(i, id){
	this.lights.add(this.scene.lightStatus, i, this.scene.lightStatus[i]).name(id);
}

Interface.prototype.processKeyDown = function(event) {
	if(event.keyIdentifier === "U+0020" && event.type === "keydown") {
		this.scene.resetAnims();
	}
}

Interface.prototype.processMouseDown = function(event) {
	this.scene.onPick(event);
	if (this.scene.modx !== null)
		this.scene.modx.onClick(event);
}

Interface.prototype.processMouseMove = function(event) {
	this.scene.onPick(event);
	if (this.scene.modx !== null)
		this.scene.modx.lastMoveEvent = event;
}
