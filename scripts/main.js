// various game objects
class bug{
		constructor(goalEnd){
			this.arcLocation= goalEnd +10+Math.floor(Math.random()*310);
			this.x = 0.87* Math.cos(this.arcLocation*Math.PI/180);
			this.y = 0.87* Math.sin(this.arcLocation*Math.PI/180);
			this.r = Math.random();
			this.g = Math.random();
			this.b = Math.random();
			switch(Math.floor(Math.random()*3)) {
			  case 0:
				this.r =1.0;
				break;
			  case 1:
				this.g =1.0;
				break;
			  case 2:
				this.b =1.0;
			}
			this.growthFactor
		}
		//grow()
}
class bugGoal{
		constructor(){
			this.start = Math.floor(Math.random()*360);
			this.startX =0.88* Math.cos(this.start*Math.PI/180);
			this.startY =0.88* Math.sin(this.start*Math.PI/180);
			this.end = 30 + this.start;
			
			this.endX =0.88* Math.cos(this.end*Math.PI/180);
			this.endY =0.88* Math.sin(this.end*Math.PI/180);
		}
		
}
	//Creates the C equivalent code in an array of strings
var vertexShaderText = [
'precision mediump float;',

'attribute vec2 vertPosition;',
'uniform mat2 scaling;',

'void main()',
'{',
'vertPosition;',
'	gl_Position =  vec4((scaling *vertPosition), 0.0, 1.0);',
'	gl_PointSize = 10.0;',
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
	
	var canvas, gl, program;
	
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
	
	//creates the program
	program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	gl.useProgram(program);
	
	
	
	//////////////
	
	var fragColorLocation = gl.getUniformLocation(program, "fragColor");
	if(!gl.getProgramParameter(program, gl.LINK_STATUS)){
		console.error('Error linking program', gl.getProgramInfo(program));
		return;
	}
	
	//outter circle
	var objectVertices = [0,0];
	for(var i = 0.0; i<=360; i+=1){
		var j = i * Math.PI / 180;
		objectVertices.push(0.9* Math.cos(j));
		objectVertices.push(0.9* Math.sin(j));
	}
	
	//inner circle
	objectVertices.push(0,0);
	for(var i = 0.0; i<=360; i+=1){
		var j = i * Math.PI / 180;
		objectVertices.push(0.88* Math.cos(j));
		objectVertices.push(0.88* Math.sin(j));
	}
	
	//creates the goal for the bugs
	let goal = new bugGoal();
	
	console.log("goal coordinates  start at at "+ goal.start+" "+goal.startX +" end " +goal.end+" " + goal.endY +"\n");
	for(var i = goal.start; i<=goal.end; i++){
		var j = i * Math.PI / 180;
		objectVertices.push(0.88* Math.cos(j));
		objectVertices.push(0.88* Math.sin(j));
		objectVertices.push(0.89* Math.cos(j));
		objectVertices.push(0.89* Math.sin(j));
	}
	
	console.log(" and end at "+ (objectVertices.length/2)+"\n");
	
	
	//TODO create bugs to expand
	var bugList = [];
	for(var i =0; i < 10; i++){
		bugList.push(new bug(goal.end));
		console.log(bugList[i].x + " " + bugList[i].y);
		objectVertices.push(bugList[i].x);
		objectVertices.push(bugList[i].y);
		for(var ci = 0.0; ci<=360; ci++){
		var j = ci * Math.PI / 180;
			objectVertices.push(0.01* Math.cos(j) + bugList[i].x);
			objectVertices.push(0.01* Math.sin(j) + bugList[i].y);
		}
	}
	
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
	
	var bugScaling = new Float32Array([ 
	1.0, 0.0, 
	0.0, 1.0
	]);
	var pietryScaling = new Float32Array([ 
	1.0, 0.0, 
	0.0, 1.0
	]);
	
	var scalingUniformLocation = gl.getUniformLocation(program, 'scaling');
	
	/////drawing
	
	
	var loop = function(){
		
		// clear the scene
		gl.clearColor(227.0/255, 227.0/255, 1.0, 0.9);
		gl.clear(gl.COLOR_BUFFER_BIT);	
		
		//draws the border of the peitry dish
		
		gl.uniformMatrix2fv(scalingUniformLocation, false, pietryScaling);
		gl.uniform4f(fragColorLocation, 160.0/255, 160.0/255, 232.0/255, 1.0);
		
		gl.drawArrays(gl.TRIANGLE_FAN,0,362);
		
		//draws the playing field
		gl.uniform4f(fragColorLocation, 225.0/255, 240.0/255, 255.0/255, 1.0);
		gl.drawArrays(gl.TRIANGLE_FAN, 362,362);
		
		//draws the bug  and the goal to protect from
		
		//bug goal
		gl.uniform4f(fragColorLocation, 255.0/255, 0.0/255, 0.0/255, 1.0);
		gl.drawArrays(gl.TRIANGLE_STRIP, 724, 62 );
		
		bugScaling[0]=bugScaling[0]+0.001;
		bugScaling[3]=bugScaling[3]+0.001;
		gl.uniformMatrix2fv(scalingUniformLocation, false, bugScaling);
		
		//drawing bugs
		for(var i =0; i<bugList.length; i++){
			gl.uniform4f(fragColorLocation, bugList[i].r, bugList[i].g, bugList[i].b, 1.0);
			gl.drawArrays(gl.TRIANGLE_FAN, 786+(i*362), 362 );
			gl.uniform4f(fragColorLocation, 0.0, 0.0,0.0, 1.0);
			gl.drawArrays(gl.LINE_LOOP, 786+(i*362 +1), 361 );
		}
		requestAnimationFrame(loop);
		//translate the points  (EXTRA: making sure that they dont leave the petrie dish
	};
	requestAnimationFrame(loop);
	
	
};

//function draw()

