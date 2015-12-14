StateWaitingForPlay.prototype = Object.create(State.prototype);
StateWaitingForPlay.prototype.constructor = StateWaitingForPlay;

function StateWaitingForPlay(modx) {
	this.init(modx);
}

StateWaitingForPlay.prototype.display = function(t) {
	this.modx.displayBoard();
	this.modx.displayXPiece(1, 1, Modx.xPieceTypes.PLAYER1);
	for (var y = 0; y < Board.size; y++)
	{
		for (var x = 0; x < Board.size; x++)
		{
			var cell = this.modx.getGame().getBoard().get(x, y);
			if (cell.getXpiece() !== Modx.xPieceTypes.NONE)
				this.modx.displayXPiece(x, y, Modx.xPieceTypes.JOKER);
		}
	}
}