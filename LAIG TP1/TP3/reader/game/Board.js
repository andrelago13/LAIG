Board.size = 8;

/**
 * Board
 * @param board prolog board representation as list
 * @constructor
 */
function Board() {
	this.board = [];
	for (var i = 0; i < this.size; i++)
	{
		this.board[i] = [];
		for (var j = 0; j < this.size; j++)
		{
			this.board[j] = new Cell();
		}
	}
};
Board.prototype.constructor=Board;

Board.prototype.parseBoard = function(board) {
	
}

Board.prototype.get = function(x, y) {
	return board[y][x];
}
	
/*	BOARD EXAMPLE
[[[[],0],[[],-1],[[],-1],[[],-1],[[],0],[[],-1],[[],-1],[[],-1]],
[[[],-1],[[],-1],[[],-1],[[],-1],[[],-1],[[],-1],[[],-1],[[],-1]],
[[[],-1],[[],-1],[[],-1],[[],-1],[[],-1],[[],-1],[[],-1],[[],-1]],
[[[],-1],[[],-1],[[],-1],[[],-1],[[],-1],[[],-1],[[],-1],[[],-1]],
[[[],-1],[[],-1],[[],-1],[[],-1],[[],-1],[[],-1],[[],-1],[[],-1]],
[[[],-1],[[],-1],[[],-1],[[],-1],[[],-1],[[],0],[[],0],[[],-1]],
[[[],0],[[],-1],[[],-1],[[],-1],[[],-1],[[],-1],[[],-1],[[],-1]],
[[[],-1],[[],-1],[[],-1],[[],-1],[[],-1],[[],-1],[[],-1],[[],-1]]]
*/
