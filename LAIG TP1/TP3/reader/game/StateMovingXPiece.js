StateMovingXPiece.prototype = Object.create(State.prototype);
StateMovingXPiece.prototype.constructor = StateMovingXPiece;

StateMovingXPiece.totalAnimTime = 1;

function StateMovingXPiece(modx, moveID, coords, xPiece, place) {
	this.init(modx);
	this.newGame = null;
	this.moveID = moveID;
	this.coords = coords;
	this.xPiece = xPiece;
	this.startAnimTime = this.modx.scene.getCurrTime();

	if (place)
	{
		this.dest = this.modx.calculateXPiecePos(coords[0], coords[1]);
		var piece = this.modx.takeOutsidePiece(xPiece);
		piece.move(this.dest);
		this.modx.placeBoardPiece(piece, coords);
	}
	else
	{
		this.modx.getHoverPiece(this.modx.nextPieceType()).setVisible(false);
		this.dest = this.modx.calculateOutsideXPiecePos(xPiece, this.modx.getNumOutsideXPieces(xPiece));
		var piece = this.modx.takeBoardPiece(coords);
		piece.move(this.dest);
		this.modx.placeOutsidePiece(piece);
	}
}

StateMovingXPiece.prototype.display = function(t) {
	this.modx.displayBoard();
	this.modx.displayXPieceBoxes();
	this.modx.displayPieces(t);

	if (this.isFinished(t))
	{
		this.modx.nextMove(this.moveID + 1);
	}
}
StateMovingXPiece.prototype.isFinished = function(t) {
	if (!this.modx.isPlayResponseReady()) return false;
	
	var animTime = t - this.startAnimTime;
	if (this.moveID === 0 || this.moveID == this.modx.newPlay.length - 1) return animTime >= StateMovingXPiece.totalAnimTime;
	return animTime >= StateMovingXPiece.totalAnimTime / 3;
}