
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
	if (elems != null)
	{
		var materials = elems;
		for (var i = 0; i < materials.length; i++) // Para cada textura
		{
			this.materials[i] = [];
			var id = this.parseRequiredAttribute(errors, warnings, materials[i], 'id', 'ss');
			
			// Check if material id already exists. If so, continue to next one and add error
			var duplicate = false;
			for(var j = 0; j < this.materials.length - 1; j++) {
				if(this.materials[j]["id"] == id) {
					warnings.push("duplicate MATERIAL id '" + id + "' found. Only the first will be considered.");
					duplicate = true;
					break;
				}
			}
			if(duplicate)
				continue;
			this.materials[i]["id"] = id;
			
			elems = this.parseElement(errors, warnings, materials[i], 'shininess', 1, 1);
			if(elems != null) {
				var enable = elems[0];
				this.materials[i]["shininess"] = this.parseRequiredAttribute(errors, warnings, enable, 'value', 'ff');
			}
			
			var attributes = ["specular", "diffuse", "ambient", "emission"];
			var attributes_arg = ['specular', 'diffuse', 'ambient', 'emission'];
			var rgba = ["r", "g", "b", "a"];
			var rgba_arg = ['r', 'g', 'b', 'a'];
			
			for(var att = 0; att < attributes.length; att++) {
				elems = this.parseElement(errors, warnings, materials[i], attributes_arg[att], 1, 1);
				if(elems != null) {
					var enable = elems[0];
					this.materials[i][attributes[att]] = [];
					for(var value = 0; value < rgba.length; value++) {
						this.materials[i][attributes[att]] = this.parseRequiredAttribute(errors, warnings, enable, rgba_arg[value], 'ff');
					}
				}
			}
			
			// FIXME para ver se um elemento já está no array basta ver se está undefined
			
			// TODO if the above code for cycle does not work, delete and uncomment below
			
			/*elems = this.parseElement(errors, warnings, materials[i], 'specular', 1, 1);
			if(elems != null) {
				var enable = elems[0];
				this.materials[i]["specular"] = [];
				this.materials[i]["specular"]["r"] = this.parseRequiredAttribute(errors, warnings, enable, 'r', 'ff');
				this.materials[i]["specular"]["g"] = this.parseRequiredAttribute(errors, warnings, enable, 'g', 'ff');
				this.materials[i]["specular"]["b"] = this.parseRequiredAttribute(errors, warnings, enable, 'b', 'ff');
				this.materials[i]["specular"]["a"] = this.parseRequiredAttribute(errors, warnings, enable, 'a', 'ff');
			}
			
			elems = this.parseElement(errors, warnings, materials[i], 'diffuse', 1, 1);
			if(elems != null) {
				var enable = elems[0];
				this.materials[i]["diffuse"] = [];
				this.materials[i]["diffuse"]["r"] = this.parseRequiredAttribute(errors, warnings, enable, 'r', 'ff');
				this.materials[i]["diffuse"]["g"] = this.parseRequiredAttribute(errors, warnings, enable, 'g', 'ff');
				this.materials[i]["diffuse"]["b"] = this.parseRequiredAttribute(errors, warnings, enable, 'b', 'ff');
				this.materials[i]["diffuse"]["a"] = this.parseRequiredAttribute(errors, warnings, enable, 'a', 'ff');
			}
			
			elems = this.parseElement(errors, warnings, materials[i], 'ambient', 1, 1);
			if(elems != null) {
				var enable = elems[0];
				this.materials[i]["ambient"] = [];
				this.materials[i]["ambient"]["r"] = this.parseRequiredAttribute(errors, warnings, enable, 'r', 'ff');
				this.materials[i]["ambient"]["g"] = this.parseRequiredAttribute(errors, warnings, enable, 'g', 'ff');
				this.materials[i]["ambient"]["b"] = this.parseRequiredAttribute(errors, warnings, enable, 'b', 'ff');
				this.materials[i]["ambient"]["a"] = this.parseRequiredAttribute(errors, warnings, enable, 'a', 'ff');
			}
			
			elems = this.parseElement(errors, warnings, materials[i], 'emission', 1, 1);
			if(elems != null) {
				var enable = elems[0];
				this.materials[i]["emission"] = [];
				this.materials[i]["emission"]["r"] = this.parseRequiredAttribute(errors, warnings, enable, 'r', 'ff');
				this.materials[i]["emission"]["g"] = this.parseRequiredAttribute(errors, warnings, enable, 'g', 'ff');
				this.materials[i]["emission"]["b"] = this.parseRequiredAttribute(errors, warnings, enable, 'b', 'ff');
				this.materials[i]["emission"]["a"] = this.parseRequiredAttribute(errors, warnings, enable, 'a', 'ff');
			}*/
			
		}
	}
}

