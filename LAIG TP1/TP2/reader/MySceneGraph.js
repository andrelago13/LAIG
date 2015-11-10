/**
 * Reads scene objects and properties from the specified 'filename', assigning them to the specified 'scene'
 * @constructor
 */
function MySceneGraph(scenename, scene, interface) {  
	this.interface = interface;
	this.scenename = scenename;
	this.initials = [];
	this.initials["transform"] = new mat4.create();
	this.initialTransform = mat4.create();
	this.illumination = [];
	this.lights = [];
	this.textures = [];
	this.materials = [];
	this.animations = [];
	this.leaves = [];
	this.nodes = [];
	this.rootNode = "";
	// Reads scene objects and properties from the specified 'filename', assigning them to the specified 'scene'
	this.graphNodes = [];
	this.graph = null;

	this.loadedOk = null;

	this.defaultAnimSpan = 1;
	this.defaultLinearAnimXX = 0;
	this.defaultLinearAnimYY = 0;
	this.defaultLinearAnimZZ = 0;

	this.defaultFrustumNear = 0.1;
	this.defaultFrustumFar = 500;
	this.defaulTransformValue = 0;
	this.defaultAxisReference = 3;
	this.defautlLightValue = 0;
	this.defaultLightEnabled = true;
	this.defaultAmplifFactor = 1;
	this.defaultMaterialShininess = 1;
	this.defaultMaterialRGBA = 1;
	this.defaultNodeMaterialID = "null";
	this.defaultNodeTextureID = "clear";

	// Establish bidirectional references between scene and graph
	this.scene = scene;
	scene.graph=this;

	this.defaultSceneMaterial = new CGFappearance(this.scene);
	this.defaultSceneMaterial.setAmbient(1, 1, 1, 1);
	this.defaultSceneMaterial.setDiffuse(1, 1, 1, 1);
	this.defaultSceneMaterial.setSpecular(1, 1, 1, 1);
	this.defaultSceneMaterial.setShininess(1);
	this.defaultSceneMaterial.setEmission(0, 0, 0, 1);

	// File reading 
	this.reader = new CGFXMLreader();

	/*
	 * Read the contents of the xml file, and refer to this class for loading and error handlers.
	 * After the file is read, the reader calls onXMLReady on this object.
	 * If any error occurs, the reader calls onXMLError on this object, with an error message
	 */
	//console.clear();
	console.group("%cParsing '" + this.scenename + ".lsx'", "font-size: 1.5em;");
	console.time("Total time taken to parse the LSX file");
	console.group("Reading the XML tree");
	console.time("Time taken to read the XML tree");
	console.log("Reading XML tree...");
	this.reader.open('scenes/'+scenename+'/'+scenename+'.lsx', this);
}

/**
 * Displays the graph
 */
MySceneGraph.prototype.display=function(t) 
{
	if(!this.ready)
		return;

	this.scene.pushMatrix();
	this.scene.multMatrix(this.initials["transform"]);
	if(typeof this.graphNodes[this.rootNode] !== 'undefined') {
		this.graphNodes[this.rootNode].display(t, undefined, this.defaultSceneMaterial);
	} else if (typeof this.leaves[this.rootNode] !== 'undefined') {
		this.leaves[this.rootNode].display(t, null);
	}
	this.scene.popMatrix();
}

/**
 * Callback to be executed after successful reading
 */
MySceneGraph.prototype.onXMLReady=function() 
{
	console.log("XML tree successfully read.");
	console.timeEnd("Time taken to read the XML tree");
	console.groupEnd();
	var rootElement = this.reader.xmlDoc.documentElement;

	// Here should go the calls for different functions to parse the various blocks
	var errors = [];
	console.group("Parsing the LSX blocks");
	console.time("Time taken to parse the LSX blocks");
	console.log("Parsing LSX blocks...");
	this.parse(errors, rootElement);
	this.loadedOk = true;
	for (var i = 0; i < errors.length; i++)
	{
		if (errors[i][0])
		{
			console.error("LSX parsing error: " + errors[i][1]);
			this.loadedOk = false;
		}
		else
			console.warn("LSX parsing warning: " + errors[i][1]);
	}
	if (this.loadedOk) console.log("LSX successfully parsed.");
	else console.info("Errors found while parsing the LSX, cannot continue.");

	console.timeEnd("Time taken to parse the LSX blocks");
	console.groupEnd();
	console.timeEnd("Total time taken to parse the LSX file");
	console.groupEnd();
	if (!this.loadedOk) return;

	// As the graph loaded ok, signal the scene so that any additional initialization depending on 
	// the graph can take place
	this.ready = true;
	this.scene.onGraphLoaded();
}

/**
 * Parses information on the file, displaying errors and warnings produced during parsing of specific elements
 * @param errors errors and warnings array
 * @param rootElement 'SCENE' node
 */
MySceneGraph.prototype.parse= function(errors, rootElement) {
	if (rootElement.nodeName != 'SCENE')
	{
		this.addError(errors, "The document root node should be 'SCENE'");
		return;
	}
	var blocks = ["INITIALS", "ILLUMINATION", "LIGHTS", "TEXTURES", "MATERIALS", "LEAVES", "NODES", "ANIMATIONS"];
	var blockPos = Array.apply(null, Array(blocks.length)).map(Number.prototype.valueOf, -1);
	var currPos = 0;
	var elements = rootElement.childNodes;
	for (var i = 0; i < elements.length; i++)
	{
		if (typeof elements[i].tagName == 'undefined')
			continue;
		var index = blocks.indexOf(elements[i].tagName);
		if (index == -1) this.addWarning(errors, "unknown block '" + elements[i].tagName + "'.");
		else if (blockPos[index] != -1) this.addWarning(errors, "block '" + elements[i].tagName + "' defined multiple times.");
		else blockPos[index] = currPos++;
	}

	for (var i = 0; i < blocks.length; i++)
	{
		if (blockPos[i] == -1)
		{
			this.addWarning(errors, "block '" + blocks[i] + "' not found.");
			continue;
		}
		if (blockPos[i] != i)
			this.addWarning(errors, "wrong block order for block '" + blocks[i] + "', it should be number " + (i + 1) + ".");

		var elems = [];
		elems = this.parseElement(errors, rootElement, blocks[i], 1, 1, true);
		if (elems == null) break;
		this.parseBlock(errors, rootElement, i);
	}
	if(this.validateNodes(errors, rootElement))
		this.graph = this.createGraph(this.rootNode);
}

