StateMovingPiece.prototype = Object.create(State.prototype);
StateMovingPiece.prototype.constructor = StateMovingPiece;

StateMovingPiece.totalAnimTime = 1;

function StateMovingPiece(modx, moveID, coords, xPiece, place) {
	this.init(modx);
	this.newGame = null;
	this.moveID = moveID;
	this.coords = coords;
	this.xPiece = xPiece;
	this.place = place;
	this.startAnimTime = this.modx.scene.getCurrTime();

	if (place)
	{
		this.dest = this.modx.calculateBoardPiecePos(coords[0], coords[1]);
		var piece = this.modx.takeOutsidePiece(xPiece);
		piece.move(this.dest);
		this.modx.placeBoardPiece(piece, coords);
	}
	else
	{
		var hoverPiece = this.modx.getHoverPiece(xPiece);
		if (hoverPiece !== null) hoverPiece.setVisible(false);
		this.dest = this.modx.calculateOutsidePiecePos(xPiece, this.modx.getNumOutsidePieces(xPiece));
		var piece = this.modx.takeBoardPiece(coords);
		piece.move(this.dest);
		this.modx.placeOutsidePiece(piece);
	}
}

StateMovingPiece.prototype.display = function(t) {
	this.modx.displayBoard();
	this.modx.displayXPieceBoxes();
	this.modx.displayPieces(t);
	
	if (this.isFinished(t))
	{
		this.modx.nextMove(this.moveID + 1);
	}
}
StateMovingPiece.prototype.isFinished = function(t) {
	if (!this.modx.isPlayResponseReady()) return false;
	
	var animTime = t - this.startAnimTime;
	if ((this.place && this.moveID === 0) || this.moveID == this.modx.newPlay.length - 1) return animTime >= StateMovingPiece.totalAnimTime;
	return animTime >= StateMovingPiece.totalAnimTime / 3;
}