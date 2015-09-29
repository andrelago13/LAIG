
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

	// As the graph loaded ok, signal the scene so that any additional initialization depending on the graph can take place
	this.scene.onGraphLoaded();
};

MySceneGraph.prototype.parse= function(errors, warnings, rootElement) {
	if (rootElement.nodeName != 'SCENE')
	{
		errors.push("The document root node should be 'SCENE'");
		return;
	}
	//this.parseInitials(errors, rootElement);
	this.parseInitials(errors, warnings, rootElement);
}

MySceneGraph.prototype.parseInitials= function(errors, warnings, rootElement) {
	var elems = [];
	elems = this.parseRequiredElement(errors, warnings, rootElement, 'INITIALS', 1);
	if (elems == null) return;
	var initials = elems[0];

	elems = this.parseRequiredElement(errors, warnings, initials, 'frustum', 1);
	if (elems != null)
	{
		var frustum = elems[0];
		this.initials["frustum"] = [];
		this.initials["frustum"]["near"] = this.parseRequiredAttribute(errors, warnings, frustum, 'near', 'ff');
		this.initials["frustum"]["far"] = this.parseRequiredAttribute(errors, warnings, frustum, 'far', 'ff');
	}

	var axisList = ["x", "y", "z"];

	elems = this.parseRequiredElement(errors, warnings, initials, 'translate', 1);
	if (elems != null)
	{
		var translate = elems[0];
		this.initials["translate"] = [];
		for (var i = 0; i < axisList.length; i++)
			this.initials["translate"][axisList[i]] = this.parseRequiredAttribute(errors, warnings, translate, axisList[i], 'ff');
	}

	elems = this.parseRequiredElement(errors, warnings, initials, 'rotation', 3);
	if (elems != null)
	{
		this.initials["rotation"] = [];
		for (var i = 0; i < 3; i++)
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
	default:
		attribute = this.reader.getString(element, name, false);
	break;
	}
	if (attribute == null)
		errors.push("'" + name + "' attribute of '" + element.nodeName + "' element should be of the type '" + type + "'.");
	return attribute;
}

MySceneGraph.prototype.parseRequiredElement= function(errors, warnings, parent, elementName, numExpected)
{
	var element = parent.getElementsByTagName(elementName);
	if (element == null) {
		errors.push("'" + elementname + "' element is missing.");
		return null;
	}
	if (element.length != numExpected)
	{
		errors.push("either zero or more than one '" + elementName + "' element found.");
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


