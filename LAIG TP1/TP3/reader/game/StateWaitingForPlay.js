StateWaitingForPlay.prototype = Object.create(State.prototype);
StateWaitingForPlay.prototype.constructor = StateWaitingForPlay;

function StateWaitingForPlay(modx) {
	this.init(modx);
}

StateWaitingForPlay.prototype.display = function(t) {
	this.modx.displayBoard();
	this.modx.displayPiece(1, 1, Modx.xPieceTypes.PLAYER1);
}