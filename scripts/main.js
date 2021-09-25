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
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
}

var vertexShader = [
'precision mediump float;',

'attribute vec2 vertPosition;',
'void main(){',
'	gl_Position = vec4(vertPosition, 0.0, 1.0);',
'}'
].join('\n');

var fragmentShader= [
'precision mediump float;',

'void main(){',
'	gl_FragColor = vec4(1, 0, 0, 1);',
'}'
].join('\n');
