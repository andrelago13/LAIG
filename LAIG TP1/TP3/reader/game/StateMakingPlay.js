StateMakingPlay.prototype = Object.create(State.prototype);
StateMakingPlay.prototype.constructor = StateMakingPlay;

StateMakingPlay.totalAnimTime = 2;

function StateMakingPlay(modx, t, coords, xPiece) {
	this.init(modx);
	this.loaded = false;
	var s = this;
	this.modx.getGame().makePlay(modx, coords[0], coords[1], function() {
		s.loaded = true;
	});
	this.coords = coords;
	this.xPiece = xPiece;
	this.init(modx);
	this.startAnimTime = t;
}

StateMakingPlay.prototype.display = function(t) {
	if ((t - this.startAnimTime >= StateMakingPlay.totalAnimTime) && this.loaded)
		this.modx.setState(new StateWaitingForPlay(this.modx));
	this.modx.displayBoard();
	for (var y = 0; y < Board.size; y++)
	{
		for (var x = 0; x < Board.size; x++)
		{
			var cell = this.modx.getGame().getBoard().get(x, y);
			var xPiece = cell.getXpiece();
			if (xPiece !== Modx.xPieceTypes.NONE)
				this.modx.displayXPiece(x, y, xPiece);
		}
	}
	this.modx.displayXPiece(this.coords[0], this.coords[1], this.xPiece);
}