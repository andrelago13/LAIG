Modx.pieceTypes = {
		NONE: -1,
		JOKER: 0,
		PLAYER1: 1,
		PLAYER2: 2,
		SPIECE_P1: 3,
		SPIECE_P2: 4,
		HOVER_JOKER: 5,
		HOVER_P1: 6,
		HOVER_P2: 7
};
Modx.numJokers = 5;
Modx.numXPiecesPerPlayer = 14;
Modx.numSPiecesPerPlayer = 18;
Modx.xPieceBoxPiecesPerRow = 7;
Modx.sPieceHeight = 0.05;
Modx.defaultPlayTimeout = 30;

Modx.playingGameState = {
		WAIT_FOR_START: 0,
		PLAYING: 1,
		GAME_ENDED: 2
}

Modx.endGameReason = {
		NONE: 0,
		P1_WIN_SCORE: 1,
		P2_WIN_SCORE: 2,
		P1_WIN_TIME: 3,
		P2_WIN_TIME: 4,
		CONNECTION_ERR: 5,
		ERROR: 6,
		TIE_GAME: 7
}

Modx.secondsToStr = function(time) {
	if(time < 0 || typeof time == "undefined")
		return "00:00";
	if(time < 60) {
		var t_str = time.toString();
		if(time < 10)
			return "00:0" + t_str[0];
		else
			return "00:" + t_str[0] + t_str[1];
	} else if (time < 3600) {
		minutes = time / 60;
		minutes_str = minutes.toString();
		seconds = time % 60;
		seconds_str = seconds.toString();
		var result = "";
		if(minutes < 10) {
			result += "0" + minutes_str[0];
		} else {
			result += "" + minutes_str[0] + minutes_str[1];
		}
		result += ":";
		if(seconds < 10) {
			result += "0" + seconds_str[0];
		} else {
			result += "" + seconds_str[0] + seconds_str[1];
		}
		return result;
	} else {
		hours = time / 3600;
		hours_str = hours.toString();
		minutes = (time % 3600)/60;
		minutes_str = minutes.toString();
		var result = "";
		if(hours < 10) {
			result += "0" + hours_str[0];
		} else {
			result += "" + hours_str[0] + hours_str[1];
		}
		result += ":";
		if(minutes < 10) {
			result += "0" + minutes_str[0];
		} else {
			result += "" + minutes_str[0] + minutes_str[1];
		}

		return result;
	}
}

/**
 * Modx
 * @constructor
 */
function Modx(scene) {
	this.scene = scene;
	this.init();
};

Modx.prototype.init = function() {
	this.client = new Client();
	var modx = this;
	this.gameHistory = [];
	this.playHistory = [];
	this.state = new StateStartingGame(this);
	this.numJokersToPlace = Modx.numJokers;
	this.lastMoveEvent = null;

	this.pieces = [];
	this.outsidePieces = [];
	this.boardPieces = [];

	this.newGame = null;
	this.newPlay = null;

	this.hudPlane = new Plane(this.scene, 10);
	this.ooliteFont = new OoliteFont(this.scene);

	this.start_time = -1;
	this.createOutsidePieces();
	this.createBoardPieces();

	this.playing = Modx.playingGameState.WAIT_FOR_START;
	this.endReason = Modx.endGameReason.NONE;

	this.play_timeout = Modx.defaultPlayTimeout;
}

/**
 * makes a prolog request to start a new game
 * @param max_score max game score for each player (1 - 14)
 * @param mode 0 (2P), 1 (SP - easy), 2 (SP - hard)
 */
Modx.prototype.getNewGame = function(max_score, mode) {
	if(typeof max_score != "number" || max_score < 1 || max_score > 14 || typeof mode != "number" || (mode != 0 && mode != 1 && mode != 2 && mode != 3))
		return false;

	var this_t = this;
	var state = this.state;
	this.client.getRequestReply("start_game(" + max_score + "," + mode + ")", function(game) { state.terminate(game); }, function(data) { 
		this_t.endReason = Modx.endGameReason.CONNECTION_ERR;
		this_t.setState(new StateGameEnded(this_t)); 
	});
	return true;
}

Modx.prototype.getPlayTimeout = function() {
	return this.play_timeout;
}

Modx.prototype.setPlayTimeout = function(time) {
	this.play_timeout = time;
}

/**
 * Goes back one play
 */
Modx.prototype.undo = function() {
	if (!(this.state instanceof StateWaitingForPlay)) return;
	var numTimesToUndo = 2;
	var game = this.getGame();
	if (game.getDifficulty() === Game.difficultyType.BOTvsBOT)
		numTimesToUndo = 0;
	else if (game.getDifficulty() === Game.difficultyType.VERSUS || game.getCurrPlayer() === 2)
		numTimesToUndo = 1;
	var reversed = [];
	console.log("numTimesToUndo", numTimesToUndo);
	for (var i = 0; i < numTimesToUndo; i++)
	{
		if (this.playHistory.length === 0) return;
		var play = this.playHistory.pop();
		this.gameHistory.pop();

		// Save first place, later we will check if it is placed and removed, in which case we won't place it at all
		var firstPlace = play[0];
		var placedAndRemoved = false;

		// Reverse actions
		for (var j = 0; j < play.length; j++)
		{
			var p = play[play.length - 1 - j];
			if (p[0] === firstPlace[0] && p[1] === !firstPlace[1] && p[2][0] === firstPlace[2][0] && p[2][1] === firstPlace[2][1])
			{
				placedAndRemoved = true;
			}
			else
			{
				reversed.push(p);
				reversed[reversed.length - 1][1] = !reversed[reversed.length - 1][1]; // place = !place
			}
		}
		if (placedAndRemoved) reversed.pop();
	}
	this.newGame = this.gameHistory.pop();
	this.newPlay = reversed;
	this.nextMove(0);
}

