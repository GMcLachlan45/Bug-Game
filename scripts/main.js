// various game objects

	var canvas;
	var poisonList = [];
	var bugGrowthValue;
	var gameStart = false;















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
				this.r = Math.random();
				this.g = Math.random();
				this.b = Math.random();
				this.a= 1.0;
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
				this.growthFactor= 1.0 + Math.random()*0.3;
				this.growthIncrement= Math.random()*bugGrowthValue;/////tanners adding
			}else{
				this.x = x;
				this.y = y;
				this.r = 55.0/255.0 * Math.random();
				this.g = Math.random();
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

'attribute vec2 vertPosition;',
'uniform mat3 scaling;',
'uniform vec2 motion;',
'void main()',
'{',
'vertPosition;',
'	gl_Position =  vec4( (scaling * vec3(vertPosition, 1.0) ).xy, 0.0, 1.0);',
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
	
	
	
window.onload = function init()
    {
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
	var program = gl.createProgram();
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
	
	//Outside the dish
	var objectVertices = [];
	
	for(var i = 0; i<=360; i++){
		var j = i * Math.PI / 180;
		objectVertices.push(0.9* Math.cos(j));
		objectVertices.push(0.9* Math.sin(j));
		objectVertices.push(2.0* Math.cos(j));
		objectVertices.push(2.0* Math.sin(j));
	}
	 var startOfInnerCircle = objectVertices.length/2;
	
	//dish Border
	for(var i = 0; i<=360; i++){
		var j = i * Math.PI / 180;
		objectVertices.push(0.88* Math.cos(j));
		objectVertices.push(0.88* Math.sin(j));
		objectVertices.push(0.9* Math.cos(j));
		objectVertices.push(0.9* Math.sin(j));
	}
	
	var startOfGoal = objectVertices.length/2;
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
	var border =objectVertices.length/2;
	objectVertices.push(1.0, 1.0, 0.99,0.99,
						-1.0, 1.0, -0.99,0.99,
						-1.0, -1.0, -0.99,-0.99,
						1.0, -1.0, 0.99, -0.99,
						1.0, 1.0, 0.99,0.99);
	
	var bugListStart = objectVertices.length/2;
	//TODO create bugs to expand
	var bugList = [];
	for(var i =0; i < 10; i++){
		bugList.push(new bug(
		goal.end, 0, 0, true));
		objectVertices.push(bugList[i].x);
		objectVertices.push(bugList[i].y);
		for(var ci = 0.0; ci<=360; ci++){
			var j = ci * Math.PI / 180;
			objectVertices.push(0.01* Math.cos(j) + bugList[i].x);
			objectVertices.push(0.01* Math.sin(j) + bugList[i].y);
		}
	}
	
	var poisonListStart = objectVertices.length/2;
	console.log(" and end at "+ (objectVertices.length/2)+"\n");
	
	
	
	for(var i =0; i < 20; i++){
		objectVertices.push(0,0);
		for(var ci = 0.0; ci<=360; ci+=1){
			var j = ci * Math.PI / 180;
			objectVertices.push(0.01* Math.cos(j));
			objectVertices.push(0.01* Math.sin(j));
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
	
	var scalingUniformLocation = gl.getUniformLocation(program, 'scaling');
	
	/////drawing
	var identityMatrix = new Float32Array([1.0, 0.0, 0.0,
										   0.0, 1.0, 0.0,
										   0.0, 0.0, 1.0])
	
	var win = false;
	var lose = false;
	var loop = function(){
		win = true;
		//resizes the viewport
		canvas.width = window.innerHeight;
		canvas.height = window.innerHeight;
		gl.viewport(0,0,canvas.width,canvas.height);
		
		// clear the scene
		gl.clearColor(225.0/255, 240.0/255, 255.0/255, 1.0);
		gl.clear(gl.COLOR_BUFFER_BIT);	
		
		//drawing bugs
		for(var i =0; i<bugList.length; i++){
			if(bugList[i].isDead)
				continue;
			
			gl.uniform4f(fragColorLocation, bugList[i].r, bugList[i].g, bugList[i].b, bugList[i].a);
			gl.uniformMatrix3fv(scalingUniformLocation, false, getCompleteTransform(bugList[i])); /// matrx for growing shite
			if(bugList[i].a<=0.4)
				bugList[i].isDead = true;
			if(bugList[i].isExploding){
				for(var x = bugListStart+1+Math.floor(Math.random()*25)+(i*362); x<bugListStart+((i+1)*362);x+=Math.floor(Math.random()*35))
					gl.drawArrays(gl.POINTS, x, 1 );
				bugList[i].a-=1.0/255.0;
				bugList[i].growthFactor+=0.5;
			}else{
				win = false;
				gl.drawArrays(gl.TRIANGLE_FAN, bugListStart+(i*362), 362 );
				gl.uniform4f(fragColorLocation, 0.0,0.0,0.0,1.0);
				gl.drawArrays(gl.LINE_LOOP, bugListStart+1+(i*362), 361 );
				if(bugList[i].isDying){
					bugList[i].growthFactor/=1.1;
					if(bugList[i].growthFactor<1.0)
						bugList[i].isExploding=true;
				}else{
					for(var j = 0; j <bugList.length; j++){
						if(i!=j&& !bugList[j].isDead)
							bugList[i].checkContains(bugList[j]);
					}
					goal.checkLose(bugList[i], i);					
					bugList[i].growthFactor+=bugList[i].growthIncrement;
				}
			}
		}
		
		
		
			for(var i =0; i<poisonList.length; i++){
				gl.uniform4f(fragColorLocation, poisonList[i].r, poisonList[i].g, poisonList[i].b, poisonList[i].a);
				gl.uniformMatrix3fv(scalingUniformLocation, false, getCompleteTransform(poisonList[i])); /// matrx for growing shite
				gl.drawArrays(gl.TRIANGLE_FAN, poisonListStart+(i*362), 362 );
				for(var j = 0; j <bugList.length; j++){
					poisonList[i].checkPoisoned(bugList[j]);
				}		
					
				poisonList[i].growthFactor+=poisonList[i].growthIncrement;
			
		}
		
		
		
		var myButton = document.getElementById("DirectionButton");
		myButton.addEventListener("click", function() { gameStart = !gameStart;
			console.log(gameStart);
		});
		
		////////////////////////////////////////////
		/////////START OF FIELD DRAWING/////////////
		////////////////////////////////////////////

		//draws the outside of the pietry dish
		
		gl.uniformMatrix3fv(scalingUniformLocation, false, identityMatrix);
		gl.uniform4f(fragColorLocation, 227.0/255, 227.0/255, 1.0, 0.9);				
		gl.drawArrays(gl.TRIANGLE_STRIP,0,startOfInnerCircle);
		
		//draws the pietry dish walls
		gl.uniform4f(fragColorLocation, 160.0/255, 160.0/255, 232.0/255, 1.0);
		gl.drawArrays(gl.TRIANGLE_STRIP, startOfInnerCircle, startOfInnerCircle);
		
		//draws the canvas border
		gl.uniform4f(fragColorLocation, 0.0, 0.0, 0.0, 1.0);
		gl.drawArrays(gl.TRIANGLE_STRIP, border, 10);
		
		
		document.getElementById("slide").onchange = function (){
			bugGrowthValue = event.srcElement.value;
			console.log("Bug incremented!"  + event.srcElement.value);

		};
	

		////////////////////////////////////////////
		//////////END OF FIELD DRAWING//////////////
		////////////////////////////////////////////		
		
		//cHECK IF WE LOST THE GAME
		if(goal.bugCount >= 2)
			lose = true;
		if(lose){
			//bug goal
		gl.uniform4f(fragColorLocation, 255.0/255, 20.0/255, 20.0/255, 1.0);
		gl.drawArrays(gl.TRIANGLE_STRIP, startOfGoal, 62 );
			console.log("2 bugs have reached the goal... You lose!");
		}else if(win){
			//bug goal
		gl.uniform4f(fragColorLocation, 255.0/255, 20.0/255, 20.0/255, 1.0);
		gl.drawArrays(gl.TRIANGLE_STRIP, startOfGoal, 62 );
			console.log("You win!");
			//print something
		}else{
			requestAnimationFrame(loop);
		}
	};
	requestAnimationFrame(loop);
	
	
};

function getCompleteTransform(Bug){
	
	var finalMatrix = new Float32Array([1.0, 0.0, 0.0,
										   0.0, 1.0, 0.0,
										   0.0, 0.0, 1.0]);
	var translationMatrix = new Float32Array([1.0, 0.0, 0.0,
										   0.0, 1.0, 0.0,
										   Bug.x, Bug.y, 1.0]);
	finalMatrix = multiply3dMatrix(finalMatrix, translationMatrix);
						// bring back to outside	

						
						// grow
	var scalingMatrix = new Float32Array([Bug.growthFactor, 0.0, 0.0,
										0.0, Bug.growthFactor, 0.0,
										0.0, 0.0, 1.0]);
	finalMatrix = multiply3dMatrix(finalMatrix, scalingMatrix);

	if(Bug.isBug){
		translationMatrix[6] *=-1.0;
		 
		translationMatrix[7] *=-1.0;
		
		finalMatrix = multiply3dMatrix(finalMatrix, translationMatrix);				
							//bring to middle ^
	}
	return finalMatrix;
};


function multiply3dMatrix(mat2, mat1){
	var a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r;
	a=mat1[0];
	b=mat1[1];
	c=mat1[2];
	d=mat1[3];
	e=mat1[4];
	f=mat1[5];
	g=mat1[6];
	h=mat1[7];
	i=mat1[8];
	j=mat2[0];
	k=mat2[1];
	l=mat2[2];
	m=mat2[3];
	n=mat2[4];
	o=mat2[5];
	p=mat2[6];
	q=mat2[7];
	r=mat2[8];
	
	var multMatrix =[(a*j + b*m + c*p), (a*k + b*n + c*q), (a*l + b*o + c*r),
					 (d*j + e*m + f*p), (d*k + e*n + f*q), (d*l + e*o + f*r),
					 (g*j + h*m + i*p), (g*k + h*n + i*q), (g*l + h*o + i*r)];
		
	return new Float32Array(multMatrix);
};


function getMousePosition(canvas, event) {
	let rect = canvas.getBoundingClientRect();
	let x = 2.0*((event.clientX - rect.left)/canvas.width)-1.0;
	let y = (2.0*((event.clientY - rect.top)/canvas.height)-1.0)*-1;
	if(poisonList.length < 20 && Math.sqrt(Math.pow(x,2)+Math.pow(y,2))<0.88)
		poisonList.push(new bug(0,x, y, false));
}

let canvasElem = document.querySelector("canvas");
  
canvasElem.addEventListener("mousedown", function(e)
{
	getMousePosition(canvasElem, e);
});


