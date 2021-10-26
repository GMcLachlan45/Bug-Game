// various game objects
const { vec2, vec3, mat3, mat4 } = glMatrix;
	var canvas;
	var poisonList = [];
	var gameOn = false;
	var bugGrowthValue = 0.012;
class bug{
		constructor(goalEnd, x, y, isBug){
			this.isDead=false;
			this.isDying=false;
			this.isExploding=false;
			this.radius = 0.01;
			this.isBug = isBug;
			if(isBug){
				var arcLocation= goalEnd +Math.floor(Math.random()*330);
				this.x = 0.87* Math.cos(arcLocation*Math.PI/180);
				this.y = 0.87* Math.sin(arcLocation*Math.PI/180);
				this.r = Math.random(); //randomize the RGB values
				this.g = Math.random();
				this.b = Math.random();
				this.a = 1.0;
				switch(Math.floor(Math.random()*3)) { //to make more appealing colors
				  case 0:
					this.r =1.0;
					break;
				  case 1:
					this.g =1.0;
					break;
				  case 2:
					this.b =1.0;
				}
				this.growthFactor= 1.0 + Math.random()*0.3;
				this.growthIncrement= Math.random()*bugGrowthValue +0.005;
			}else{
				this.x = x;
				this.y = y;
				this.r = 55.0/255.0 * Math.random();
				this.g = (Math.random()*155.0+100.0)/255.0;
				this.b = 70.0/255.0*Math.random();
				this.a= 1.0;
				this.growthFactor= 1.0;
				this.growthIncrement = 0.02;
			}
		}
	checkPoisoned(poisonedBug){
		if(Math.sqrt(Math.pow(this.x-poisonedBug.x, 2) + Math.pow(this.y-poisonedBug.y, 2)) < this.radius*this.growthFactor+poisonedBug.radius*poisonedBug.growthFactor){
			poisonedBug.isDying = true;
		}
	}
	checkContains(smallerBug){
		if(!smallerBug.isDying && 
		   Math.sqrt(Math.pow(this.x-smallerBug.x, 2) + Math.pow(this.y-smallerBug.y, 2))+smallerBug.radius*smallerBug.growthFactor 
		   <=this.radius*this.growthFactor){
			  
			this.r = (this.r + smallerBug.r)/2.0;
			this.g = (this.g + smallerBug.g)/2.0;
			this.b = (this.b + smallerBug.b)/2.0;
			smallerBug.isDead=true;
		   }
	}
}
class bugGoal{
		constructor(){
			this.start = Math.floor(Math.random()*360);
			this.startX =0.88* Math.cos(this.start*Math.PI/180);
			this.startY =0.88* Math.sin(this.start*Math.PI/180);
			this.end = 30 + this.start;
			
			this.endX =0.88* Math.cos(this.end*Math.PI/180);
			this.endY =0.88* Math.sin(this.end*Math.PI/180);
			this.bugCount = 0;
			this.bug1=-1;
		}
	checkLose(bug, bugNum){
		if( bugNum!= this.bug1 && 
		(Math.sqrt( Math.pow(this.startX- bug.x, 2) + Math.pow(this.startY -bug.y, 2) )<bug.radius*bug.growthFactor ||
		Math.sqrt( Math.pow(this.endX- bug.x, 2) + Math.pow(this.endY -bug.y, 2) )<bug.radius*bug.growthFactor )
			){
			   this.bugCount++;
			   console.log("Breach! "+ bugNum);
			   if(this.bug1==-1)
				   this.bug1=bugNum;
		   }
	}		
}


	

	//Creates the C equivalent code in an array of strings
