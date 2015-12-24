//StateStartingGame
StateStartingGame.prototype = Object.create(State.prototype);
StateStartingGame.prototype.constructor = StateStartingGame;

StateStartingGame.animState = {
		STARTING: 0,
		IDLE: 1,
		ENDING: 2,
		ENDED: 3
}

function StateStartingGame(modx) {
	this.init(modx);
	this.anim_state = StateStartingGame.animState.STARTING;
	
	this.hudPlane = new Plane(this.modx.scene, 10);
	this.hudAppearance = new CGFappearance(modx.scene);
	this.hudAppearance.setAmbient(1, 1, 1, 1);
	this.hudAppearance.setDiffuse(1, 1, 1, 1);
	this.hudAppearance.setSpecular(0.3, 0.3, 0.3, 1);	
	this.hudAppearance.setShininess(120);
	this.hudAppearance.setTexture(new CGFtexture(modx.scene, "game/resources/start_menu.png"));
	
	this.animTime = -1;
	this.animDuration = 2;
	this.animEndDuration = 1;
	this.endAnimTime = -1;
	
	this.modx.scene.lights[5].setPosition(2, 2, 1, 0);
	this.modx.scene.lights[5].setAmbient(1, 1, 1, 1);
	this.modx.scene.lights[5].setDiffuse(1, 1, 1, 1);
	this.modx.scene.lights[5].setSpecular(1, 1, 1, 1);
	this.modx.scene.lights[5].setVisible(false);
	
	/*
	 * if(typeof this.graph.lights[i] == 'undefined')
			continue;
		this.modx.scene.lights[i].setPosition(this.graph.lights[i]["position"]["x"], this.graph.lights[i]["position"]["y"], this.graph.lights[i]["position"]["z"], this.graph.lights[i]["position"]["w"]);
		this.modx.scene.lights[i].setAmbient(this.graph.lights[i]["ambient"]["r"],this.graph.lights[i]["ambient"]["g"],this.graph.lights[i]["ambient"]["b"],this.graph.lights[i]["ambient"]["a"]);
		this.modx.scene.lights[i].setDiffuse(this.graph.lights[i]["diffuse"]["r"],this.graph.lights[i]["diffuse"]["g"],this.graph.lights[i]["diffuse"]["b"],this.graph.lights[i]["diffuse"]["a"]);
		this.modx.scene.lights[i].setSpecular(this.graph.lights[i]["specular"]["r"],this.graph.lights[i]["specular"]["g"],this.graph.lights[i]["specular"]["b"],this.graph.lights[i]["specular"]["a"]);
		if (this.graph.lights[i]["enable"])
		{
			this.modx.scene.lights[i].enable();
			this.modx.scene.lightstatus[i] = true;
		}
		else
		{
			this.modx.scene.lights[i].disable();
			this.modx.scene.lightstatus[i] = false;
		}
		this.modx.scene.lights[i].setVisible(false);
		this.modx.scene.lights[i].update();
		this.graph.interface.addFolder("Lights");
		this.graph.interface.addLightToggler(i, this.graph.lights[i]["id"]);
	 */
}

StateStartingGame.prototype.displayHUD = function(t) {
	if(this.anim_state != StateStartingGame.animState.ENDING) {
		this.modx.scene.lights[5].enable();
		this.modx.scene.lights[5].update();
		if(this.animTime == -1 || t < this.animTime) {
			this.animTime = t;
			return;
		}
		
		this.modx.scene.pushMatrix();
		this.hudAppearance.apply();
		this.modx.scene.translate(1.3, -2.3, 0);
		
		if(t > this.animTime + this.animDuration) {
			this.anim_state = StateStartingGame.animState.IDLE;
			this.modx.scene.scale(4, 2.5, 1);
		} else {
			anim_prop = (t-this.animTime)/this.animDuration;
			this.modx.scene.scale(4*anim_prop, 2.5*anim_prop,1);
		}
		
		this.modx.scene.translate(0.5, 0.5, 0);
		this.hudPlane.display();
		this.modx.scene.popMatrix();
	} else {
		this.modx.scene.lights[5].enable();
		this.modx.scene.lights[5].update();
		if(this.animTime == -1 || t < this.animTime) {
			this.animTime = t;
			return;
		}
		
		this.modx.scene.pushMatrix();
		this.hudAppearance.apply();
		this.modx.scene.translate(1.3, -2.3, 0);
		
		if(t > this.animTime + this.animEndDuration) {
			this.anim_state = StateStartingGame.animState.ENDED;
			this.modx.scene.scale(0, 0, 1);
			this.modx.start(this.newGame);
			this.modx.scene.lights[5].disable();
			this.modx.scene.lights[5].update();
		} else {
			anim_prop = (t-this.animTime)/this.animEndDuration;
			this.modx.scene.scale(4*(1 - anim_prop), 2.5*(1 - anim_prop),1);
		}
		
		this.modx.scene.translate(0.5, 0.5, 0);
		this.hudPlane.display();
		this.modx.scene.popMatrix();
	}		
}

StateStartingGame.prototype.display = function(t) {}

StateStartingGame.prototype.isFinished = function(t) {
	return this.anim_state == StateStartingGame.animState.ENDED;
}

StateStartingGame.prototype.terminate = function(newGame) {
	this.anim_state = StateStartingGame.animState.ENDING;
	this.animTime = -1;
	this.newGame = newGame;
}