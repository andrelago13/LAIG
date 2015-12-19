var VELOCITY_LIMIT = 0.1;
var ANGLE_LIMIT = 0.1;

/**
 * MyRobot
 * @constructor
 */
 function MyRobot(scene, slices, stacks) {
 	CGFobject.call(this,scene);
 	
 	// Acceleration given when forward/backward keys are pressed
 	this.defaultAcceleration = 0.7;
 	// Rotation acceleration given when left/right keys are pressed
 	this.defaultRotation = 0.7;
 	
 	// Measures time for animation purposes
 	this.time = 0;
 	
 	// Indices of textures in the appearances lists
 	this.bodyApIndex = 0;			// Body side
 	this.bodyTopApIndex = 1;		// Body top and bottom
 	this.eyeApIndex = 2;			// Eyes side
 	this.eyeFrontApIndex = 3;		// Eyes front
 	this.wheelApIndex = 4;			// Wheel
 	this.wheelSideApIndex = 5;		// Wheel side
 	this.armsApIndex = 6;			// Arm side
 	this.armTopApIndex = 7;			// Arm top and bottom
 	this.antennaApIndex = 8;		// Antenna side
 	this.antennaTopApIndex = 9;		// Antenna top
 	this.headApIndex = 10;			// Head side
 	this.headBottomApIndex = 11;	// Head bottom
 	 	
 	// Movement and animation variables
 	this.defaultSpeed = 2;
 	this.defaultResistance = 4;
 	this.defaultAngleSpeed = 2;
 	this.defaultAngleResistance = 4;
 	this.defaultAngleAcceleration = 0.8;

 	this.armDefaultSpeed = 0.02;
 	this.armRotationSpeed = 0;
 	this.armRotationResitance = 1;
 	this.armRotationSlowingFactor = Math.PI/80;

 	// Robot movement and "status" variables
 	this.x = 0;
 	this.y = 0;
 	this.z = 0;
 	this.speed = 0;
 	this.angle = 0;
 	this.angleSpeed = 0;
 	this.resistance = 0;		// Air and ground resistance to robot linear movement
 	this.angleResistance = 0;	// Air and ground resistance to robot angular movement
 	
 	this.leftArmAngle = Math.PI/4;					// Angle of the upper part of the left arm (connected to shoulder)
 	this.leftArmAngleLower = this.leftArmAngle;		// Angle of the lower part of the left arm (connected to elbow)
 	this.rightArmAngle = Math.PI/4;					// Angle of the upper part of the right arm (connected to shoulder)
 	this.rightArmAngleLower = this.rightArmAngle;	// Angle of the lower part of the left arm (connected to elbow)
 	this.waveAngle = 0;								// Sideways angle for upper left arm for waiving "hello"
 	this.waveAngleLower = 0;						// Same as waveAngle but for lower left arm
 	this.leftWheelAngle = 0;						// Left wheel angle to vertical, for rotation
 	this.rightWheelAngle = 0;						// Right wheel angle to vertical, for rotation
 	this.antennaLeanAngle = 0.5;
	
 	this.initBuffers();
 	
 	this.objectSlices = 300;	// Slices for cylinders, circles and other round objects
 	this.objectStacks = 20;		// Vertical stacks for round objects
 	
 	this.sizeScale = 1;			// Defines the general size of the robot. All parts are scaled in proportion of this variable
 	
 	this.updateVars(this.sizeScale);
 	 
 	// Essential parts for robot's body
 	this.circle = new Cylinder(this.scene, 0, 1, 0, 2, this.objectSlices, false);
 	this.cylinder = new Cylinder(this.scene, 1, 1, 1, this.objectStacks, this.objectSlices, false);
 	this.hsphere = new MyHalfSphere(this.scene, this.objectSlices, this.objectStacks);
 	this.wheel = new MyRobotWheel(this.scene, this.objectSlices, this.objectStacks);
 		
 	// Indices for lollipop appearance
 	this.lollipopTubeIndex = 0;
 	this.lollipopIndex = 1;
 	this.lollipopSideIndex = 2;
 	
 	// State of the "hello" animation
 	this.waveState = 0;	// 0 - normal arm movement
 						// 1 - Interpolate arms to correct position
 						// 2 - Wave arm
 						// 3 - Interpolate arms to "normal" position
 	
 	// Auxiliar variables for arm animations
 	this.rightArmStart;
 	this.leftArmStart;
 	this.animTimeStart;
 };

 MyRobot.prototype = Object.create(CGFobject.prototype);
 MyRobot.prototype.constructor = MyRobot;
 
