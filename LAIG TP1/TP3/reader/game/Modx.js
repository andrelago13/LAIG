Modx.xPieceTypes = {
		NONE: -1,
		JOKER: 0,
		PLAYER1: 1,
		PLAYER2: 2
}

/**
 * Modx
 * @constructor
 */
function Modx(scene) {
	this.scene = scene;
	this.setState(new StateWaitingForPlay(this));
	this.gameHistory = [];
};

Modx.prototype.start = function() {
	this.gameHistory = [new Game()];
	return this.getGame();
}

Modx.prototype.getGame = function() {
	return this.gameHistory[0];
}

Modx.prototype.setState = function(state) {
	this.state = state;
}

Modx.prototype.display = function(t) {
	this.state.display(t);
}

Modx.prototype.displayBoard = function() {
	this.scene.graph.graphNodes["board"].display(0);
}

Modx.prototype.displayPiece = function(x, y, type) {
	// TODO change appearance according to type
	this.scene.pushMatrix();
	this.scene.translate(x, 0, y);
	this.scene.graph.graphNodes["piece"].display(0);
	this.scene.popMatrix();
}