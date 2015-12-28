StateWaitingForPlay.prototype = Object.create(State.prototype);
StateWaitingForPlay.prototype.constructor = StateWaitingForPlay;

function StateWaitingForPlay(modx) {
	this.init(modx);
	this.modx.nextTurn();
	this.hovered = null;
	if (this.modx.lastMoveEvent !== null)
	{
		this.scene.setPickEnabled(true);
		this.scene.onPick(this.modx.lastMoveEvent);
	}

	var curr_game = this.modx.getGame();
	if(typeof curr_game != 'undefined') {
		var this_t = this;
		this.modx.client.getRequestReply("available_moves(" + curr_game.toJSON() + ")", function(prolog_reply) {
			this_t.updated = true;
			var positions = JSON.parse(prolog_reply.target.responseText);
			var board = this_t.modx.getGame().getBoard();
			board.setAllCellsValidity(false);
			var size = positions.length;
			for(var i = 0; i < size; ++i) {
				board.get(positions[i][0], positions[i][1]).setValidValue(true);
			}
		})

		if(curr_game.getDifficulty() == Game.difficultyType.VERSUS) {
			if(curr_game.getCurrPlayer() == 1)
				this.modx.scene.setCameraByName("Player 1");
			else {
				this.modx.scene.setCameraByName("Player 2");
			}
		} else {
			if(curr_game.getCurrPlayer() == 1)
				this.modx.scene.setCameraByName("Player 1");
			else {
				this.modx.getBotPlay();
			}
		}
	}

	this.start_time = -1;
}


StateWaitingForPlay.prototype.display = function(t) {	
	this.scene.setPickEnabled(true);
	var curr_game = this.modx.getGame();
	for (var y = 0; y < Board.size; y++)
	{
		this.scene.pushMatrix();
		this.scene.translate(0, 0, y);
		for (var x = 0; x < Board.size; x++)
		{
			var cell_temp = curr_game.getBoard().get(x, y);
			// Draw cell
			if (cell_temp.getXpiece() === Modx.pieceTypes.NONE && cell_temp.isValid() && 
					((curr_game.getDifficulty() != Game.difficultyType.VERSUS && curr_game.getCurrPlayer() == 1) || (curr_game.getDifficulty() == Game.difficultyType.VERSUS)))
				this.scene.registerForPick(y * Board.size + x + 1 , [x, y]);
			else if (cell_temp.getXpiece() === Modx.pieceTypes.NONE && !cell_temp.isValid()) {
				this.scene.graph.graphNodes["invalid_cell_marker"].display(0);
				this.scene.defaultAppearance.apply();
			}
			this.scene.graph.graphNodes["cell"].display(0);
			this.scene.clearPickRegistration();
			this.scene.translate(1, 0, 0);
		}
		this.scene.popMatrix();
	}
	this.updatePicking();
	this.scene.graph.graphNodes["board"].display(0);
	this.modx.displayXPieceBoxes();
	this.modx.displayPieces(t);

	if(this.start_time == -1 || t < this.start_time)
		this.start_time = t;
	else
		this.modx.checkPlayTimeout(this.start_time, t);
}

StateWaitingForPlay.prototype.updatePicking = function ()
{
	if (this.scene.pickMode == false) {
		if (this.scene.pickResults != null && this.scene.pickResults.length > 0) {
			this.hovered = null;
			this.modx.getHoverPiece(this.modx.nextPieceType()).setVisible(false);
			var obj = this.scene.pickResults[0][0];
			if (obj)
			{
				this.scene.setPickEnabled(false);
				this.hovered = obj;
				this.modx.getHoverPiece(this.modx.nextPieceType()).setPosition(this.modx.calculateBoardPiecePos(obj[0], obj[1]));
				this.modx.getHoverPiece(this.modx.nextPieceType()).setVisible(true);
			}
			this.scene.pickResults.splice(0,this.scene.pickResults.length);
		}		
	}
}

StateWaitingForPlay.prototype.onClick = function(event) {
	if (this.hovered !== null)
	{
		var s = this;
		this.modx.setState(new StateMovingPiece(s.modx, 0, this.hovered, this.modx.nextPieceType(), true));
		this.modx.getGame().makePlay(this.modx, this.hovered[0], this.hovered[1], function(newGame) {
			s.modx.start_time = -1;
			s.modx.newGame = newGame;
			s.modx.newPlay = s.modx.getGame().compare(s.hovered, newGame);
			console.log(s.modx.newPlay);
			s.modx.updatePlay();
		});
		this.scene.setPickEnabled(false);
	}
}