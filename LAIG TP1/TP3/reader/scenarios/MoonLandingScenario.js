MoonLandingScenario.prototype = Object.create(Scenario.prototype);
MoonLandingScenario.prototype.constructor = MoonLandingScenario;

MoonLandingScenario.NAME = "Moon Landing";

function MoonLandingScenario(scene) {
	this.scene = scene;
	this.skybox = new Skybox(this.scene, ["scenes/modx/textures/cubemap/moon_left.png", 
  	                              "scenes/modx/textures/cubemap/moon_right.png", 
	                              "scenes/modx/textures/cubemap/moon_up.png", 
	                              "scenes/modx/textures/cubemap/moon_down.png", 
	                              "scenes/modx/textures/cubemap/moon_front.png", 
	                              "scenes/modx/textures/cubemap/moon_back.png"]);
}

MoonLandingScenario.prototype.display = function(t) {
	this.skybox.display(0);
	if(typeof this.scene.graph != "undefined" && this.scene.graph.ready && typeof this.scene.graph.graphNodes != "undefined" && typeof this.scene.graph.graphNodes["moon_landing_scenario"] != "undefined" ) {
		this.scene.graph.graphNodes["moon_landing_scenario"].display(t);
	}
}

MoonLandingScenario.prototype.getName = function() {
	return MoonLandingScenario.NAME;
}