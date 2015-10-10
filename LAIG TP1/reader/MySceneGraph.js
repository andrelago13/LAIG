
function MySceneGraph(filename, scene) {  

	this.initials = [];
	this.illumination = [];
	this.lights = [];
	this.textures = [];
	this.materials = [];
	this.leaves = [];
	this.nodes = [];
	this.rootNode = "";
	this.graphNodes = [];
	this.graph = null;

	this.loadedOk = null;

	// Establish bidirectional references between scene and graph
	this.scene = scene;
	scene.graph=this;

	// File reading 
	this.reader = new CGFXMLreader();

	/*
	 * Read the contents of the xml file, and refer to this class for loading and error handlers.
	 * After the file is read, the reader calls onXMLReady on this object.
	 * If any error occurs, the reader calls onXMLError on this object, with an error message
	 */

	this.reader.open('scenes/'+filename, this);
}

/*
 * Callback to be executed after successful reading
 */
MySceneGraph.prototype.onXMLReady=function() 
{
	console.log("XML Loading finished.");
	var rootElement = this.reader.xmlDoc.documentElement;

	// Here should go the calls for different functions to parse the various blocks
	var errors = [];
	var warnings = [];
	this.parse(errors, warnings, rootElement);
	if(warnings.length > 0) {
		this.onXMLWarning(warnings);
	}
	if (errors.length > 0) {
		this.onXMLError(errors);
		return;
	}

	this.loadedOk=true;

	// As the graph loaded ok, signal the scene so that any additional initialization depending on 
	// the graph can take place
	this.scene.onGraphLoaded();
}

MySceneGraph.prototype.parse= function(errors, warnings, rootElement) {
	if (rootElement.nodeName != 'SCENE')
	{
		errors.push("The document root node should be 'SCENE'");
		return;
	}
	var blocks = ["INITIALS", "ILLUMINATION", "LIGHTS", "TEXTURES", "MATERIALS", "LEAVES", "NODES"];
	var blockPos = Array.apply(null, Array(blocks.length)).map(Number.prototype.valueOf, -1);
	var currPos = 0;
	var elements = rootElement.childNodes;
	for (var i = 0; i < elements.length; i++)
	{
		if (typeof elements[i].tagName == 'undefined')
			continue;
		var index = blocks.indexOf(elements[i].tagName);
		if (index == -1) warnings.push("unknown block '" + elements[i].tagName + "'.");
		else if (blockPos[index] != -1) warnings.push("block '" + elements[i].tagName + "' defined multiple times.");
		else blockPos[index] = currPos++;
	}

	for (var i = 0; i < blocks.length; i++)
	{
		if (blockPos[i] == -1)
		{
			warnings.push("block '" + blocks[i] + "' not found.");
			break;
		}
		if (blockPos[i] != i)
			warnings.push("wrong block order for block '" + blocks[i] + "', it should be number " + (i + 1) + ".");

		var elems = [];
		elems = this.parseElement(errors, warnings, rootElement, blocks[i], 1, 1);
		if (elems == null) break;
		this.parseBlock(errors, warnings, rootElement, i);
	}
	if(this.validateNodes(errors, warnings, rootElement))
		this.graph = this.createGraph(this.rootNode);
}

MySceneGraph.prototype.parseBlock= function(errors, warnings, element, blockID)
{
	switch (blockID)
	{
	case 0: return this.parseInitials(errors, warnings, element);
	case 1: return this.parseIllumination(errors, warnings, element);
	case 2: return this.parseLights(errors, warnings, element);
	case 3: return this.parseTextures(errors, warnings, element);
	case 4: return this.parseMaterials(errors, warnings, element);
	case 5: return this.parseLeaves(errors, warnings, element);
	case 6: return this.parseNodes(errors, warnings, element);
	default: return;
	}
}