/**
 * Parses an individual block from the file
 * @param errors errors and warnings array
 * @param blockID
 */
MySceneGraph.prototype.parseBlock= function(errors, element, blockID)
{
	switch (blockID)
	{
	case 0: return this.parseInitials(errors, element);
	case 1: return this.parseIllumination(errors, element);
	case 2: return this.parseLights(errors, element);
	case 3: return this.parseTextures(errors, element);
	case 4: return this.parseMaterials(errors, element);
	case 5: return this.parseLeaves(errors, element);
	case 6: return this.parseNodes(errors, element);
	case 7: return this.parseAnimations(errors, element);
	default: return;
	}
}

/**
 * Parses the "INITIALS" block
 * @param errors errors and warnings array
 * @param rootElement 'SCENE' node
 */
MySceneGraph.prototype.parseInitials= function(errors, rootElement) {
	var elems = [];
	elems = this.parseElement(errors, rootElement, 'INITIALS', 1, 1, true);
	if (elems == null) return;
	var initials = elems[0];

	// Parse frustum values
	elems = this.parseElement(errors, initials, 'frustum', 1, 1, true);
	if (elems != null)
	{
		var frustum = elems[0];
		this.initials["frustum"] = [];
		this.initials["frustum"]["near"] = this.parseAttributeWithDefault(errors, frustum, 'near', 'ff', this.defaultFrustumNear);
		this.initials["frustum"]["far"] = this.parseAttributeWithDefault(errors, frustum, 'far', 'ff', this.defaultFrustumFar);
	}

	// Validate initial transormation number and order
	var temp = initials.childNodes;
	var realElems = [];
	for(var i = 0; i < temp.length; i++) {
		if(temp[i].nodeName[0] != "#")
			realElems.push(temp[i]);
	}
	var transform_found = [];
	transform_found["translation"] = -1;
	transform_found["rotation"] = [-1, -1, -1];
	transform_found["scale"] = -1;
	for(var i = 0; i < realElems.length; i++) {
		switch(realElems[i].nodeName) {
		case "translation":
			if(transform_found["translation"] != -1) {
				this.addWarning("Duplicate initial translation found. Only considering the first one.");
			} else {
				transform_found["translation"] = i;
			}
			break;
		case "rotation":
			if(transform_found["rotation"][0] == -1) {
				transform_found["rotation"][0] = i;
			} else if(transform_found["rotation"][1] == -1) {
				transform_found["rotation"][1] = i;
			} else
				transform_found["rotation"][2] = i;
			break;
		case "scale":
			if(transform_found["scale"] != -1) {
				this.addWarning("Duplicate initial scale found. Only considering the first one.");
			} else {
				transform_found["scale"] = i;
			}
			break;
		}
	}
	// Checks if the transformation order was correct. Even if it isn't correct, assumes the correct order (translation, rotation1, rotation2, rotation3, scale).
	if(!(transform_found["translation"] === transform_found["rotation"][0] - 1 &&
			transform_found["rotation"][0] === transform_found["rotation"][1] - 1 &&
			transform_found["rotation"][1] === transform_found["rotation"][2] - 1 &&
			transform_found["rotation"][2] === transform_found["scale"] - 1)) {
		this.addWarning(errors, "Invalid initial transformation order found. Results may be different from expected. " +
		"Correct order must be translation, rotation1, rotation2, rotation3, scale, where rotations must use all 3 axis on any order.");
	}

	// Parse initial transformations
	var axisList = ["x", "y", "z"];
	elems = this.parseElement(errors, initials, 'translation', 1, 1, true);
	if(elems == null)
		return;

	// Initial translation
	var translate = elems[0];
	this.initials["translate"] = [];
	for (var i = 0; i < axisList.length; i++)
		this.initials["translate"][axisList[i]] = this.parseAttributeWithDefault(errors, translate, axisList[i], 'ff', this.defaulTransformValue);
	this.initials["transform"] = mat4.translate(this.initials["transform"], this.initials["transform"], [ this.initials["translate"]["x"], this.initials["translate"]["y"], this.initials["translate"]["z"] ]);

	// Initial rotations
	var axis_found = [];
	axis_found["x"] = false;
	axis_found["y"] = false;
	axis_found["z"] = false;
	elems = initials.childNodes;
	for(var i = 0; i < elems.length; i++) {
		if(elems[i].nodeName != "rotation")
			continue;

		var axis = this.parseRequiredAttribute(errors, elems[i], 'axis', 'cc');
		var angle = this.parseAttributeWithDefault(errors, elems[i], 'angle', 'ff', this.defaultTransformValue);

		if(axis == null || angle == null)
			continue;

		angle = angle*Math.PI/180;

		if(axis_found[axis]) {
			this.addWarning(errors, "Initial rotation on axis '" + axis + "' already found. Only the first will be considered.");
			continue;
		}
		axis_found[axis] = true;

		switch(axis) {
		case 'x':
			this.initials["transform"] = mat4.rotateX(this.initials["transform"], this.initials["transform"], angle);
			break;
		case 'y':
			this.initials["transform"] = mat4.rotateY(this.initials["transform"], this.initials["transform"], angle);
			break;
		case 'z':
			this.initials["transform"] = mat4.rotateZ(this.initials["transform"], this.initials["transform"], angle);
			break;
		}
	}

	for(var i in axis_found) {
		if(!axis_found[i]) {
			this.addWarning(errors, "Initial rotation on axis '" + i + "' not found. Assuming zero.");
		}
	}

	// Initial scale
	elems = this.parseElement(errors, initials, 'scale', 1, 1, true);
	if (elems != null)
	{
		var scale = elems[0];
		this.initials["scale"] = [];
		for (var i = 0; i < 3; i++)
		{
			this.initials["scale"]["s" + axisList[i]] = this.parseAttributeWithDefault(errors, scale, 's' + axisList[i], 'ff', this.defaultTransformValue);
		}
	}
	this.initials["transform"] = mat4.scale(this.initials["transform"], this.initials["transform"], [ this.initials["scale"]["sx"], this.initials["scale"]["sy"], this.initials["scale"]["sz"] ]);

	// Parses axis reference
	elems = this.parseElement(errors, initials, 'reference', 1, 1, true);
	if (elems != null)
	{
		var reference = elems[0];
		this.initials["reference"] = this.parseAttributeWithDefault(errors, reference, 'length', 'ff', this.defaultAxisReference);
	}
}

