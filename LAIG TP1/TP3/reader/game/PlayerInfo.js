//////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////		NON STATIC MEMBERS	       ///////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * PlayerInfo
 * @param pinfo prolog player info representation as list
 * @constructor
 */
function PlayerInfo(pinfo_json) {
	this.score = 0;
	this.num_x_pieces = 0;
	this.parsePlayerInfo(pinfo_json);
};
PlayerInfo.prototype.PlayerInfo=PlayerInfo;

PlayerInfo.score_index = 0;
PlayerInfo.num_xpieces_index = 1;

PlayerInfo.prototype.parsePlayerInfo = function(pinfo_json) {
	this.setScore(pinfo_json[PlayerInfo.score_index]);
	this.setNumXPieces(pinfo_json[PlayerInfo.num_xpieces_index]);
}

PlayerInfo.prototype.setScore = function(score) {
	this.score = score;
}

PlayerInfo.prototype.getScore = function() {
	return this.score;
}

PlayerInfo.prototype.setNumXPieces = function(num_xpieces) {
	this.num_x_pieces = num_xpieces;
}

PlayerInfo.prototype.getNumXPieces = function() {
	return this.num_x_pieces;
}

PlayerInfo.prototype.toArray = function() {
	var arr = [];
	arr.push(this.getScore());
	arr.push(this.getNumXPieces());
	return arr;
}