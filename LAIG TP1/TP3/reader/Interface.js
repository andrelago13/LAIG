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
	
	dat.GUI.prototype.removeFolder = function(name) {
	    var folder = this.__folders[name];
	    if (!folder) {
	      return;
	    }
	    folder.close();
	    this.__ul.removeChild(folder.domElement.parentNode);
	    delete this.__folders[name];
	    this.onResize();
	  }

	this.gui = new dat.GUI();
	
	return true;
};

Interface.prototype.resetFolder = function(name) {
	switch(name) {
	case "Lights":
		this.lights = this.gui.addFolder("Lights");	
		return;
	case "Play ModX":
		this.modxFolder = this.gui.addFolder("Play ModX");
		return;
	case "Start Game":
		this.startGameFolder = this.gui.addFolder("Start Game");
		return;
	}
}

Interface.prototype.addFolder = function(name) {
	switch(name) {
	case "Lights":
		if(typeof this.lights == "undefined")
			this.lights = this.gui.addFolder("Lights");	
		return;
	case "Play ModX":
		if(typeof this.modxFolder == "undefined")
			this.modxFolder = this.gui.addFolder("Play ModX");
		return;
	case "Start Game":
		if(typeof this.startGameFolder == "undefined")
			this.startGameFolder = this.gui.addFolder("Start Game");
		return;
	}
}

Interface.prototype.removeFolder = function(name) {
	switch(name) {
	case "Lights":
		if(typeof this.lights != "undefined")
			this.gui.removeFolder("Lights");
			//this.gui.__ul.removeChild(this.lights.domElement.parentNode);
		return;
	case "Play ModX":
		if(typeof this.modxFolder != "undefined")
			this.gui.removeFolder("Play ModX");
			//this.gui.__ul.removeChild(this.modxFolder.domElement.parentNode);
		return;
	case "Start Game":
		if(typeof this.startGameFolder != "undefined")
			this.gui.removeFolder("Start Game");
			//this.gui.__ul.removeChild(this.startGameFolder.domElement.parentNode);			
		return;
	}
}

Interface.prototype.initPlayModX = function() {
	this.resetFolder("Play ModX");
	
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
	
	this.modxFolder.add(this.scene, "gameUndo").name("UNDO");
	
	this.modxFolder.open();
}

Interface.prototype.initStartModX = function(show_movie) {
	this.resetFolder("Start Game");

	var max_score = this.startGameFolder.add(this.scene, 'startGameMaxScore', 5, 14, 1);
	max_score.name("Max Game Score");
	max_score.step(1);
	this.startGameFolder.add(this.scene, 'startGameDifficulty', this.scene.startGameDifficulties).name("Game Type");
	var play_timeout = this.startGameFolder.add(this.scene, 'startGamePlayTimeout', 5, 120, 1);
	play_timeout.name("Play Timeout");
	play_timeout.step(1);
	this.startGameFolder.add(this.scene, "startGame").name("Start Game");
	if(typeof show_movie != "undefined" && show_movie)
		this.startGameFolder.add(this.scene, "gameMovie").name("Game Movie");
	
	this.startGameFolder.open();
}

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
