Modx.xPieceTypes = {
		NONE: -1,
		JOKER: 0,
		PLAYER1: 1,
		PLAYER2: 2,
		HOVER: 0
}

Modx.sPieceHeight = 0.05;

/**
 * Modx
 * @constructor
 */
function Modx(scene) {
	this.client = new Client();
	var modx = this;
	this.client.getRequestReply("start_game(8,1)", function(game) { modx.start(game); });
	this.gameHistory = [];
	this.scene = scene;
	this.state = null;
	this.numJokersToPlace = 0;
	this.lastMoveEvent = null;
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

Modx.prototype.displayXPiece = function(x, y, type, hover) {
	this.scene.pushMatrix();
	var cell = this.getGame().getBoard().get(x, y);
	var sPieces = cell.getSPieces();
	this.scene.translate(x, Modx.sPieceHeight * sPieces.length, y);
	var name = "piece" + type;
	if (hover) name += "_hover";
	this.scene.graph.graphNodes[name].display(0);
	this.scene.popMatrix();
}

Modx.prototype.displaySPieces = function(x, y) {
	this.scene.pushMatrix();
	this.scene.translate(x, 0, y);
	var cell = this.getGame().getBoard().get(x, y);
	var sPieces = cell.getSPieces();
	for (var i = 0; i < sPieces.length; i++)
	{
		this.scene.pushMatrix();
		this.scene.translate(0, Modx.sPieceHeight * i, 0);
		var name = "s_piece" + sPieces[i];
		this.scene.graph.graphNodes[name].display(0);
		this.scene.popMatrix();
	}
	this.scene.popMatrix();
}

Modx.prototype.onClick = function(event) {
	if (this.state !== null)
		this.state.onClick(event);
}

Modx.prototype.nextPieceType = function() {
	return (this.numJokersToPlace === 0) ? this.getGame().getCurrPlayer() : Modx.xPieceTypes.JOKER;
}