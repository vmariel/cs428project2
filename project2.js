"use strict";

var gl;
var positions =[];
var iteration = 0;

window.onload = function init()
{
    var canvas = document.getElementById("gl-canvas");
    gl = canvas.getContext('webgl2');
    if (!gl) alert( "WebGL 2.0 isn't available" );

    //
    // Initialize our data for the Snowflake
    //

    // First, initialize the corners with three positions.
    var height = Math.sqrt(3) / 2;

    positions = [
        vec2(-0.5, - height / 3),
        vec2(0, height * (2/3) ),
        vec2(0.5, - height / 3)
    ];

    var rad = radians(60);
    var ccwR = mat2(Math.cos(rad), -(Math.sin(rad)), Math.sin(rad), Math.cos(rad));

    var originalLength;
    var u, v, a, b, c;

    // var slider = document.getElementById('slider'); 
    // slider.addEventListener('input', oninput, false); 

    for ( var i = 0; i < iteration; i++ ) {

        originalLength = positions.length;

        for (var j = 0; j < originalLength; j++) {

            if (j == (originalLength - 1)) {
                u = positions[4*j];
                v = positions[0];
            } else {
                u = positions[4*j];
                v = positions[4*j+1];
            }
            // u = p1, a= p2, b = p3, c = p4, v = p5
            // mix = (1-s) u + s v = u + -u s + v s = u + s ( v - u )

            a = mix(u, v, 1/3); // 2/3 p1 + 1/3 p5
            c = mix(u, v, 2/3); // 1/3 p1 + 2/3 p5
            b = add(a, mult(ccwR, subtract(c, a)));

            positions.splice( (j * 4) + 1, 0, a, b, c );

        }

    }

    document.getElementById("slider").onchange = function(event) {
        iteration = event.target.value;
        positions = [];
        init();
    };

    //
    //  Configure WebGL
    //
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    //  Load shaders and initialize attribute buffers

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Load the data into the GPU

    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId );
    gl.bufferData(gl.ARRAY_BUFFER, flatten(positions), gl.STATIC_DRAW);

    // Associate out shader variables with our data buffer

    var positionLoc = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    render();
};

function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays(gl.LINE_LOOP, 0, positions.length);
}
