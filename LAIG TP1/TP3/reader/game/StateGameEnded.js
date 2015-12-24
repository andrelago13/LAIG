//StateGameEnded
StateGameEnded.prototype = Object.create(State.prototype);
StateGameEnded.prototype.constructor = StateGameEnded;

function StateGameEnded(modx) {
	/*this.init(modx);

	this.hudPlane = new Plane(this.modx.scene, 10);
	this.hudAppearance = new CGFappearance(modx.scene);
	this.hudAppearance.setAmbient(1, 1, 1, 1);
	this.hudAppearance.setDiffuse(1, 1, 1, 1);
	this.hudAppearance.setSpecular(0.3, 0.3, 0.3, 1);	
	this.hudAppearance.setShininess(120);
	
	if(this.modx.getWinner() == 1) {
		this.hudAppearance.setTexture(new CGFtexture(modx.scene, "game/resources/winner_1.png"));
	} else {
		this.hudAppearance.setTexture(new CGFtexture(modx.scene, "game/resources/winner_2.png"));
	}
	
	this.modx.scene.lights[5].setPosition(2, 2, 1, 0);
	this.modx.scene.lights[5].setAmbient(1, 1, 1, 1);
	this.modx.scene.lights[5].setDiffuse(1, 1, 1, 1);
	this.modx.scene.lights[5].setSpecular(1, 1, 1, 1);
	this.modx.scene.lights[5].setVisible(false);
	
	this.modx.scene.endGame();*/
}

StateGameEnded.prototype.displayHUD = function(t) {
	/*this.modx.scene.lights[5].enable();
	this.modx.scene.lights[5].update();
	if(this.animTime == -1 || t < this.animTime) {
		this.animTime = t;
		return;
	}

	this.modx.scene.pushMatrix();
	this.hudAppearance.apply();
	this.modx.scene.translate(1.3, -2.3, 0);

	if(t > this.animTime + this.animDuration) {
		this.anim_state = StateGameEnded.animState.IDLE;
		this.modx.scene.scale(4, 2.5, 1);
	} else {
		anim_prop = (t-this.animTime)/this.animDuration;
		this.modx.scene.scale(4*anim_prop, 2.5*anim_prop,1);
	}

	this.modx.scene.translate(0.5, 0.5, 0);
	this.hudPlane.display();
	this.modx.scene.popMatrix();*/
}

StateGameEnded.prototype.display = function(t) {}

StateGameEnded.prototype.isFinished = function(t) {
	return false;
}