Tester.testing = function() {
	return true;
}

function Tester() {};
Tester.prototype.constructor=Tester;

Tester.test = function() {
	var client = new Client();
	client.getRequestReply("start_game", funct);
}

funct = function(data) {
	var game = Reply.getText(data);
	console.log(game);
	var game_obj = new Game(game);
}