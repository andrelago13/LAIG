StatePlacingXPiece.prototype = Object.create(State.prototype);
StatePlacingXPiece.prototype.constructor = StatePlacingXPiece;

StatePlacingXPiece.totalAnimTime = 0;

function StatePlacingXPiece(modx, coords, xPiece) {
	this.init(modx);
	this.newGame = null;
	this.numJokersToPlace = null;
	var s = this;
	this.modx.getGame().makePlay(modx, coords[0], coords[1], function(newGame) {
		s.newGame = newGame;
		s.modx.client.getRequestReply("num_jokers_to_place(" + newGame.toJSON() + ")", function(data) {
			s.numJokersToPlace = parseInt(Reply.getText(data));
			s.modx.numJokersToPlace = s.numJokersToPlace;
		})
	});
	this.coords = coords;
	this.xPiece = xPiece;
	this.init(modx);
	this.startAnimTime = this.modx.scene.getCurrTime();
}

StatePlacingXPiece.prototype.display = function(t) {
	if ((t - this.startAnimTime >= StatePlacingXPiece.totalAnimTime) && this.numJokersToPlace !== null)
	{
		this.modx.updateGame(this.newGame);
		this.modx.setState(new StateWaitingForPlay(this.modx));
	}
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