/**
 * Parses the "ILLUMINATION" block
 * @param errors errors and warnings array
 * @param rootElement 'SCENE' node
 */
MySceneGraph.prototype.parseIllumination= function(errors, rootElement)
{
	var elems = [];
	elems = this.parseElement(errors, rootElement, 'ILLUMINATION', 1, 1, true);
	if (elems == null) return;
	var illumination = elems[0];

	var rgbaList = ["r", "g", "b", "a"];

	// Parses global ambient light values
	elems = this.parseElement(errors, illumination, 'ambient', 1, 1, true);
	if (elems != null)
	{
		var ambient = elems[0];
		this.illumination["ambient"] = [];
		for (var i = 0; i < 3; i++)
		{
			this.illumination["ambient"][rgbaList[i]] = this.parseAttributeWithDefault(errors, ambient, rgbaList[i], 'ff', this.defautlLightValue);
		}
	}

	// Parses global background light values
	elems = this.parseElement(errors, illumination, 'background', 1, 1, true);
	if (elems != null)
	{
		var background = elems[0];
		this.illumination["background"] = [];
		for (var i = 0; i < 3; i++)
		{
			this.illumination["background"][rgbaList[i]] = this.parseAttributeWithDefault(errors, background, rgbaList[i], 'ff', this.defautlLightValue);
		}
	}
}

/**
 * Parses the "LIGHTS" block
 * @param errors errors and warnings array
 * @param rootElement 'SCENE' node
 */
MySceneGraph.prototype.parseLights= function(errors, rootElement)
{
	var elems = [];
	elems = this.parseElement(errors, rootElement, 'LIGHTS', 1, 1, true);
	if (elems == null) return;
	var lights = elems[0];

	var xyzwList = ["x", "y", "z", "w"];
	var rgbaList = ["r", "g", "b", "a"];

	elems = this.parseElement(errors, lights, 'LIGHT', 0, 0, true);
	if(elems == null)
		return;

	var lights = elems;
	for (var i = 0; i < lights.length; i++) // For each light
	{
		// Get light id
		this.lights[i] = [];
		this.lights[i]["id"] = this.parseRequiredAttribute(errors, lights[i], 'id', 'ss');
		elems = this.parseElement(errors, lights[i], 'enable', 1, 1, true);
		if(elems == null)
			continue;

		// Get light's enabled valye
		var enable = elems[0];
		this.lights[i]["enable"] = this.parseAttributeWithDefault(errors, enable, 'value', 'tt', this.defaultLightEnabled);

		// Get light's position
		elems = this.parseElement(errors, lights[i], 'position', 1, 1, true);
		if(elems == null)
			continue;
		var position = elems[0];
		this.lights[i]["position"] = [];
		for (var j = 0; j < xyzwList.length; j++)
		{
			this.lights[i]["position"][xyzwList[j]] = this.parseRequiredAttribute(errors, position, xyzwList[j], 'ff');
		}

		// Get light's ambient values
		elems = this.parseElement(errors, lights[i], 'ambient', 1, 1, true);
		if(elems == null)
			continue;

		var ambient = elems[0];
		this.lights[i]["ambient"] = [];
		for (var j = 0; j < rgbaList.length; j++)
		{
			this.lights[i]["ambient"][rgbaList[j]] = this.parseAttributeWithDefault(errors, ambient, rgbaList[j], 'ff', this.defautlLightValue);
		}

		// Get light's diffuse values
		elems = this.parseElement(errors, lights[i], 'diffuse', 1, 1, true);
		if(elems == null)
			continue;
		var diffuse = elems[0];
		this.lights[i]["diffuse"] = [];
		for (var j = 0; j < rgbaList.length; j++)
		{
			this.lights[i]["diffuse"][rgbaList[j]] = this.parseAttributeWithDefault(errors, diffuse, rgbaList[j], 'ff', this.defautlLightValue);
		}

		// Get light's specular values
		elems = this.parseElement(errors, lights[i], 'specular', 1, 1, true);
		if(elems == null)
			continue;
		var specular = elems[0];
		this.lights[i]["specular"] = [];
		for (var j = 0; j < rgbaList.length; j++)
		{
			this.lights[i]["specular"][rgbaList[j]] = this.parseAttributeWithDefault(errors, specular, rgbaList[j], 'ff', this.defautlLightValue);
		}
	}
}

