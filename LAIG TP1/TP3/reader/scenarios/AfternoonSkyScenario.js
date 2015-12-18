AfternoonSkyScenario.prototype = Object.create(Scenario.prototype);
AfternoonSkyScenario.prototype.constructor = AfternoonSkyScenario;

AfternoonSkyScenario.NAME = "Afternoon Sky";

function AfternoonSkyScenario(scene) {
	this.scene = scene;
	this.skybox = new Skybox(this.scene, ["scenes/modx/textures/cubemap/sky_left.jpg", 
		                              "scenes/modx/textures/cubemap/sky_right.jpg", 
		                              "scenes/modx/textures/cubemap/sky_up.jpg", 
		                              "scenes/modx/textures/cubemap/sky_down.jpg", 
		                              "scenes/modx/textures/cubemap/sky_front.jpg", 
		                              "scenes/modx/textures/cubemap/sky_back.jpg"]);
}

AfternoonSkyScenario.prototype.display = function(t) {
	this.skybox.display(0);
	if(typeof this.scene.graph != "undefined" && this.scene.graph.ready && typeof this.scene.graph.graphNodes != "undefined" && typeof this.scene.graph.graphNodes["afternoon_sky_scenario"] != "undefined" ) {
		this.scene.graph.graphNodes["afternoon_sky_scenario"].display(t);
	}
}

AfternoonSkyScenario.prototype.getName = function() {
	return AfternoonSkyScenario.NAME;
}