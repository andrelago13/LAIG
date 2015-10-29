/**
 * Interface
 * @constructor
 */


function Interface() {
	//call CGFinterface constructor 
	CGFinterface.call(this);
};

Interface.prototype = Object.create(CGFinterface.prototype);
Interface.prototype.constructor = Interface;

/**
 * init
 * @param {CGFapplication} application
 */
Interface.prototype.init = function(application) {
	CGFinterface.prototype.init.call(this, application);
	this.gui = new dat.GUI();
	this.lights = this.gui.addFolder("Lights");
	
	return true;
};

Interface.prototype.addLightToggler = function(i, id){
	this.lights.add(this.scene.lightStatus, i, this.scene.lightStatus[i]).name(id);
}