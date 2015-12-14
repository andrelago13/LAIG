Board.size = 8;

/**
 * Board
 * @param board_json prolog board representation as list
 * @constructor
 */

function Board(board_json) {
	this.board = [];
	if(typeof board_json != 'undefined')
		this.parseBoard(board_json);
}

Board.prototype.constructor=Board;

Board.prototype.parseBoard = function(board_json) {
	var board = [];
	
	for(var line = 0; line < board_json.length; ++line) {
		var line_array = [];
		for(var col = 0; col < board_json[line].length; ++col) {
			line_array.push(new Cell(board_json[line][col]));
		}
		board.push(line_array);
	}
	
	this.setBoard(board);
}

Board.prototype.get = function(x, y) {
	return this.board[y][x];
}

Board.prototype.setBoard = function(board) {
	this.board = board;
}

Board.prototype.getBoard = function() {
	return this.board;
}

Board.prototype.size = function() {
	return this.board.length;
}

Board.prototype.toArray = function() {
	var arr = [];
	var b = this.getBoard();
	var size = b.length;
	for(var line = 0; line < size; ++line) {
		var line_arr = [];
		for(var col = 0; col < size; ++col) {
			line_arr.push(b[line][col].toArray());
		}
		arr.push(line_arr);
	}
	return arr;
}
