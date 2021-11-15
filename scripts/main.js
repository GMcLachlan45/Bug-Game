// various game objects
const { vec2, vec3, vec4, mat3, mat4 } = glMatrix;
	var canvas;
	var poisonList = [];
	var gameOn = false;
	var bugGrowthValue = Math.PI/180.0; //the growth value that will be between 
	var translu = false;
	var stop = true;
	var camLat =-0;
	var camLon = -0;
	var win = false;
	var stop = false;
class bug{
	constructor(goalLat,goalLon, x, y, isBug){
		this.isDead=false;
		this.isDying=false;
		this.isExploding=false;
		this.radius = Math.PI/180;
		if(isBug){				
			this.lon =Math.random()*Math.PI*2-Math.PI;
			this.lat =Math.random()*Math.PI-Math.PI/2;//Math.random()*Math.PI*2.0;
			
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
			this.growthIncrement= (3*Math.random()*bugGrowthValue +Math.PI/180)/60;
		}else{
			this.lon = x;
			this.lat = y;
			
			this.r = 55.0/255.0 * Math.random(); //makes random shades of green.
			this.g = (Math.random()*155.0+100.0)/255.0;
			this.b = 70.0/255.0*Math.random();
			this.a= 1.0;
			this.growthIncrement = Math.PI/90/60; //poison grows at a constant 2 deg/sec
			}
		}

	checkPoisoned(poisonedBug){
		var bothRadiusLength = this.radius+poisonedBug.radius;//adds together the radii of the bugs
		if(findCenterDifference(this, poisonedBug) < bothRadiusLength){
			poisonedBug.isDying = true;
		}
	}
	
	checkContains(smallerBug){
		if(!smallerBug.isDying && 
		   findCenterDifference(this, smallerBug) + smallerBug.radius <= this.radius){
			this.r = (this.r + smallerBug.r)/2.0;
			this.g = (this.g + smallerBug.g)/2.0;
			this.b = (this.b + smallerBug.b)/2.0;
			smallerBug.isDead=true;
		   }
	}
}

function findCenterDifference(bug1, bug2){//calculates distance between bug centers using haversine 
	var dlat = bug2.lat - bug1.lat;//gets the difference between lats and longs
	var dlon = bug2.lon - bug1.lon;
	var a = Math.pow(Math.sin(dlat / 2.0), 2) + Math.cos(bug1.lat) * Math.cos(bug2.lat) * Math.pow(Math.sin(dlon / 2.0), 2);
	return 2*Math.atan2(Math.sqrt(a), Math.sqrt(1-a));//the primary haversine to get the difference between centers	
}
	
