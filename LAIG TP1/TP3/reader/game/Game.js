//////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////		NON STATIC MEMBERS	       ///////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

Game.board_index = 0;
Game.curr_player_index = 1;
Game.p1_info_index = 2;
Game.p2_info_index = 3;
Game.maxscore_index = 4;
Game.difficulty_index = 5;

Game.defaultBoard = new Board();
Game.defaultCurrPlayer = 0;
Game.defaultPlayerInfo = [];
Game.defaultMaxScore = 0;
Game.defaultDifficulty = 0;

/**
 * Game
 * @param game prolog game representation as list
 * @constructor
 */
function Game(game_reply) {
	this.setBoard(Game.defaultBoard);
	this.setCurrPlayer(Game.defaultCurrPlayer);
	this.player_info = Game.defaultPlayerInfo;
	this.setMaxScore(Game.defaultMaxScore);
	this.setDifficulty(Game.defaultDifficulty);
	var game_json = JSON.parse(Reply.getText(game_reply));
	this.parseGame(game_json);
};
Game.prototype.constructor=Game;

Game.prototype.parseGame = function(game_json) {
	this.setBoard(new Board(game_json[Game.board_index]));
	this.setCurrPlayer(game_json[Game.curr_player_index]);
	this.setPlayerInfo(1, new PlayerInfo(game_json[Game.p1_info_index]));
	this.setPlayerInfo(2, new PlayerInfo(game_json[Game.p2_info_index]));
	this.setMaxScore(game_json[Game.maxscore_index]);
	this.setDifficulty(game_json[Game.difficulty_index]);
}

Game.prototype.setBoard = function(board) {
	this.board = board;
}

Game.prototype.getBoard = function() {
	return this.board;
}

Game.prototype.getBoard = function() {
	return this.board;
}

Game.prototype.setBoard = function(board) {
	this.board = board;
}

Game.prototype.getCurrPlayer = function() {
	return this.curr_player;
}

Game.prototype.setCurrPlayer = function(curr_player) {
	this.curr_player = curr_player;
}

Game.prototype.getPlayerInfo = function(player_no) {
	return this.player_info[player_no-1];
}

Game.prototype.setPlayerInfo = function(player_no, player_info) {
	this.player_info[player_no - 1] = player_info;
}

Game.prototype.getMaxScore = function() {
	return this.maxScore;
}

Game.prototype.setMaxScore = function(maxScore) {
	this.maxScore = maxScore;
}

Game.prototype.getDifficulty = function() {
	return this.difficulty;
}

Game.prototype.setDifficulty = function(difficulty) {
	this.difficulty = difficulty;
}

Game.prototype.getNumPlayers = function() {
	return this.player_info.length;
}

Game.prototype.toArray = function() {
	var arr = [];
	arr.push(this.getBoard().toArray());
	arr.push(this.getCurrPlayer());
	var player_no = this.getNumPlayers();
	for(var i = 0; i < player_no; ++i) {
		arr.push(this.getPlayerInfo(i+1).toArray());
	}
	arr.push(this.getMaxScore());
	arr.push(this.getDifficulty());
	return arr;
}

Game.prototype.toJSON = function() {
	return JSON.stringify(this.toArray());
}

Game.prototype.makePlay = function(modx, x, y, successHandler, errorHandler) {
	var sh = this.activeMakePlaySuccessHandler = successHandler;
	var eh = this.activeMakePlayErrorHandler = errorHandler;
	modx.client.getRequestReply("make_play(" + this.toJSON() + "," + x + "," + y + ")", function(data) {
		var newGame = new Game(data);
		if (typeof sh != 'undefined')
			sh(newGame);
	}, function(data) {
		if (typeof eh != 'undefined')
			eh(newGame);
	});
}

Game.prototype.compare = function(coords, newGame) {
	
}