MySceneGraph.prototype.parseInitials= function(errors, warnings, rootElement) {
	var elems = [];
	elems = this.parseElement(errors, warnings, rootElement, 'INITIALS', 1, 1);
	if (elems == null) return;
	var initials = elems[0];

	elems = this.parseElement(errors, warnings, initials, 'frustum', 1, 1);
	if (elems != null)
	{
		var frustum = elems[0];
		this.initials["frustum"] = [];
		this.initials["frustum"]["near"] = this.parseRequiredAttribute(errors, warnings, frustum, 'near', 'ff');
		this.initials["frustum"]["far"] = this.parseRequiredAttribute(errors, warnings, frustum, 'far', 'ff');
	}

	var axisList = ["x", "y", "z"];

	elems = this.parseElement(errors, warnings, initials, 'translation', 1, 1);
	if (elems != null)
	{
		var translate = elems[0];
		this.initials["translate"] = [];
		for (var i = 0; i < axisList.length; i++)
			this.initials["translate"][axisList[i]] = this.parseRequiredAttribute(errors, warnings, translate, axisList[i], 'ff');
	}
	elems = this.parseElement(errors, warnings, initials, 'rotation', 0, 0);
	if (elems != null)
	{
		this.initials["rotation"] = [];
		for (var i = 0; i < elems.length; i++)
		{
			var rotation = elems[i];
			var axis = this.parseRequiredAttribute(errors, warnings, rotation, 'axis', 'cc', axisList);
			if (typeof this.initials["rotation"][axis] != 'undefined')
				warnings.push("rotation of '" + axis + "' axis already defined, updating its value.");
			this.initials["rotation"][axis] = this.parseRequiredAttribute(errors, warnings, rotation, 'angle', 'ff');
		}
		for (var i = 0; i < 3; i++)
		{
			if (typeof this.initials["rotation"][axisList[i]] == 'undefined')
			{
				warnings.push("rotation of '" + axis + "' axis not defined, setting it to 0.");
				this.initials["rotation"][axisList[i]] = 0;
			}
		}
	}

	elems = this.parseElement(errors, warnings, initials, 'scale', 1, 1);
	if (elems != null)
	{
		var scale = elems[0];
		this.initials["scale"] = [];
		for (var i = 0; i < 3; i++)
		{
			this.initials["scale"]["s" + axisList[i]] = this.parseRequiredAttribute(errors, warnings, scale, 's' + axisList[i], 'ff');
		}
	}

	elems = this.parseElement(errors, warnings, initials, 'reference', 1, 1);
	if (elems != null)
	{
		var reference = elems[0];
		this.initials["reference"] = this.parseRequiredAttribute(errors, warnings, reference, 'length', 'ff');
	}
}

MySceneGraph.prototype.parseIllumination= function(errors, warnings, rootElement)
{
	var elems = [];
	elems = this.parseElement(errors, warnings, rootElement, 'ILLUMINATION', 1, 1);
	if (elems == null) return;
	var illumination = elems[0];

	var rgbaList = ["r", "g", "b", "a"];

	elems = this.parseElement(errors, warnings, illumination, 'ambient', 1, 1);
	if (elems != null)
	{
		var ambient = elems[0];
		this.illumination["ambient"] = [];
		for (var i = 0; i < 3; i++)
		{
			this.illumination["ambient"][rgbaList[i]] = this.parseRequiredAttribute(errors, warnings, ambient, rgbaList[i], 'ff');
		}
	}

	elems = this.parseElement(errors, warnings, illumination, 'background', 1, 1);
	if (elems != null)
	{
		var background = elems[0];
		this.illumination["background"] = [];
		for (var i = 0; i < 3; i++)
		{
			this.illumination["background"][rgbaList[i]] = this.parseRequiredAttribute(errors, warnings, background, rgbaList[i], 'ff');
		}
	}
}