/**
 * Initializes the game movie
 */
Modx.prototype.gameMovie = function() {
	//if (this.state instanceof StateGameEnded)
	this.setState(new StateGameMovie(this));
}

/**
 * Makes a prolog request to check if the game has ended
 */
Modx.prototype.checkGameEnded = function() {
	this_temp = this;
	this.client.getRequestReply("game_ended(" + this.getGame().toJSON() + ")", function(data) { this_temp.checkGameEndedReponseHandler(data); }, function(data) { 
		this_temp.endReason = Modx.endGameReason.CONNECTION_ERR;
		this_temp.setState(new StateGameEnded(this_temp)); 
	});
}

/**
 * If the request reply says the game has ended, changes the game state
 */
Modx.prototype.checkGameEndedReponseHandler = function(data) {
	if((this.state instanceof StateGameMovie) || (this.state instanceof StateGameEnded))
		return;

	if(data.target.responseText == "yes") {
		console.log("check game ended 2");
		this.playing = Modx.playingGameState.GAME_ENDED;

		winner = this.getGame().getWinner();

		switch(winner) {
		case 1:
			this.endReason = Modx.endGameReason.P1_WIN_SCORE;
			break;
		case 2:
			this.endReason = Modx.endGameReason.P2_WIN_SCORE;
			break;
		default:
			this.endReason = Modx.endGameReason.TIE_GAME;
		break;
		}

		this.setState(new StateGameEnded(this));
	}
}

/**
 * Restarts the game, getting a new one with a prolog request
 */
Modx.prototype.restart = function() {
	var backup_timeout = this.play_timeout;
	this.init();
	this.play_timeout = backup_timeout;
}

/**
 * Checks if the play timeout has been reached
 */
Modx.prototype.checkPlayTimeout = function(start_time, curr_time) {
	if(curr_time > start_time + this.play_timeout) {
		var curr_p = this.getGame().getCurrPlayer();
		if(curr_p == 1) {
			this.endReason = Modx.endGameReason.P2_WIN_TIME;
		} else {
			this.endReason = Modx.endGameReason.P1_WIN_TIME;
		}
		this.setState(new StateGameEnded(this));
	}
}

Modx.prototype.getEndReason = function() {
	return this.endReason;
}

Modx.prototype.createBoardPieces = function() {
	for (var y = 0; y < Board.size; y++)
	{
		this.boardPieces[y] = [];
		for (var x = 0; x < Board.size; x++)
		{
			this.boardPieces[y][x] = [];
		}
	}
}

