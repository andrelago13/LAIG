AfternoonSkyScenario.prototype = Object.create(Scenario.prototype);
AfternoonSkyScenario.prototype.constructor = AfternoonSkyScenario;

AfternoonSkyScenario.NAME = "Afternoon Sky";

function AfternoonSkyScenario(scene) {
	this.scene = scene;
	this.skybox = new Skybox(this.scene, ["scenes/modx/textures/afternoon_sky/cubemap/sky_left.jpg", 
		                              "scenes/modx/textures/afternoon_sky/cubemap/sky_right.jpg", 
		                              "scenes/modx/textures/afternoon_sky/cubemap/sky_up.jpg", 
		                              "scenes/modx/textures/afternoon_sky/cubemap/sky_down.jpg", 
		                              "scenes/modx/textures/afternoon_sky/cubemap/sky_front.jpg", 
		                              "scenes/modx/textures/afternoon_sky/cubemap/sky_back.jpg"]);
}

AfternoonSkyScenario.prototype.display = function(t) {
	this.scene.pushMatrix();
	this.scene.rotate(t * 0.03, 0, 1, 0);
	this.skybox.display(0);
	this.scene.popMatrix();
	if(typeof this.scene.graph != "undefined" && this.scene.graph.ready && typeof this.scene.graph.graphNodes != "undefined" && typeof this.scene.graph.graphNodes["afternoon_sky_scenario"] != "undefined" ) {
		this.scene.graph.graphNodes["afternoon_sky_scenario"].display(t);
	}
}

AfternoonSkyScenario.prototype.getName = function() {
	return AfternoonSkyScenario.NAME;
}