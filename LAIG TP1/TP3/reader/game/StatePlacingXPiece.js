StatePlacingXPiece.prototype = Object.create(State.prototype);
StatePlacingXPiece.prototype.constructor = StatePlacingXPiece;

StatePlacingXPiece.totalAnimTime = 1;

function StatePlacingXPiece(modx, coords, xPiece) {
	this.init(modx);
	this.newGame = null;
	this.numJokersToPlace = null;
	var s = this;
	this.modx.getGame().makePlay(modx, coords[0], coords[1], function(newGame) {
		s.newGame = newGame;
		s.modx.client.getRequestReply("num_jokers_to_place(" + newGame.toJSON() + ")", function(data) {
			s.modx.numJokersToPlace = parseInt(Reply.getText(data));
			s.numJokersToPlace = s.modx.numJokersToPlace;
		})
	});
	this.playerXPieces = [];
	this.playerXPieces[1] = this.modx.getGame().getPlayerInfo(1).getNumXPieces();
	this.playerXPieces[2] = this.modx.getGame().getPlayerInfo(2).getNumXPieces();
	this.playerXPieces[xPiece] -= 1;
	this.coords = coords;
	this.startPos = this.modx.calculateRemainingXPiecePos(xPiece, this.playerXPieces[xPiece]);
	this.endPos = this.modx.calculateXPiecePos(coords[0], coords[1]);
	this.xPiece = xPiece;
	this.startAnimTime = this.modx.scene.getCurrTime();
	this.animation = new PieceAnimation(0, StatePlacingXPiece.totalAnimTime, this.startPos, this.endPos, 2);
}

StatePlacingXPiece.prototype.display = function(t) {
	this.modx.displayBoard();
	this.modx.displayXPieceBoxes();
	for (var y = 0; y < Board.size; y++)
	{
		for (var x = 0; x < Board.size; x++)
		{
			this.modx.displaySPieces(x, y);
			var cell = this.modx.getGame().getBoard().get(x, y);
			var xPiece = cell.getXpiece();
			if (xPiece !== Modx.xPieceTypes.NONE)
				this.modx.displayXPiece(x, y, xPiece);
		}
	}
	this.modx.displayXPiece(this.coords[0], this.coords[1], this.xPiece, true);
	this.displayRemainingXPieces(t);
	
	if ((t - this.startAnimTime >= StatePlacingXPiece.totalAnimTime) && this.numJokersToPlace !== null)
	{
		this.modx.updateGame(this.newGame);
		this.modx.setState(new StateWaitingForPlay(this.modx));
	}
	else this.displayMovingXPiece(t);
}

StatePlacingXPiece.prototype.displayMovingXPiece = function(t) {
	t = t - this.startAnimTime;
	this.scene.pushMatrix();
	this.scene.multMatrix(this.animation.getMatrix(t));
	this.scene.graph.graphNodes["piece" + this.xPiece].display(0);
	this.scene.popMatrix();
}

StatePlacingXPiece.prototype.displayRemainingXPieces = function(t) {
	var game = this.modx.getGame();
	for (var i = 0; i < this.playerXPieces[1]; i++)
		this.modx.displayRemainingXPiece(1, i);
	for (var i = 0; i < this.playerXPieces[2]; i++)
		this.modx.displayRemainingXPiece(2, i);
}