/**
 * Parses the "TEXTURES" block
 * @param errors errors and warnings array
 * @param rootElement 'SCENE' node
 */
MySceneGraph.prototype.parseTextures= function(errors, rootElement)
{
	var elems = [];
	elems = this.parseElement(errors, rootElement, 'TEXTURES', 1, 1, true);
	if (elems == null) return;
	var textures = elems[0];

	elems = this.parseElement(errors, textures, 'TEXTURE', 0, 0, true);
	if (elems != null)
	{
		var textures = elems;
		for (var i = 0; i < textures.length; i++) // For each texture
		{
			// Get texture ID
			var id = this.parseRequiredAttribute(errors, textures[i], 'id', 'ss');
			var texture = [];
			texture["id"] = id;

			// Get texture file
			elems = this.parseElement(errors, textures[i], 'file', 1, 1, true);
			if (elems != null)
			{
				var enable = elems[0];
				texture["file"] = this.parseRequiredAttribute(errors, enable, 'path', 'ss');
			}

			// Get texture's amplification factors
			elems = this.parseElement(errors, textures[i], 'amplif_factor', 1, 1, true);
			if (elems != null)
			{
				var enable = elems[0];
				texture["amplif_factor"] = [];
				texture["amplif_factor"]["s"] = this.parseAttributeWithDefault(errors, enable, 's', 'ff', this.defaultAmplifFactor);
				texture["amplif_factor"]["t"] = this.parseAttributeWithDefault(errors, enable, 't', 'ff', this.defaultAmplifFactor);
			}
			this.textures[texture["id"]] = new Texture(new CGFtexture(this.scene, 'scenes/'+this.scenename+'/'+texture["file"]),
					texture["amplif_factor"]["s"],
					texture["amplif_factor"]["t"]);
		}
	}
}

/**
 * Parses the "MATERIALS" block
 * @param errors errors and warnings array
 * @param rootElement 'SCENE' node
 */
MySceneGraph.prototype.parseMaterials= function(errors, rootElement) {

	// These arrays store the different material arguments and types to shorten parsing
	var attributes = ["specular", "diffuse", "ambient", "emission"];
	var rgba = ["r", "g", "b", "a"];

	var elems = [];
	elems = this.parseElement(errors, rootElement, 'MATERIALS', 1, 1, true);
	if (elems == null) return;
	var materials = elems[0];

	elems = this.parseElement(errors, materials, 'MATERIAL', 0, 0, true);
	if (elems == null)
		return;

	var materials = elems;
	for (var i = 0; i < materials.length; i++) // For each material
	{
		var material = [];
		// Get material ID
		var id = this.parseRequiredAttribute(errors, materials[i], 'id', 'ss');
		if(id === null)
			continue;

		// Check if material id already exists. If so, continue to next one and add warning
		if (typeof this.materials[id] != 'undefined') {
			this.addWarning(errors, "duplicate MATERIAL id '" + id + "' found. Only the first will be considered.");
			continue;
		}

		// Get material shininess
		elems = this.parseElement(errors, materials[i], 'shininess', 1, 1, true);
		if(elems===null)
			continue;
		material["shininess"] = this.parseAttributeWithDefault(errors, elems[0], 'value', 'ff', this.defaultMaterialShininess);
		if(material["shininess"] === null) {
			material["shininess"] = 0;
			this.addWarning(errors, "MATERIAL '" + id + "' shininess not found. Assuming zero.");
		}

		// Parse material arguments and their properties
		for(var att = 0; att < attributes.length; att++) {
			elems = this.parseElement(errors, materials[i], attributes[att], 1, 1, true);
			if(elems != null) {
				material[attributes[att]] = [];
				for(var value = 0; value < rgba.length; value++) {
					material[attributes[att]][rgba[value]] = this.parseAttributeWithDefault(errors, elems[0], rgba[value], 'ff', this.defaultMaterialRGBA);
					if(material[attributes[att]][rgba[value]] === null) {
						material[attributes[att]][rgba[value]] = 0;
						this.addWarning(errors, "MATERIAL '" + id + "' " + attributes[att] + " " + rgba[value] + " value not found. Assuming zero.");
					}
				}
			}
		}
		var app = new CGFappearance(this.scene);
		app.setAmbient(material["ambient"]["r"], material["ambient"]["g"], material["ambient"]["b"], material["ambient"]["a"]);
		app.setDiffuse(material["diffuse"]["r"], material["diffuse"]["g"], material["diffuse"]["b"], material["diffuse"]["a"]);
		app.setSpecular(material["specular"]["r"], material["specular"]["g"], material["specular"]["b"], material["specular"]["a"]);
		app.setShininess(material["shininess"]);
		app.setEmission(material["emission"]["r"], material["emission"]["g"], material["emission"]["b"], material["emission"]["a"]);

		this.materials[id] = app;
	}
}

/**
 * Parses the "LEAVES" block
 * @param errors errors and warnings array
 * @param rootElement 'SCENE' node
 */
