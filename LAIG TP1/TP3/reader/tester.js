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
	console.log(Reply.getText(data));
}