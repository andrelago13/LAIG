
function MySceneGraph(filename, scene) {
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

	this.initials = [];
	this.illumination = [];
	this.lights = [];
	this.textures = [];
	this.materials = [];
	this.leaves = [];
	this.nodes = [];
	this.rootNode = "";
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
	console.log("Num errors: " + errors.length);
	if (errors.length > 0) {
		this.onXMLError(errors);
		return;
	}
	
	this.loadedOk=true;
	
	if(warnings.length > 0) {
		this.onXMLWarning(warnings);
	}

	// As the graph loaded ok, signal the scene so that any additional initialization depending on 
	// the graph can take place
	this.scene.onGraphLoaded();
};

MySceneGraph.prototype.parse= function(errors, warnings, rootElement) {
	if (rootElement.nodeName != 'SCENE')
	{
		errors.push("The document root node should be 'SCENE'");
		return;
	}
	this.parseInitials(errors, warnings, rootElement);
	this.parseIllumination(errors, warnings, rootElement);
	this.parseLights(errors, warnings, rootElement);
	this.parseTextures(errors, warnings, rootElement);
	this.parseMaterials(errors, warnings, rootElement);
	this.parseLeaves(errors, warnings, rootElement);
	this.parseNodes(errors, warnings, rootElement);
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

	elems = this.parseElement(errors, warnings, initials, 'translate', 1, 1);
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
		for (var i = 0; i < elems[i]; i++)
		{
			var rotation = elems[i];
			var axis = this.parseRequiredAttribute(errors, warnings, rotation, 'axis', 'cc', axisList);
			if (this.initials["rotation"][axis] != null)
				warnings.push("rotation of '" + axis + "' axis already defined, updating its value.");
			this.initials["rotation"][axis] = this.parseRequiredAttribute(errors, warnings, rotation, 'angle', 'ff');
		}
		for (var i = 0; i < 3; i++)
		{
			if (this.initials["rotation"][axisList[i]] == null)
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

	elems = this.parseElement(errors, warnings, illumination, 'doubleside', 1, 1);
	if (elems != null)
	{
		var doubleside = elems[0];
		this.illumination["doubleside"] = this.parseRequiredAttribute(errors, warnings, doubleside, 'value', 'tt');
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
				for (var j = 0; j < 3; j++)
				{
					this.lights[i]["position"][xyzwList[j]] = this.parseRequiredAttribute(errors, warnings, position, xyzwList[j], 'ff');
				}
			}

			elems = this.parseElement(errors, warnings, lights[i], 'ambient', 1, 1);
			if (elems != null)
			{
				var ambient = elems[0];
				this.lights[i]["ambient"] = [];
				for (var j = 0; j < 3; j++)
				{
					this.lights[i]["ambient"][rgbaList[j]] = this.parseRequiredAttribute(errors, warnings, ambient, rgbaList[j], 'ff');
				}
			}

			elems = this.parseElement(errors, warnings, lights[i], 'diffuse', 1, 1);
			if (elems != null)
			{
				var diffuse = elems[0];
				this.lights[i]["diffuse"] = [];
				for (var j = 0; j < 3; j++)
				{
					this.lights[i]["diffuse"][rgbaList[j]] = this.parseRequiredAttribute(errors, warnings, diffuse, rgbaList[j], 'ff');
				}
			}

			elems = this.parseElement(errors, warnings, lights[i], 'specular', 1, 1);
			if (elems != null)
			{
				var specular = elems[0];
				this.lights[i]["specular"] = [];
				for (var j = 0; j < 3; j++)
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
	
	var elems = [];
	elems = this.parseElement(errors, warnings, rootElement, 'MATERIALS', 1, 1);
	if (elems == null) return;
	var materials = elems[0];

	elems = this.parseElement(errors, warnings, materials, 'MATERIAL', 0, 0);
	if (elems == null)
		return;
	
	var materials = elems;
	for (var i = 0; i < materials.length; i++) // Para cada textura
	{
		var material = [];
		var id = this.parseRequiredAttribute(errors, warnings, materials[i], 'id', 'ss');
		
		// Check if material id already exists. If so, continue to next one and add warning
		if (typeof this.materials[id] != 'undefined') {
			warnings.push("duplicate MATERIAL id '" + id + "' found. Only the first will be considered.");
			continue;
		}
		
		elems = this.parseElement(errors, warnings, materials[i], 'shininess', 1, 1);
		if(elems==null)
			continue;
		material["shininess"] = this.parseRequiredAttribute(errors, warnings, elems[0], 'value', 'ff');
		
		var attributes = ["specular", "diffuse", "ambient", "emission"];
		var rgba = ["r", "g", "b", "a"];
		
		for(var att = 0; att < attributes.length; att++) {
			elems = this.parseElement(errors, warnings, materials[i], attributes[att], 1, 1);
			if(elems != null) {
				material[attributes[att]] = [];
				for(var value = 0; value < rgba.length; value++) {
					material[attributes[att]][value] = this.parseRequiredAttribute(errors, warnings, elems[0], rgba_arg[value], 'ff');
					if(material[attributes[att]][value] == null) {
						material[attributes[att]][value] = 0;
					}
				}
			}
		}
		
		this.materials[id] = material;
	}
}

MySceneGraph.prototype.parseLeaves= function(errors, warnings, rootElement) {
	
	// TODO clean code
	
	var elems = [];
	elems = this.parseElement(errors, warnings, rootElement, 'LEAVES', 1, 1);
	if (elems == null) return;
	var leaves = elems[0];

	elems = this.parseElement(errors, warnings, leaves, 'LEAF', 0, 0);
	if (elems == null)
		return;
	
	var leaves = elems;
	for (var i = 0; i < leaves.length; i++) // Para cada textura
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
			
		leaf["type"] = elems;
		var invalid_type = false;
		
		switch(elems) {
		case "rectangle":
			if(args.length == 4) {
				// TODO passar as variáveis tipo left-top-x para um lugar tipo definido numa classe, o mesmo para os outros tipos
				leaf["left-top-x"] = parseInt(args[0]);
				leaf["left-top-y"] = parseInt(args[1]);
				leaf["right-bottom-x"] = parseInt(args[2]);
				leaf["right-bottom-x"] = parseInt(args[3]);
				
				if(isNaN(leaf["left-top-x"]) || isNaN(leaf["left-top-y"]) || 
						isNaN(leaf["right-bottom-x"]) || isNaN(leaf["right-bottom-y"])) {
					errors.push("invalid argumens for leaf '" + id + "' of type " + elems + ".");
					return;
				}
				
			} else {
				errors.push("illegal number of arguments for leaf '" + id + "' of type " + elems + ".");
				return;
			}
			break;
		case "cylinder":
			if(args.length == 5) {
				leaf["height"] = parseFloat(args[0]);
				leaf["bottom-radius"] = parseFloat(args[1]);
				leaf["top-radius"] = parseFloat(args[2]);
				leaf["sections-per-height"] = parseInt(args[3]);
				leaf["parts-per-section"] = parseInt(args[4]);
				
				if(isNaN(leaf["height"]) || isNaN(leaf["bottom-radius"]) ||
						isNaN(leaf["top-radius"]) || isNaN(leaf["sections-per-height"]) ||
						isNaN(leaf["parts-per-section"])) {
					errors.push("invalid argumens for leaf '" + id + "' of type " + elems + ".");
					return;
				}
				
			} else {
				errors.push("illegal number of arguments for leaf '" + id + "' of type " + elems + ".");
				return;
			}
			break;
		case "sphere":
			break;
			if(args.length == 3) {
				leaf["radius"] = parseFloat(args[0]);
				leaf["parts-along-radius"] = parseInt(args[0]);
				leaf["parts-per-section"] = parseInt(args[0]);
				
				if(isNaN(leaf["radius"]) || isNaN(leaf["parts-along-radiu"]) ||
						isNaN(leaf["parts-per-section"])) {
					errors.push("invalid argumens for leaf '" + id + "' of type " + elems + ".");
					return;
				}
			} else {
				errors.push("illegal number of arguments for leaf '" + id + "' of type " + elems + ".");
				return;
			}
		case "triangle":
			break;
			if(args.length == 9) {
				leaf["v1-x"] = parseFloat(args[0]);
				leaf["v1-y"] = parseFloat(args[1]);
				leaf["v1-z"] = parseFloat(args[2]);
				leaf["v2-x"] = parseFloat(args[3]);
				leaf["v2-y"] = parseFloat(args[4]);
				leaf["v2-z"] = parseFloat(args[5]);
				leaf["v3-x"] = parseFloat(args[6]);
				leaf["v3-y"] = parseFloat(args[7]);
				leaf["v3-z"] = parseFloat(args[8]);
				
				if(isNaN(leaf["v1-x"]) || isNaN(leaf["v1-y"]) || isNaN(leaf["v1-z"])
						|| isNaN(leaf["v2-x"]) || isNaN(leaf["v2-y"]) ||
						isNaN(leaf["v2-z"]) || isNaN(leaf["v3-x"]) || isNaN(leaf["v3-y"])
						|| isNaN(leaf["v3-z"])) {
					errors.push("invalid argumens for leaf '" + id + "' of type " + elems + ".");
					return;
				}
			} else {
				errors.push("illegal number of arguments for leaf '" + id + "' of type " + elems + ".");
				return;
			}
		default:
			errors.push("illegal LEAF type '" + elems + "' found.");
			invalid_type = true;
			break;
		}
		
		if(invalid_type)
			continue;
		
		this.leaves[id] = leaf;
	}
}

MySceneGraph.prototype.parseNodes= function(errors, warnings, rootElement) {
	
	// FIXME passar id para chave do array
	
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
		var material = parseElement(errors, warnings, elems[i], 'MATERIAL', 1, 1);
		if(material == null)
			continue;
		var mat_id = parseRequiredAttribute(errors, warnings, material[0], 'id', 'ss');
		if(mat_id == null)
			continue;
		// TODO extract to validate method
		if(mat_id != "null") {
			if(typeof this.materials[mat_id] == 'undefined') {
				errors.push("MATERIAL id '" + mat_id + "' not found for NODE '" + id + "'");
				continue;
			}
		}
		
		// GET NODE'S TEXTURE ID
		var texture = parseElement(errors, warnings, elems[i], 'TEXTURE', 1, 1);
		if(texture == null)
			continue;
		var tex_id = parseRequiredAttribute(errors, warnings, texture[0], 'id', 'ss');
		if(tex_id == null)
			continue;
		// TODO extract to validate method
		if(tex_id != "null" && tex_id != "clear") {
			if(typeof this.textures["id"] == 'undefined') {
				errors.push("TEXTURE id '" + tex_id + "' not found for NODE '" + id + "'");
				continue;				
			}
		}
		
		var transforms = [];
		var elements = elems[0].getElements();
		var translation_attributes = ["x", "y", "z"];
		var translation_types = ["ff", "ff", "ff"];
		var rotation_attributes = ["axis", "angle"];
		var rotation_types = ["cc", "ff"];
		var scale_attributes = ["sx", "sy", "sz"];
		var scale_types = ["ff", "ff", "ff"];
		
		for(var j = 0; j < elements.length; j++) {
			var type = null;
			var attributes = null;
			var types = null;
			
			switch(elements[j].nodeName) {
			case "TRANSLATION":
				type = "TRANSLATION";
				attributes = transform_attributes;
				types = transform_types;
				break;
			case "ROTATION":
				type = "ROTATION";
				attributes = rotation_attributes;
				types = rotations_types;
				break;
			case "SCALE":
				type = "SCALE";
				attributes = scale_attributes;
				types = scale_types;
				break;
			default:
				break;	
			}
			
			if(type != null) {
				var transform = [];
				transform["id"] = type;
				var error = false;
				
				for(var i = 0; i < attributes.length; i++) {
					transform[attributes[i]] = this.parseRequiredAttribute(errors, warnings, elements[j], attributes[i], types[i]);
					if(transform[attributes[i]] == null) {
						error = true;
						break;
					}
				}
				
				if(error)
					continue;
				transforms.push(transform);
			}
		}
		
		// GET NODE DESCENDANTS
		var descendants = this.parseElement(errors, warnings, elems[0], 'DESCENDANTS', 1, 1);
		if(descendants == null)
			continue;
		descendants = this.parseElement(errors, warnings, descendants[0], 'DESCENDANT', 0, 0);
		if(descendants == null) {
			continue;
		}
		
		var desc = [];
		
		for(var j = 0; j < descendants.length; j++) {
			var desc_id = this.parseRequiredAttribute(errors, warnings, descendants[0], 'id', 'ss');
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
		node["transforms"] = transforms;
		node["descendants"] = desc;
		this.nodes[id] = node;
	}
	
	// TODO extract to validade method
	// CHECK IF ROOT NODE EXISTS
	var found = false;
	for(var i = 0; i < this.nodes.length; i++) {
		if(this.nodes[i]["id"] == this.nodes["root-id"]) {
			found = true;
			break;
		}
	}
	if(!found) {
		errors.push("no NODE with id of ROOT node ('" + this.nodes["root-id"] + "') was found");
		return;
	}

	// TODO extract to validade method
	// CHECK IF ALL DESCENDANTS OF ALL NODES EXIST
	for(var i = 0; i < this.nodes.length; i++) {
		var desc = this.nodes[i]["descendants"];
		for(var j = 0; j < desc.length; j++) {
			var found = false;
			for(var k = 0; k < this.nodes.length; k++) {
				if(this.nodes[k]["id"] == desc[j]) {
					found = true;
					break;
				}
			}
			if(!found) {
				for(var k = 0; k < this.leaves.length; k++) {
					if(this.leaves[k]["id"] == desc[j]) {
						found = true;
						break;
					}
				}
			}
			
			if(!found) {
				errors.push("DESCENDANT '" + desc[j] + "' not found in NODES or LEAVES list");
			}
		}
	}			
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
	if (attribute == null)
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

/*
 * Callback to be executed on any read error
 */

MySceneGraph.prototype.onXMLError=function (errors) {
	for (var i = 0; i < errors.length; i++)
		console.error("XML Loading Error: "+ errors[i]);

	this.loadedOk=false;
};

MySceneGraph.prototype.onXMLWarning=function (warnings) {
	for (var i = 0; i < warnings.length; i++)
		console.log("XML Loading Warning: "+ warnings[i]);
	
	if(this.loadedOk)
		console.log("Execution continuing with possible errors.")
}