MyRobot.prototype.wave = function() {
	// If inactive, starts waiving animation
	if(this.waveState == 0)
	{
		this.waveState = 1;
		this.rightArmStart = this.rightArmAngle;
		this.leftArmStart = this.leftArmAngle;
		this.animTimeStart = this.time;
	}
};

 MyRobot.prototype.initBuffers = function() {
	 
	 // Not used since robot was made from different pieces
	 
	 this.vertices = [];
	 this.indices = [];
 
 	/*this.vertices = [0.5, 0.3, 0,
 	                 -0.5, 0.3, 0,
 	                 0, 0.3, 2
 	                 ];

 	this.indices = [0, 1, 2];
 	
 	//this.normals = [];*/

 	this.primitiveType = this.scene.gl.TRIANGLES;
 	this.initGLBuffers();
 };

 MyRobot.prototype.move = function(delta) {
	// Gives the robot some speed (positive or negative), but does not
	// change position, since that is done in the update function
	 
	this.armRotationSpeed = this.armDefaultSpeed;
 	this.x += delta*Math.sin(this.angle);
 	this.z += delta*Math.cos(this.angle);
 };

MyRobot.prototype.rotate = function(alfa) {
	// Changes the robot's rotation speed but not the angle, that's update task
	
	this.armRotationSpeed = this.armDefaultSpeed;
 	this.angleSpeed += alfa;
 };

MyRobot.prototype.accelerate = function(acceleration) {
	// Gives the robot some acceleration (positive or negative), but does not
	// change position, since that is done in the update function
 	this.speed += acceleration;
 };

MyRobot.prototype.update = function(delta_t) {

	// Increases time since "creation" of robot
	this.time += delta_t;
	
	// Updates robot's angle
	this.angle += this.angleSpeed * delta_t/1000;
	
	// Updates wheels angle according to rotation speed
	angleShift = this.angleSpeed*(delta_t/1000)*this.bodyDiameterScale/this.wheelDiameterScale;
 	this.rightWheelAngle += angleShift;
 	this.leftWheelAngle -= angleShift;
	
 	// Updates angular speed considering angle resistance
	this.angleSpeed -= this.angleSpeed * delta_t/1000 * this.angleResistance;

	if(Math.abs(this.angleSpeed) <= ANGLE_LIMIT)
		this.angleSpeed = 0;

	// Updates robot's position
	this.x += this.speed * delta_t/1000 * Math.sin(this.angle) * this.sizeScale;
	this.z += this.speed * delta_t/1000 * Math.cos(this.angle) * this.sizeScale;
	
	// Updates linear speed considering resistance
	this.speed -= this.speed * delta_t/1000 * this.resistance;
 	this.detectCollisions();

	// Updates robot wheel angle considering linear speed. After this, wheel angles match the movement completely
	angleShift = this.speed*(delta_t/1000)*this.sizeScale/this.wheelDiameterScale;
	this.rightWheelAngle += angleShift;
 	this.leftWheelAngle += angleShift;
	
	this.armAnimation();

	if(Math.abs(this.speed) <= VELOCITY_LIMIT)
		this.speed = 0;
 };
 
MyRobot.prototype.detectCollisions = function() {
	// Simplified collision detection
	if(this.x < this.bodyDiameterScale)
		this.x = this.bodyDiameterScale;
	if(this.x > 15 - this.bodyDiameterScale)
		this.x = 15 - this.bodyDiameterScale;
	if(this.z < this.bodyDiameterScale)
		this.z = this.bodyDiameterScale;
	if(this.z > 10.47-this.bodyDiameterScale)
		this.z = 10.47-this.bodyDiameterScale;
};
 