Modx.prototype.createOutsidePieces = function() {
	this.pieces[Modx.pieceTypes.JOKER] = [];
	this.outsidePieces[Modx.pieceTypes.JOKER] = [];
	for (var i = 0; i < Modx.numJokers; i++)
	{
		this.pieces[Modx.pieceTypes.JOKER][i] = new Piece(this.scene, Modx.pieceTypes.JOKER);
		this.outsidePieces[Modx.pieceTypes.JOKER][i] = this.pieces[Modx.pieceTypes.JOKER][i];
	}

	this.pieces[Modx.pieceTypes.PLAYER1] = [];
	this.outsidePieces[Modx.pieceTypes.PLAYER1] = [];
	this.pieces[Modx.pieceTypes.PLAYER2] = [];
	this.outsidePieces[Modx.pieceTypes.PLAYER2] = [];
	for (var i = 0; i < Modx.numXPiecesPerPlayer; i++)
	{
		this.pieces[Modx.pieceTypes.PLAYER1][i] = new Piece(this.scene, Modx.pieceTypes.PLAYER1);
		this.pieces[Modx.pieceTypes.PLAYER1][i].setPosition(this.calculateOutsideXPiecePos(Modx.pieceTypes.PLAYER1, i));
		this.outsidePieces[Modx.pieceTypes.PLAYER1][i] = this.pieces[Modx.pieceTypes.PLAYER1][i];
		this.pieces[Modx.pieceTypes.PLAYER2][i] = new Piece(this.scene, Modx.pieceTypes.PLAYER2);
		this.pieces[Modx.pieceTypes.PLAYER2][i].setPosition(this.calculateOutsideXPiecePos(Modx.pieceTypes.PLAYER2, i));
		this.outsidePieces[Modx.pieceTypes.PLAYER2][i] = this.pieces[Modx.pieceTypes.PLAYER2][i];
	}

	this.pieces[Modx.pieceTypes.SPIECE_P1] = [];
	this.outsidePieces[Modx.pieceTypes.SPIECE_P1] = [];
	this.pieces[Modx.pieceTypes.SPIECE_P2] = [];
	this.outsidePieces[Modx.pieceTypes.SPIECE_P2] = [];
	for (var i = 0; i < Modx.numSPiecesPerPlayer; i++)
	{
		this.pieces[Modx.pieceTypes.SPIECE_P1][i] = new Piece(this.scene, Modx.pieceTypes.SPIECE_P1);
		this.pieces[Modx.pieceTypes.SPIECE_P1][i].setPosition(this.calculateOutsideSPiecePos(Modx.pieceTypes.SPIECE_P1, i));
		this.outsidePieces[Modx.pieceTypes.SPIECE_P1][i] = this.pieces[Modx.pieceTypes.SPIECE_P1][i];
		this.pieces[Modx.pieceTypes.SPIECE_P2][i] = new Piece(this.scene, Modx.pieceTypes.SPIECE_P2);
		this.pieces[Modx.pieceTypes.SPIECE_P2][i].setPosition(this.calculateOutsideSPiecePos(Modx.pieceTypes.SPIECE_P2, i));
		this.outsidePieces[Modx.pieceTypes.SPIECE_P2][i] = this.pieces[Modx.pieceTypes.SPIECE_P2][i];
	}
	this.pieces[Modx.pieceTypes.HOVER_JOKER] = [];
	this.pieces[Modx.pieceTypes.HOVER_JOKER][0] = new Piece(this.scene, Modx.pieceTypes.HOVER_JOKER);
	this.pieces[Modx.pieceTypes.HOVER_JOKER][0].setVisible(false);
	this.pieces[Modx.pieceTypes.HOVER_P1] = [];
	this.pieces[Modx.pieceTypes.HOVER_P1][0] = new Piece(this.scene, Modx.pieceTypes.HOVER_P1);
	this.pieces[Modx.pieceTypes.HOVER_P1][0].setVisible(false);
	this.pieces[Modx.pieceTypes.HOVER_P2] = [];
	this.pieces[Modx.pieceTypes.HOVER_P2][0] = new Piece(this.scene, Modx.pieceTypes.HOVER_P2);
	this.pieces[Modx.pieceTypes.HOVER_P2][0].setVisible(false);
}

