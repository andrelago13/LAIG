
////////////////////////////////NON STATIC MEMBERS	       ///////////////////////////////////////////


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

Game.difficultyType = {
		VERSUS: 0,
		CPU_EASY: 1,
		CPU_HARD: 2
}

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
	if(typeof game_reply != "undefined") {
		var game_json = JSON.parse(Reply.getText(game_reply));
		this.parseGame(game_json);		
	}
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
	var result = [];
	var g1_board = this.getBoard();
	var g2_board = newGame.getBoard();
	var board_size = g1_board.size();

	curr_piece = g2_board.get(coords[0], coords[1]);

	if(curr_piece.getXpiece() !== Modx.pieceTypes.NONE) {	// Peça colocada sem ponto
		result.push([curr_piece.getXpiece(), true, coords]); // Peça colocada
	}
	else	// Peça colocada com ponto
	{
		result.push([this.getCurrPlayer(), true, coords]); // Peça colocada
		var removed_xpieces = [];
		var added_bases = [];

		for(var x = 0; x < board_size; ++x) {
			for(var y = 0; y < board_size; ++y) {
				if((g1_board.get(x, y).getXpiece() != Modx.pieceTypes.NONE && g2_board.get(x, y).getXpiece() == Modx.pieceTypes.NONE)){			// Peça removida do padrão
					removed_xpieces.push([g1_board.get(x, y).getXpiece(), false, [x, y]]);
				} else if (x == coords[0] && y == coords[1]) {
					removed_xpieces.push([this.getCurrPlayer(), false, [x, y]]);
				}

				if(g1_board.get(x, y).getTopSPiece() != g2_board.get(x, y).getTopSPiece()) {								// Base adicionada
					added_bases.push([g2_board.get(x, y).getTopSPiece() + Modx.pieceTypes.SPIECE_P1 - Modx.pieceTypes.PLAYER1, true, [x, y]]);
				}
			}
		}

		for(var i = 0; i < removed_xpieces.length; ++i) {
			result.push(removed_xpieces[i]);
		}

		for(var i = 0; i < added_bases.length; ++i) {
			result.push(added_bases[i]);
		}
	}
	console.log("result: ", result);
	return result;
}