MyRobot.prototype.armAnimation = function() {
	// Arm animation control
 	switch(this.waveState)
 	{
 	case 0:		// Normal arms swinging state
 		this.waveAngle = 0;
 		angle = 0.11 * this.speed * Math.sin(0.005 * this.time);
 	 	this.rightArmAngle = angle;
 	 	this.rightArmAngleLower = this.rightArmAngle;
 	 	if(this.rightArmAngle > 0)
 	 		this.rightArmAngleLower += 0.7*this.rightArmAngle;
 	 	else
 	 		this.rightArmAngleLower -= 0.1*this.rightArmAngle;
 	 	
 	 	this.leftArmAngle = -angle;
 	 	this.leftArmAngleLower = this.leftArmAngle;
 	 	if(this.leftArmAngle > 0)
 	 		this.leftArmAngleLower += 0.7*this.leftArmAngle;
 	 	else
 	 		this.leftArmAngleLower -= 0.1*this.leftArmAngle;
 	 	
 	 	break;
 	case 1:		// Left arm moves to "down" position, right arm places itself in "waiving" position
 		timeDiff = this.time - this.animTimeStart;
 		this.waveAngle = this.lerp(0, 0.9, timeDiff/1000);
 		this.waveAngleLower = this.lerp(0, 3*Math.PI/4, timeDiff/1000);
 		this.rightArmAngle = this.lerp(this.rightArmStart, 0, timeDiff/1000);
 		this.leftArmAngle = this.lerp(this.leftArmStart, 0, timeDiff/1000);
 		
 		this.leftArmAngleLower = this.leftArmAngle;
 	 	if(this.leftArmAngle > 0)
 	 		this.leftArmAngleLower += 0.7*this.leftArmAngle;
 	 	else
 	 		this.leftArmAngleLower -= 0.1*this.leftArmAngle;
 	 	
 	 	this.rightArmAngleLower = this.rightArmAngle;
 	 	if(this.rightArmAngle > 0)
 	 		this.rightArmAngleLower += 0.7*this.rightArmAngle;
 	 	else
 	 		this.rightArmAngleLower -= 0.1*this.rightArmAngle;
 		
 		if(timeDiff > 1000)
 		{
 			this.animTimeStart = this.time;
 			this.waveState = 2;
 		}
 		break;
 	case 2:		// Right arm waves three times
 		timeDiff = this.time - this.animTimeStart;
 		this.waveAngle = 0.9;
 		this.waveAngleLower = 3*Math.PI/4 + (Math.PI/6)*((Math.sin(this.lerp(0, 3, timeDiff/3000)*2*Math.PI + 3*Math.PI/2) + 1)/2);
 		
 		if(timeDiff > 3000)
 		{
 			this.waveState = 3;
 			this.rightArmStart = this.rightArmAngle;
 			this.leftArmStart = this.leftArmAngle;
 			this.animTimeStart = this.time;
 		}
 		break;
 	case 3:		// Both arms move to the position they should be at given the current speed
 		angle = 0.11 * this.speed * Math.sin(0.005 * this.time);
 		timeDiff = this.time - this.animTimeStart;
 		this.rightArmAngle = this.lerp(this.rightArmStart, angle, timeDiff/1000);
 		this.leftArmAngle = this.lerp(this.leftArmStart, -angle, timeDiff/1000);
 		this.waveAngle = this.lerp(0.9, 0, timeDiff/1000);
 		this.waveAngleLower = this.lerp(3*Math.PI/4, 0, timeDiff/1000);
 		
 		this.leftArmAngleLower = this.leftArmAngle;
 	 	if(this.leftArmAngle > 0)
 	 		this.leftArmAngleLower += 0.7*this.leftArmAngle;
 	 	else
 	 		this.leftArmAngleLower -= 0.1*this.leftArmAngle;
 	 	
 	 	this.rightArmAngleLower = this.rightArmAngle;
 	 	if(this.rightArmAngle > 0)
 	 		this.rightArmAngleLower += 0.7*this.rightArmAngle;
 	 	else
 	 		this.rightArmAngleLower -= 0.1*this.rightArmAngle;
 		
 		if(timeDiff > 1000)
 		{
 			this.animTimeStart = this.time;
 			this.waveState = 0;
 	 		this.waveAngle = 0;
 	 		this.waveAngleLower = 0;
 		}
 		break;
 	}
};
  