Modx.prototype.displayHUDprimitives = function(t, show_time) {
	if(typeof this.state == 'undefined' || this.gameHistory.length <= 0)
		return;

	if(this.start_time === -1 || t < this.start_time) {
		this.start_time = t;
		return;
	}

	time_diff = Modx.secondsToStr(this.play_timeout - (t - this.start_time));

	var background = this.ooliteFont.getBackgroundAppearance();
	background.apply();
	var text = this.ooliteFont.getAppearance();

	this.scene.setActiveShaderSimple(this.ooliteFont.getShader());
	text.apply();
	this.scene.activeShader.setUniformsValues({'charCoords': this.ooliteFont.getCharCoords(" ")});

	var game = this.getGame();
	var p1_score = game.getPlayerInfo(1).getScoreString();
	var p1_n1 = p1_score[0];
	var p1_n2 = p1_score[1];
	var p2_score = game.getPlayerInfo(2).getScoreString();
	var p2_n1 = p2_score[0];
	var p2_n2 = p2_score[1];

	// Top border
	this.scene.pushMatrix();
	this.scene.translate(0, 0.95, 0);
	this.scene.scale(1, 0.05, 1);
	this.scene.translate(0.5, 0.5, 0);
	this.hudPlane.display();
	this.scene.popMatrix();

	// Top-left-margin
	this.scene.pushMatrix();
	this.scene.translate(0, 0.8, 0);
	this.scene.scale(0.2, 0.2, 1);
	this.scene.translate(0.5, 0.5, 0);
	this.hudPlane.display();
	this.scene.popMatrix();

	// Top-right-margin
	this.scene.pushMatrix();
	this.scene.translate(0.8, 0.8, 0);
	this.scene.scale(0.2, 0.2, 1);
	this.scene.translate(0.5, 0.5, 0);
	this.hudPlane.display();
	this.scene.popMatrix();

	// Mid border 1
	this.scene.pushMatrix();
	this.scene.translate(0, 0.75, 0);
	this.scene.scale(1, 0.05, 1);
	this.scene.translate(0.5, 0.5, 0);
	this.hudPlane.display();
	this.scene.popMatrix();
	// M
	this.scene.pushMatrix();
	this.scene.activeShader.setUniformsValues({'charCoords': this.ooliteFont.getCharCoords("M")});
	this.scene.translate(0.2, 0.8, 0);
	this.scene.scale(0.15, 0.2, 1);
	this.scene.translate(0.5, 0.5, 0);
	this.hudPlane.display();
	this.scene.popMatrix();
	// o
	this.scene.pushMatrix();
	this.scene.activeShader.setUniformsValues({'charCoords': this.ooliteFont.getCharCoords("o")});
	this.scene.translate(0.35, 0.8, 0);
	this.scene.scale(0.15, 0.2, 1);
	this.scene.translate(0.5, 0.5, 0);
	this.hudPlane.display();
	this.scene.popMatrix();
	// d
	this.scene.pushMatrix();
	this.scene.activeShader.setUniformsValues({'charCoords': this.ooliteFont.getCharCoords("d")});
	this.scene.translate(0.5, 0.8, 0);
	this.scene.scale(0.15, 0.2, 1);
	this.scene.translate(0.5, 0.5, 0);
	this.hudPlane.display();
	this.scene.popMatrix();
	// X
	this.scene.pushMatrix();
	this.scene.activeShader.setUniformsValues({'charCoords': this.ooliteFont.getCharCoords("X")});
	this.scene.translate(0.65, 0.8, 0);
	this.scene.scale(0.15, 0.2, 1);
	this.scene.translate(0.5, 0.5, 0);
	this.hudPlane.display();
	this.scene.popMatrix();

	// Player 1

	// P (1)
	this.scene.pushMatrix();
	this.scene.activeShader.setUniformsValues({'charCoords': this.ooliteFont.getCharCoords("P")});
	this.scene.translate(0, 0.65, 0);
	this.scene.scale(0.09, 0.1, 1);
	this.scene.translate(0.5, 0.5, 0);
	this.hudPlane.display();
	this.scene.popMatrix();

	// l (1)
	this.scene.pushMatrix();
	this.scene.activeShader.setUniformsValues({'charCoords': this.ooliteFont.getCharCoords("l")});
	this.scene.translate(0.09, 0.65, 0);
	this.scene.scale(0.09, 0.1, 1);
	this.scene.translate(0.5, 0.5, 0);
	this.hudPlane.display();
	this.scene.popMatrix();

	// a (1)
	this.scene.pushMatrix();
	this.scene.activeShader.setUniformsValues({'charCoords': this.ooliteFont.getCharCoords("a")});
	this.scene.translate(0.18, 0.65, 0);
	this.scene.scale(0.09, 0.1, 1);
	this.scene.translate(0.5, 0.5, 0);
	this.hudPlane.display();
	this.scene.popMatrix();

	// y (1)
	this.scene.pushMatrix();
	this.scene.activeShader.setUniformsValues({'charCoords': this.ooliteFont.getCharCoords("y")});
	this.scene.translate(0.27, 0.65, 0);
	this.scene.scale(0.09, 0.1, 1);
	this.scene.translate(0.5, 0.5, 0);
	this.hudPlane.display();
	this.scene.popMatrix();

	// e (1)
	this.scene.pushMatrix();
	this.scene.activeShader.setUniformsValues({'charCoords': this.ooliteFont.getCharCoords("e")});
	this.scene.translate(0.36, 0.65, 0);
	this.scene.scale(0.09, 0.1, 1);
	this.scene.translate(0.5, 0.5, 0);
	this.hudPlane.display();
	this.scene.popMatrix();

	// r (1)
	this.scene.pushMatrix();
	this.scene.activeShader.setUniformsValues({'charCoords': this.ooliteFont.getCharCoords("r")});
	this.scene.translate(0.45, 0.65, 0);
	this.scene.scale(0.09, 0.1, 1);
	this.scene.translate(0.5, 0.5, 0);
	this.hudPlane.display();
	this.scene.popMatrix();

	// 1 (1)
	this.scene.pushMatrix();
	this.scene.activeShader.setUniformsValues({'charCoords': this.ooliteFont.getCharCoords("1")});
	this.scene.translate(0.54, 0.65, 0);
	this.scene.scale(0.09, 0.1, 1);
	this.scene.translate(0.5, 0.5, 0);
	this.hudPlane.display();
	this.scene.popMatrix();

	// : (1)
	this.scene.pushMatrix();
	this.scene.activeShader.setUniformsValues({'charCoords': this.ooliteFont.getCharCoords(":")});
	this.scene.translate(0.63, 0.65, 0);
	this.scene.scale(0.09, 0.1, 1);
	this.scene.translate(0.5, 0.5, 0);
	this.hudPlane.display();
	this.scene.popMatrix();

	// " " (1)
	this.scene.pushMatrix();
	this.scene.activeShader.setUniformsValues({'charCoords': this.ooliteFont.getCharCoords(" ")});
	this.scene.translate(0.72, 0.65, 0);
	this.scene.scale(0.09, 0.1, 1);
	this.scene.translate(0.5, 0.5, 0);
	this.hudPlane.display();
	this.scene.popMatrix();

	// N1 (1)
	this.scene.pushMatrix();
	this.scene.activeShader.setUniformsValues({'charCoords': this.ooliteFont.getCharCoords("" + p1_n1)});
	this.scene.translate(0.81, 0.65, 0);
	this.scene.scale(0.09, 0.1, 1);
	this.scene.translate(0.5, 0.5, 0);
	this.hudPlane.display();
	this.scene.popMatrix();

	// N2 (1)
	this.scene.pushMatrix();
	this.scene.activeShader.setUniformsValues({'charCoords': this.ooliteFont.getCharCoords("" + p1_n2)});
	this.scene.translate(0.9, 0.65, 0);
	this.scene.scale(0.1, 0.1, 1);
	this.scene.translate(0.5, 0.5, 0);
	this.hudPlane.display();
	this.scene.popMatrix();

	// Player 2

	// P (2)
	this.scene.pushMatrix();
	this.scene.activeShader.setUniformsValues({'charCoords': this.ooliteFont.getCharCoords("P")});
	this.scene.translate(0, 0.55, 0);
	this.scene.scale(0.09, 0.1, 1);
	this.scene.translate(0.5, 0.5, 0);
	this.hudPlane.display();
	this.scene.popMatrix();

	// l (2)
	this.scene.pushMatrix();
	this.scene.activeShader.setUniformsValues({'charCoords': this.ooliteFont.getCharCoords("l")});
	this.scene.translate(0.09, 0.55, 0);
	this.scene.scale(0.09, 0.1, 1);
	this.scene.translate(0.5, 0.5, 0);
	this.hudPlane.display();
	this.scene.popMatrix();

	// a (2)
	this.scene.pushMatrix();
	this.scene.activeShader.setUniformsValues({'charCoords': this.ooliteFont.getCharCoords("a")});
	this.scene.translate(0.18, 0.55, 0);
	this.scene.scale(0.09, 0.1, 1);
	this.scene.translate(0.5, 0.5, 0);
	this.hudPlane.display();
	this.scene.popMatrix();

	// y (2)
	this.scene.pushMatrix();
	this.scene.activeShader.setUniformsValues({'charCoords': this.ooliteFont.getCharCoords("y")});
	this.scene.translate(0.27, 0.55, 0);
	this.scene.scale(0.09, 0.1, 1);
	this.scene.translate(0.5, 0.5, 0);
	this.hudPlane.display();
	this.scene.popMatrix();

	// e (2)
	this.scene.pushMatrix();
	this.scene.activeShader.setUniformsValues({'charCoords': this.ooliteFont.getCharCoords("e")});
	this.scene.translate(0.36, 0.55, 0);
	this.scene.scale(0.09, 0.1, 1);
	this.scene.translate(0.5, 0.5, 0);
	this.hudPlane.display();
	this.scene.popMatrix();

	// r (2)
	this.scene.pushMatrix();
	this.scene.activeShader.setUniformsValues({'charCoords': this.ooliteFont.getCharCoords("r")});
	this.scene.translate(0.45, 0.55, 0);
	this.scene.scale(0.09, 0.1, 1);
	this.scene.translate(0.5, 0.5, 0);
	this.hudPlane.display();
	this.scene.popMatrix();

	// 2 (2)
	this.scene.pushMatrix();
	this.scene.activeShader.setUniformsValues({'charCoords': this.ooliteFont.getCharCoords("2")});
	this.scene.translate(0.54, 0.55, 0);
	this.scene.scale(0.09, 0.1, 1);
	this.scene.translate(0.5, 0.5, 0);
	this.hudPlane.display();
	this.scene.popMatrix();

	// : (2)
	this.scene.pushMatrix();
	this.scene.activeShader.setUniformsValues({'charCoords': this.ooliteFont.getCharCoords(":")});
	this.scene.translate(0.63, 0.55, 0);
	this.scene.scale(0.09, 0.1, 1);
	this.scene.translate(0.5, 0.5, 0);
	this.hudPlane.display();
	this.scene.popMatrix();

	// " " (2)
	this.scene.pushMatrix();
	this.scene.activeShader.setUniformsValues({'charCoords': this.ooliteFont.getCharCoords(" ")});
	this.scene.translate(0.72, 0.55, 0);
	this.scene.scale(0.09, 0.1, 1);
	this.scene.translate(0.5, 0.5, 0);
	this.hudPlane.display();
	this.scene.popMatrix();

	// N1 (2)
	this.scene.pushMatrix();
	this.scene.activeShader.setUniformsValues({'charCoords': this.ooliteFont.getCharCoords("" + p2_n1)});
	this.scene.translate(0.81, 0.55, 0);
	this.scene.scale(0.09, 0.1, 1);
	this.scene.translate(0.5, 0.5, 0);
	this.hudPlane.display();
	this.scene.popMatrix();

	// N2 (2)
	this.scene.pushMatrix();
	this.scene.activeShader.setUniformsValues({'charCoords': this.ooliteFont.getCharCoords("" + p2_n2)});
	this.scene.translate(0.9, 0.55, 0);
	this.scene.scale(0.1, 0.1, 1);
	this.scene.translate(0.5, 0.5, 0);
	this.hudPlane.display();
	this.scene.popMatrix();

	if(typeof show_time == "undefined" || show_time) {

		// Time

		// T
		this.scene.pushMatrix();
		this.scene.activeShader.setUniformsValues({'charCoords': this.ooliteFont.getCharCoords("T")});
		this.scene.translate(0, 0.45, 0);
		this.scene.scale(0.09, 0.1, 1);
		this.scene.translate(0.5, 0.5, 0);
		this.hudPlane.display();
		this.scene.popMatrix();

		// i
		this.scene.pushMatrix();
		this.scene.activeShader.setUniformsValues({'charCoords': this.ooliteFont.getCharCoords("i")});
		this.scene.translate(0.09, 0.45, 0);
		this.scene.scale(0.09, 0.1, 1);
		this.scene.translate(0.5, 0.5, 0);
		this.hudPlane.display();
		this.scene.popMatrix();

		// m
		this.scene.pushMatrix();
		this.scene.activeShader.setUniformsValues({'charCoords': this.ooliteFont.getCharCoords("m")});
		this.scene.translate(0.18, 0.45, 0);
		this.scene.scale(0.09, 0.1, 1);
		this.scene.translate(0.5, 0.5, 0);
		this.hudPlane.display();
		this.scene.popMatrix();

		// e
		this.scene.pushMatrix();
		this.scene.activeShader.setUniformsValues({'charCoords': this.ooliteFont.getCharCoords("e")});
		this.scene.translate(0.27, 0.45, 0);
		this.scene.scale(0.09, 0.1, 1);
		this.scene.translate(0.5, 0.5, 0);
		this.hudPlane.display();
		this.scene.popMatrix();

		// :
		this.scene.pushMatrix();
		this.scene.activeShader.setUniformsValues({'charCoords': this.ooliteFont.getCharCoords(":")});
		this.scene.translate(0.36, 0.45, 0);
		this.scene.scale(0.09, 0.1, 1);
		this.scene.translate(0.5, 0.5, 0);
		this.hudPlane.display();
		this.scene.popMatrix();

		// " "
		this.scene.pushMatrix();
		this.scene.activeShader.setUniformsValues({'charCoords': this.ooliteFont.getCharCoords(" ")});
		this.scene.translate(0.45, 0.45, 0);
		this.scene.scale(0.09, 0.1, 1);
		this.scene.translate(0.5, 0.5, 0);
		this.hudPlane.display();
		this.scene.popMatrix();

		// D1
		this.scene.pushMatrix();
		this.scene.activeShader.setUniformsValues({'charCoords': this.ooliteFont.getCharCoords(time_diff[0])});
		this.scene.translate(0.54, 0.45, 0);
		this.scene.scale(0.09, 0.1, 1);
		this.scene.translate(0.5, 0.5, 0);
		this.hudPlane.display();
		this.scene.popMatrix();

		// D2
		this.scene.pushMatrix();
		this.scene.activeShader.setUniformsValues({'charCoords': this.ooliteFont.getCharCoords(time_diff[1])});
		this.scene.translate(0.63, 0.45, 0);
		this.scene.scale(0.09, 0.1, 1);
		this.scene.translate(0.5, 0.5, 0);
		this.hudPlane.display();
		this.scene.popMatrix();

		// :
		this.scene.pushMatrix();
		this.scene.activeShader.setUniformsValues({'charCoords': this.ooliteFont.getCharCoords(time_diff[2])});
		this.scene.translate(0.72, 0.45, 0);
		this.scene.scale(0.09, 0.1, 1);
		this.scene.translate(0.5, 0.5, 0);
		this.hudPlane.display();
		this.scene.popMatrix();

		// D3
		this.scene.pushMatrix();
		this.scene.activeShader.setUniformsValues({'charCoords': this.ooliteFont.getCharCoords(time_diff[3])});
		this.scene.translate(0.81, 0.45, 0);
		this.scene.scale(0.09, 0.1, 1);
		this.scene.translate(0.5, 0.5, 0);
		this.hudPlane.display();
		this.scene.popMatrix();

		// D4
		this.scene.pushMatrix();
		this.scene.activeShader.setUniformsValues({'charCoords': this.ooliteFont.getCharCoords(time_diff[4])});
		this.scene.translate(0.90, 0.45, 0);
		this.scene.scale(0.1, 0.1, 1);
		this.scene.translate(0.5, 0.5, 0);
		this.hudPlane.display();
		this.scene.popMatrix();

	}
}

