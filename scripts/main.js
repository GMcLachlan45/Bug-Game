// various game objects
const { vec2, vec3, mat3, mat4 } = glMatrix;
	var canvas;
	var poisonList = [];
	var gameOn = false;
	var bugGrowthValue = 1*Math.PI/180.0;
	var translu = false;
	var stop = true;
	var camLat =-0;
	var camLon = -0;
	var win = false;
class bug{
		constructor(goalLat,goalLon, x, y, isBug){
			this.isDead=false;
			this.isDying=false;
			this.isExploding=false;
			this.radius = 0.01;
			this.isBug = isBug;
			if(isBug){				
				this.lat =Math.random()*Math.PI;//Math.random()*Math.PI*2.0;
					this.lon =Math.random()*Math.PI;
				
				
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
				this.growthIncrement= bugGrowthValue +0.5;
			}else{
				this.lat = Math.random()*Math.PI ;
				this.lon = Math.random()*Math.PI*2.0;
				
			
				this.r = 55.0/255.0 * Math.random();
				this.g = (Math.random()*155.0+100.0)/255.0;
				this.b = 70.0/255.0*Math.random();
				this.a= 1.0;
				this.growthIncrement = bugGrowthValue;
			}
		}
	checkPoisoned(poisonedBug){
		//calculates distance between points using haversine shit
		
		var dlat = poisonedBug.lat -this.lat;
		var dlon = poisonedBug.lon - this.lon;

		var a = (Math.pow(Math.sin(dlat/2.0) ,2) + Math.cos(this.lat)*Math.cos(poisonedBug.lat)* Math.pow(Math.sin(dlon/2.0) ,2));
		var bugCenterDifference =  2*Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
		
		var bothRadiusLength = this.radius+poisonedBug.radius;
		console.log(""+bugCenterDifference+" "+bothRadiusLength);
		
		if(bugCenterDifference<bothRadiusLength){
			win = true;//poisonedBug.isDying = true;
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


	var raf = 3;
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
	canvas.width = window.innerWidth*0.98;
	canvas.height = window.innerWidth*0.98*9.0/16.0;
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
	var divisions = 190;
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
	//console.log(indices.length);
	
	
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
	var goalTransMatrix = goalTransforms(goal.lon, goal.lon, goal.rotation);
	
	var vertBeforeBugs = objectVertices.length/3; //gets the point number in objvert. Add to whatever needs to be done for bug
	var goalPoints = indices.length-spherePoints; //gets the number of points to draw for the goal. spherePoints+goalPoints doubles as offset for start of bugs
	
	
	/////////////////////////
	var startingRad = 1;//that is one degree	;// this is starting rad longitude for some reason
		for(var seg = 0.00; seg<=1.0; seg+=1.0/divisions){ //divide each bitch into segments
			//console.log(objectVertices.length/3);
			for(var i = 0; i<=360; i+=360/divisions){
				objectVertices.push(i*toRad, startingRad, seg);
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
	for(var i = 0; i <1; i++){
		bugList.push(new bug(goal.lat, goal.lon, 0, 0, true));
		console.log("Bug " + +1+": "+bugList[i].lon+ ", " + bugList[i].lat);
	}
	//console.log(bugList.length);
	
	var axis = objectVertices.length/3;
	objectVertices.push(-2,0,0,2,0,0,0,-2,0,0,2,0,0,0,-2,0,0,2 , -3,0,-3,3,0,3);
		
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
		canvas.height = window.innerWidth*9.0/16.0;
	//SETS THE WORLD SO THAT IT'S NORMAL, 1-1. DON'T NEED TO WORRY ABOUT IT ANYMORE
	var world = new Float32Array(16);
	mat4.identity(world);
	
	///SETS THE CAMERA, WILL NEED TO CHANGE IN LOOP IF WE WANNA SPIN AROUND
	var view = new Float32Array(16);
	//todo fix camera
	mat4.lookAt(view, [raf*Math.sin(camLat*toRad)*Math.cos(camLon*toRad),raf*Math.sin(camLat*toRad)*Math.cos(camLon*toRad),raf*Math.cos(camLat*toRad)]/*POINT IN SPACE WHERE THE EYE IS*/, 
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
	
	/////////////end stole
	 var lose = false;
	var loop = function(){
		//win = true;
		//resizes the viewport
		canvas.width = window.innerWidth;
		canvas.height = window.innerWidth*9.0/16.0;
		
		
		mat4.lookAt(view, [0,0,3]/*POINT IN SPACE WHERE THE EYE IS*/, 
				[0,0,0]/*POINT WE'RE LOOKING AT*/, 
				[0,Math.abs(Math.cos(camLat)),0]);//up
				//console.log(camLat);		
		gl.uniformMatrix4fv(viewUniformLocation, false, view);
		
		gl.uniformMatrix4fv(transformationUniformLocation, false, iden);
		
		
		
		mat4.multiply(world, camTransforms(camLat, camLon), iden);// gets proper camera Location
		//console.log(camLat, +" "+ camLon);
		
		gl.uniformMatrix4fv(worldUniformLocation, false, world);
		gl.viewport(0,0,canvas.width,canvas.height);
		
		// clear the scene
		gl.clearColor(225.0/255, 240.0/255, 255.0/255, 1.0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		//

		//////////////DRAW SPHERE
		gl.uniform1f(sphereProjectionLocation, 0.0);//sets to normal drawing		
		gl.uniform4f(fragColorLocation, 1.0,1.0,1.0,1.0);
		if(!translu)
			gl.drawElements(gl.TRIANGLE_STRIP, spherePoints, gl.UNSIGNED_SHORT, 0); //Draws the sphere
		
		gl.uniform4f(fragColorLocation, 0.0,0.0,0.0, 1.0);
		gl.drawElements(gl.LINE_STRIP, spherePoints, gl.UNSIGNED_SHORT, 0); //Draws the mesh
		//////////////////END DRAW SPHERE
		
		gl.uniform4f(fragColorLocation, 1,0,0,1);
		gl.drawArrays(gl.LINES, axis, 2);
		gl.drawArrays(gl.POINT, axis+1, 1);
		gl.uniform4f(fragColorLocation, 0,1,0,1);
		gl.drawArrays(gl.LINES, axis+2, 2);
		gl.drawArrays(gl.POINT, axis+3, 1);
		gl.uniform4f(fragColorLocation, 0,0,1,1);
		gl.drawArrays(gl.LINES, axis+4, 2);
		
		gl.drawArrays(gl.POINT, axis+5, 1);
		
		
					
					gl.uniformMatrix4fv(transformationUniformLocation, false, bugTransforms(bugList[0].lat, bugList[0].lon, 0));
		gl.uniform4f(fragColorLocation, 0,0.5,0.5,1);
		gl.drawArrays(gl.LINES, axis+4, 2);
		
		gl.drawArrays(gl.POINT, axis+5, 1);
		
		for(var i = 0; i <poisonList.length; i++){
			gl.uniformMatrix4fv(transformationUniformLocation, false, bugTransforms(poisonList[i].lat, poisonList[i].lon, 0));
		gl.uniform4f(fragColorLocation, 0,0.5,0.5,1);
		gl.drawArrays(gl.LINES, axis+4, 2);
		
		gl.drawArrays(gl.POINT, axis+5, 1);
		}
		
		
		gl.uniformMatrix4fv(transformationUniformLocation, false, iden);
		
		gl.uniform1f(sphereProjectionLocation, 1.0);// Changes to drawing on the surface of the sphere
		//DRAW GOAL/////////////////
		
		
		
		
		///DRAW BUGS
		
		for(var i = 0; i< bugList.length; i++){
				
			if(bugList[i].isDead){//CASE, Bug isn't dead
				//win = false;
				continue;
			}else if(bugList[i].isExploding){
					//make explosion
					console.log("eee");
					bugList[i].isDead = true;
				}else {
					//win = false;
					gl.uniform4f(fragColorLocation, bugList[i].r,bugList[i].g,bugList[i].b,1);// makes the bug its color
					
					gl.uniformMatrix4fv(transformationUniformLocation, false, bugTransforms(bugList[i].lat, bugList[i].lon, i));
					gl.uniform1f(bugRadLocation, bugList[i].radius);//increases the bug's radius	
					if(!translu)
					gl.drawElements(gl.TRIANGLE_STRIP, bugPoints, gl.UNSIGNED_SHORT, (goalPoints+spherePoints)*2);
					
					if(bugList[i].isDying){
					// draw but make shringk
						bugList[i].radius/=1.02;
						if(bugList[i].radius < 1){
							console.log("why");
							bugList[i].isExploding = true;
						}
					}else{
						if(!win)
							bugList[i].radius+=0.1*Math.PI/180;//bugList[i].growthIncrement;
					}
					//console.log("eee");
				}
			//if bug is dead, we don't draw him
		}
		
		
		
		/////////////////////DRAW POISON////////
	
		for(var i = 0; i < poisonList.length; i++){
			gl.uniform4f(fragColorLocation, poisonList[i].r,poisonList[i].g,poisonList[i].b,1);// makes the bug its color
			gl.uniformMatrix4fv(transformationUniformLocation, false, bugTransforms(poisonList[i].lat, poisonList[i].lon, i));
			gl.uniform1f(bugRadLocation, poisonList[i].radius);//increases the bug's radius	
			if(!translu)
			gl.drawElements(gl.TRIANGLE_STRIP, bugPoints, gl.UNSIGNED_SHORT, (goalPoints+spherePoints)*2);
							
			for(var j = 0; j < bugList.length; j++){
				if(bugList[j].isDead||win)
					continue;
				else
					poisonList[i].checkPoisoned(bugList[j]);
			}
			if(!win)
				poisonList[i].radius+=0.1*Math.PI/180;//poisonList[i].growthIncrement;
			
		}
		
		
		////////////END DRAW POISON////////////////
		
		
		
	/////////////////////DRAW GOAL/////////////////
	gl.uniform1f(bugRadLocation, 1);
	gl.uniform4f(fragColorLocation, 0,0,1,1);
	gl.uniformMatrix4fv(transformationUniformLocation, false, goalTransMatrix);//used to rotate the goal to where it needs to be
	//gl.drawElements(gl.TRIANGLE_STRIP, goalPoints, gl.UNSIGNED_SHORT, spherePoints*2)
	/////////////////////END DRAW GOAL/////////////
	
		if(stop/*||/* bugList[0].radius >=3*Math.PI/4*/	){
			console.log( bugList[0].radius +" You win!");
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
	if(num<1)
		num=0;
	var finalTransformMatrix = new Float32Array(16);
	mat4.identity(finalTransformMatrix);
	mat4.scale(finalTransformMatrix, finalTransformMatrix, [1.0+num/2000, 1.0+num/2000, 1.0+num/2000]);
	
	mat4.rotate(finalTransformMatrix, finalTransformMatrix, -lat, [Math.cos(lon), 0, Math.cos(lon)]); //rotates the patch to the proper latitude
	mat4.rotateY(finalTransformMatrix, finalTransformMatrix, lon); //first, rotates the patch to the proper longitude

	return finalTransformMatrix;
}

function camTransforms(lat, lon){
	
	var finalTransformMatrix = new Float32Array(16);
	mat4.identity(finalTransformMatrix);
	
	mat4.rotateX(finalTransformMatrix, finalTransformMatrix, lat); //rotates the patch to the proper latitude
	mat4.rotateY(finalTransformMatrix, finalTransformMatrix, -lon); //first, rotates the patch to the proper longitude

	return finalTransformMatrix;
}

function goalTransforms(lat, lon, rot){
	var finalTransformMatrix = new Float32Array(16);
	mat4.fromXRotation(finalTransformMatrix, rot);//creates the oriented matrix, properly rotated so the patch is cool
	
	mat4.rotate(finalTransformMatrix, finalTransformMatrix, lat, [Math.cos(lon), 0, Math.cos(lon)]); //rotates the patch to the proper latitude
	mat4.rotateY(finalTransformMatrix, finalTransformMatrix, lon); //first, rotates the patch to the proper longitude
	
	return finalTransformMatrix;	
}

function getMousePosition(canvas, event) {
	let rect = canvas.getBoundingClientRect();
	let x = (2.0*((event.clientX - rect.left)/canvas.width)-1.0)*bugGrowthValue;
	let y = ((2.0*((event.clientY - rect.top)/canvas.height)-1.0)*-1)*bugGrowthValue;
	console.log("canvas x: "+x+ " y: "+ y);
	///convert that to a thinkg on the sphere
	/*if(Math.sqrt(Math.pow(x,2)+Math.pow(y,2))<1.0){
		//calculate 
		poisonList.push(new bug(0,0, x, y, false));
		console.log("Poison "+ poisonList.length+ ": "+poisonList[poisonList.length-1].lon+ ", " + poisonList[poisonList.length-1].lat);
	}*/
}

//sets up the option menu

let canvasElem = document.getElementById("glCanvas");
let playButton = document.getElementById("playButton");
let diffSlider = document.getElementById("difficultySlider");

let bruhButton = document.getElementById("bruhButton");
/*canvasElem.addEventListener("mousedown", function(e){
	
	getMousePosition(canvasElem, e);
});*/

playButton.addEventListener("click", function(f){
	console.log("GameOn");
		newGame();
});
bruhButton.addEventListener("click", function(d){
	if(translu)
		translu = false;
	else
		translu = true;
});
stopButton.addEventListener("click", function(d){
	if(stop)
		stop = false;
	else
		stop = true;
});

diffSlider.addEventListener("change", function(g){
	bugGrowthValue = event.srcElement.value/100.0;
	console.log("Bug incremented!"  + event.srcElement.value);
});
document.addEventListener("keydown", function(z){
	switch(event.keyCode){
		case 87:
		camLat+=0.1;
		break;
		case 65:
		camLon-=0.1;
		break;
		case 68:
		camLon+=0.1;
		break;
		case 83:
		camLat-=0.1;
		break;
		
		
		case 38:
		camLat+=0.01;
		break;
		case 37:
		camLon-=0.01;
		break;
		case 39:
		camLon+=0.01;
		break;
		case 40:
		camLat-=0.01;
		break;
		
		case 90:
		if(raf==3)
			raf=5;
		else
			raf=3;
		break;
	}
});

//clickand drag
var minDelta = 0.000005;
var moved = false;
var clicked=false;
var startX;
var startY
canvasElem.addEventListener("mousedown", function(cd){
	let rect = canvas.getBoundingClientRect();
	startX = 2.0*((event.clientX - rect.left)/canvas.width)-1.0;
	startY = (2.0*((event.clientY - rect.top)/canvas.height)-1.0)*-1;
	lastX =startX;
	lastY = startY;
	clicked=true;
});

var lastX;
var lastY;
canvasElem.addEventListener("mousemove", function(cm){
	if(clicked){
	let rect = canvas.getBoundingClientRect();
	newX = 2.0*((event.clientX - rect.left)/canvas.width)-1.0;
	newY = (2.0*((event.clientY - rect.top)/canvas.height)-1.0)*-1;
	
	console.log(newX-startX +" "+ (newY-startY));
	if(newX-startX >minDelta || newY-startY>minDelta || newX-startX <-1*minDelta || newY-startY<-1*minDelta ){
		moved=true;
		console.log("moved");
	}
	
	if(moved){
		camLon = camLon- (newX-lastX);
		camLat  = camLat-(newY-lastY);
	}
	lastX=newX;
	lastY=newY;
	}
});

canvasElem.addEventListener("mouseup", function(cu){
	if(!moved){
		getMousePosition(canvasElem, cu);
	}
	moved = false
	clicked=false;
	
});



///////////AHHHHHHHHH finding the barycentric coordinates

function getXyzCoordinates(x,y){
	z = 1- x*x-y*y;
	if(z<0)
		console.log("Out of circle");
	else
		console.log("affline x: "+x+" y: "+y+" z: " +z);
}