MyRobot.prototype.displayBody = function(sideTex, topTex) {
	
	this.scene.pushMatrix();
		this.scene.translate(0, this.wheelDiameterScale, 0);
		this.scene.rotate(-Math.PI/2, 1, 0, 0);
		this.scene.scale(this.bodyDiameterScale, this.bodyDiameterScale, this.bodyHeightScale);
		if (typeof sideTex != "undefined") {
			sideTex.apply();
		}
		this.cylinder.display();	// Body
		this.scene.pushMatrix();	// Top
 			this.scene.translate(0, 0, 1);
 			if (typeof topTex != "undefined") {
 				topTex.apply();
 			}
 			this.circle.display();
 		this.scene.popMatrix();
 		this.scene.pushMatrix();	// Bottom
 			this.scene.rotate(Math.PI, 1, 0, 0);
 			if (typeof topTex != "undefined") {
 				topTex.apply();
 			}
			this.circle.display();
		this.scene.popMatrix();
	this.scene.popMatrix();
 };
 
MyRobot.prototype.displayMoveBody = function(sideTex, topTex) {
	this.scene.pushMatrix();
		this.scene.translate(this.x, this.y, this.z);
		this.scene.rotate(this.angle, 0, 1, 0);
		this.displayBody(sideTex, topTex);
	this.scene.popMatrix();
}
 
MyRobot.prototype.displayHead = function(sideTex, bottomTex, antennaSideTex, antennaTopTex) {
	
	this.scene.pushMatrix();
	 	this.scene.translate(0, this.bodyHeightScale+this.headToBodySpacing+this.wheelDiameterScale, 0);
	 	this.scene.rotate(-Math.PI/2, 1, 0, 0);
	 	
	 	this.scene.pushMatrix();	// Head itself
	 		this.scene.scale(this.bodyDiameterScale, this.bodyDiameterScale, this.bodyDiameterScale);
	 		if (typeof sideTex != "undefined") {
	 			sideTex.apply();
	 		}
	 		this.hsphere.display();
	 		this.scene.rotate(Math.PI, 1, 0, 0);
	 		if (typeof bottomTex != "undefined") {
	 			bottomTex.apply();
	 		}
	 		this.circle.display();
	 	this.scene.popMatrix();
	 	
	 	this.scene.pushMatrix();	// Left Antenna
	 		this.scene.rotate(this.antennaLeanAngle, 0, 1, 0);
			this.scene.translate(0, 0, this.antennaHeightAdjustment);
			this.scene.pushMatrix();
	 			this.scene.scale(this.antennaDiameterScale, this.antennaDiameterScale, this.antennaHeightScale);
	 			if (typeof antennaSideTex != "undefined") {
	 				antennaSideTex.apply();
	 			}
	 			this.cylinder.display();		// Antenna side
	 		this.scene.popMatrix();
	 		this.scene.pushMatrix();
	 			this.scene.translate(0, 0, this.antennaHeightScale);
	 			this.scene.rotate(Math.PI/2, 0, 0, 1);
	 			this.scene.scale(this.antennaDiameterScale, this.antennaDiameterScale, this.antennaDiameterScale);
	 			if (typeof antennaTopTex != "undefined") {
	 				antennaTopTex.apply();
	 			}
	 			this.hsphere.display();			// Antenna top
	 		this.scene.popMatrix();
	 	this.scene.popMatrix();
	 	
	 	this.scene.pushMatrix();	// Right Antenna
			this.scene.rotate(-this.antennaLeanAngle, 0, 1, 0);
			this.scene.translate(0, 0, this.antennaHeightAdjustment);
			this.scene.pushMatrix();
				this.scene.scale(this.antennaDiameterScale, this.antennaDiameterScale, this.antennaHeightScale);
				if (typeof antennaSideTex != "undefined") {
					antennaSideTex.apply();
				}
				this.cylinder.display();	// Antenna side
			this.scene.popMatrix();
			this.scene.pushMatrix();
				this.scene.translate(0, 0, this.antennaHeightScale);
				this.scene.rotate(Math.PI/2, 0, 0, 1);
				this.scene.scale(this.antennaDiameterScale, this.antennaDiameterScale, this.antennaDiameterScale);
				if (typeof antennaTopTex != "undefined") {
		 			antennaTopTex.apply();
		 		}
		 		this.hsphere.display();		// Antenna top
			this.scene.popMatrix();
		this.scene.popMatrix();
	 this.scene.popMatrix();
 };

