StateWaitingForPlay.prototype = Object.create(State.prototype);
StateWaitingForPlay.prototype.constructor = StateWaitingForPlay;

function StateWaitingForPlay(modx) {
	this.init(modx);
	this.hovered = null;
	if (this.modx.lastMoveEvent !== null)
	{
		this.scene.setPickEnabled(true);
		this.scene.onPick(this.modx.lastMoveEvent);
	}
}

StateWaitingForPlay.prototype.display = function(t) {
	this.scene.setPickEnabled(true);
	for (var y = 0; y < Board.size; y++)
	{
		this.scene.pushMatrix();
		this.scene.translate(0, 0, y);
		for (var x = 0; x < Board.size; x++)
		{
			// Draw cell
			if (this.modx.getGame().getBoard().get(x, y).getXpiece() === Modx.xPieceTypes.NONE)
				this.scene.registerForPick(y * Board.size + x, [x, y]);
			this.scene.graph.graphNodes["cell"].display(0);
			this.scene.clearPickRegistration();
			this.scene.translate(1, 0, 0);
		}
		this.scene.popMatrix();
	}
	this.scene.graph.graphNodes["board"].display(0);
	for (var y = 0; y < Board.size; y++)
	{
		for (var x = 0; x < Board.size; x++)
		{
			// Draw sPieces
			this.modx.displaySPieces(x, y);
			
			// Draw xPiece
			var cell = this.modx.getGame().getBoard().get(x, y);
			var xPiece = cell.getXpiece();
			if (xPiece !== Modx.xPieceTypes.NONE)
				this.modx.displayXPiece(x, y, xPiece);
		}
	}
	this.updatePicking();
	if (this.hovered !== null)
		this.modx.displayXPiece(this.hovered[0], this.hovered[1], this.modx.nextPieceType(), true);
	var p1_pieces = this.modx.getGame().getPlayerInfo(1).getXPieces();
	var p2_pieces = this.modx.getGame().getPlayerInfo(2).getXPieces();
	this.modx.displayRemainingXPieces(1, p1_pieces);
	this.modx.displayRemainingXPieces(2, p2_pieces);
}

StateWaitingForPlay.prototype.updatePicking = function ()
{
	if (this.scene.pickMode == false) {
		if (this.scene.pickResults != null && this.scene.pickResults.length > 0) {
			this.hovered = null;
			var obj = this.scene.pickResults[0][0];
			if (obj)
			{
				this.scene.setPickEnabled(false);
				this.hovered = obj;
			}
			this.scene.pickResults.splice(0,this.scene.pickResults.length);
		}		
	}
}

StateWaitingForPlay.prototype.onClick = function(event) {
	if (this.hovered !== null)
	{
		this.modx.setState(new StatePlacingXPiece(this.modx, this.hovered, this.modx.nextPieceType()));
		this.scene.setPickEnabled(false);
	}
}