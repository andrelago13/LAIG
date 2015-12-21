StateMovingJoker.prototype = Object.create(State.prototype);
StateMovingJoker.prototype.constructor = StateMovingJoker;

StateMovingJoker.totalAnimTime = 1;

function StateMovingJoker(modx, startCoords, endCoords) {
	this.init(modx);
	this.newGame = null;
	this.numJokersToPlace = null;
	var s = this;
	this.modx.getGame().makePlay(modx, coords[0], coords[1], function(newGame) {
		s.newGame = newGame;
		s.modx.numJokersToPlace--;
		s.numJokersToPlace = s.modx.numJokersToPlace;
	});
	this.startPos = this.modx.calculateXPiecePos(startCoords[0], startCoords[1]);
	this.endPos = this.modx.calculateXPiecePos(endCoords[0], endCoords[1]);
	this.startAnimTime = this.modx.scene.getCurrTime();
	this.animation = new PieceAnimation(0, StateMovingJoker.totalAnimTime, this.startPos, this.endPos, 2);
}

StateMovingJoker.prototype.display = function(t) {
	this.modx.displayBoard();
	for (var y = 0; y < Board.size; y++)
	{
		for (var x = 0; x < Board.size; x++)
		{
			/*this.modx.displaySPieces(x, y);
			var cell = this.modx.getGame().getBoard().get(x, y);
			var xPiece = cell.getXpiece();
			if (xPiece !== Modx.xPieceTypes.NONE)
				this.modx.displayXPiece(x, y, xPiece);*/
		}
	}
	this.displayMovingJoker(t);
	this.modx.displayRemainingXPieces(t);
	
	if ((t - this.startAnimTime >= StateMovingJoker.totalAnimTime) && this.numJokersToPlace !== null)
	{
		this.modx.updateGame(this.newGame);
		this.modx.setState(new StateWaitingForPlay(this.modx));
	}
}

StateMovingJoker.prototype.displayMovingJoker = function(t) {
	t = t - this.startAnimTime;
	this.scene.pushMatrix();
	this.scene.multMatrix(this.animation.getMatrix(t));
	this.scene.graph.graphNodes["piece" + Modx.xPieceTypes.JOKER].display(0);
	this.scene.popMatrix();
}