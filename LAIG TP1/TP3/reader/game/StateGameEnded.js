//StateGameEnded
StateGameEnded.prototype = Object.create(State.prototype);
StateGameEnded.prototype.constructor = StateGameEnded;

StateGameEnded.animState = {
		STARTING: 0,
		IDLE: 1,
		ENDING: 2,
		ENDED: 3
}

function StateGameEnded(modx) {
	this.init(modx);
	
	this.anim_state = StateGameEnded.animState.STARTING;
	this.animTime = -1;
	this.animDuration = 2;
	this.animEndDuration = 1;
	this.endAnimTime = -1;
	
	this.hudPlane = new Plane(this.modx.scene, 10);
	this.hudAppearance = new CGFappearance(modx.scene);
	this.hudAppearance.setAmbient(1, 1, 1, 1);
	this.hudAppearance.setDiffuse(1, 1, 1, 1);
	this.hudAppearance.setSpecular(0.3, 0.3, 0.3, 1);	
	this.hudAppearance.setShininess(120);
	this.hudAppearance.setTexture(new CGFtexture(modx.scene, "game/resources/player1wins_score.png"));

	this.modx.scene.lights[5].setPosition(2, 2, 1, 0);
	this.modx.scene.lights[5].setAmbient(1, 1, 1, 1);
	this.modx.scene.lights[5].setDiffuse(1, 1, 1, 1);
	this.modx.scene.lights[5].setSpecular(1, 1, 1, 1);
	this.modx.scene.lights[5].setVisible(false);
	
	this.modx.scene.endGame();
}

StateGameEnded.prototype.displayHUD = function(t) {
	if(this.anim_state != StateGameEnded.animState.ENDING) {
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
			this.anim_state = StateGameEnded.animState.IDLE;
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
			this.anim_state = StateGameEnded.animState.ENDED;
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

StateGameEnded.prototype.display = function(t) {
	for (var y = 0; y < Board.size; y++)
	{
		this.scene.pushMatrix();
		this.scene.translate(0, 0, y);
		for (var x = 0; x < Board.size; x++)
		{
			this.scene.graph.graphNodes["cell"].display(0);
			this.scene.translate(1, 0, 0);
		}
		this.scene.popMatrix();
	}
	this.scene.graph.graphNodes["board"].display(0);
	this.modx.displayXPieceBoxes();
	this.modx.displayPieces(t);	// TODO fix ghost piece
}

StateGameEnded.prototype.isFinished = function(t) {
	return this.anim_state == StateGameEnded.animState.ENDED;
}

StateGameEnded.prototype.terminate = function(newGame) {
	this.anim_state = StateGameEnded.animState.ENDING;
	this.animTime = -1;
	this.newGame = newGame;
}