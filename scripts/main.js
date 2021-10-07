// various game objects

class bug{
		constructor(goalEnd, x, y){
			var arcLocation= goalEnd +10+Math.floor(Math.random()*310);
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
			this.bugScaling = [1.0, 0.0, 0.0,
								0.0, 1.0, 0.0,
								0.0, 0.0, 1.0];
			this.growthFactor= 1.0 + Math.random()*0.3;
			
			this.isDead=false;
			this.isDying=false;
			this.isExploding=false;
			
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
	
	

	var canvas, gl, program;
var Initialize = function(){
	var isPlaying = false;

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
	

	console.log("You got to the button command");
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
	
	
	var bugListStart = objectVertices.length/2;
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
	
	var poisonListStart = objectVertices.length/2;
	var endOfBufferOffset = objectVertices.length/2;
	console.log(" and end at "+ (objectVertices.length/2)+"\n");
	
	
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
		gl.clearColor(227.0/255, 227.0/255, 1.0, 0.9);
		gl.clear(gl.COLOR_BUFFER_BIT);	
		
		//draws the border of the peitry dish
		
		gl.uniformMatrix3fv(scalingUniformLocation, false, identityMatrix);
		gl.uniform4f(fragColorLocation, 160.0/255, 160.0/255, 232.0/255, 1.0);
		
		gl.drawArrays(gl.TRIANGLE_FAN,0,362);
		
		//draws the playing field
		gl.uniform4f(fragColorLocation, 225.0/255, 240.0/255, 255.0/255, 1.0);
		gl.drawArrays(gl.TRIANGLE_FAN, 362, 362);
		
		//draws the bug  and the goal to protect from
		
		//bug goal
		gl.uniform4f(fragColorLocation, 255.0/255, 0.0/255, 0.0/255, 1.0);
		gl.drawArrays(gl.TRIANGLE_STRIP, 724, 62 );
		
		
		//drawing bugs
		for(var i =0; i<bugList.length; i++){
			if(bugList[i].isDead){
				continue;
				}
			else {
				gl.uniform4f(fragColorLocation, bugList[i].r, bugList[i].g, bugList[i].b, bugList[i].a);

				gl.uniformMatrix3fv(scalingUniformLocation, false, getCompleteTransform(bugList[i])); /// matrx for growing shite
				if(bugList[i].a<=0.5)
					bugList[i].isDead = true;
				if(bugList[i].isExploding)
					for(var x = bugListStart+1+Math.floor(Math.random()*25)+(i*362); x<bugListStart+((i+1)*362);x+=Math.floor(Math.random()*35))
						gl.drawArrays(gl.POINTS, x, 1 );
				else{
					win = false;
					gl.drawArrays(gl.TRIANGLE_FAN, bugListStart+(i*362), 362 );
				}
				
					
			//	gl.uniform4f(fragColorLocation, 0.0, 0.0,0.0, bugList[i].a);
			//	gl.drawArrays(gl.LINE_LOOP, 786+(i*362 +1), 361 );						//todo delete
			}
		}
			gl.uniform4f(fragColorLocation, 23.0/255, 227.0/255, 37/255.0, 0.8);
			for(var i =0; i<bugList.length; i++){

				gl.uniformMatrix3fv(scalingUniformLocation, false, getCompleteTransform(bugList[i])); /// matrx for growing shite
				gl.drawArrays(gl.TRIANGLE_FAN, poisonListStart+(i*362), 362 );
				
			//	gl.uniform4f(fragColorLocation, 0.0, 0.0,0.0, bugList[i].a);
			//	gl.drawArrays(gl.LINE_LOOP, 786+(i*362 +1), 361 );						//todo delete
			
		}
		
			
		if(lose){
			///print something
		}else if(win){
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
		
	if(Bug.isExploding){
		Bug.a-=1.0/255.0;
		Bug.growthFactor+=0.5;
	}else if(Bug.isDying){
		Bug.growthFactor/=1.1;
		if(Bug.growthFactor<1.0)
			Bug.isExploding=true;
	} else{
		if(Bug.growthFactor>50.0)
			Bug.isDying =true;
		
		Bug.growthFactor+=0.1;
		}	

		
	translationMatrix[6] *=-1.0;
	 
	translationMatrix[7] *=-1.0;
	
	finalMatrix = multiply3dMatrix(finalMatrix, translationMatrix);				
						//bring to middle ^
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
	
	//console.log("|%f %f %f | |%f %f %f |\n|%f %f %f |X|%f %f %f |\n|%f %f %f | |%f %f %f |\n ",  a,b,c, j,k,l, d,e,f, m,n,o, g,h,i, p,q,r);
	
	var multMatrix =[(a*j + b*m + c*p), (a*k + b*n + c*q), (a*l + b*o + c*r),
					 (d*j + e*m + f*p), (d*k + e*n + f*q), (d*l + e*o + f*r),
					 (g*j + h*m + i*p), (g*k + h*n + i*q), (g*l + h*o + i*r)];
					 
	//console.log(" |%f %f %f |\n=|%f %f %f |\n |%f %f %f |\n",  multMatrix[0],multMatrix[1],multMatrix[2],multMatrix[3],multMatrix[4],multMatrix[5],multMatrix[6],multMatrix[7],multMatrix[8]);
	
	
	return new Float32Array(multMatrix);
};
function getMousePosition(canvas, event) {
	let rect = canvas.getBoundingClientRect();
	let x = ((event.clientX - rect.left)/canvas.width)-0.5;
	let y = (((event.clientY - rect.top)/canvas.height)-0.5)*-1;
	console.log("Coordinate x: " + x, 
				"Coordinate y: " + y);
}

let canvasElem = document.querySelector("canvas");
  
canvasElem.addEventListener("mousedown", function(e)
{
	getMousePosition(canvasElem, e);
});