Modx.prototype.displayHUD = function(t, show_time) {
	if(typeof this.state.displayHUD == "function") {
		this.state.displayHUD(t);
		return;
	}

	this.displayHUDprimitives(t, show_time);
}

Modx.prototype.start = function(game) {
	this.gameHistory = [];
	if(game instanceof Game)
		this.gameHistory = [game];
	else
		this.gameHistory = [new Game(game)];
	if(!(this.state instanceof StateGameMovie) && !(this.state instanceof StateGameEnded))
		this.setState(new StateWaitingForPlay(this));
	this.playHistory = [];
	this.newGame = null;
	this.newPlay = null;
	var board = this.getGame().getBoard();
	for (var y = 0; y < Board.size; y++)
	{
		for (var x = 0; x < Board.size; x++)
		{
			var xPiece = board.get(x, y).getXpiece();
			if (xPiece !== Modx.pieceTypes.NONE)
			{
				var piece = this.takeOutsidePiece(xPiece);
				piece.setPosition(this.calculateBoardPiecePos(x, y));
				this.placeBoardPiece(piece, [x, y]);
			}
		}
	}
	this.playing = Modx.playingGameState.PLAYING;
	
	var type = this.getGame().getDifficulty();
	if(type != Game.difficultyType.BOTvsBOT) {
		this.scene.addUndo();
	}
	
	return this.getGame();
}

