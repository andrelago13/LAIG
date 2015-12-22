Modx.pieceTypes = {
		NONE: -1,
		JOKER: 0,
		PLAYER1: 1,
		PLAYER2: 2,
		SPIECE_P1: 3,
		SPIECE_P2: 4,
		HOVER: 0
};
Modx.numXPiecesPerPlayer = 14;
Modx.xPieceBoxPiecesPerRow = 7;
Modx.sPieceHeight = 0.05;

Modx.secondsToStr = function(time) {
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
	this.client = new Client();
	var modx = this;
	this.client.getRequestReply("start_game(8,1)", function(game) { modx.start(game); });
	this.gameHistory = [];
	this.scene = scene;
	this.state = null;
	this.numJokersToPlace = 0;
	this.lastMoveEvent = null;
	this.numRemovedJokers = 0;
	
	this.hudPlane = new Plane(this.scene, 10);
	this.ooliteFont = new OoliteFont(this.scene);
	
	this.start_time = -1;
};

Modx.prototype.displayHUD = function(t) {
	if(typeof this.state == 'undefined' || this.gameHistory.length <= 0)
		return;
	
	if(this.start_time === -1 || t < this.start_time) {
		this.start_time = t;
		return;
	}
	
	time_diff = Modx.secondsToStr(t - this.start_time);
	
	var background = this.ooliteFont.getBackgroundAppearance();
	background.apply();
	var text = this.ooliteFont.getAppearance();
	
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
	
	this.scene.setActiveShaderSimple(this.ooliteFont.getShader())
	text.apply();
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

Modx.prototype.start = function(game) {
	this.setState(new StateWaitingForPlay(this));
	this.gameHistory = [];
	this.gameHistory = [new Game(game)];
	return this.getGame();
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

Modx.prototype.updateGame = function(newGame) {
	this.gameHistory.push(newGame);
}

Modx.prototype.setState = function(state) {
	this.state = state;
}

Modx.prototype.display = function(t) {
	if (this.state !== null)
		this.state.display(t);
}

Modx.prototype.displayBoard = function() {
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

Modx.prototype.calculateXPiecePos = function(x, y) {
	return vec3.fromValues(x, Modx.sPieceHeight * this.getGame().getBoard().get(x, y).getSPieces().length, y);
}

Modx.prototype.displayXPiece = function(x, y, type, hover) {
	this.scene.pushMatrix();
	var pos = this.calculateXPiecePos(x, y);
	this.scene.translate(pos[0], pos[1], pos[2]);
	var name = "piece" + type;
	if (hover) name += "_hover";
	this.scene.graph.graphNodes[name].display(0);
	this.scene.popMatrix();
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

Modx.prototype.incNumRemovedJokers = function() {
	this.numRemovedJokers++;
}

Modx.prototype.decNumRemovedJokers = function() {
	this.numRemovedJokers--;
}

Modx.prototype.getNumRemovedJokers = function() {
	return this.numRemovedJokers;
}

Modx.prototype.nextPieceType = function() {
	return (this.numJokersToPlace === 0) ? this.getGame().getCurrPlayer() : Modx.pieceTypes.JOKER;
}

Modx.prototype.calculateRemainingXPiecePos = function(player, xPieceNum) {
	var res;
	switch (player)
	{
	case 1: res = vec3.fromValues(0.5, 0, 8.5);
	return vec3.add(vec3.create(), res, vec3.fromValues(xPieceNum % Modx.xPieceBoxPiecesPerRow, 0, (xPieceNum / Modx.xPieceBoxPiecesPerRow) >> 0));
	break;
	case 2: res = vec3.fromValues(6.5, 0, -1.5);
	return vec3.add(vec3.create(), res, vec3.fromValues(-(xPieceNum % Modx.xPieceBoxPiecesPerRow), 0, -(xPieceNum / Modx.xPieceBoxPiecesPerRow) >> 0));
	break;
	default: return null;
	}
}

Modx.prototype.displayRemainingXPiece = function(player, xPieceNum) {
	this.scene.pushMatrix();
	var pos = this.calculateRemainingXPiecePos(player, xPieceNum);
	this.scene.translate(pos[0], pos[1], pos[2]);
	this.scene.graph.graphNodes["piece" + player].display(0);
	this.scene.popMatrix();
}

Modx.prototype.displayRemainingXPieces = function(player) {
	if (player !== 1 && player !== 2) return;

	for(var i = 0; i < this.getGame().getPlayerInfo(player).getNumXPieces(); ++i) {
		this.displayRemainingXPiece(player, i);
	}
}

Modx.prototype.calculateRemovedJokerPos = function(n) {
	// TODO
}