MySceneGraph.prototype.parseLights= function(errors, warnings, rootElement)
{
	var elems = [];
	elems = this.parseElement(errors, warnings, rootElement, 'LIGHTS', 1, 1);
	if (elems == null) return;
	var lights = elems[0];

	var xyzwList = ["x", "y", "z", "w"];
	var rgbaList = ["r", "g", "b", "a"];

	elems = this.parseElement(errors, warnings, lights, 'LIGHT', 0, 0);
	if (elems != null)
	{
		var lights = elems;
		for (var i = 0; i < lights.length; i++) // Para cada fonte de luz
		{
			this.lights[i] = [];
			this.lights[i]["id"] = this.parseRequiredAttribute(errors, warnings, lights[i], 'id', 'ss');

			elems = this.parseElement(errors, warnings, lights[i], 'enable', 1, 1);
			if (elems != null)
			{
				var enable = elems[0];
				this.lights[i]["enable"] = this.parseRequiredAttribute(errors, warnings, enable, 'value', 'tt');
			}

			elems = this.parseElement(errors, warnings, lights[i], 'position', 1, 1);
			if (elems != null)
			{
				var position = elems[0];
				this.lights[i]["position"] = [];
				for (var j = 0; j < xyzwList.length; j++)
				{
					this.lights[i]["position"][xyzwList[j]] = this.parseRequiredAttribute(errors, warnings, position, xyzwList[j], 'ff');
				}
			}

			elems = this.parseElement(errors, warnings, lights[i], 'ambient', 1, 1);
			if (elems != null)
			{
				var ambient = elems[0];
				this.lights[i]["ambient"] = [];
				for (var j = 0; j < rgbaList.length; j++)
				{
					this.lights[i]["ambient"][rgbaList[j]] = this.parseRequiredAttribute(errors, warnings, ambient, rgbaList[j], 'ff');
				}
			}

			elems = this.parseElement(errors, warnings, lights[i], 'diffuse', 1, 1);
			if (elems != null)
			{
				var diffuse = elems[0];
				this.lights[i]["diffuse"] = [];
				for (var j = 0; j < rgbaList.length; j++)
				{
					this.lights[i]["diffuse"][rgbaList[j]] = this.parseRequiredAttribute(errors, warnings, diffuse, rgbaList[j], 'ff');
				}
			}

			elems = this.parseElement(errors, warnings, lights[i], 'specular', 1, 1);
			if (elems != null)
			{
				var specular = elems[0];
				this.lights[i]["specular"] = [];
				for (var j = 0; j < rgbaList.length; j++)
				{
					this.lights[i]["specular"][rgbaList[j]] = this.parseRequiredAttribute(errors, warnings, specular, rgbaList[j], 'ff');
				}
			}
		}
	}
}

MySceneGraph.prototype.parseTextures= function(errors, warnings, rootElement)
{
	var elems = [];
	elems = this.parseElement(errors, warnings, rootElement, 'TEXTURES', 1, 1);
	if (elems == null) return;
	var textures = elems[0];

	elems = this.parseElement(errors, warnings, textures, 'TEXTURE', 0, 0);
	if (elems != null)
	{
		var textures = elems;
		for (var i = 0; i < textures.length; i++) // Para cada textura
		{
			this.textures[i] = [];
			this.textures[i]["id"] = this.parseRequiredAttribute(errors, warnings, textures[i], 'id', 'ss');

			elems = this.parseElement(errors, warnings, textures[i], 'file', 1, 1);
			if (elems != null)
			{
				var enable = elems[0];
				this.textures[i]["file"] = this.parseRequiredAttribute(errors, warnings, enable, 'path', 'ss');
			}

			elems = this.parseElement(errors, warnings, textures[i], 'amplif_factor', 1, 1);
			if (elems != null)
			{
				var enable = elems[0];
				this.textures[i]["amplif_factor"] = [];
				this.textures[i]["amplif_factor"]["s"] = this.parseRequiredAttribute(errors, warnings, enable, 's', 'ff');
				this.textures[i]["amplif_factor"]["t"] = this.parseRequiredAttribute(errors, warnings, enable, 't', 'ff');
			}
		}
	}
}

