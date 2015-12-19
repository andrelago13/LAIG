//From https://github.com/EvanHahn/ScriptInclude
include=function(){function f(){var a=this.readyState;(!a||/ded|te/.test(a))&&(c--,!c&&e&&d())}var a=arguments,b=document,c=a.length,d=a[c-1],e=d.call;e&&c--;for(var g,h=0;c>h;h++)g=b.createElement("script"),g.src=arguments[h],g.async=!0,g.onload=g.onerror=g.onreadystatechange=f,(b.head||b.getElementsByTagName("head")[0]).appendChild(g)};
serialInclude=function(a){var b=console,c=serialInclude.l;if(a.length>0)c.splice(0,0,a);else b.log("Done!");if(c.length>0){if(c[0].length>1){var d=c[0].splice(0,1);b.log("Loading "+d+"...");include(d,function(){serialInclude([]);});}else{var e=c[0][0];c.splice(0,1);e.call();};}else b.log("Finished.");};serialInclude.l=new Array();

function getUrlVars() {
	var vars = {};
	var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,    
			function(m,key,value) {
		vars[decodeURIComponent(key)] = decodeURIComponent(value);
	});
	return vars;
}	 

serialInclude(['../lib/CGF.js', 'XMLscene.js', 'MySceneGraph.js', 'SceneNode.js', 'TransformMatrix.js', 'SceneLeaf.js', 'Texture.js', 'Interface.js', 'Cubemap.js', 'Shadowmap.js', 
               'animation/Animation.js',
               'animation/LinearAnimation.js',
               'animation/CircularAnimation.js',
               'animation/AnimationSet.js',
               'primitives/Cylinder.js', 
               'primitives/Rectangle.js', 
               'primitives/Sphere.js', 
               'primitives/Triangle.js', 
               'primitives/Plane.js', 
               'primitives/Patch.js', 
               'primitives/Terrain.js', 
               'primitives/Teapot.js', 
               'primitives/ReversedSphere.js', 
               'primitives/Skybox.js', 
               'communication/Client.js', 
               'communication/Reply.js',  
               'tester.js', 
               'game/Cell.js', 
               'game/Board.js',
               'game/PlayerInfo.js',   
               'game/Game.js', 
               'game/Modx.js', 
               'game/State.js',
               'game/StateWaitingForPlay.js', 
               'game/StatePlacingXPiece.js', 
               'scenarios/Scenario.js', 
               'scenarios/MoonLandingScenario.js', 
               'scenarios/AfternoonSkyScenario.js', 

               main=function()
               {
	if(getUrlVars()['scene'] !== "#test") {
		// Standard application, scene and interface setup
		var app = new CGFapplication(document.body);
		var myScene = new XMLscene();
		var myInterface = new Interface();

		app.init();

		app.setScene(myScene);
		app.setInterface(myInterface);

		myInterface.setActiveCamera(myScene.camera);

		// get scene name provided in URL, e.g. http://localhost/myproj/?scene=cinema
		// or use "cinema" as default (assumes files in subfolder "scenes/<scenename>", check MySceneGraph constructor) 

		var filename=getUrlVars()['scene'] || "modx";

		// create and load graph, and associate it to scene. 
		// Check console for loading errors
		var myGraph = new MySceneGraph(filename, myScene, myInterface);

		// start
		app.run();
	} else {
		run_tests();
	}
               }

]);
