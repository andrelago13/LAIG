//////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////			STATIC MEMBERS	       ///////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

Client.defaultPort = 8081;

Client.defaultSuccessHandler = function(data){
	console.log("Request successful. Reply: " + data.target.response);
};

Client.defaultErrorHandler = function(){
	console.log("Error waiting for response");
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////		NON STATIC MEMBERS	       ///////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Client
 * @param port port number (default is 8081)
 * @constructor
 */
function Client(port) {
	this.port = port || Client.defaultPort;
};
Client.prototype.constructor=Client;

/**
 * @brief Gets a request reply from the server
 * @param requestString string to be sent to the server
 * @param onSuccess successful return handler
 * @param onError error handler
 */
Client.prototype.getRequestReply = function (requestString, onSuccess, onError) {
	var requestPort = this.port || Client.defaultPort;
	var request = new XMLHttpRequest();
	request.open('GET', 'http://localhost:'+requestPort+'/'+requestString, true);

	request.onload = onSuccess || Client.defaultSuccessHandler;
	request.onerror = onError || Client.defaultErrorHandler;

	request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
	request.send();
}

Client.prototype.getPort = function () {
	return this.port;
}

Client.prototype.setPort = function(newPort) {
	if(typeof newPort == 'undefined' || newPort == null)
		return;
	this.port = newPort;
}
