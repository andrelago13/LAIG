Modx.xPieceTypes = {
		NONE: -1,
		JOKER: 0,
		PLAYER1: 1,
		PLAYER2: 2,
		HOVER: 0
}

/**
 * Modx
 * @constructor
 */
function Modx(scene) {
	this.client = new Client();
	var modx = this;
	this.client.getRequestReply("start_game(8,1)", function(game) { return modx.start(game); });
	this.gameHistory = [];
	this.scene = scene;
	this.state = null;
};

Modx.prototype.start = function(game) {
	this.setState(new StateWaitingForPlay(this));
	this.gameHistory = [];
	this.gameHistory = [new Game(game)];
	return this.getGame();
}

Modx.prototype.getGame = function() {
	return this.gameHistory[this.gameHistory.length - 1];
}

Modx.prototype.updateGame = function(newGame) {
	this.gameHistory.push(newGame);
}

Modx.prototype.setState = function(state) {
	this.state = state;
}

Modx.prototype.display = function(t) {
	if (this.state !== null)
		this.state.display(t);
}

Modx.prototype.displayBoard = function() {
	this.scene.graph.graphNodes["board"].display(0);
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
}

Modx.prototype.displayXPiece = function(x, y, type) {
	this.scene.pushMatrix();
	this.scene.translate(x, 0, y);
	this.scene.graph.graphNodes["piece" + type].display(0);
	this.scene.popMatrix();
}