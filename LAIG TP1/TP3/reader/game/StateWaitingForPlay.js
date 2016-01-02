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
		if(curr_game.getDifficulty() == Game.difficultyType.VERSUS) {
			if(this.modx.scene.automaticCamera) {
				if(curr_game.getCurrPlayer() == 1) {
					this.modx.scene.setCameraByName("Player 1");
				} else {
					this.modx.scene.setCameraByName("Player 2");
				}
			}
		} else if (curr_game.getDifficulty() == Game.difficultyType.BOTvsBOT) {
			if(this.modx.scene.automaticCamera)
				this.modx.scene.setCameraByName("Top");
			this.modx.getBotPlay();
			
		} else {
			if(curr_game.getCurrPlayer() == 1) {
				if(this.modx.scene.automaticCamera)
					this.modx.scene.setCameraByName("Player 1");
			} else {
				this.modx.getBotPlay();
			}
		}
	}

	this.start_time = -1;
}


StateWaitingForPlay.prototype.display = function(t) {	
	this.scene.setPickEnabled(true);
	var curr_game = this.modx.getGame();
	
	// Draw pickable objects
	this.scene.setDefaultAppearance();
	for (var y = 0; y < Board.size; y++)
	{
		this.scene.pushMatrix();
		this.scene.translate(0, 0, y);
		for (var x = 0; x < Board.size; x++)
		{
			var cell_temp = curr_game.getBoard().get(x, y);
			if (cell_temp.getXpiece() === Modx.pieceTypes.NONE && cell_temp.isValid() && 
					((curr_game.getDifficulty() != Game.difficultyType.VERSUS && curr_game.getCurrPlayer() == 1) || (curr_game.getDifficulty() == Game.difficultyType.VERSUS)) &&
					(curr_game.getDifficulty() != Game.difficultyType.BOTvsBOT))
				this.scene.registerForPick(y * Board.size + x + 1 , [x, y]);
			this.scene.graph.graphNodes["cell"].display(0);
			this.scene.clearPickRegistration();
			this.scene.translate(1, 0, 0);
		}
		this.scene.popMatrix();
	}
	this.updatePicking();
	
	// Draw invalid cell markers
	for (var y = 0; y < Board.size; y++)
	{
		for (var x = 0; x < Board.size; x++)
		{
			var cell_temp = curr_game.getBoard().get(x, y);
			if (cell_temp.getXpiece() === Modx.pieceTypes.NONE && !cell_temp.isValid()) {
				var pos = this.modx.calculateBoardPiecePos(x, y);
				this.scene.pushMatrix();
				this.scene.translate(pos[0], pos[1], pos[2]);
				this.scene.graph.graphNodes["invalid_cell_marker"].display(0);
				this.scene.popMatrix();
			}
		}
	}
	
	this.scene.setDefaultAppearance();
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
			s.modx.updatePlay();
			
			s.modx.client.getRequestReply("available_moves(" + newGame.toJSON() + ")", function(prolog_reply) {
				s.updated = true;
				var positions = JSON.parse(prolog_reply.target.responseText);
				var board = newGame.getBoard();
				board.setAllCellsValidity(false);
				var size = positions.length;
				for(var i = 0; i < size; ++i) {
					board.get(positions[i][0], positions[i][1]).setValidValue(true);
				}
			})
		});
		this.scene.setPickEnabled(false);
	}
}