MyRobot.prototype.displayMoveHead = function() {
	this.scene.pushMatrix();
		this.scene.translate(this.x, this.y, this.z);
		this.scene.rotate(this.angle, 0, 1, 0);
		this.displayHead(sideTex, bottomTex, antennaSideTex, antennaTopTex);
	this.scene.popMatrix();
}
 
MyRobot.prototype.displayArms = function(sideTex, topTex) {

	 // Left arm upper
	 this.scene.pushMatrix();
	 	this.scene.translate(this.armToBodySpacing, this.wheelDiameterScale + this.bodyHeightScale, 0);
	 	this.scene.rotate(Math.PI - this.leftArmAngle, 1, 0, 0);
	 	
	 	this.scene.rotate(-Math.PI/2, 1, 0, 0);
	 	this.scene.scale(this.armDiameterScale, this.armDiameterScale, this.armHeightScale);
 		if (typeof sideTex != "undefined") {
 			sideTex.apply();
 		}
	 	this.cylinder.display();
	 	this.scene.pushMatrix();
			this.scene.rotate(Math.PI, 1, 0, 0);
			this.scene.scale(1, 1, this.armDiameterScale/this.armHeightScale);
	 		if (typeof topTex != "undefined") {
	 			topTex.apply();
	 		}
			this.hsphere.display();
		this.scene.popMatrix();
		this.scene.pushMatrix();
			this.scene.translate(0, 0, 1);
			this.scene.scale(1, 1, this.armDiameterScale/this.armHeightScale);
	 		if (typeof topTex != "undefined") {
	 			topTex.apply();
	 		}
			this.hsphere.display();
		this.scene.popMatrix();
	 this.scene.popMatrix();
	 
	// Left arm lower
	 this.scene.pushMatrix();
	 	this.scene.translate(this.armToBodySpacing
	 			, this.wheelDiameterScale + this.bodyHeightScale + this.armHeightScale*(-Math.cos(this.leftArmAngle))
	 			, this.armHeightScale*Math.sin(this.leftArmAngle));
	 	this.scene.rotate(Math.PI-this.leftArmAngleLower, 1, 0, 0);
	 	
	 	this.scene.rotate(-Math.PI/2, 1, 0, 0);
	 	this.scene.scale(this.armDiameterScale, this.armDiameterScale, this.armHeightScale);
 		if (typeof sideTex != "undefined") {
 			sideTex.apply();
 		}
	 	this.cylinder.display();
	 	this.scene.pushMatrix();
			this.scene.rotate(Math.PI, 1, 0, 0);
			this.scene.scale(1, 1, this.armDiameterScale/this.armHeightScale);
	 		if (typeof topTex != "undefined") {
	 			topTex.apply();
	 		}
			this.hsphere.display();
		this.scene.popMatrix();
		this.scene.pushMatrix();
			this.scene.translate(0, 0, 1);
			this.scene.scale(1, 1, this.armDiameterScale/this.armHeightScale);
	 		if (typeof topTex != "undefined") {
	 			topTex.apply();
	 		}
			this.hsphere.display();
		this.scene.popMatrix();
	 this.scene.popMatrix();
	 
	 // Right arm upper
	 this.scene.pushMatrix();
	 	this.scene.translate(-this.armToBodySpacing, this.wheelDiameterScale + this.bodyHeightScale, 0);
	 	this.scene.rotate(-this.rightArmAngle+Math.PI, 1, 0, 0);
	 	this.scene.rotate(this.waveAngle, 0, 0, 1);
	 	
	 	this.scene.rotate(-Math.PI/2, 1, 0, 0);
	 	this.scene.scale(this.armDiameterScale, this.armDiameterScale, this.armHeightScale);
 		if (typeof sideTex != "undefined") {
 			sideTex.apply();
 		}
	 	this.cylinder.display();
	 	this.scene.pushMatrix();
	 		this.scene.rotate(Math.PI, 1, 0, 0);
	 		this.scene.scale(1, 1, this.armDiameterScale/this.armHeightScale);
	 		if (typeof topTex != "undefined") {
	 			topTex.apply();
	 		}
	 		this.hsphere.display();
	 	this.scene.popMatrix();
	 	this.scene.pushMatrix();
	 		this.scene.translate(0, 0, 1);
	 		this.scene.scale(1, 1, this.armDiameterScale/this.armHeightScale);
	 		if (typeof topTex != "undefined") {
	 			topTex.apply();
	 		}
	 		this.hsphere.display();
	 	this.scene.popMatrix();
	 this.scene.popMatrix();
	 
	// Right arm lower
	 this.scene.pushMatrix();
	 	this.scene.translate(-this.armToBodySpacing - this.armHeightScale*Math.sin(this.waveAngle)
	 			, this.wheelDiameterScale + this.bodyHeightScale + this.armHeightScale*(-Math.cos(this.rightArmAngle) + 1 - Math.cos(this.waveAngle))
	 			, this.armHeightScale*Math.sin(this.rightArmAngle));
	 	this.scene.rotate(Math.PI - this.rightArmAngleLower, 1, 0, 0);
	 	this.scene.rotate(this.waveAngleLower, 0, 0, 1);
	 	
	 	this.scene.rotate(-Math.PI/2, 1, 0, 0);
	 	this.scene.scale(this.armDiameterScale, this.armDiameterScale, this.armHeightScale);
 		if (typeof sideTex != "undefined") {
 			sideTex.apply();
 		}
	 	this.cylinder.display();
	 	this.scene.pushMatrix();
	 		this.scene.rotate(Math.PI, 1, 0, 0);
	 		this.scene.scale(1, 1, this.armDiameterScale/this.armHeightScale);
	 		if (typeof topTex != "undefined") {
	 			topTex.apply();
	 		}
	 		this.hsphere.display();
	 	this.scene.popMatrix();
	 	this.scene.pushMatrix();
	 		this.scene.translate(0, 0, 1);
	 		this.scene.scale(1, 1, this.armDiameterScale/this.armHeightScale);
	 		if (typeof topTex != "undefined") {
	 			topTex.apply();
	 		}
	 		this.hsphere.display();
	 	this.scene.popMatrix();
	 this.scene.popMatrix();
 };
 
