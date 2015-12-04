Cubemap.prototype = Object.create(CGFtexture.prototype);
Cubemap.prototype.constructor = Cubemap;

//right, left, up, down, front, back
function Cubemap(scene, srcs) {
	this.scene = scene;
	this.texID = -1;
	this.gl = scene.gl;
	this.images = [];
	var c = this;
	var loaded = 0;
	for (var i = 0; i < 6; i++)
	{
		this.images[i] = new Image();
		this.images[i].crossOrigin = "anonymous";
		this.images[i].onload = function() {
			loaded++;
			console.log("Texture loaded: " + this.src);
			if (loaded == 6)
			{
				c.texID = c.gl.createTexture();
				c.gl.bindTexture(c.gl.TEXTURE_CUBE_MAP, c.texID);
				c.gl.texImage2D(c.gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, c.gl.RGBA, c.gl.RGBA, c.gl.UNSIGNED_BYTE, this);
		        c.gl.texImage2D(c.gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, c.gl.RGBA, c.gl.RGBA, c.gl.UNSIGNED_BYTE, this);
				c.gl.texImage2D(c.gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, c.gl.RGBA, c.gl.RGBA, c.gl.UNSIGNED_BYTE, this);
				c.gl.texImage2D(c.gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, c.gl.RGBA, c.gl.RGBA, c.gl.UNSIGNED_BYTE, this);
				c.gl.texImage2D(c.gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, c.gl.RGBA, c.gl.RGBA, c.gl.UNSIGNED_BYTE, this);
				c.gl.texImage2D(c.gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, c.gl.RGBA, c.gl.RGBA, c.gl.UNSIGNED_BYTE, this);
				c.gl.texParameteri(c.gl.TEXTURE_CUBE_MAP, c.gl.TEXTURE_MAG_FILTER, c.gl.LINEAR);
				if (isPowerOfTwo(this.width) && isPowerOfTwo(this.height)) c.gl.texParameteri(c.gl.TEXTURE_CUBE_MAP, c.gl.TEXTURE_MIN_FILTER, c.gl.LINEAR);
				else {
					c.gl.texParameteri(c.gl.TEXTURE_CUBE_MAP, c.gl.TEXTURE_MIN_FILTER, c.gl.LINEAR);
					c.gl.texParameteri(c.gl.TEXTURE_CUBE_MAP, c.gl.TEXTURE_WRAP_S, c.gl.CLAMP_TO_EDGE);
					c.gl.texParameteri(c.gl.TEXTURE_CUBE_MAP, c.gl.TEXTURE_WRAP_T, c.gl.CLAMP_TO_EDGE);
				}
			}
		};
		this.images[i].src = srcs[i];
	}
}