MySceneGraph.prototype.parseLeaves= function(errors, rootElement) {

	// These arrays store the different argument names and parsing functions for each type of primitive
	var all_args = [];
	var all_func = [];
	all_args["rectangle"] = ["left-top-x", "left-top-y", "right-bottom-x", "right-bottom-y"];
	all_func["rectangle"] = [parseFloat, parseFloat, parseFloat, parseFloat];
	all_args["cylinder"] = ["height", "bottom-radius", "top-radius", "sections-per-height", "parts-per-section"];
	all_func["cylinder"] = [parseFloat, parseFloat, parseFloat, parseInt, parseInt];
	all_args["sphere"] = ["radius", "parts-along-radius", "parts-per-section"];
	all_func["sphere"] = [parseFloat, parseInt, parseInt];
	all_args["triangle"] = ["v1-x", "v1-y", "v1-z", "v2-x", "v2-y", "v2-z", "v3-x", "v3-y", "v3-z"];
	all_func["triangle"] = [parseFloat, parseFloat, parseFloat, parseFloat, parseFloat, parseFloat, parseFloat, parseFloat, parseFloat];
	all_args["plane"] = ["parts"];
	all_func["plane"] = [parseInt];
	all_args["patch"] = ["order", "partsU", "partsV"];
	all_func["patch"] = [parseInt, parseInt, parseInt];

	var elems = [];
	elems = this.parseElement(errors, rootElement, 'LEAVES', 1, 1, true);
	if (elems == null) return;
	var leaves = elems[0];

	elems = this.parseElement(errors, leaves, 'LEAF', 0, 0, true);
	if (elems == null)
		return;

	var leaves = elems;
	for (var i = 0; i < leaves.length; i++) // For each leaf
	{
		var leaf = [];
		// Get leaf ID
		var id = this.parseRequiredAttribute(errors, leaves[i], 'id', 'ss');
		if(id == null)
			continue;

		// Check if leaf id already exists. If so, continue to next one and add error
		if (typeof this.leaves[id] != 'undefined') {
			this.addWarning(errors, "duplicate MATERIAL id '" + id + "' found. Only the first will be considered.");
			continue;
		}

		// Get leaf type
		elems = this.parseRequiredAttribute(errors, leaves[i], 'type', 'ss');
		var args = this.parseRequiredAttribute(errors, leaves[i], 'args', 'ss');
		args = args.split(' ');
		if(elems == null)
			continue;

		// Prepare list of arguments, allowing multiple spaces between arguments
		var temp_args = [];
		for(var temp = 0; temp < args.length; temp++) {
			if(args[temp] !== "")
				temp_args.push(args[temp]);
		}
		args = temp_args;

		if(typeof all_args[elems] == 'undefined') {
			this.addError(errors, "illegal LEAF type '" + elems + "' found.");
			break;
		}	
		leaf["type"] = elems;

		// Validate leaf type's number of arguments
		if(args.length != all_args[elems].length) {
			this.addError(errors, "illegal number of arguments for leaf '" + id + "' of type '" + elems + "'.");
			continue;
		}

		// Get leaf parameters
		var err_found = false;
		for(var temp = 0; temp < all_args[elems].length; temp++) {
			leaf[all_args[elems][temp]] = (all_func[elems])[temp](args[temp]);
			if(isNaN(leaf[all_args[elems][temp]])) {
				err_found = true;
				break;
			}
		}
		if(err_found) {
			this.addError(errors, "invalid argumens for leaf '" + id + "' of type '" + elems + "'.");
			continue;
		}

		// Generate SceneLeaf objet for the leaf
		switch(elems) {
		case "rectangle":
			this.leaves[id] = new SceneLeaf(new Rectangle(this.scene, leaf["left-top-x"], leaf["left-top-y"], leaf["right-bottom-x"], leaf["right-bottom-y"]),
					id, this.leaves);
			break;
		case "triangle":
			this.leaves[id] = new SceneLeaf(new Triangle(this.scene, leaf["v1-x"], leaf["v1-y"], leaf["v1-z"], leaf["v2-x"], leaf["v2-y"], leaf["v2-z"], leaf["v3-x"], leaf["v3-y"], leaf["v3-z"]),
					id, this.leaves);
			break;
		case "sphere":
			this.leaves[id] = new SceneLeaf(new Sphere(this.scene, leaf["radius"], leaf["parts-along-radius"], leaf["parts-per-section"]),
					id, this.leaves);
			break;
		case "cylinder":
			this.leaves[id] = new SceneLeaf(new Cylinder(this.scene, leaf["height"], leaf["bottom-radius"], leaf["top-radius"], leaf["sections-per-height"], leaf["parts-per-section"]),
					id, this.leaves);
			break;
		case "plane":
			this.leaves[id] = new SceneLeaf(new Plane(this.scene, leaf["parts"]), id, this.leaves);
			break;
		case "patch":
			if(this.parseControlPoints(errors, leaves[i], "Patch", leaf, Math.pow(leaf["order"]+1, 2), true)) {
				this.leaves[id] = new SceneLeaf(new Patch(this.scene, leaf["order"], leaf["partsU"], leaf["partsV"], leaf["controlpoints"]), id, this.leaves);
			}
			break;
		}
	}
}


/**
 * Parses a "controlpoint" elements inside a block
 * @param errors errors and warnings array
 * @param rootElement node containing controlpoints
 * @param id animation ID
 * @param dest_array array having "id" and storing result
 * @param message1 left error message
 * @param message2 right error message
 * @return false if an error occurred, true upon success
 */
MySceneGraph.prototype.parseControlPoints= function(errors, rootElement, id, dest_array, type, minNum, mandatory) {
	var controlpoints = [];
	for(var i = 0; i < rootElement.childNodes.length; i++) {
		if(rootElement.childNodes[i].nodeName === "controlpoint") {
			controlpoints.push(rootElement.childNodes[i]);
		}
	}

	if(mandatory && controlpoints.length != minNum) {
		this.addWarning(errors, "" + type + " '" + id + "' doesn't have " + minNum + " required control points. Ignoring");
		return false;
	}

	if(!mandatory && controlpoints.length < minNum) {
		this.addWarning(errors, "" + type + " '" + id + "' has less than " + minNum + " control points. Ignoring");
		return false;
	}

	dest_array['controlpoints'] = [];

	for(var i = 0; i < controlpoints.length; i++) {
		var elem = controlpoints[i];
		var xx = this.parseRequiredAttribute(errors, controlpoints[i], 'xx', 'ff');
		var yy = this.parseRequiredAttribute(errors, controlpoints[i], 'yy', 'ff');
		var zz = this.parseRequiredAttribute(errors, controlpoints[i], 'zz', 'ff');
		var point = [xx, yy, zz];

		dest_array['controlpoints'].push(point);
	}

	return true;
}