MyRobot.prototype.displayMoveArms = function(sideTex, topTex) {
	this.scene.pushMatrix();
		this.scene.translate(this.x, this.y, this.z);
		this.displayArms(sideTex, topTex);
	this.scene.popMatrix();
}
 
MyRobot.prototype.displayEyes = function(sideTex, frontTex) {

	 this.scene.pushMatrix();
	 this.scene.pushMatrix();	// Left eye
	 	this.scene.translate(this.eyeToEyeDistance, this.bodyHeightScale+this.headToBodySpacing+this.eyeHeightScale+this.wheelDiameterScale, 0);
	 	this.scene.scale(this.eyeDiameterScale, this.eyeDiameterScale, this.eyeDepthScale);
 		if (typeof sideTex != "undefined") {
 			sideTex.apply();
 		}
	 	this.cylinder.display();
	 	this.scene.translate(0, 0, 1);
 		if (typeof frontTex != "undefined") {
 			frontTex.apply();
 		}
	 	this.circle.display();
	 this.scene.popMatrix();
	 this.scene.pushMatrix();	// Right eye
	 	this.scene.translate(-this.eyeToEyeDistance, this.bodyHeightScale+this.headToBodySpacing+this.eyeHeightScale+this.wheelDiameterScale, 0);
	 	this.scene.scale(this.eyeDiameterScale, this.eyeDiameterScale, this.eyeDepthScale);
 		if (typeof sideTex != "undefined") {
 			sideTex.apply();
 		}
	 	this.cylinder.display();
	 	this.scene.translate(0, 0, 1);
 		if (typeof frontTex != "undefined") {
 			frontTex.apply();
 		}
	 	this.circle.display();
	 this.scene.popMatrix();
	 this.scene.popMatrix();
 };
 
