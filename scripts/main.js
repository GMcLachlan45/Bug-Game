// various game objects
class bugNest{
		constructor(perimeterLocation){
			this.nestX = 0.88* Math.cos(perimeterLocation*Math.PI/180);
			this.nestY = 0.88* Math.sin(perimeterLocation*Math.PI/180);
		}
		
}
class bugGoal{
		constructor(perimeterStart=0){
			this.start = perimeterStart;
			this.end = 30 + perimeterStart;
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
	
	var canvas, gl, program;
var Initialize = function() {
	//Initializes the webGL stuff
	canvas = document.getElementById("glCanvas");
	gl = canvas.getContext("webgl");
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
	program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);

	gl.linkProgram(program);
	//////////////
	
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
	
	console.log("nest coordinates at "+ (objectVertices.length/2)+"\n");
	objectVertices.push(nest.nestX);
	objectVertices.push(nest.nestY);
	
	console.log("goal coordinates  start at at "+ (objectVertices.length/2)+"\n");
	//trying to figure out the bug goal
	var bugNestSt =bugOrigin+ 90+ Math.floor(Math.random()*150);
	
	console.log(bugNestSt+"\n");
	let goal = new bugGoal(bugNestSt);
	
	console.log("goal coordinates  start at at "+ goal.start+" end " +goal.end+"\n");
	for(var i = goal.start; i<=goal.end; i+=1){
		var j = i * Math.PI / 180;
		objectVertices.push(0.88* Math.cos(j));
		objectVertices.push(0.88* Math.sin(j));
	}
	
	console.log(" and end at "+ (objectVertices.length/2)+"\n");
	
	
	//TODO create bugs to move
	
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
	
	
	
	/////drawing
	
	
	var loop = function(){
		gl.clearColor(227.0/255, 227.0/255, 1.0, 0.9);
		gl.clear(gl.COLOR_BUFFER_BIT);	
		
		//draws the border of the peitry dish
		gl.uniform4f(fragColorLocation, 160.0/255, 160.0/255, 232.0/255, 1.0);
		
		gl.drawArrays(gl.TRIANGLE_FAN,0,362);
		
		//draws the playing field
		gl.uniform4f(fragColorLocation, 225.0/255, 240.0/255, 255.0/255, 1.0);
		gl.drawArrays(gl.TRIANGLE_FAN, 362,362);
		
		//draws the bug nest and the goal to protect from
		
		//bug origin
		gl.uniform4f(fragColorLocation, 255.0/255, 0.0/255, 0.0/255, 1.0);
		gl.drawArrays(gl.POINTS, 724, 1);
		
		//bug goal
		gl.uniform4f(fragColorLocation, 255.0/255, 255.0/255, 0.0/255, 1.0);
		gl.drawArrays(gl.POINTS, 725, 31 );
	};
	requestAnimationFrame(loop);
	
	
};