/**
 * Parses the "NODES" block
 * @param errors errors and warnings array
 * @param rootElement 'SCENE' node
 */
MySceneGraph.prototype.parseNodes= function(errors, rootElement) {

	// These arrays store the different attributes and their types for the node's transformations
	var all_attributes = []; var all_types = [];
	all_attributes["TRANSLATION"] = ["x", "y", "z"];
	all_types["TRANSLATION"] = ["ff", "ff", "ff"];
	all_attributes["ROTATION"] = ["axis", "angle"];
	all_types["ROTATION"] = ["cc", "ff"];
	all_attributes["SCALE"] = ["sx", "sy", "sz"];
	all_types["SCALE"] = ["ff", "ff", "ff"];

	var elems = [];
	elems = this.parseElement(errors, rootElement, 'NODES', 1, 1, true);
	if(elems == null)
		return;

	// GET ROOT NODE ID
	var root = this.parseElement(errors, elems[0], 'ROOT', 1, 1, true);
	if(root == null)
		return;
	this.rootNode = this.parseRequiredAttribute(errors, root[0], 'id', 'ss');
	if(this.rootNode == null)
		return;

	// GET NORMAL NODES
	elems = this.parseElement(errors, elems[0], 'NODE', 0, 0, true);
	if(elems == null)
		return;

	// for every node
	for(var i = 0; i < elems.length; i++) {

		// GET NODE ID AND CHECK IF IT ALREADY EXISTS
		var id = this.parseRequiredAttribute(errors, elems[i], 'id', 'ss');
		if(id == null) {
			continue;
		}

		if(typeof this.nodes[id] != 'undefined') {
			this.addWarning(errors, "duplicate NODE id '" + id + "' found. Only the first will be considered.");
			continue;
		}
		if(typeof this.leaves[id] != 'undefined') {
			this.addWarning(errors, "NODE id '" + id + "' already used as LEAF id. The NODE will not be considered");
			continue;
		}

		// GET NODE'S MATERIAL ID
		var material = this.parseElement(errors, elems[i], 'MATERIAL', 1, 1, true);
		if(material == null)
			continue;
		var mat_id = this.parseAttributeWithDefault(errors, material[0], 'id', 'ss', this.defaultNodeMaterialID);
		if(mat_id == null)
			continue;

		// GET NODE'S TEXTURE ID
		var texture = this.parseElement(errors, elems[i], 'TEXTURE', 1, 1, true);
		if(texture == null)
			continue;
		var tex_id = this.parseAttributeWithDefault(errors, texture[0], 'id', 'ss', this.defaultNodeTextureID);
		if(tex_id == null)
			continue;

		// GET NODE'S ANIMATION
		var animation = this.parseElement(errors, elems[i], 'animationref', 0, 1, false);
		if (animation == null)
			continue;
		var anim_id = null;
		if(animation.length == 1)
		{
			anim_id = this.parseRequiredAttribute(errors, animation[0], 'id', 'ss');
			if(anim_id == null)
				continue;
		}

		var transforms = [];
		var elements = elems[i].childNodes;

		for(var j = 0; j < elements.length; j++) {
			var type = elements[j].nodeName;
			if(typeof all_types[type] == 'undefined')
				continue;

			var transform = [];
			transform["type"] = type;
			var error = false;

			for(var k = 0; k < all_attributes[type].length; k++) {
				var att = all_attributes[type][k];
				var t = all_types[type][k];
				transform[att] = this.parseRequiredAttribute(errors, elements[j], att, t);
				if(transform[att] == null) {
					error = true;
					break;
				}
			}

			if(error)
				continue;
			transforms.push(transform);
		}

		// GET NODE DESCENDANTS
		var descendants = this.parseElement(errors, elems[i], 'DESCENDANTS', 1, 1, true);
		if(descendants == null) {
			this.addWarning(errors, "NODE '" + id + "' doesn't have a DESCENDANTS block. Ignoring node");
			continue;
		}

		descendants = this.parseElement(errors, descendants[0], 'DESCENDANT', 0, 0, true);
		if(descendants == null) {
			continue;
		}

		var desc = [];

		for(var j = 0; j < descendants.length; j++) {
			var desc_id = this.parseRequiredAttribute(errors, descendants[j], 'id', 'ss');
			if(desc_id == null)
				continue;
			desc.push(desc_id);
		}

		if(desc.length < 1) {
			this.addError(errors, "NODE '" + id + "' must have at least one valid descendant id");
			continue;
		}

		// ADD NODE TO NODE LIST
		node = [];
		node["material"] = mat_id;
		node["texture"] = tex_id;
		node["animation"] = anim_id;
		var transform_obj = new TransformMatrix(transforms);
		node["transforms"] = transform_obj.matrix;
		node["descendants"] = desc;
		this.nodes[id] = node;
	}		
}

/**
 * Parses the "ANIMATIONS" block
 * @param errors errors and warnings array
 * @param rootElement 'SCENE' node
 */