MyRobot.prototype.displayMoveEyes = function(sideTex, frontTex) {
	this.scene.pushMatrix();
		this.scene.translate(this.x, this.y, this.z);
		this.scene.rotate(this.angle, 0, 1, 0);
		this.displayEyes(sideTex, frontTex);
	this.scene.popMatrix();
}
 
MyRobot.prototype.displayWheels = function(frontTex, sideTex) {
	this.scene.pushMatrix();	// Left wheel
		this.scene.translate(this.bodyDiameterScale, this.wheelDiameterScale, 0);
		this.scene.rotate(this.leftWheelAngle, 1, 0, 0);
		this.scene.rotate(Math.PI/2, 0, 1, 0);
		this.scene.scale(this.wheelDiameterScale, this.wheelDiameterScale, this.wheelDepthScale);
 		if (typeof frontTex != "undefined") {
 			frontTex.apply();
 		}
		this.wheel.display();
	this.scene.popMatrix();
	
	this.scene.pushMatrix();	// Right wheel
		this.scene.translate(-this.bodyDiameterScale, this.wheelDiameterScale, 0);
		this.scene.rotate(this.rightWheelAngle, 1, 0, 0);
		this.scene.rotate(3*Math.PI/2, 0, 1, 0);
		this.scene.scale(this.wheelDiameterScale, this.wheelDiameterScale, this.wheelDepthScale);
 		if (typeof frontTex != "undefined") {
 			frontTex.apply();
 		}
		this.wheel.display();
	this.scene.popMatrix();
 };
 
MyRobot.prototype.displayMoveWheels = function() {
	this.scene.pushMatrix();
		this.scene.translate(this.x, this.y, this.z);
		this.scene.rotate(this.angle, 0, 1, 0);
		this.displayWheels();
	this.scene.popMatrix();
};
 
MyRobot.prototype.display = function() {

	this.scene.pushMatrix();
	this.scene.translate(this.x, this.y, this.z);
	 	 
	 // Main robot body
	 this.displayBody();
	 
	 // Robot head
	 this.displayHead();
	 
	 // Robot arms
	 this.displayArms();
	 
	 // Robot eyes
	 this.displayEyes();
	 
	 // Robot wheels
	 this.displayWheels();

	this.scene.popMatrix();
	 
	 this.drawElements(this.primitiveType);
 }

MyRobot.prototype.displayLollipop = function(lollipopAppearanceSet) {
	lollipopTubeHeightScale = 1.5;
	lollipopDiameterScale = 0.5;
	lollipopHeightScale = 0.03;
	
	this.scene.pushMatrix();
	this.scene.translate(this.x, this.y, this.z);
	this.scene.translate(this.armToBodySpacing*Math.cos(-this.angle), this.wheelDiameterScale + this.bodyHeightScale-2*this.armHeightScale, this.armToBodySpacing*Math.sin(-this.angle));
	this.scene.rotate(this.angle+Math.PI, 0, 1, 0);
	this.scene.translate(0, this.armHeightScale*(1-Math.cos(this.leftArmAngle)) + this.armHeightScale*(1-Math.cos(this.leftArmAngleLower)), -this.armHeightScale*Math.sin(this.leftArmAngle)-this.armHeightScale*Math.sin(this.leftArmAngleLower));
	this.scene.rotate(this.leftArmAngle, 1, 0, 0);
	this.scene.rotate(Math.PI/4, 0, 0, 1);
	
	// Tube
	this.scene.pushMatrix();
		this.scene.rotate(-Math.PI/2, 1, 0, 0);
		this.scene.scale(lollipopHeightScale*this.bodyDiameterScale, lollipopHeightScale*this.bodyDiameterScale, lollipopTubeHeightScale*this.bodyDiameterScale);
		lollipopAppearanceSet[this.lollipopTubeIndex].apply();
		this.cylinder.display();
		this.scene.rotate(Math.PI, 1, 0, 0);
		this.circle.display();
	this.scene.popMatrix();
	
	// Lollipop
	this.scene.pushMatrix();
		this.scene.translate(0, lollipopTubeHeightScale*this.bodyDiameterScale, 0);
		this.scene.scale(lollipopDiameterScale*this.bodyDiameterScale, lollipopDiameterScale*this.bodyDiameterScale, 2*lollipopHeightScale*this.bodyDiameterScale);
		this.scene.translate(0, 0, -0.5);
		lollipopAppearanceSet[this.lollipopSideIndex].apply();
		this.cylinder.display();
		this.scene.pushMatrix();
			this.scene.rotate(Math.PI, 1, 0, 0);
			lollipopAppearanceSet[this.lollipopIndex].apply();
			this.circle.display();
		this.scene.popMatrix();
		this.scene.pushMatrix();
			this.scene.translate(0, 0, 1);
			lollipopAppearanceSet[this.lollipopIndex].apply();
			this.circle.display();
		this.scene.popMatrix();
	this.scene.popMatrix();
	
	this.scene.popMatrix();
}