class bugGoal{//TODO:
		constructor(){
			this.lat =  0;//Math.random()*Math.PI*2.0;
			this.lon = 0;//Math.random()*Math.PI*2.0;
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


////////////////////to delete

var tr = 0;
var bruh = true;
/////////////////////


//Creates the C equivalent code in an array of strings
var vertexShaderText = [
'precision mediump float;',

'attribute vec3 vertPosition;',
'uniform mat4 vertexTransformation;',

'uniform mat4 world;',
'uniform mat4 view;',
'uniform mat4 proj;',

'uniform float projecting;',
'uniform float radius;',

'void main(){',
'vertPosition;',
'	mat4 mvp = proj*view*world;',
'	if(projecting<0.5)',
'		gl_Position =  mvp*vertexTransformation*vec4(vertPosition, 1.0);',
'	else',
'		gl_Position =  mvp*vertexTransformation* vec4(cos(vertPosition.x)*sin(vertPosition.y*vertPosition.z*radius),sin(vertPosition.x)*sin(vertPosition.y*vertPosition.z*radius),cos(vertPosition.y*vertPosition.z*radius), 1.0);',
'	gl_PointSize = 2.0;',
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
	console.log("Hit \"Play\" when ready to start");
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
	
	//sets the window's proper size
	canvas.width = window.innerWidth*0.9;
	canvas.height = window.innerWidth*0.9*9/16;
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
	
	//creates all of the webgl points that we will use for drawing
	var objectVertices = [];
	var indices =[];
	var divisions = 90;
	var toRad = Math.PI/180;
	
	//creates the spherical playing field
	for(let theta = 0; theta <=360; theta += 360 / divisions){
		for(let phi = 0; phi <=180; phi += 180 / divisions){
			var x = 0.99 * Math.sin(toRad * phi) * Math.cos(toRad * theta);
			var z = 0.99 * Math.sin(toRad * phi) * Math.sin(toRad * theta);
			var y = 0.99 * Math.cos(toRad * phi);
			objectVertices.push(x, y, z);
		}
	}
	
	for(let j = 0; j<divisions; j++){
		for(let i = 0; i<=divisions; i++){
			var point1 = j*(divisions+1)+i;
			var point2 = point1+ (divisions+1);
			indices.push(point1, point2);
		}
	}
	
	var vertBeforeExp = objectVertices.length / 3; //gets the point number in objvert. Add to whatever needs to be done
	var spherePoints = indices.length; //gets the number of points to draw for the sphere doubles as the offset for start of goal
	
	
	//creates a nested half circle to simultate an explosion
	for(let expRad = 1; expRad<4; expRad++){
		for(let theta = 0; theta <=180; theta += 180 / (4*expRad)){
			for(let phi = 0; phi <=180; phi += 180 / (4*expRad)){
				var x = expRad/10 * Math.sin(toRad * phi) * Math.cos(toRad * theta);
				var z = expRad/10 * Math.sin(toRad * phi) * Math.sin(toRad * theta);
				var y = expRad/10 * Math.cos(toRad * phi);
				objectVertices.push(x, y, z);
			}
		}
	}
	//var goalTransMatrix = goalTransforms(goal.lon, goal.lon, goal.rotation);//gets the matrix
	
	var vertBeforeBugs = objectVertices.length/3; //gets the point number in objvert. Add to whatever needs to be done for bug
	var expPoints = indices.length-spherePoints; //gets the number of points to draw for the goal. spherePoints+goalPoints doubles as offset for start of bugs
	
	//creates the circle used to represent a bug/poison in 2d space: to project onto the sphere 
	for(var seg = 0.00; seg<=1.0; seg+=1.0/divisions){ //created like a sphere, but in the xz-plane
		for(var i = 0; i<=360; i+=360/divisions){
			objectVertices.push(i*toRad, 1, seg);
		}
	}	
		
	for(let j = 0; j<divisions; j++){
		for(let i = 0; i<=divisions; i++){
			var point1 = vertBeforeBugs+ j*(divisions+1)+i;
			var point2 = point1+ (divisions+1);
			indices.push(point1, point2);
		}
	}
	
	var bugPoints = indices.length-spherePoints-expPoints; ///lastPoints
	
	
	var bugList = [];
	for(var i = 0; i <10; i++){
		bugList.push(new bug(0, 0, 0, 0, true));
	}
	
	////
	var axis = objectVertices.length/3;
	objectVertices.push(-2,0,0,2,0,0,0,-2,0,0,2,0,0,0,-2,0,0,2 , -3,0,-3,3,0,3);
		
	//GET THE LOCATION TO CHANGE TO PROJECTING ON THE SPHERE. X>0.5 MEANS IT'S ON SPHERE, X<0.5 MEANS WE JUST DRAW NORMALLY
	var sphereProjectionLocation = gl.getUniformLocation(program, 'projecting');
	
	var bugRadLocation = gl.getUniformLocation(program, 'radius');//gets the location for radius in ver shader. Only used in bugs/goal
	
	var fragColorLocation = gl.getUniformLocation(program, "fragColor"); //gets the location for color in frag shader
	if(!gl.getProgramParameter(program, gl.LINK_STATUS)){
		console.error('Error linking program', gl.getProgramInfo(program));
		return;
	}
	
	//creating and binding our buffers
	var vertexBufferObject = gl.createBuffer(); 
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(objectVertices), gl.STATIC_DRAW); //Sends the vertex info to the GPU
	
	
    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW); //sends the index info to the gpu
	
	var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
	gl.vertexAttribPointer(positionAttribLocation, 3, gl.FLOAT, gl.FALSE, 
		3*Float32Array.BYTES_PER_ELEMENT, 0*Float32Array.BYTES_PER_ELEMENT
		);
	gl.enableVertexAttribArray(positionAttribLocation);
	
	
	//////////SETS UP FOR THE WORLD-VIEW-PROJECTION MATRIX OPERATIONS/////////
	var worldUniformLocation = gl.getUniformLocation(program, 'world');
	var viewUniformLocation = gl.getUniformLocation(program, 'view');
	var projUniformLocation = gl.getUniformLocation(program, 'proj');