MySceneGraph.prototype.parseAnimations= function(errors, rootElement) {

	var anims = this.parseElement(errors, rootElement, 'ANIMATIONS', 1, 1, true);
	if(anims === null)
		return;

	anims = this.parseElement(errors, anims[0], 'ANIMATION', 0, 0, true);
	if(anims === null)
		return;

	for(var i = 0; i < anims.length; i++) {	// for each animation
		var animation = [];

		// Get animation ID
		var id = this.parseRequiredAttribute(errors, anims[i], 'id', 'ss');
		if(id === null)
			continue;

		// Check if animation id already exists. If so, continue to next one and add warning
		if (typeof this.animations[id] != 'undefined') {
			this.addWarning(errors, "duplicate ANIMATION id '" + id + "' found. Only the first will be considered.");
			continue;
		}

		var span = this.parseAttributeWithDefault(errors, anims[i], 'span', 'ff', 0);
		if(span <= 0) {
			this.addWarning(errors, "Illegal span " + span + " for ANIMATION '" + id + "'. Replacing by default value " + this.defaultAnimSpan);
			span = this.defaultAnimSpan;
		}

		var type = this.parseRequiredAttribute(errors, anims[i], 'type', 'ss');
		if(type == null)
			continue;

		animation['span'] = span;
		animation['type'] = type;
		var anim_obj;

		var invalidAnim = false;
		switch(type) {
		case 'linear':
			invalidAnim = !this.parseLinearAnimation(id, animation, errors, anims[i]);
			if(!invalidAnim) {
				anim_obj = new LinearAnimation(id, animation['span'], animation['controlpoints']);
			}
			break;
		case 'circular':
			animation['center'] = this.parseRequiredAttribute(errors, anims[i], 'center', 'ff ff ff');
			if (animation['center'] === null) continue;
			animation['radius'] = this.parseRequiredAttribute(errors, anims[i], 'radius', 'ff');
			if (animation['radius'] === null) continue;
			animation['startang'] = this.parseRequiredAttribute(errors, anims[i], 'startang', 'ff');
			if (animation['startang'] === null) continue;
			animation['rotang'] = this.parseRequiredAttribute(errors, anims[i], 'rotang', 'ff');
			if (animation['rotang'] === null) continue;
			anim_obj = new CircularAnimation(id, animation['span'], animation['center'], animation['radius'], this.radians(animation['startang']), this.radians(animation['rotang']));
			break;
		default:
			this.addWarning("Invalid type '" + type + "' for animation '" + id + "'. Ignoring animation.");
		invalidAnim = true;
		break;
		}

		if(invalidAnim)
			continue;

		this.animations[id] = anim_obj;
	}
};

/**
 * Parses the "ANIMATIONS" block
 * @param id animation ID
 * @param destAnim animation array to store the result
 * @param errors errors and warnings array
 * @param animation_elem LSX element of the animation
 * @return true if no error occurred, false otherwise
 */
MySceneGraph.prototype.parseLinearAnimation= function(id, destAnim, errors, animation_elem) {

	return this.parseControlPoints(errors, animation_elem, id, destAnim, "Linear animation", 2, false);
};

/**
 * Checks if graph nodes are valid
 * 	- checks if the indicated root node exists
 * 	- checks if all node descendants exist
 * 	- checks if all node's materials exist. If not, assigns "null"
 * 	- checks if all node's textures exist. If not, assigns "null"
 * 
 * @return {Boolean} true if no error was found (only warnings), false otherwise
 */
MySceneGraph.prototype.validateNodes= function(errors) {

	var error_found = false;

	// CHECK IF ROOT NODE EXISTS
	if(typeof this.rootNode == 'undefined') {
		this.addError(errors, "No ROOT node ID found.");
		error_found = true;
	}

	if(typeof this.nodes[this.rootNode] == 'undefined' && typeof this.leaves[this.rootNode] == 'undefined') {
		this.addError(errors, "no NODE with id of ROOT node ('" + this.rootNode + "') was found");
		error_found = true;
	}

	// CHECK IF LINKS IN NODES ARE VALID
	for (var i in this.nodes) {
		// CHECK IF ALL DESCENDANTS EXIST
		var desc = this.nodes[i]["descendants"];
		for(var j = 0; j < desc.length; j++) {
			if(typeof this.nodes[desc[j]] == 'undefined' && typeof this.leaves[desc[j]] == 'undefined') {	// if a descendant does not exist, removes it so the scene can still be displayed
				this.addWarning(errors, "DESCENDANT '" + desc[j] + "' of NODE '" + i + "' not found in NODES or LEAVES list. Removing descendant.");
				this.nodes[i]["descendants"].splice(j, 1);
			}
		}

		// CHECK IF TEXTURE EXISTS (except "null" and "clear")
		var tex_id = this.nodes[i]["texture"];
		if((tex_id != "null") && (tex_id != "clear") && (typeof this.textures[tex_id] == 'undefined')) {
			this.addWarning(errors, "TEXTURE id '" + tex_id + "' not found for NODE '" + i + "'");
			this.nodes[i]["texture"] = "null";
			continue;				
		}

		// CHECK IF MATERIAL EXISTS (except "null")
		var mat_id = this.nodes[i]["material"];
		if((mat_id !== "null") && (typeof this.materials[mat_id] == 'undefined')) {
			this.addWarning(errors, "MATERIAL id '" + mat_id + "' not found for NODE '" + i + "'");
			this.nodes[i]["material"] = "null";
			continue;
		}

		// CHECK IF THE ANIMATION EXISTS
		var anim_id = this.nodes[i]["animation"];
		if (anim_id !== null)
		{
			if (typeof this.animations[anim_id] == 'undefined')
			{
				this.addWarning(errors, "ANIMATION id '" + anim_id + "' not found for NODE '" + i + "'");
				this.nodes[i]["animation"] = null;
				continue;
			}
		}
	}

	return !error_found;
}

/**
 * Generates the scene graph after parsing the LSX file
 * @param nodeID ID of the root node
 * @return {SceneNode} sceneNode representing the root node
 */