MyRobot.prototype.updateVars = function(scale) {
	this.sizeScale = scale;
	 
 	this.bodyDiameterScale = this.sizeScale*0.8;
 	this.bodyHeightScale = 2*this.bodyDiameterScale/0.8;
 	
 	this.headToBodySpacing = this.bodyDiameterScale/8;
 	
 	this.armDiameterScale = this.bodyDiameterScale/5;
 	this.armHeightScale = this.bodyDiameterScale*(9/12);
 	this.armToBodySpacing = this.armDiameterScale + 1.1*this.bodyDiameterScale;
 	
 	this.antennaDiameterScale = this.bodyDiameterScale/20;
 	this.antennaHeightScale = this.bodyDiameterScale*1.4;
 	this.antennaHeightAdjustment = Math.cos(this.antennaLeanAngle)*this.antennaDiameterScale;
 	
 	this.eyeDiameterScale = 0.1*this.bodyDiameterScale;
 	this.eyeDepthScale = 0.84*this.bodyDiameterScale;
 	this.eyeHeightScale = (0.5)*this.bodyDiameterScale;
 	this.eyeToEyeDistance = (0.45)*this.bodyDiameterScale;
 	
 	this.wheelDiameterScale = 0.5*this.bodyDiameterScale;
 	this.wheelDepthScale = 0.2*this.bodyDiameterScale;
}

MyRobot.prototype.displayAppearance = function(appearanceSet, scale) {

	if(scale != this.sizeScale)
		this.updateVars(scale);
	
	this.scene.pushMatrix();
	this.scene.translate(this.x, this.y, this.z);	
	this.scene.rotate(this.angle, 0, 1, 0);
	
	if (typeof appearanceSet != "undefined") // texture set defined
	{
		// Main robot body
		this.displayBody(appearanceSet[this.bodyApIndex], appearanceSet[this.bodyTopApIndex]);
		 
		// Robot head
		this.displayHead(appearanceSet[this.headApIndex], appearanceSet[this.headBottomApIndex], appearanceSet[this.antennaApIndex], appearanceSet[this.antennaTopApIndex]);
		
		// Robot arms
		this.displayArms(appearanceSet[this.armsApIndex], appearanceSet[this.armTopApIndex]);
		 
		// Robot eyes
		this.displayEyes(appearanceSet[this.eyeApIndex], appearanceSet[this.eyeFrontApIndex]);
		 
		// Robot wheels
		this.displayWheels(appearanceSet[this.wheelApIndex], appearanceSet[this.wheelSideApIndex]);
	}
	else
	{
		// Main robot body
		this.displayBody();
		 
		// Robot head
		this.displayHead();
		
		// Robot arms
		this.displayArms();
		 
		// Robot eyes
		this.displayEyes();
		 
		// Robot wheels
		this.displayWheels();
	}
	

	 this.scene.popMatrix();
	 
	 this.drawElements(this.primitiveType);
}

MyRobot.prototype.lerp = function(oldX, newX, alpha) {
	// return oldX + alpha * (newX - oldX); Imprecise method which does not guarantee x = newX when alpha = 1
	return (1 - alpha) * oldX + alpha * newX;
}