	/////drawing
	//SETS THE WORLD SO THAT IT'S NORMAL, 1-1. DON'T NEED TO WORRY ABOUT IT ANYMORE
	var world = new Float32Array(16);
	mat4.identity(world);
	
	//SETS THE CAMERA, WILL NEED TO CHANGE IN LOOP IF WE WANNA SPIN AROUND
	var view = new Float32Array(16);
	mat4.lookAt(view, [0,0,3], /*POINT IN SPACE WHERE THE EYE IS*/
				[0,0,0], /*POINT WE'RE LOOKING AT*/
				[0,Math.abs(Math.cos(camLat)),0]);//up*/
				
	
			
	//SETS THE PROJECTION, SO THAT WE HAVE everything in view
	var proj = new Float32Array(16);
	/*mat4.perspective(proj, glMatrix.glMatrix.toRadian(45), //FIELD OF VIEW
					 canvas.width/canvas.height, //ASPECT RATIO
					 0.1/*NEAR/, 100/FAR/);
	*/
	mat4.ortho(proj, -16/9,16/9,-1,1,-3,10);
	
	//GETS THE LOCATION WHERE WE'LL USE TO ROTATE INDIVIDUAL BUGS
	var trans = new Float32Array(16);
	var transformationUniformLocation = gl.getUniformLocation(program, 'vertexTransformation');
	mat4.identity(trans);
	
	gl.uniformMatrix4fv(transformationUniformLocation, false, trans);
	gl.uniformMatrix4fv(worldUniformLocation, false, world);
	gl.uniformMatrix4fv(viewUniformLocation, false, view);
	gl.uniformMatrix4fv(projUniformLocation, false, proj);
	
	var iden = new Float32Array(16);
	mat4.identity(iden);
	
	var lose = false;
	
