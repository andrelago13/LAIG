
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

Cell.prototype.getXpiece = function() {
	return this.xPiece;
}

Cell.prototype.getSPieces = function() {
	return this.sPieces;
}

Cell.prototype.getTopSPiece = function() {
	if (sPieces.length === 0)
		return null;
	else
		return sPieces[0];
}

Cell.prototype.setXpiece = function(xPiece) {
	this.xPiece = xPiece;
}

Cell.prototype.pushSPiece = function(sPiece) {
	this.sPieces.push(sPiece);
}

Cell.prototype.popSpiece = function() {
	return this.sPieces.pop();
}