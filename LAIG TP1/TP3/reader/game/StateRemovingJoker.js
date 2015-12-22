StateRemovingJoker.prototype = Object.create(State.prototype);
StateRemovingJoker.prototype.constructor = StateRemovingJoker;

StateRemovingJoker.totalAnimTime = 1;

function StateRemovingJoker(modx, toBeRemovedCoordsList) {
	this.init(modx);
	this.newGame = null;
	this.numJokersToPlace = null;
	var s = this;
	var coords = toBeRemovedCoordsList[this.modx.getNumRemovedJokers()];
	this.startPos = this.modx.calculateXPiecePos(coords[0], coords[1]);
	this.endPos = this.modx.calculateRemovedJokerPos(this.modx.getNumRemovedJokers());
	this.startAnimTime = this.modx.scene.getCurrTime();
	this.animation = new PieceAnimation(0, StateRemovingJoker.totalAnimTime, this.startPos, this.endPos, 2);
}

StateRemovingJoker.prototype.display = function(t) {
	this.modx.displayBoard();
	for (var y = 0; y < Board.size; y++)
	{
		for (var x = 0; x < Board.size; x++)
		{
			this.modx.displaySPieces(x, y);
			var cell = this.modx.getGame().getBoard().get(x, y);
			var xPiece = cell.getXpiece();
			if (xPiece !== Modx.pieceTypes.NONE)
				this.modx.displayXPiece(x, y, xPiece);
		}
	}
	// TODO display jokers that have not been removed from the board yet
	this.modx.displayRemainingXPieces(t);
	
	if ((t - this.startAnimTime >= StateRemovingJoker.totalAnimTime) && this.numJokersToPlace !== null)
	{
		this.modx.updateGame(this.newGame);
		this.modx.setState(new StateWaitingForPlay(this.modx));
	}
	else this.displayMovingJoker(t);
}

StateRemovingJoker.prototype.displayMovingJoker = function(t) {
	t = t - this.startAnimTime;
	this.scene.pushMatrix();
	this.scene.multMatrix(this.animation.getMatrix(t));
	this.scene.graph.graphNodes["piece" + Modx.pieceTypes.JOKER].display(0);
	this.scene.popMatrix();
}