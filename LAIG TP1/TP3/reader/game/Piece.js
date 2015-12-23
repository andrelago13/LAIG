Piece.prototype.constructor = Piece;

function Piece(scene, type) {
	this.scene = scene;
	this.type = type;
	this.position = vec3.fromValues(0, 0, 0);
	this.visible = true;
	this.animation = null;
	this.animStartTime = null;
	this.dest = null;
}

Piece.prototype.move = function(dest) {
	this.dest = dest;
	this.animStartTime = this.scene.getCurrTime();
	this.animation = new PieceAnimation(0, StateMovingPiece.totalAnimTime, this.position, dest, 2);
}

Piece.prototype.display = function(t) {	
	if (!this.visible || this.type === Modx.pieceTypes.NONE) return;

	this.scene.pushMatrix();

	if (this.animation !== null)
	{
		var animTime = t - this.animStartTime;
		if (this.animation.finished(animTime))
		{
			this.animation = null;
			this.animStartTime = null;
			this.position = this.dest;
			this.dest = null;
		}
		else
			this.scene.multMatrix(this.animation.getMatrix(animTime));
	}

	if (this.animation === null)
		this.scene.translate(this.position[0], this.position[1], this.position[2]);

	var name = "piece";
	switch (this.type)
	{
	case Modx.pieceTypes.JOKER:
	case Modx.pieceTypes.PLAYER1:
	case Modx.pieceTypes.PLAYER2:
		name += this.type;
		break;
	case Modx.pieceTypes.HOVER_JOKER:
	case Modx.pieceTypes.HOVER_P1:
	case Modx.pieceTypes.HOVER_P2:
		name += (this.type - (Modx.pieceTypes.HOVER_JOKER - Modx.pieceTypes.JOKER)) + "_hover";
		break;
	case Modx.pieceTypes.SPIECE_P1:
	case Modx.pieceTypes.SPIECE_P2:
		name = "s_" + name + (this.type - (Modx.pieceTypes.SPIECE_P1 - Modx.pieceTypes.PLAYER1));
		break;
	default:
		return null;
	}
	this.scene.graph.graphNodes[name].display(0);
	this.scene.popMatrix();
}

Piece.prototype.getPosition = function() {
	return this.position;
}

Piece.prototype.getType = function() {
	return this.type;
}

Piece.prototype.setPosition = function(newPosition) {
	this.position = newPosition;
}

Piece.prototype.setVisible = function(visible) {
	this.visible = visible;
}

Piece.prototype.getHeight = function() {
	switch (this.type)
	{
	case Modx.pieceTypes.JOKER:
	case Modx.pieceTypes.PLAYER1:
	case Modx.pieceTypes.PLAYER2:
		return 0.3;
	case Modx.pieceTypes.HOVER_JOKER:
	case Modx.pieceTypes.HOVER_P1:
	case Modx.pieceTypes.HOVER_P2:
		return 0;
	case Modx.pieceTypes.SPIECE_P1:
	case Modx.pieceTypes.SPIECE_P2:
		return 0.05;
	default:
		return 0;
	}
}