MySceneGraph.prototype.createGraph= function(nodeID) {
	if (typeof this.graphNodes[nodeID] != 'undefined') return this.graphNodes[nodeID]; // Node already created
	if (typeof this.leaves[nodeID] != 'undefined') return this.leaves[nodeID]; // Node is a leaf

	var material = this.nodes[nodeID]["material"];
	if (material === "null")
		material = null;
	else
		material = this.materials[material];

	var texture = this.nodes[nodeID]["texture"];
	if (texture === "null")
		texture = null;
	else if (texture !== "clear")
		texture = this.textures[texture];

	var animation = this.nodes[nodeID]["animation"]
	if (animation !== null) animation = this.animations[animation];

	this.graphNodes[nodeID] = new SceneNode(nodeID, material, texture, animation, this.nodes[nodeID]["transforms"], this.scene);

	for (var i = 0; i < this.nodes[nodeID]["descendants"].length; i++)
	{
		this.graphNodes[nodeID].push(this.createGraph(this.nodes[nodeID]["descendants"][i]));
	}
	return this.graphNodes[nodeID];
}


/**
 * Parses an element attribute with given name and type. If the argument does not exist, returns defaultValue
 * @param errors errors and warnings array
 * @param element xml element whose attribute to parse
 * @param name name of the attribute to parse
 * @param type string representing the type of the attribute to be parsed
 * @param defaultValue default value to assign to the attribute if an error occurs
 * @return value of the required attribute if it exists, defaultValue if it doesn't or has invalid type
 */
MySceneGraph.prototype.parseAttributeWithDefault= function(errors, element, name, type, defaultValue) {
	if (!this.reader.hasAttribute(element, name))
	{
		this.addWarning(errors, "Could not read '" + name + "' attribute of '" + element.nodeName + "' element. Assuming default value: " + defaultValue);
		return defaultValue;
	}

	var attribute = this.parseAttributeType(element, name, type);
	if (attribute === null) {
		this.addWarning(errors, "'" + name + "' attribute of '" + element.nodeName + "' element should be of the type '" + type + "'. Assuming default value: " + defaultValue);
		attribute = defaultValue;
	}

	return attribute;	
}


/**
 * Parses a required attribute of a specified element, returning null
 * and adding an error, if the argument does not exist or has invalid type
 * @param errors errors and warnings array
 * @param element xml element whose attribute to parse
 * @param name name of the attribute to parse
 * @param type string representing the type of the attribute to be parsed
 * @return required attribute if it exists and has valid type, null otherwise
 */
MySceneGraph.prototype.parseRequiredAttribute= function(errors, element, name, type)
{
	if (!this.reader.hasAttribute(element, name))
	{
		this.addError(errors, "could not read '" + name + "' attribute of '" + element.nodeName + "' element.");
		return;
	}

	var attribute = this.parseAttributeType(element, name, type);
	if (attribute === null)
		this.addError(errors, "'" + name + "' attribute of '" + element.nodeName + "' element should be of the type '" + type + "'.");
	return attribute;
}

MySceneGraph.prototype.parseAttributeType = function(element, name, type)
{
	var attribute = null;
	switch (type)
	{
	case "cc":
		attribute = this.reader.getItem(element, name, ["x", "y", "z"], false);
		break;
	case "ff":
		attribute = this.reader.getFloat(element, name, false);
		if (isNaN(attribute)) attribute = null;
		break;
	case "ss":
		attribute = this.reader.getString(element, name, false);
		break;
	case "tt":
		attribute = this.reader.getBoolean(element, name, false);
		break;
	case "ff ff ff":
		attribute = this.reader.getVector3(element, name, false);
		break;
	default:
		attribute = this.reader.getString(element, name, false);
	break;
	}
	return attribute;
}

/**
 * Parses an inner element from another element, with a specified name. Returns an array
 * of elements with that name if the array's length is within minNum - maxNum, returning null otherwise
 * @param errors errors and warnings array
 * @param parent parent element
 * @param name of the element to be parsed
 * @param minNum minimum number of elements expected to be found, or 0 if optional element
 * @param maxNum maximum number of elements expected to be found, or 0 if infinite
 * @return required element if it exists, null otherwise
 */
MySceneGraph.prototype.parseElement= function(errors, parent, elementName, minNum, maxNum, addError)
{
	var element = parent.getElementsByTagName(elementName);
	if (element == null && addError) {
		this.addError(errors, "'" + elementname + "' element is missing.");
		return null;
	}

	if (((element.length < minNum && minNum != 0) || (element.length > maxNum && maxNum != 0)) && addError)
	{
		if (minNum == maxNum)
			this.addError(errors, "expected " + minNum + " '" + elementName + "' element" + (minNum != 1 ? "s" : "") + " but found " + element.length + ".");
		else
			this.addError(errors, "found " + element.length + " '" + elementName + "' element" + (minNum != 1 ? "s" : "") + " but expected between " + minNum + " and " + maxNum + ".");
		return null;
	}
	return element;
}


/**
 * Adds an error to the errors array, with the specified message
 * @param errors errors and warnings array
 * @param msg error message
 */
MySceneGraph.prototype.addError = function(errors, msg)
{
	errors.push([true, msg]);
}


/**
 * Adds a warning to the errors array, with the specified message
 * @param errors errors and warnings array
 * @param msg warning message
 */
MySceneGraph.prototype.addWarning = function(errors, msg)
{
	errors.push([false, msg]);
}

/**
 * Callback executed on a XML parsing error
 */
MySceneGraph.prototype.onXMLError = function()
{
	console.error("XML error occured");
}

/**
 * Toggles the light with the specified index
 * @param light index of the light to be toggled
 */
MySceneGraph.prototype.toggleLight = function(light)
{
	if (this.scene !== null)
		this.scene.lights[light].disable();
}

/**
 * Converts an angle from degrees to radians
 * @param deg the angle in degrees
 * @returns {Number} the angle in radians
 */
MySceneGraph.prototype.radians = function(deg)
{
	return deg * (Math.PI/180);
}
