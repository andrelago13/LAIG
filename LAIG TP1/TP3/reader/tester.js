function run_tests() {
	console.log("testing");
	var client = new Client();
	client.getRequestReply("start_game(8,1)", funct);
}

funct = function(data) {
	var game_obj = new Game(data);
	console.log(game_obj.toArray());
	//console.log("  ");
	//console.log(JSON.stringify(game_obj.toArray()));
	var client = new Client();
	client.getRequestReply("available_moves(" + game_obj.toJSON() + ")", funct2);
}

funct2 = function(data) {
	console.log(Reply.getText(data));
	//var game_obj = new Game(data);
	//console.log(game_obj.toArray());
}