Modx.prototype.nextTurn = function() {
	this.updateGame();
	this.newGame = null;
	this.newPlay = null;
}

Modx.prototype.isPlayResponseReady = function() {
	return this.newGame && this.newPlay;
}

Modx.prototype.getGame = function() {
	return this.gameHistory[this.gameHistory.length - 1];
}
Modx.prototype.getGameFromLast = function(index) {
	length = this.gameHistory.length - 1;
	if(index > length)
		return null;
	return this.gameHistory[length - index];
}

Modx.prototype.updateGame = function() {
	if (this.newGame !== null)
		this.gameHistory.push(this.newGame);
}

Modx.prototype.getPlay = function() {
	return this.playHistory[this.playHistory.length - 1];
}

/**
 * Gets a bot play via prolog request
 */
Modx.prototype.getBotPlay = function() {
	var this_t = this;
	this.client.getRequestReply("make_play(" + this.getGame().toJSON() + ")", function(data) { this_t.onBotPlayReceived(data); }, function(data) { 
		this_t.endReason = Modx.endGameReason.CONNECTION_ERR;
		this_t.setState(new StateGameEnded(this_t)); 
	});
}

/**
 * Makes the actual bot play received
 */
Modx.prototype.onBotPlayReceived = function(prolog_reply) {
	if((this.state instanceof StateGameEnded) || (this.state instanceof StateGameMovie) || (this.state instanceof StateStartingGame))
		return;

	var reply = JSON.parse(prolog_reply.target.responseText);
	if(reply[1].length == 2) {
		this.setState(new StateMovingPiece(this, 0, reply[1], this.nextPieceType(), true));
		this.start_time = -1;
		this.newGame = new Game();
		this.newGame.parseGame(reply[0]);
		this.newPlay = this.getGame().compare(reply[1], this.newGame);
		this.updatePlay();		
	} else  {
		winner = this.getGame().getWinner();
		switch(winner) {
		case 1:
			this.endReason = Modx.endGameReason.P1_WIN_SCORE;
			break;
		case 2:
			this.endReason = Modx.endGameReason.P2_WIN_SCORE;
			break;
		default:
			this.endReason = Modx.endGameReason.TIE_GAME;
		break;
		}
		if(!(this.state instanceof StateGameEnded) && !(this.state instanceof StateGameMovie))
			this.setState(new StateGameEnded(this));
	}
}

