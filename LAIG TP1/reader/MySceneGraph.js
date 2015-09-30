
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
	
	// TODO análise dos warnings

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
		errors.push("either zero or more than one '" + elementName + "' element found.");
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


