
////////////////////////////////NON STATIC MEMBERS	       ///////////////////////////////////////////


function Cell() {
	this.xPiece = 0;
	this.sPieces = [];
};

function Cell(cell_json) {
	this.parseCell(cell_json);
}

Cell.prototype.constructor=Cell;

Cell.spiece_index = 0;
Cell.xpiece_index = 1;

Cell.prototype.parseCell = function(cell_json) {
	this.setXpiece(cell_json[Cell.xpiece_index]);
	this.setSPieces(cell_json[Cell.spiece_index]);
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

Cell.prototype.setSPieces = function(spieces) {
	this.sPieces = spieces;
}

Cell.prototype.toArray = function() {
	var arr = [];
	arr.push(this.getSPieces());
	arr.push(this.getXpiece());
	return arr;
}