// various game objects
const { vec2, vec3, mat3, mat4 } = glMatrix;
	var canvas;
	var poisonList = [];
	var gameOn = false;
	var bugGrowthValue = 2.5;
class bug{
		constructor(goalEnd, x, y, isBug){
			this.isDead=false;
			this.isDying=false;
			this.isExploding=false;
			this.radius = 0.01;
			this.isBug = isBug;
			if(isBug){
				var arcLocation= goalEnd +Math.floor(Math.random()*330);
				
			this.lat = Math.random()*Math.PI*2.0;
			this.lon = Math.random()*Math.PI*2.0;
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
				this.growthFactor= 1.0 + Math.random();
				this.growthIncrement= Math.random()*bugGrowthValue +0.5;
			}else{
				
			this.lat = Math.random()*Math.PI*2.0;
			this.lon = Math.random()*Math.PI*2.0;
			
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
			this.lat = Math.random()*Math.PI*2.0;
			this.lon = Math.random()*Math.PI*2.0;
			this.rotation = Math.random()*Math.PI;
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


	
var tr = 0;
var bruh = true;
var stop = false;
	//Creates the C equivalent code in an array of strings
var vertexShaderText = [
'precision mediump float;',

'attribute vec3 vertPosition;',
'uniform mat4 vertexTransformation;',

'uniform mat4 world;',
'uniform mat4 view;',
'uniform mat4 proj;',
'',
'uniform float projecting;',
'uniform float radius;',
'void main()',
'{',
'vertPosition;',
'	mat4 mvp = proj*view*world;',
'	if(projecting<0.5)',
'		gl_Position =  mvp*vertexTransformation*vec4(vertPosition, 1.0);',
'	else',
'		gl_Position =  mvp*vertexTransformation* vec4(cos(vertPosition.x)*sin(vertPosition.y*vertPosition.z*radius),sin(vertPosition.x)*sin(vertPosition.y*vertPosition.z*radius),cos(vertPosition.y*vertPosition.z*radius), 1.0);',
'	gl_PointSize = 50.0;',
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
	
	
	
	
	
	var objectVertices = [];
	var divisions = 40;
	var toRad = Math.PI/180;
	for(let theta = 0; theta <=360; theta+=360/divisions){
		for(let phi = 0; phi <=180; phi+=180/divisions){
			var x = 0.99*Math.sin(toRad*phi)*Math.cos(toRad*theta);
			var y = 0.99*Math.sin(toRad*phi)*Math.sin(toRad*theta);
			var z = 0.99*Math.cos(toRad*phi);
			objectVertices.push( x,y,z );
			
		}
	}
	var indices =[];
	for(let j = 0; j<divisions; j++){
		for(let i = 0; i<=divisions; i++){
			var point1 = j*(divisions+1)+i;
			var point2 = point1+ (divisions+1);
			indices.push(point1, point2);
		}
	}
	
	var vertBeforeGoal = objectVertices.length/3; //gets the point number in objvert. Add to whatever needs to be done
	var spherePoints = indices.length;//gets the number of points to draw for the sphere doubles as the offset for start of goal
	console.log(indices.length);
	
	
	///////////////Creating bug goalEnd
	var goal = new bugGoal();
	console.log("" + goal.lon+ " " + goal.lat);
	var count = 0;
	
	for(let j = -15; j<=15; j+=5){
		for(let i = 75; i<105; i+=5){
		objectVertices.push(toRad*(j), toRad*(i), 1.0,
							toRad*(j+5), toRad*(i), 1.0,
		);
		}
	}
		for(var count = 0; count<49; count++){
			indices.push(count+vertBeforeGoal);
		}
		console.log(indices);
	var goalTransMatrix = goalTransforms(goal.lon, goal.lon, goal.rotation);
	
	var vertBeforeBugs = objectVertices.length/3; //gets the point number in objvert. Add to whatever needs to be done for bug
	var goalPoints = indices.length-spherePoints; //gets the number of points to draw for the goal. spherePoints+goalPoints doubles as offset for start of bugs
	
	
	/////////////////////////
	var pl = 0.01*Math.PI/180;// this is starting rad longitude for some reason
		for(var sec = 0.00; sec<=1.0; sec+=1.0/divisions){
			console.log(objectVertices.length/3);
			for(var i = 0; i<=360; i+=360/divisions){
				objectVertices.push(i*toRad, pl, sec);
			}
		}	
	for(let j = 0; j<divisions; j++){
		for(let i = 0; i<=divisions; i++){
			var point1 = vertBeforeBugs+ j*(divisions+1)+i;
			var point2 = point1+ (divisions+1);
			indices.push(point1, point2);
		}
	}
	
	var bugPoints = indices.length-spherePoints-goalPoints; ///lastPoints
	var bugList = [];
	for(var i = 0; i <10; i++){
		bugList.push(new bug(0, 0, 0, true));
	}
	console.log(bugList.length);	
		
		
	///////GET THE LOCATION TO CHANGE TO PROJECTING ON THE SPHERE. X>0.5 MEANS IT'S ON SPHERE, X<0.5 MEANS WE JUST DRAW NORMALLY
	var sphereProjectionLocation = gl.getUniformLocation(program, 'projecting');
	///////GET THE LOCATION FOR HOW LARGE THE BUG HAS GOTTEN
	var bugRadLocation = gl.getUniformLocation(program, 'radius');
	
	///////OBTAIN THE LOCATION IN THE FRAGMENT SHADER TO FIND OUT WHERE COLOR IS///////////////
	var fragColorLocation = gl.getUniformLocation(program, "fragColor");
	if(!gl.getProgramParameter(program, gl.LINK_STATUS)){
		console.error('Error linking program', gl.getProgramInfo(program));
		return;
	}
	////////////////////////////////////////////////////////////////////////////////////////////
	
	var vertexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(objectVertices), gl.STATIC_DRAW);
	
	// Create and store data into index buffer
    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
	
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
	
	
	//////////SETS UP FOR THE WORLD-VIEW-PROJECTION MATRIX OPERATIONS/////////
	var worldUniformLocation = gl.getUniformLocation(program, 'world');
	var viewUniformLocation = gl.getUniformLocation(program, 'view');
	var projUniformLocation = gl.getUniformLocation(program, 'proj');


	/////drawing
	//initializes the canvas to fill its space
	
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	//SETS THE WORLD SO THAT IT'S NORMAL, 1-1. DON'T NEED TO WORRY ABOUT IT ANYMORE
	var world = new Float32Array(16);
	mat4.identity(world);
	
	///SETS THE CAMERA, WILL NEED TO CHANGE IN LOOP IF WE WANNA SPIN AROUND
	var view = new Float32Array(16);
	mat4.lookAt(view, [0,0,3]/*POINT IN SPACE WHERE THE EYE IS*/, 
				[0,0,0]/*POINT WE'RE LOOKING AT*/, 
				[0,1,0]);//up
				

	/////SETS THE PROJECTION, SO THAT WE HAVE 
	var proj = new Float32Array(16);
	mat4.perspective(proj, glMatrix.glMatrix.toRadian(45),//FIELD OF VIEW
					 canvas.width/canvas.height,/*ASPECT RATIO*/
					 0.1/*NEAR*/,100/*FAR*/);
	
	
	///GETS THE LOCATION WHERE WE'LL USE TO ROTATE INDIVIDUAL BUGS
	var trans = new Float32Array(16);
	var transformationUniformLocation = gl.getUniformLocation(program, 'vertexTransformation');
	mat4.identity(trans);
	
	gl.uniformMatrix4fv(transformationUniformLocation, false, trans);
	gl.uniformMatrix4fv(worldUniformLocation, false, world);
	gl.uniformMatrix4fv(viewUniformLocation, false, view);
	gl.uniformMatrix4fv(projUniformLocation, false, proj);
	
		////////stole STOLEN CODE TO ROTATE THE CAMERA
	var angle = 0;
	var rotz = new Float32Array(16);
	var iden = new Float32Array(16);
	
	mat4.identity(rotz);
	mat4.identity(iden);
	
	////////////end stole
	
	var win = false; var lose = false;
	var loop = function(){
		//resizes the viewport
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		
		gl.uniformMatrix4fv(transformationUniformLocation, false, iden);
		
		/////////stolen
		angle = -1*performance.now() / 5000;
		mat4.fromRotation(rotz,angle,[0,1,0]);
		mat4.multiply(world,rotz,iden);
		//////////endstolen
		
		gl.uniformMatrix4fv(worldUniformLocation, false, world);
		gl.viewport(0,0,canvas.width,canvas.height);
		
		// clear the scene
		gl.clearColor(225.0/255, 240.0/255, 255.0/255, 1.0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		//

		//////////////DRAW SPHERE
		gl.uniform1f(sphereProjectionLocation, 0.0);//sets to normal drawing		
		gl.uniform4f(fragColorLocation, 1.0,1.0,1.0,1.0);
		if(bruh)
			gl.drawElements(gl.TRIANGLE_STRIP, spherePoints, gl.UNSIGNED_SHORT, 0); //Draws the sphere
		
		gl.uniform4f(fragColorLocation, 0.0,0.0,0.0, 1.0);
		gl.drawElements(gl.LINE_STRIP, spherePoints, gl.UNSIGNED_SHORT, 0); //Draws the mesh
		//////////////////END DRAW SPHERE
		
		gl.uniform1f(sphereProjectionLocation, 1.0);// Changes to drawing on the surface of the sphere
		//DRAW GOAL/////////////////
		
		
		
		
		///DRAW BUGS
		for(var i = 0; i< bugList.length; i++){
			
			gl.uniform4f(fragColorLocation, bugList[i].r,bugList[i].g,bugList[i].b,1);// makes the circle red so we can see it.
			
			gl.uniformMatrix4fv(transformationUniformLocation, false, bugTransforms(bugList[i].lat, bugList[i].lon, i));
			gl.uniform1f(bugRadLocation, bugList[i].radius);//increases the bug's radius	
			
			gl.drawElements(gl.TRIANGLE_STRIP, bugPoints, gl.UNSIGNED_SHORT, (goalPoints+spherePoints)*2);
			bugList[i].radius+=bugList[i].growthIncrement;
		}
	/////////////////////DRAW GOAL/////////////////
	gl.uniform1f(bugRadLocation, 1);
	gl.uniform4f(fragColorLocation, 0,0,1,1);
	gl.uniformMatrix4fv(transformationUniformLocation, false, goalTransMatrix);//used to rotate the goal to where it needs to be
	gl.drawElements(gl.TRIANGLE_STRIP, goalPoints, gl.UNSIGNED_SHORT, spherePoints*2)
	/////////////////////END DRAW GOAL/////////////
		if(win){
			console.log("You win!");
		}else if(lose){
			console.log("You Lose...");s
		}
		else 
			requestAnimationFrame(loop);
	};
	requestAnimationFrame(loop);
	
	
	poisonList = [];
	gameOn=false;
//}


};

function bugTransforms(lat, lon, num){
	
	var finalTransformMatrix = new Float32Array(16);
	mat4.identity(finalTransformMatrix);
	mat4.scale(finalTransformMatrix, finalTransformMatrix, [1.0+num/500, 1.0+num/500, 1.0+num/500]);
	mat4.rotateZ(finalTransformMatrix, finalTransformMatrix, lat); //rotates the patch to the proper latitude
	mat4.rotateY(finalTransformMatrix, finalTransformMatrix, lon); //rotates the patch to the proper longitude

	return finalTransformMatrix;
}

function goalTransforms(lat, lon, rot){
	var finalTransformMatrix = new Float32Array(16);
	mat4.fromXRotation(finalTransformMatrix, rot);//creates the oriented matrix, properly rotated so the patch is cool
	mat4.rotateZ(finalTransformMatrix, finalTransformMatrix, lat); //rotates the patch to the proper latitude
	mat4.rotateY(finalTransformMatrix, finalTransformMatrix, lon); //rotates the patch to the proper longitude
	
	return finalTransformMatrix;	
}

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

let bruhButton = document.getElementById("bruhButton");
canvasElem.addEventListener("mousedown", function(e){
	tr+=16;
	if(bruh)
		bruh = false;
	else
		bruh = true;
	console.log(tr);
	getMousePosition(canvasElem, e);
});

playButton.addEventListener("click", function(f){
	console.log("GameOn");
	//if(!gameOn)
		newGame();
});


diffSlider.addEventListener("change", function(g){
	bugGrowthValue = event.srcElement.value/100.0;
	console.log("Bug incremented!"  + event.srcElement.value);
});