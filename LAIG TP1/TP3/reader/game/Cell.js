
////////////////////////////////NON STATIC MEMBERS	       ///////////////////////////////////////////


/**
 * Cell
 * @param Cell prolog Cell representation as list
 * @constructor
 */
function Cell() {
	this.xPiece = 0;
	this.sPieces = [];
};

function Cell(cell) {
	this.parseCell(cell);
}

Cell.prototype.constructor=Cell;

Cell.prototype.parseCell = function(cell) {

}

Cell.prototype.getXpiece() {
	return this.xPiece;
}

Cell.prototype.getSPieces() {
	return this.sPieces;
}

Cell.prototype.getTopSPiece() {
	if (sPieces.length === 0)
		return null;
	else
		return sPieces[0];
}

Cell.prototype.setXpiece(xPiece) {
	this.xPiece = xPiece;
}

Cell.prototype.pushSPiece(sPiece) {
	this.sPieces.push(sPiece);
}

Cell.prototype.popSpiece() {
	return this.sPieces.pop();
}