/**
 * State
 * @constructor
 */
function State(modx) {
	this.init(modx);
};

State.prototype.init = function(modx) {
	this.modx = modx;
	this.scene = modx.scene;
}

State.prototype.display = function(t) {
	// Abstract
}

State.prototype.onClick = function(event) {
}