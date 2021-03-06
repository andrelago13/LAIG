
////////////////////////////////NON STATIC MEMBERS	       ///////////////////////////////////////////


function Cell() {
	this.xPiece = 0;
	this.sPieces = [];
	this.valid = true;
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
	this.valid = true;
}

Cell.prototype.getXpiece = function() {
	return this.xPiece;
}

Cell.prototype.getSPieces = function() {
	return this.sPieces;
}

Cell.prototype.getTopSPiece = function() {
	if (this.sPieces.length === 0)
		return null;
	else
		return this.sPieces[0];
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

Cell.prototype.isValid = function() {
	return this.valid;
}

Cell.prototype.setValidValue = function(valid) {
	this.valid = valid;
}