MySceneGraph.prototype.parseMaterials= function(errors, warnings, rootElement) {

	var attributes = ["specular", "diffuse", "ambient", "emission"];
	var rgba = ["r", "g", "b", "a"];

	var elems = [];
	elems = this.parseElement(errors, warnings, rootElement, 'MATERIALS', 1, 1);
	if (elems == null) return;
	var materials = elems[0];

	elems = this.parseElement(errors, warnings, materials, 'MATERIAL', 0, 0);
	if (elems == null)
		return;

	var materials = elems;
	for (var i = 0; i < materials.length; i++) // For each material
	{
		var material = [];
		var id = this.parseRequiredAttribute(errors, warnings, materials[i], 'id', 'ss');
		if(id == null)
			continue;

		// Check if material id already exists. If so, continue to next one and add warning
		if (typeof this.materials[id] != 'undefined') {
			warnings.push("duplicate MATERIAL id '" + id + "' found. Only the first will be considered.");
			continue;
		}

		elems = this.parseElement(errors, warnings, materials[i], 'shininess', 1, 1);
		if(elems==null)
			continue;
		material["shininess"] = this.parseRequiredAttribute(errors, warnings, elems[0], 'value', 'ff');
		if(material["shininess"] == null) {
			material["shininess"] = 0;
			warnings.push("MATERIAL '" + id + "' shininess not found. Assuming zero.");
		}

		for(var att = 0; att < attributes.length; att++) {
			elems = this.parseElement(errors, warnings, materials[i], attributes[att], 1, 1);
			if(elems != null) {
				material[attributes[att]] = [];
				for(var value = 0; value < rgba.length; value++) {
					material[attributes[att]][value] = this.parseRequiredAttribute(errors, warnings, elems[0], rgba[value], 'ff');
					if(material[attributes[att]][value] == null) {
						material[attributes[att]][value] = 0;
						warnings.push("MATERIAL '" + id + "' " + attributes[att] + " " + rgba[value] + " value not found. Assuming zero.");
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

MySceneGraph.prototype.parseLeaves= function(errors, warnings, rootElement) {

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

	var elems = [];
	elems = this.parseElement(errors, warnings, rootElement, 'LEAVES', 1, 1);
	if (elems == null) return;
	var leaves = elems[0];

	elems = this.parseElement(errors, warnings, leaves, 'LEAF', 0, 0);
	if (elems == null)
		return;

	var leaves = elems;
	for (var i = 0; i < leaves.length; i++) // For each leaf
	{
		var leaf = [];
		var id = this.parseRequiredAttribute(errors, warnings, leaves[i], 'id', 'ss');

		// Check if leaf id already exists. If so, continue to next one and add error
		if (typeof this.leaves[id] != 'undefined') {
			warnings.push("duplicate MATERIAL id '" + id + "' found. Only the first will be considered.");
			continue;
		}

		elems = this.parseRequiredAttribute(errors, warnings, leaves[i], 'type', 'ss');
		var args = this.parseRequiredAttribute(errors, warnings, leaves[i], 'args', 'ss');
		args = args.split(' ');
		if(elems == null)
			continue;

		if(typeof all_args[elems] == 'undefined') {
			errors.push("illegal LEAF type '" + elems + "' found.");
			break;
		}	
		leaf["type"] = elems;

		if(args.length != all_args[elems].length) {
			errors.push("illegal number of arguments for leaf '" + id + "' of type '" + elems + "'.");
			continue;
		}

		var err_found = false;
		for(var temp = 0; temp < all_args[elems].length; temp++) {
			leaf[all_args[elems][temp]] = (all_func[elems])[temp](args[temp]);
			if(isNaN(leaf[all_args[elems][temp]])) {
				err_found = true;
				break;
			}
		}
		if(err_found) {
			errors.push("invalid argumens for leaf '" + id + "' of type '" + elems + "'.");
			continue;
		}

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
		}
	}
}

MySceneGraph.prototype.parseNodes= function(errors, warnings, rootElement) {

	var all_attributes = []; var all_types = [];
	all_attributes["TRANSLATION"] = ["x", "y", "z"];
	all_types["TRANSLATION"] = ["ff", "ff", "ff"];
	all_attributes["ROTATION"] = ["axis", "angle"];
	all_types["ROTATION"] = ["cc", "ff"];
	all_attributes["SCALE"] = ["sx", "sy", "sz"];
	all_types["SCALE"] = ["ff", "ff", "ff"];

	var elems = [];
	elems = this.parseElement(errors, warnings, rootElement, 'NODES', 1, 1);
	if(elems == null)
		return;

	// GET ROOT NODE ID
	var root = this.parseElement(errors, warnings, elems[0], 'ROOT', 1, 1);
	if(root == null)
		return;
	this.rootNode = this.parseRequiredAttribute(errors, warnings, root[0], 'id', 'ss');
	if(this.rootNode == null)
		return;

	// GET NORMAL NODES
	elems = this.parseElement(errors, warnings, elems[0], 'NODE', 0, 0);
	if(elems == null)
		return;

	// for every node
	for(var i = 0; i < elems.length; i++) {

		// GET NODE ID AND CHECK IF IT ALREADY EXISTS
		var id = this.parseRequiredAttribute(errors, warnings, elems[i], 'id', 'ss');
		if(id == null) {
			continue;
		}

		if(typeof this.nodes[id] != 'undefined') {
			warnings.push("duplicate NODE id '" + id + "' found. Only the first will be considered.");
			continue;
		}
		if(typeof this.leaves[id] != 'undefined') {
			warnings.push("NODE id '" + id + "' already used as LEAF id. The NODE will not be considered");
			continue;
		}

		// GET NODE'S MATERIAL ID
		var material = this.parseElement(errors, warnings, elems[i], 'MATERIAL', 1, 1);
		if(material == null)
			continue;
		var mat_id = this.parseRequiredAttribute(errors, warnings, material[0], 'id', 'ss');
		if(mat_id == null)
			continue;

		// GET NODE'S TEXTURE ID
		var texture = this.parseElement(errors, warnings, elems[i], 'TEXTURE', 1, 1);
		if(texture == null)
			continue;
		var tex_id = this.parseRequiredAttribute(errors, warnings, texture[0], 'id', 'ss');
		if(tex_id == null)
			continue;

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
				transform[att] = this.parseRequiredAttribute(errors, warnings, elements[j], att, t);
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
		var descendants = this.parseElement(errors, warnings, elems[i], 'DESCENDANTS', 1, 1);
		if(descendants == null) {
			warnings.push("NODE '" + id + "' doesn't have a DESCENDANTS block. Ignoring node");
			continue;
		}

		descendants = this.parseElement(errors, warnings, descendants[0], 'DESCENDANT', 0, 0);
		if(descendants == null) {
			continue;
		}

		var desc = [];

		for(var j = 0; j < descendants.length; j++) {
			var desc_id = this.parseRequiredAttribute(errors, warnings, descendants[j], 'id', 'ss');
			if(desc_id == null)
				continue;
			desc.push(desc_id);
		}

		if(desc.length < 1) {
			errors.push("NODE '" + id + "' must have at least one valid descendant id");
			continue;
		}

		// ADD NODE TO NODE LIST
		node = [];
		node["material"] = mat_id;
		node["texture"] = tex_id;
		var transform_obj = new TransformMatrix(transforms);
		node["transforms"] = transform_obj.matrix;
		node["descendants"] = desc;
		this.nodes[id] = node;
	}		
}

MySceneGraph.prototype.validateNodes= function(errors, warnings, rootElement) {

	var init_err_len = errors.length;

	// CHECK IF ROOT NODE EXISTS
	if(typeof this.nodes[this.rootNode] == 'undefined') {
		errors.push("no NODE with id of ROOT node ('" + this.nodes["root-id"] + "') was found");
	}

	// CHECK IF LINKS IN NODES ARE VALID
	for (var i in this.nodes) {
		// CHECK IF ALL DESCENDANTS EXIST
		var desc = this.nodes[i]["descendants"];
		for(var j = 0; j < desc.length; j++) {
			if(typeof this.nodes[desc[j]] == 'undefined' && typeof this.leaves[desc[j]] == 'undefined') {
				errors.push("DESCENDANT '" + desc[j] + "' of NODE '" + i + "' not found in NODES or LEAVES list");
			}
		}

		// CHECK IF TEXTURE EXISTS (except "null" and "clear")
		var tex_id = this.nodes[i]["texture"];
		if(tex_id != "null" && tex_id != "clear" && typeof this.textures[tex_id] == 'undefined') {
			warnings.push("TEXTURE id '" + tex_id + "' not found for NODE '" + i + "'");
			continue;				
		}

		// CHECK IF MATERIAL EXISTS (except "null")
		var mat_id = this.nodes[i]["material"];
		if(mat_id != "null" && typeof this.materials[mat_id] == 'undefined') {
			warnings.push("MATERIAL id '" + mat_id + "' not found for NODE '" + i + "'");
			continue;
		}
	}

	if(errors.length > init_err_len)
		return false;

	return true;
}

MySceneGraph.prototype.createGraph= function(nodeID) {
	if (typeof this.graphNodes[nodeID] != 'undefined') return this.graphNodes[nodeID]; // Node already created
	if (typeof this.leaves[nodeID] != 'undefined') return this.leaves[nodeID]; // Node is a leaf

	this.graphNodes[nodeID] = new SceneNode(nodeID, null, null, this.nodes[nodeID]["transforms"], this.scene);

	for (var i = 0; i < this.nodes[nodeID]["descendants"].length; i++)
	{
		this.graphNodes[nodeID].push(this.createGraph(this.nodes[nodeID]["descendants"][i]));
	}
	return this.graphNodes[nodeID];
}

MySceneGraph.prototype.parseRequiredAttribute= function(errors, warnings, element, name, type, opts)
{
	if (!this.reader.hasAttribute(element, name))
	{
		errors.push("could not read '" + name + "' attribute of '" + element.nodeName + "' element.");
		return;
	}
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
	default:
		attribute = this.reader.getString(element, name, false);
	break;
	}
	if (attribute === null)
		errors.push("'" + name + "' attribute of '" + element.nodeName + "' element should be of the type '" + type + "'.");
	return attribute;
}

MySceneGraph.prototype.parseElement= function(errors, warnings, parent, elementName, minNum, maxNum)
{
	var element = parent.getElementsByTagName(elementName);
	if (element == null) {
		errors.push("'" + elementname + "' element is missing.");
		return null;
	}

	if ((element.length < minNum && minNum != 0) || (element.length > maxNum && maxNum != 0))
	{
		if (minNum == maxNum)
			errors.push("expected " + minNum + " '" + elementName + "' element" + (minNum != 1 ? "s" : "") + " but found " + element.length + ".");
		else
			errors.push("found " + element.length + " '" + elementName + "' element" + (minNum != 1 ? "s" : "") + " but expected between " + minNum + " and " + maxNum + ".");
		return null;
	}
	return element;
}

MySceneGraph.prototype.onXMLError=function (errors) {
	for (var i = 0; i < errors.length; i++)
		console.error("XML Loading Error: "+ errors[i]);

	this.loadedOk=false;
};

MySceneGraph.prototype.onXMLWarning=function (warnings) {
	for (var i = 0; i < warnings.length; i++)
		console.warn("XML Loading Warning: "+ warnings[i]);

	if(this.loadedOk)
		console.log("Execution continuing with possible errors.")
}

