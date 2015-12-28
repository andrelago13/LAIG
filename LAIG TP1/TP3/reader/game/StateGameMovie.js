StateGameMovie.prototype = Object.create(State.prototype);
StateGameMovie.prototype.constructor = StateGameMovie;

StateGameMovie.totalAnimTime = 1;

function StateGameMovie(modx) {
	this.init(modx);
	this.games = this.modx.gameHistory.slice(0);
	this.plays = this.modx.playHistory.slice(0);
	this.modx.pieces = [];
	this.modx.outsidePieces = [];
	this.modx.boardPieces = [];
	this.modx.createOutsidePieces();
	this.modx.createBoardPieces();
	this.modx.start(this.modx.gameHistory[0]);
	this.currentPlay = 0;
	this.currentMove = 0;
	this.lastAnimTime = this.modx.scene.getCurrTime();
	this.modx.scene.setCameraByName("Top");
}

StateGameMovie.prototype.displayHUD = function(t) {
	this.modx.displayHUDprimitives(t, false);
}

StateGameMovie.prototype.display = function(t) {
	this.modx.displayBoard();
	this.modx.displayXPieceBoxes();
	this.modx.displayPieces(t);

	var timeDiff = t - this.lastAnimTime;

	if (this.isFinished(t))
	{
		this.modx.setState(new StateGameEnded(this.modx));
	}
	else if ((this.currentMove > 1 && timeDiff >= StateMovingPiece.totalAnimTime / 3) || timeDiff >= StateMovingPiece.totalAnimTime)
	{
		this.makeMove(this.plays[this.currentPlay][this.currentMove]);
		if (++this.currentMove >= this.plays[this.currentPlay].length)
		{
			this.currentPlay++;
			this.currentMove = 0;
		}
		this.lastAnimTime = t;
	}
}

StateGameMovie.prototype.makeMove = function(move) {
	var xPiece = move[0];
	var place = move[1];
	var coords = move[2];
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

StateGameMovie.prototype.isFinished = function(t) {
	if (this.currentPlay !== this.plays.length)
		return false;

	return t - this.lastAnimTime >= StateMovingPiece.totalAnimTime;
}