var vertexShaderText = [
'precision mediump float;',

'attribute vec3 vertPosition;',
'uniform mat4 vertexTransformations;',
'uniform mat4 world;',
'uniform mat4 view;',
'uniform mat4 proj;',
'void main()',
'{',
'vertPosition;',
'	mat4 mvp = proj*view*world;',
'	gl_Position =  mvp*vec4(vertPosition, 1.0);',
'	gl_PointSize = 5.0;',
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
	
window.onload = function main(){
	
	console.log("uhh");
	
}

	

var newGame = function init(){
	gameOn=true;
	//Initializes the webGL stuff
	canvas = document.getElementById("glCanvas");
	var gl = canvas.getContext("webgl");
	if (!gl){
		console.log("Base webgl not supported. Trying Experimental");
		gl = canvas.getContext("experimental-webgl");
	}
	if(!gl){
		alert("Your browser doesn't support webGL");
	}
	canvas.width = window.innerHeight*0.98;
	canvas.height = window.innerHeight*0.98;
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
	var program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	gl.useProgram(program);
	gl.enable(gl.DEPTH_TEST);
	
	
	
	//////////////
	
	var fragColorLocation = gl.getUniformLocation(program, "fragColor");
	if(!gl.getProgramParameter(program, gl.LINK_STATUS)){
		console.error('Error linking program', gl.getProgramInfo(program));
		return;
	}
	var objectVertices = [];
	
	for(let theta = 0; theta <=360; theta+=12){
		var toRad = Math.PI/180;
		for(let phi = 0; phi <=180; phi+=6){
			objectVertices.push(0.7* Math.sin(toRad*theta)*Math.cos(toRad*phi) );
			objectVertices.push(0.7* Math.sin(toRad*theta)*Math.sin(toRad*phi) );
			objectVertices.push(0.7* Math.cos(toRad*theta) );
		}
	}
	console.log(objectVertices.length/3);
	
	var vertexBufferObject = gl.createBuffer();
	
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObject);
	
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(objectVertices), gl.STATIC_DRAW);
	
	
	
	var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
	gl.vertexAttribPointer(
		positionAttribLocation, 
		3, 
		gl.FLOAT, 
		gl.FALSE, 
		3*Float32Array.BYTES_PER_ELEMENT, 
		0*Float32Array.BYTES_PER_ELEMENT
		);
	gl.enableVertexAttribArray(positionAttribLocation);
	
	var worldUniformLocation = gl.getUniformLocation(program, 'world');
	var viewUniformLocation = gl.getUniformLocation(program, 'view');
	var projUniformLocation = gl.getUniformLocation(program, 'proj');
	
	/////drawing
	var identityMatrix = new Float32Array([1.0, 0.0, 0.0, 0.0,
										   0.0, 1.0, 0.0,0.0,
										   0.0, 0.0, 1.0,0.0,
										   0.0, 0.0, 0.0, 1.0]);
	var world = new Float32Array(16);
	mat4.identity(world);
	//var rot = new Float32Array(16);
	//var trans = new Float32Array(16);
	//mat4.identity(rot);
	//mat4.identity(trans);
	//var x = -2;
	//var angle = glMatrix.glMatrix.toRadian(45);
	//mat4.fromRotation(rot,angle,[0,0,1]);
	//mat4.fromTranslation(trans,[x,0,0]);
	//mat4.multiply(world,trans,rot);

	var view = new Float32Array(16);
	mat4.lookAt(view, [0,0,8], [0,0,1],[0,1,0])

	var proj = new Float32Array(16);
	mat4.perspective(proj,glMatrix.glMatrix.toRadian(45),canvas.width/canvas.height,0.1,100);

	gl.uniformMatrix4fv(worldUniformLocation, false, world);
	gl.uniformMatrix4fv(viewUniformLocation, false, view);
	gl.uniformMatrix4fv(projUniformLocation, false, proj);
	
		////////stole
	var angle = 0;
	var rotz = new Float32Array(16);
	var rotx = new Float32Array(16);
	
	mat4.identity(rotx);
	mat4.identity(rotx);
	
	////////////end stole
	
	var loop = function(){
		win = true;
		//resizes the viewport
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		
		/////////stolen
		angle = performance.now() / 1000;
		mat4.fromRotation(rotx,angle,[1,0,0]);
		mat4.fromRotation(rotz,angle,[0,0,1]);
		mat4.multiply(world,rotz,rotx);
		
		//////////endstolen
		
		gl.uniformMatrix4fv(worldUniformLocation, false, world);
		gl.viewport(0,0,canvas.width,canvas.height);
		
		// clear the scene
		gl.clearColor(1.0/255, 1.0/255, 255.0/255, 1.0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
			
		gl.uniform4f(fragColorLocation, 1.0,1.0,1.0,1.0);
		gl.drawArrays(gl.LINE_LOOP, 0, 961);

		requestAnimationFrame(loop);
	};
	requestAnimationFrame(loop);
	
	
	poisonList = [];
	gameOn=false;
//}


};

function getMousePosition(canvas, event) {
	let rect = canvas.getBoundingClientRect();
	let x = 2.0*((event.clientX - rect.left)/canvas.width)-1.0;
	let y = (2.0*((event.clientY - rect.top)/canvas.height)-1.0)*-1;
	if(poisonList.length < 20 && Math.sqrt(Math.pow(x,2)+Math.pow(y,2))<0.88)
		poisonList.push(new bug(0,x, y, false));
}

//sets up the option menu

let canvasElem = document.getElementById("glCanvas");
let playButton = document.getElementById("playButton");
let diffSlider = document.getElementById("difficultySlider");

canvasElem.addEventListener("mousedown", function(e){
	getMousePosition(canvasElem, e);
});

playButton.addEventListener("click", function(f){
	console.log("GameOn");
	newGame();
});

diffSlider.addEventListener("change", function(g){
	bugGrowthValue = event.srcElement.value/1000.0;
	console.log("Bug incremented!"  + event.srcElement.value);
});