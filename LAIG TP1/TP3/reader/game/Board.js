
////////////////////////////////NON STATIC MEMBERS	       ///////////////////////////////////////////


/**
 * Board
 * @param board prolog board representation as list
 * @constructor
 */
function Board() {
	this.size = 8;

	this.board = [];
	for (var i = 0; i < 8; i++)
	{
		this.board[i] = [];
		for (var j = 0; j < 8; j++)
		{
			this.board[j] = new Cell();
		}
	}
};
Board.prototype.constructor=Board;

Board.prototype.parseBoard = function(board) {
}

Board.prototype.get(x, y) {
	return board[y][x];
}