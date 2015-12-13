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

Modx.prototype.displayPiece = function(x, y) {
	// TODO
	this.scene.graph.graphNodes["piece"].display(0);
}