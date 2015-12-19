MoonLandingScenario.prototype = Object.create(Scenario.prototype);
MoonLandingScenario.prototype.constructor = MoonLandingScenario;

MoonLandingScenario.NAME = "Moon Landing";

function MoonLandingScenario(scene) {
	this.scene = scene;
	this.skybox = new Skybox(this.scene, ["scenes/modx/textures/moon_landing/cubemap/moon_left.png", 
  	                              "scenes/modx/textures/moon_landing/cubemap/moon_right.png", 
	                              "scenes/modx/textures/moon_landing/cubemap/moon_up.png", 
	                              "scenes/modx/textures/moon_landing/cubemap/moon_down.png", 
	                              "scenes/modx/textures/moon_landing/cubemap/moon_front.png", 
	                              "scenes/modx/textures/moon_landing/cubemap/moon_back.png"]);
	this.robot = new MyRobot(this.scene, 20, 20);
}

MoonLandingScenario.prototype.display = function(t) {
	this.skybox.display(0);
	if(typeof this.scene.graph != "undefined" && this.scene.graph.ready && typeof this.scene.graph.graphNodes != "undefined" && typeof this.scene.graph.graphNodes["moon_landing_scenario"] != "undefined" ) {
		this.scene.graph.graphNodes["moon_landing_scenario"].display(t);
	}
	this.scene.pushMatrix();
	this.scene.translate(-0.5, 0, -0.5);
	this.scene.rotate(Math.PI/4, 0, 1, 0);
	this.robot.updateVars(0.4);
	this.robot.display();
	this.scene.popMatrix();
}

MoonLandingScenario.prototype.getName = function() {
	return MoonLandingScenario.NAME;
}