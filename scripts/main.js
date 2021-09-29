// various game objects
class bugNest{
	
		constructor(perimeterPart){
			this.nestX = 0.88* Math.cos(perimeterPart*Math.PI/180);
			this.nestY = 0.88* Math.sin(perimeterPart*Math.PI/180);
		}
		
}
class bugGoal{
	constructor(perimeterPart){
		this.goalStart =perimeterPart;
		this.goalEnd=perimeterPart+30;
	}
}


	//Creates the C equivalent code in an array of strings
var vertexShaderText = [
'precision mediump float;',

'attribute vec2 vertPosition;',

'void main()',
'{',
'	gl_Position = vec4(vertPosition, 0.0, 1.0);',
'gl_PointSize = 10.0;',
'}'
].join('\n');

var fragmentShaderText = [
'precision mediump float;',
'uniform vec4 fragColor;',

'void main()',
'{',
'	gl_FragColor = fragColor;',
'}'
].join('\n');
	
var Initialize = function() {
	//Initializes the webGL stuff
	var canvas = document.getElementById("glCanvas");
	var gl = canvas.getContext("webgl");
	if (!gl){
		console.log("Base webgl not supported. Trying Experimental");
		gl = canvas.getContext("experimental-webgl");
	}
	if(!gl){
		alert("Your browser doesn't support webGL");
	}
	canvas.width = window.innerHeight;
	canvas.height = window.innerHeight;
	gl.viewport(0,0,canvas.width,canvas.height);

	

	//Compiles the shader objects
	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

	gl.shaderSource(vertexShader,vertexShaderText);
	gl.shaderSource(fragmentShader,fragmentShaderText);

	gl.compileShader(vertexShader);
	if(!gl.getShaderParameter(vertexShader,gl.COMPILE_STATUS)){
		console.error('Error compiling vertex shader!', gl.getShaderInfoLog(vertexShader))
		return;
	}
	gl.compileShader(fragmentShader);
		if(!gl.getShaderParameter(fragmentShader,gl.COMPILE_STATUS)){
		console.error('Error compiling vertex shader!', gl.getShaderInfoLog(fragmentShader))
		return;
	}
	var program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);

	gl.linkProgram(program);
	
	var fragColorLocation = gl.getUniformLocation(program, "fragColor");
	if(!gl.getProgramParameter(program, gl.LINK_STATUS)){
		console.error('Error linking program', gl.getProgramInfo(program));
		return;
	}
	var objectVertices = [0,0];
	for(var i = 0.0; i<=360; i+=1){
		var j = i * Math.PI / 180;
		objectVertices.push(0.9* Math.cos(j));
		objectVertices.push(0.9* Math.sin(j));
	}
	objectVertices.push(0,0);
	for(var i = 0.0; i<=360; i+=1){
		var j = i * Math.PI / 180;
		objectVertices.push(0.88* Math.cos(j));
		objectVertices.push(0.88* Math.sin(j));
	}
	
	var bugOrigin = Math.floor(Math.random()*360);
	let nest = new bugNest(bugOrigin);
	
	objectVertices.push(nest.nestX);
	objectVertices.push(nest.nestY);
	
	//trying to figure out the bug goal
	let nest2 = new bugNest(bugOrigin+90.0);
	
	objectVertices.push(nest2.nestX);
	objectVertices.push(nest2.nestY);
	
	var vertexBufferObject = gl.createBuffer();
	
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObject);
	
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(objectVertices), gl.STATIC_DRAW);
	
	var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
	gl.vertexAttribPointer(
		positionAttribLocation, 
		2, 
		gl.FLOAT, 
		gl.FALSE, 
		2*Float32Array.BYTES_PER_ELEMENT, 
		0*Float32Array.BYTES_PER_ELEMENT
		);
	gl.enableVertexAttribArray(positionAttribLocation);

	gl.useProgram(program);
	
	var loop = function(){
		gl.clearColor(227.0/255, 227.0/255, 1.0, 0.9);
		gl.clear(gl.COLOR_BUFFER_BIT);	
		
		//draws the border of the peitry dish
		gl.uniform4f(fragColorLocation, 160.0/255, 160.0/255, 232.0/255, 1.0); //////TANNER, IT IS THIS FUNCT THAT CHANGES COLORS, THE RGBA VALUES ARE DIVIDED BY 255 TO GET THE VALUE BETWEEN 1 AND 0
		
		gl.drawArrays(gl.TRIANGLE_FAN,0,362);
		
		//draws the playing field
		gl.uniform4f(fragColorLocation, 225.0/255, 240.0/255, 255.0/255, 1.0);
		gl.drawArrays(gl.TRIANGLE_FAN, 362,362);
		
		//draws the bug nest and the goal to protect from
		gl.uniform4f(fragColorLocation, 255.0/255, 0.0/255, 0.0/255, 1.0);
		
		//bug origin
		gl.drawArrays(gl.POINTS, 724, 1);
		
		gl.uniform4f(fragColorLocation, 255.0/255, 255.0/255, 0.0/255, 1.0);
		
		gl.drawArrays(gl.POINTS, 726, 1);
		//goal
	};
	requestAnimationFrame(loop);
	
	
};