	var loop = function(){
		win = true;
		//resizes the viewport
		canvas.width = window.innerWidth*0.9;
		canvas.height = window.innerWidth*0.9*9/16;
		gl.viewport(0,0,canvas.width,canvas.height);
		
		//configures camera to properly look at sphere
		mat4.lookAt(view, [0,0,3], [0,0,0], [0,Math.abs(Math.cos(camLat)),0]);	
		gl.uniformMatrix4fv(viewUniformLocation, false, view);
		
		gl.uniformMatrix4fv(transformationUniformLocation, false, iden);
		
		
		mat4.multiply(world, camTransforms(camLat, camLon), iden);// gets proper camera Location
		gl.uniformMatrix4fv(worldUniformLocation, false, world);
		
		// clear the scene
		gl.clearColor(225.0/255, 240.0/255, 255.0/255, 1.0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		
		//DRAW SPHERE
		gl.uniform1f(sphereProjectionLocation, 0.0); //sets to normal drawing		
		gl.uniform4f(fragColorLocation, 1.0,1.0,1.0,1.0); //sets color to white
		if(!translu)
		gl.drawElements(gl.TRIANGLE_STRIP, spherePoints, gl.UNSIGNED_SHORT, 0); //Draws the sphere
		
		gl.uniform4f(fragColorLocation, 0.0,0.0,0.0, 1.0);
		if(!translu)
		//gl.drawElements(gl.LINE_STRIP, spherePoints, gl.UNSIGNED_SHORT, 0); //Draws the mesh
		
		/*{//DRAWS AXES for debugging
		gl.uniform4f(fragColorLocation, 1,0,0,1);
		gl.drawArrays(gl.LINES, axis, 2);//xaxis
		gl.drawArrays(gl.POINT, axis+1, 1);
		
		gl.uniform4f(fragColorLocation, 0,1,0,1);
		gl.drawArrays(gl.LINES, axis+2, 2);//yaxis
		gl.drawArrays(gl.POINT, axis+3, 1);
		
		gl.uniform4f(fragColorLocation, 0,0,1,1);
		gl.drawArrays(gl.LINES, axis+4, 2);//zaxis
		gl.drawArrays(gl.POINT, axis+5, 1);
		}
			*/	
		gl.uniformMatrix4fv(transformationUniformLocation, false, iden);
		// Changes to drawing on the surface of the sphere
		
		///DRAW BUGS
		for(var i = 0; i< bugList.length; i++){	
			if(bugList[i].isDead){//CASE, Bug is dead, then we don't draw him
				continue;
			}else if(bugList[i].isExploding){
				win=false;
				gl.uniform1f(sphereProjectionLocation, 0.0);				//make explosion
				gl.uniform4f(fragColorLocation, bugList[i].r,bugList[i].g,bugList[i].b,bugList[i].a);// makes the bug its color
				
				gl.uniformMatrix4fv(transformationUniformLocation, false, expTransforms(bugList[i].lat, bugList[i].lon, bugList[i].radius));//moves the bug where it needs to be
				gl.uniform1f(bugRadLocation, bugList[i].radius); //updates the bug's radius	
				gl.drawArrays(gl.POINTS, vertBeforeExp, vertBeforeBugs-vertBeforeExp);
				if(bugList[i].a<0.5)
					bugList[i].isDead = true;
				else{
					bugList[i].radius+= 0.01;
					bugList[i].a -= 0.01;
				}
			}else {
				win=false;
				gl.uniform1f(sphereProjectionLocation, 1.0);
				win = false;
				gl.uniform4f(fragColorLocation, bugList[i].r,bugList[i].g,bugList[i].b,1);// makes the bug its color	
				gl.uniformMatrix4fv(transformationUniformLocation, false, bugTransforms(bugList[i].lat, bugList[i].lon, i));//moves the bug where it needs to be
				gl.uniform1f(bugRadLocation, bugList[i].radius); //updates the bug's radius	
				gl.drawElements(gl.TRIANGLE_STRIP, bugPoints, gl.UNSIGNED_SHORT, (expPoints+spherePoints)*2);//draws the bug
				if(bugList[i].isDying){//make the radius shrink
					bugList[i].radius/=1.1;
					if(bugList[i].radius < toRad)//if the bug is smaller than 1 degree, make it explode
							bugList[i].isExploding = true;
				}else{
					for(var j = 0; j < bugList.length; j++)//checks to see if this poison killed any bugs
						if(i!=j && !bugList[j].isDead)
							bugList[i].checkContains(bugList[j]);//check to see if we consume the small bug
					bugList[i].radius+=bugList[i].growthIncrement; //make the bug smaller
				}
			}
			//if bug is dead, we don't draw him
		}
		
		///DRAW POISON	
		for(var i = 0; i < poisonList.length; i++){
			
				gl.uniform1f(sphereProjectionLocation, 1.0);
			gl.uniform4f(fragColorLocation, poisonList[i].r,poisonList[i].g,poisonList[i].b,1);// makes the poison its color
			gl.uniformMatrix4fv(transformationUniformLocation, false, bugTransforms(poisonList[i].lat, poisonList[i].lon, bugList.length + i));
			gl.uniform1f(bugRadLocation, poisonList[i].radius);//increases the bug's radius	
			gl.drawElements(gl.TRIANGLE_STRIP, bugPoints, gl.UNSIGNED_SHORT, (expPoints+spherePoints)*2);//draws the poison
			
			for(var j = 0; j < bugList.length; j++)//checks to see if this poison killed any bugs
				if(!bugList[j].isDead)
					poisonList[i].checkPoisoned(bugList[j]);	
			poisonList[i].radius+=poisonList[i].growthIncrement;
		}
		/*
		///DRAW GOAL
		gl.uniform1f(bugRadLocation, 1);
		gl.uniform4f(fragColorLocation, 0,0,1,1);
		gl.uniformMatrix4fv(transformationUniformLocation, false, bugTransforms(goal.lat, goal.lon, 100));//used to rotate the goal to where it needs to be
		gl.drawElements(gl.TRIANGLE_STRIP, goalPoints, gl.UNSIGNED_SHORT, spherePoints*2)
	*/
		if(win){
			console.log("You win!");
		}else if(lose||stop){
			console.log("You Lose...");s
		}else 
			requestAnimationFrame(loop);
	};
	
	requestAnimationFrame(loop);
};

function bugTransforms(lat, lon, num){
	if(num<0)
		num=0;
	//set up matrix and the vector we rotate for longitue
	var finalTransformMatrix = new Float32Array(16);
	mat4.identity(finalTransformMatrix);
	var lonRot = vec3.fromValues(1,0,0);
	vec3.rotateY(lonRot, lonRot, [0,0,0], -lon);
	
	mat4.scale(finalTransformMatrix,finalTransformMatrix, [1+ num/1800,1+ num/1800,1+ num/1800]); // finally, makes it so no undesirable effects from multiple bugs
	mat4.rotate(finalTransformMatrix, finalTransformMatrix, lat, lonRot); // next, rotate about the lonVec to get proper lat
	mat4.rotateY(finalTransformMatrix, finalTransformMatrix, -lon); //first, rotates the patch to the proper longitude
	return finalTransformMatrix;
}

//an alright free camera
function camTransforms(lat, lon){
	var finalTransformMatrix = new Float32Array(16);
	mat4.identity(finalTransformMatrix);
	
	mat4.rotateX(finalTransformMatrix, finalTransformMatrix, lat); // next, rotate about the lonVec to get proper lat
	mat4.rotateY(finalTransformMatrix, finalTransformMatrix, -lon); //first, rotates the patch to the proper longitude
	return finalTransformMatrix;
}

/*
function goalTransforms(lat, lon, rot){
	var finalTransformMatrix = bugTransforms(lat, lon, 0); //uses the lat-lon finder in bugTransforms
	mat4.rotateZ(finalTransformMatrix, finalTransformMatrix, rot); //spins the goal so it's rotation is cool
	return finalTransformMatrix;	
}
*/

function expTransforms(lat, lon, rad){
	
	var finalTransformMatrix = new Float32Array(16);
	mat4.identity(finalTransformMatrix);
	var lonRot = vec3.fromValues(1,0,0);
	vec3.rotateY(lonRot, lonRot, [0,0,0], -lon);
	
	mat4.rotate(finalTransformMatrix, finalTransformMatrix, lat, lonRot); // next, rotate about the lonVec to get proper lat
	mat4.rotateY(finalTransformMatrix, finalTransformMatrix, -lon); //first, rotates the patch to the proper longitude
	mat4.translate(finalTransformMatrix, finalTransformMatrix, [0,0,1]);
	mat4.scale(finalTransformMatrix,finalTransformMatrix, [rad,rad,rad]);
	return finalTransformMatrix;
}

function addPoison(canvas, event) {
	let rect = canvas.getBoundingClientRect();
	let x = ((2*(event.clientX - rect.left)/canvas.width)-1)*16/9;
	let y = ((2*(event.clientY - rect.top)/canvas.height)-1);
	
	
	let gotZ = Math.sqrt(1- x*x-y*y);
	console.log("canvas \nx: "+x+ " \ny: "+ y+ " \nz: " + gotZ);
	///convert that to a thinkg on the sphere
	
	var mat = bugTransforms(camLat, -1*camLon, 0);
	var vec = vec4.fromValues(x,y,gotZ, 1);
	
	vec4.transformMat4(vec, vec, mat);
	
	
	
	
	var lat = Math.acos(vec[1])-Math.PI/2; 
    var lon = Math.atan(vec[0]/vec[2]); 
	if(vec[2]<0)
		lon+= Math.PI;
	
	console.log("canvas \nlon: "+lon+ " \nlat: "+ lat);
	
	if(gotZ>0){
		//calculate 
		poisonList.push(new bug(0,0, -1*lon,-1*lat, false));
		//console.log("Poison "+ poisonList.length+ ": "+poisonList[poisonList.length-1].lon+ ", " + poisonList[poisonList.length-1].lat);
	}
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
bruhButton.addEventListener("click", function(d){////////////////TO MAKE LIGHTING WORK
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
	z.view.event.preventDefault();
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
		
	}
});

//clickand drag
var minDelta = 0.0005;
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
	
		if(newX-startX >minDelta || newY-startY>minDelta || newX-startX <-1*minDelta || newY-startY<-1*minDelta )
			moved=true;
		if(moved){
			if(Math.abs(camLat% (2*Math.PI))>Math.PI/2)
				camLon = camLon + (newX-lastX);
			else
				camLon = camLon - (newX-lastX);
			camLat = camLat-Math.cos(newY)*(newY-lastY);
		}
		lastX=newX;
		lastY=newY;
	}
});

canvasElem.addEventListener("mouseup", function(cu){
	if(!moved){
		addPoison(canvasElem, cu);
	}
	moved = false
	clicked=false;
	
});
