function run_tests() {
	console.log("testing");
	var client = new Client();
	client.getRequestReply("start_game(8,1)", funct);
}

funct = function(data) {
	var game_obj = new Game(data);
	console.log(game_obj.toArray());
}