MySceneGraph.prototype.parseLeaves= function(errors, warnings, rootElement) {
	
	var elems = [];
	elems = this.parseElement(errors, warnings, rootElement, 'LEAVES', 1, 1);
	if (elems == null) return;
	var leaves = elems[0];

	elems = this.parseElement(errors, warnings, leaves, 'LEAF', 0, 0);
	if (elems != null)
	{
		var leaves = elems;
		for (var i = 0; i < leaves.length; i++) // Para cada textura
		{
			this.leaves[i] = [];
			var id = this.parseRequiredAttribute(errors, warnings, leaves[i], 'id', 'ss');
			
			// Check if leaf id already exists. If so, continue to next one and add error
			var duplicate = false;
			for(var j = 0; j < this.leaves.length - 1; j++) {
				if(this.leaves[j]["id"] == id) {
					warnings.push("duplicate MATERIAL id '" + id + "' found. Only the first will be considered.");
					duplicate = true;
					break;
				}
			}
			if(duplicate)
				continue;
			this.leaves[i]["id"] = id;
			
			elems = this.parseRequiredAttribute(errors, warnings, leaves[i], 'type', 'ss');
			var args = this.parseRequiredAttribute(errors, warnings, leaves[i], 'args', 'ss');
			args = args.split(' ');
			if(elems != null) {
				this.leaves[i]["type"] = elems[0];
				if(elems[0] == "rectangle") {
					if(args.length == 4) {
						// TODO passar as variáveis tipo left-top-x para um lugar tipo definido numa classe, o mesmo para os outros tipos
						this.leaves[i]["left-top-x"] = parseInt(args[0]);
						this.leaves[i]["left-top-y"] = parseInt(args[1]);
						this.leaves[i]["right-bottom-x"] = parseInt(args[2]);
						this.leaves[i]["right-bottom-x"] = parseInt(args[3]);
						
						if(isNaN(this.leaves[i]["left-top-x"]) || isNaN(this.leaves[i]["left-top-y"]) || 
								isNaN(this.leaves[i]["right-bottom-x"]) || isNaN(this.leaves[i]["right-bottom-y"])) {
							errors.push("invalid argumens for leaf '" + id + "' of type " + elems[0] + ".");
							return;
						}
						
					} else {
						errors.push("illegal number of arguments for leaf '" + id + "' of type " + elems[0] + ".");
						return;
					}
				} else if (elems[0] == "cylinder") {
					if(args.length == 5) {
						this.leaves[i]["height"] = parseFloat(args[0]);
						this.leaves[i]["bottom-radius"] = parseFloat(args[1]);
						this.leaves[i]["top-radius"] = parseFloat(args[2]);
						this.leaves[i]["sections-per-height"] = parseInt(args[3]);
						this.leaves[i]["parts-per-section"] = parseInt(args[4]);
						
						if(isNaN(this.leaves[i]["height"]) || isNaN(this.leaves[i]["bottom-radius"]) ||
								isNaN(this.leaves[i]["top-radius"]) || isNaN(this.leaves[i]["sections-per-height"]) ||
								isNaN(this.leaves[i]["parts-per-section"])) {
							errors.push("invalid argumens for leaf '" + id + "' of type " + elems[0] + ".");
							return;
						}
						
					} else {
						errors.push("illegal number of arguments for leaf '" + id + "' of type " + elems[0] + ".");
						return;
					}					
				} else if (elems[0] == "sphere") {
					if(args.length == 3) {
						this.leaves[i]["radius"] = parseFloat(args[0]);
						this.leaves[i]["parts-along-radius"] = parseInt(args[0]);
						this.leaves[i]["parts-per-section"] = parseInt(args[0]);
						
						if(isNaN(this.leaves[i]["radius"]) || isNaN(this.leaves[i]["parts-along-radiu"]) ||
								isNaN(this.leaves[i]["parts-per-section"])) {
							errors.push("invalid argumens for leaf '" + id + "' of type " + elems[0] + ".");
							return;
						}
					} else {
						errors.push("illegal number of arguments for leaf '" + id + "' of type " + elems[0] + ".");
						return;
					}					
				} else if (elems[0] == "triangle") {
					if(args.length == 9) {
						this.leaves[i]["v1-x"] = parseFloat(args[0]);
						this.leaves[i]["v1-y"] = parseFloat(args[1]);
						this.leaves[i]["v1-z"] = parseFloat(args[2]);
						this.leaves[i]["v2-x"] = parseFloat(args[3]);
						this.leaves[i]["v2-y"] = parseFloat(args[4]);
						this.leaves[i]["v2-z"] = parseFloat(args[5]);
						this.leaves[i]["v3-x"] = parseFloat(args[6]);
						this.leaves[i]["v3-y"] = parseFloat(args[7]);
						this.leaves[i]["v3-z"] = parseFloat(args[8]);
						
						if(isNaN(this.leaves[i]["v1-x"]) || isNaN(this.leaves[i]["v1-y"]) || isNaN(this.leaves[i]["v1-z"])
								|| isNaN(this.leaves[i]["v2-x"]) || isNaN(this.leaves[i]["v2-y"]) ||
								isNaN(this.leaves[i]["v2-z"]) || isNaN(this.leaves[i]["v3-x"]) || isNaN(this.leaves[i]["v3-y"])
								|| isNaN(this.leaves[i]["v3-z"])) {
							errors.push("invalid argumens for leaf '" + id + "' of type " + elems[0] + ".");
							return;
						}
					} else {
						errors.push("illegal number of arguments for leaf '" + id + "' of type " + elems[0] + ".");
						return;
					}
				} else {
					errors.push("illegal LEAF type '" + elems[0] + "' found.");
					return;
				}
				
			} else {
				continue;
			}			
		}
	}
}

