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
	this.animation = new PieceAnimation(0, StateMovingXPiece.totalAnimTime, this.position, dest, 2);
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

	var type = this.type;
	var hover = (type === Modx.pieceTypes.HOVER_JOKER || type === Modx.pieceTypes.HOVER_P1 || type === Modx.pieceTypes.HOVER_P2);
	if (hover)
		type -= Modx.pieceTypes.HOVER_JOKER - Modx.pieceTypes.JOKER;
	var name = "piece" + type;
	if (hover) name += "_hover";
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