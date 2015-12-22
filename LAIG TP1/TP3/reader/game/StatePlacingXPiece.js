StatePlacingXPiece.prototype = Object.create(State.prototype);
StatePlacingXPiece.prototype.constructor = StatePlacingXPiece;

StatePlacingXPiece.totalAnimTime = 1;

function StatePlacingXPiece(modx, coords, xPiece) {
	this.init(modx);
	this.newGame = null;
	var s = this;
	
	this.coords = coords;
	this.startPos = this.modx.calculateRemainingXPiecePos(xPiece, this.modx.getNumOutsideXPieces(xPiece) - 1);
	this.endPos = this.modx.calculateXPiecePos(coords[0], coords[1]);
	this.xPiece = xPiece;
	this.startAnimTime = this.modx.scene.getCurrTime();
	this.animation = new PieceAnimation(0, StatePlacingXPiece.totalAnimTime, this.startPos, this.endPos, 2);
	this.modx.decNumOutsideXPieces(xPiece);
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
			if (xPiece !== Modx.pieceTypes.NONE)
				this.modx.displayXPiece(x, y, xPiece);
		}
	}
	this.modx.displayXPiece(this.coords[0], this.coords[1], this.xPiece, true);
	this.modx.displayRemainingXPieces(1);
	this.modx.displayRemainingXPieces(2);
	
	if ((t - this.startAnimTime >= StatePlacingXPiece.totalAnimTime))
	{
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