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
	this.x_pieces = 0;
	this.parsePlayerInfo(pinfo_json);
};
PlayerInfo.prototype.PlayerInfo=PlayerInfo;

PlayerInfo.score_index = 0;
PlayerInfo.xpieces_index = 1;

PlayerInfo.prototype.parsePlayerInfo = function(pinfo_json) {
	this.setScore(pinfo_json[PlayerInfo.score_index]);
	this.setXPieces(pinfo_json[PlayerInfo.xpieces_index]);
}

PlayerInfo.prototype.setScore = function(score) {
	this.score = score;
}

PlayerInfo.prototype.getScore = function() {
	return this.score;
}

PlayerInfo.prototype.setXPieces = function(xpieces) {
	this.x_pieces = xpieces;
}

PlayerInfo.prototype.getXPieces = function() {
	return this.x_pieces;
}