MySceneGraph.prototype.parseNodes= function(errors, warnings, rootElement) {
	
	var elems = [];
	elems = this.parseElement(errors, warnings, rootElement, 'NODES', 1, 1);
	if(elems != null) {
		
		// GET ROOT NODE ID
		var root = this.parseElement(errors, warnings, elems[0], 'ROOT', 1, 1);
		if(root == null)
			return;
		this.nodes["root-id"] = this.parseRequiredAttribute(errors, warnings, root[0], 'id', 'ss');
		if(this.nodes["root-id"] == null)
			return;
		
		// GET NORMAL NODES
		elems = this.parseElement(errors, warnings, elems[0], 'NODE', 0, 0);
		if(elems != null) {
			// for every node
			for(var i = 0; i < elems.length; i++) {
				
				// GET NODE ID AND CHECK IF IT ALREADY EXISTS
				var id = this.parseRequiredAttribute(errors, warnings, elems[i], 'id', 'ss');
				if(id == null) {
					continue;
				}
				
				var duplicate = false;
				for(var j = 0; j < this.nodes.length; j++) {
					if(this.nodes[j]["id"] == id) {
						warnings.push("duplicate NODE id '" + id + "' found. Only the first will be considered.");
						duplicate = true;
						break;
					}
				}
				if(duplicate)
					continue;

				for(var j = 0; j < this.leaves.length; j++) {
					if(this.leaves[j]["id"] == id) {
						warnings.push("NODE id '" + id + "' already used as LEAF id. The NODE will not be considered");
						duplicate = true;
						break;
					}
				}
				if(duplicate)
					continue;
				
				// GET NODE'S MATERIAL ID
				var material = parseElement(errors, warnings, elems[i], 'MATERIAL', 1, 1);
				if(material == null)
					continue;
				var mat_id = parseRequiredAttribute(errors, warnings, material[0], 'id', 'ss');
				if(mat_id == null)
					continue;
				if(mat_id != "null") {
					var found = false;
					for(var j = 0; j < this.materials.length; j++) {
						if(this.materials[j]["id"] == mat_id) {
							found = true;
							break;
						}
					}
					if(!found) {
						errors.push("MATERIAL id '" + mat_id + "' not found in NODE '" + id + "'");
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
				if(tex_id != "null" && tex_id != "clear") {
					var found = false;
					for(var j = 0; j < this.textures.length; j++) {
						if(this.textures[j]["id"] == tex_id) {
							found = true;
							break;
						}
					}
					if(!found) {
						errors.push("TEXTURE id '" + tex_id + "' not found in NODE '" + id + "'");
						continue;
					}
				}
				
				
				// TODO usar getElements para retirar as transformações
				
				var transforms = [];
				var elements = elems[0].getElements();
				
				for(var j = 0; j < elements.length; j++) {
					
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
				this.nodes[i]["id"] = id;
				this.nodes[i]["material"] = mat_id;
				this.nodes[i]["texture"] = tex_id;
				this.nodes[i]["transforms"] = [];	// TODO complete
				this.nodes[i]["descendants"] = desc;
			}
			
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
	case "ff":
		attribute = this.reader.getFloat(element, name, false);
		if (isNaN(attribute)) attribute = null;
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
		errors.push("illegal ammount of '" + elementName + "' element found.");
		if (minNum == maxNum)
			errors.push("expected " + minNum + " '" + elementName + "' element" + (minNum != 1 ? "s" : "") + " but found " + element.length + ".");
		else
			errors.push("found " + element.length + " '" + elementName + "' element" + (minNum != 1 ? "s" : "") + " but expected between " + minNum + " and " + maxNum + ".");
		return null;
	}
	return element;
}

/*
 * Example of method that parses elements of one block and stores information in a specific data structure
 */
MySceneGraph.prototype.parseGlobalsExample= function(errors, warnings, rootElement) {

	/*var elems =  rootElement.getElementsByTagName('globals');
	if (elems == null) {
		errors.push("globals element is missing.");
	}

	if (elems.length != 1) {
		errors.push("either zero or more than one 'globals' element found.");
	}

	// various examples of different types of access
	var globals = elems[0];*/
	/*	this.background = this.reader.getRGBA(globals, 'background');
	this.drawmode = this.reader.getItem(globals, 'drawmode', ["fill","line","point"]);
	this.cullface = this.reader.getItem(globals, 'cullface', ["back","front","none", "frontandback"]);
	this.cullorder = this.reader.getItem(globals, 'cullorder', ["ccw","cw"]);

	console.log("Globals read from file: {background=" + this.background + ", drawmode=" + this.drawmode + ", cullface=" + this.cullface + ", cullorder=" + this.cullorder + "}");
	 */
	/*var tempList=rootElement.getElementsByTagName('list');

	if (tempList == null  || tempList.length==0) {
		errors.push("list element is missing.");
	}

	this.list=[];
	// iterate over every element
	var nnodes=tempList[0].children.length;
	for (var i=0; i< nnodes; i++)
	{
		var e=tempList[0].children[i];

		// process each element and store its information
		this.list[e.id]=e.attributes.getNamedItem("coords").value;
		console.log("Read list item id "+ e.id+" with value "+this.list[e.id]);
	};*/

};

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

