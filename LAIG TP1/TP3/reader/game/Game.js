//////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////		NON STATIC MEMBERS	       ///////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Game
 * @param game prolog game representation as list
 * @constructor
 */
function Game(game) {
	this.board = null;
	this.curr_player = null;
	this.player_info = [];
	this.maxScore = null;
	this.difficulty = null;
	this.parseGame(game);
};
Game.prototype.constructor=Game;

Game.prototype.parseGame = function(game) {
	var elem_list = game.split(",#,");
	elem_list[0] = elem_list[0].substring(1);
	elem_list[5] = elem_list[5].substring(0, 1);
	console.log(elem_list);
	
	this.board = new Board(elem_list[0]);
	this.curr_player = parseInt(elem_list[1]);
	//this.player_info[0] = new PlayerInfo(elem_list[2]);
	//this.player_info[1] = new PlayerInfo(elem_list[3]);
	this.maxScore = parseInt(elem_list[4]);
	this.difficulty = parseInt(elem_list[5]);
}
/*	GAME EXAMPLE
[[[[[],0],[[],-1],[[],-1],[[],-1],[[],0],[[],-1],[[],-1],[[],-1]],
[[[],-1],[[],-1],[[],-1],[[],-1],[[],-1],[[],-1],[[],-1],[[],-1]],
[[[],-1],[[],-1],[[],-1],[[],-1],[[],-1],[[],-1],[[],-1],[[],-1]],
[[[],-1],[[],-1],[[],-1],[[],-1],[[],-1],[[],-1],[[],-1],[[],-1]],
[[[],-1],[[],-1],[[],-1],[[],-1],[[],-1],[[],-1],[[],-1],[[],-1]],
[[[],-1],[[],-1],[[],-1],[[],-1],[[],-1],[[],0],[[],0],[[],-1]],
[[[],0],[[],-1],[[],-1],[[],-1],[[],-1],[[],-1],[[],-1],[[],-1]],
[[[],-1],[[],-1],[[],-1],[[],-1],[[],-1],[[],-1],[[],-1],[[],-1]]],
1,
[0,14],
[0,14],
8,
1]
*/