Modx.prototype.updatePlay = function() {
	if (this.newPlay !== null)
		this.playHistory.push(this.newPlay);
}

Modx.prototype.takeOutsidePiece = function(type) {
	return this.outsidePieces[type].pop();
}

Modx.prototype.takeBoardPiece = function(coords) {
	var piece = this.boardPieces[coords[1]][coords[0]].pop();
	if (piece.getType() === Modx.pieceTypes.JOKER)
		this.numJokersToPlace++;
	return piece;
}

Modx.prototype.placeOutsidePiece = function(piece) {
	this.outsidePieces[piece.getType()].push(piece);
}

Modx.prototype.placeBoardPiece = function(piece, coords) {
	if (piece.getType() === Modx.pieceTypes.JOKER)
		this.numJokersToPlace--;
	this.boardPieces[coords[1]][coords[0]].push(piece);
}

Modx.prototype.getHoverPiece = function(type) {
	if (type !== Modx.pieceTypes.JOKER && type !== Modx.pieceTypes.PLAYER1 && type !== Modx.pieceTypes.PLAYER2)
		return null;
	else
		return this.pieces[type + (Modx.pieceTypes.HOVER_JOKER - Modx.pieceTypes.JOKER)][0];
}

Modx.prototype.nextMove = function(moveID) {
	if (moveID === this.newPlay.length)
	{
		if(this.playing == Modx.playingGameState.GAME_ENDED)
			this.setState(new StateGameEnded(this));
		else
			this.setState(new StateWaitingForPlay(this));
		return;
	}

	var move = this.newPlay[moveID];
	switch (move[0])
	{
	case Modx.pieceTypes.JOKER:
	case Modx.pieceTypes.PLAYER1:
	case Modx.pieceTypes.PLAYER2:
	case Modx.pieceTypes.SPIECE_P1:
	case Modx.pieceTypes.SPIECE_P2:
		this.setState(new StateMovingPiece(this, moveID, move[2], move[0], move[1]));
		break;
	}
	return;
}

Modx.prototype.setState = function(state) {
	var prev_state = this.state;
	this.state = state;
	if((prev_state instanceof StateGameMovie) || (prev_state instanceof StateGameEnded))
		return;
	if(!(this.state instanceof StateStartingGame) && !(this.state instanceof StateGameMovie) && !(this.state instanceof StateGameEnded) && typeof this.getGame() != "undefined") {
		this.checkGameEnded();
	}
}

Modx.prototype.display = function(t) {
	if(typeof this.scene.scenarios != "undefined" && typeof this.scene.scenarioName != undefined && typeof this.scene.scenarios[this.scene.scenarioName] != "undefined")
		this.scene.scenarios[this.scene.scenarioName].display(t, this.playing == Modx.playingGameState.PLAYING || this.playing == Modx.playingGameState.GAME_ENDED);
	if (this.state !== null)
		this.state.display(t);
}

Modx.prototype.displayBoard = function() {
	this.scene.setDefaultAppearance();
	this.scene.graph.graphNodes["board"].display(0);
	for (var y = 0; y < Board.size; y++)
	{
		this.scene.pushMatrix();
		this.scene.translate(0, 0, y);
		for (var x = 0; x < Board.size; x++)
		{
			this.scene.graph.graphNodes["cell"].display(0);
			this.scene.translate(1, 0, 0);
		}
		this.scene.popMatrix();
	}
}

Modx.prototype.displayXPieceBoxes = function() {
	this.scene.graph.graphNodes["piece_boxes"].display(0);
}

Modx.prototype.calculateBoardPiecePos = function(x, y) {
	var height = 0;
	var cell = this.boardPieces[y][x];
	for (var i = 0; i < cell.length; i++)
	{
		height += cell[i].getHeight();
	}
	return vec3.fromValues(x, height, y);
}

Modx.prototype.displayPieces = function(t) {
	for (var type in this.pieces) {
		for (var i = 0; i < this.pieces[type].length; i++)
			this.pieces[type][i].display(t);
	}
}

Modx.prototype.displaySPieces = function(x, y) {
	this.scene.pushMatrix();
	this.scene.translate(x, 0, y);
	var cell = this.getGame().getBoard().get(x, y);
	var sPieces = cell.getSPieces();
	for (var i = 0; i < sPieces.length; i++)
	{
		this.scene.pushMatrix();
		this.scene.translate(0, Modx.sPieceHeight * i, 0);
		var name = "s_piece" + sPieces[sPieces.length - 1 - i];
		this.scene.graph.graphNodes[name].display(0);
		this.scene.popMatrix();
	}
	this.scene.popMatrix();
}

Modx.prototype.onClick = function(event) {
	if (this.state !== null)
		this.state.onClick(event);
}


Modx.prototype.getNumOutsidePieces = function(type) {
	return this.outsidePieces[type].length;
}

Modx.prototype.nextPieceType = function() {
	return (this.numJokersToPlace === 0) ? this.getGame().getCurrPlayer() : Modx.pieceTypes.JOKER;
}

Modx.prototype.calculateOutsidePiecePos = function(type, xPieceNum) {
	switch (type)
	{
	case Modx.pieceTypes.JOKER:
	case Modx.pieceTypes.PLAYER1:
	case Modx.pieceTypes.PLAYER2:
		return this.calculateOutsideXPiecePos(type, xPieceNum);
	case Modx.pieceTypes.SPIECE_P1:
	case Modx.pieceTypes.SPIECE_P2:
		return this.calculateOutsideSPiecePos(type, xPieceNum);
	default:
		return null;
	}
}


Modx.prototype.calculateOutsideSPiecePos = function(type, xPieceNum) {
	var res;
	switch (type)
	{
	case Modx.pieceTypes.SPIECE_P1:
		res = vec3.fromValues(7.5, 0, 9);
		break;
	case Modx.pieceTypes.SPIECE_P2:
		res = vec3.fromValues(-0.5, 0, -2);
		break;
	default:
		return null;
	}
	res = vec3.add(vec3.create(), res, vec3.fromValues(0, 0.05 * xPieceNum, 0));
	res = vec3.add(vec3.create(), res, vec3.fromValues((Math.random() - 0.5) * 0.03, 0, (Math.random() - 0.5) * 0.03)); // Random noise
	return res;
}

Modx.prototype.calculateOutsideXPiecePos = function(type, xPieceNum) {
	var res;
	switch (type)
	{
	case Modx.pieceTypes.PLAYER1:
		res = vec3.fromValues(0.5, 0, 8.5);
		return vec3.add(vec3.create(), res, vec3.fromValues(xPieceNum % Modx.xPieceBoxPiecesPerRow, 0, (xPieceNum / Modx.xPieceBoxPiecesPerRow) >> 0));
		break;
	case Modx.pieceTypes.PLAYER2:
		res = vec3.fromValues(6.5, 0, -1.5);
		return vec3.add(vec3.create(), res, vec3.fromValues(-(xPieceNum % Modx.xPieceBoxPiecesPerRow), 0, -(xPieceNum / Modx.xPieceBoxPiecesPerRow) >> 0));
		break;
	case Modx.pieceTypes.JOKER:
		res = vec3.fromValues(-1.5, 0, Board.size / 2 - 0.5);
		return vec3.add(vec3.create(), res, vec3.fromValues(0, 0.3 * xPieceNum, 0));
	default:
		return null;
	}
}

Modx.prototype.displayOutsideXPiece = function(player, xPieceNum) {
	this.scene.pushMatrix();
	var pos = this.calculateOutsideXPiecePos(player, xPieceNum);
	this.scene.translate(pos[0], pos[1], pos[2]);
	this.scene.graph.graphNodes["piece" + player].display(0);
	this.scene.popMatrix();
}

Modx.prototype.displayOutsideXPieces = function(player) {
	if (player !== 1 && player !== 2) return;

	for(var i = 0; i < this.getNumOutsideXPieces(player); ++i) {
		this.displayOutsideXPiece(player, i);
	}
}
