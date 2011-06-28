
function initBuffers(gl) {
  var triangle = {};
  var square = {};
  var buffers = {
    triangle: triangle, 
    square: square
  };

  triangle.vertices = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, triangle.vertices);
  var vertices = [
     0.0,  1.0,  0.0,
    -1.0, -1.0,  0.0,
     1.0, -1.0,  0.0
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  triangle.vertices.itemSize = 3;
  triangle.vertices.numItems = 3;

  triangle.colours = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, triangle.colours);
  var colours = [
    1.0, 0.0, 0.0, 1.0,
    0.0, 1.0, 0.0, 1.0,
    0.0, 0.0, 1.0, 1.0,
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colours), gl.STATIC_DRAW);
  triangle.colours.itemSize = 4;
  triangle.colours.numItems = 3;

  square.vertices = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, square.vertices);
  vertices = [
     1.0,  1.0,  0.0,
    -1.0,  1.0,  0.0,
     1.0, -1.0,  0.0,
    -1.0, -1.0,  0.0
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  square.vertices.itemSize = 3;
  square.vertices.numItems = 4;

  var colours = [];
  for (var i = 0; i < 4; ++i) {
    colours = colours.concat([0.5, 0.5, 1.0, 1.0]);
  }
  square.colours = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, square.colours);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colours), gl.STATIC_DRAW);
  square.colours.itemSize = 4;
  square.colours.numItems = 4;

  return buffers;
}

function drawScene(gl, shaderProgram, buffers, animationTime, animationState) {
  if (animationState.frame < 10) {
    console.log("frame=" + animationState.frame + " animationTime=" + animationTime + 
                " triangleRotation=" + animationState.triangleRotation);
  }

  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  var projection = mat4.create();
  var usePerspective = true;

  if (usePerspective) {
    mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, projection);
  } else {
//    mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.00001, 100.0, projection);
//    mat4.ortho(-4.0, 4.0, -4.0, 4.0, 0, 1000, projection);
//    mat4.identity(projection);
    mat4.ortho(-10.0, +10.0, -10.0, +10.0, 0.1, 100.0, projection);
  }
  gl.uniformMatrix4fv(shaderProgram.uProjection, false, projection);

  var modelView = mat4.create();

  function withModelView(action) {
    var copy = mat4.create();
    mat4.set(modelView, copy);

    action();

    modelView = copy;
  }

  function setModelViewUniform() {
    gl.uniformMatrix4fv(shaderProgram.uModelView, false, modelView);
  }

  mat4.identity(modelView);
  mat4.translate(modelView, [0.0, 0.0, -7.0]);

  withModelView(function() {
    mat4.translate(modelView, [-1.5, 0.0, 0.0]);
    withModelView(function() {
      var triangle = buffers.triangle;
      mat4.rotate(modelView, degToRad(animationState.triangleRotation), [0, 1, 0]);
      gl.bindBuffer(gl.ARRAY_BUFFER, triangle.vertices);
      gl.vertexAttribPointer(shaderProgram.aVertexPosition, triangle.vertices.itemSize, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, triangle.colours);
      gl.vertexAttribPointer(shaderProgram.aVertexColour, triangle.colours.itemSize, gl.FLOAT, false, 0, 0);
      setModelViewUniform();
      gl.drawArrays(gl.TRIANGLES, 0, triangle.vertices.numItems);
    });
  });

  withModelView(function() {
    mat4.translate(modelView, [+1.5, 0.0, 0.0]);
    withModelView(function() {
      var square = buffers.square;
      mat4.rotate(modelView, degToRad(animationState.squareRotation), [1, 0, 0]);
      gl.bindBuffer(gl.ARRAY_BUFFER, square.vertices);
      gl.vertexAttribPointer(shaderProgram.aVertexPosition, square.vertices.itemSize, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, square.colours);
      gl.vertexAttribPointer(shaderProgram.aVertexColour, square.colours.itemSize, gl.FLOAT, false, 0, 0);
      setModelViewUniform();
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, square.vertices.numItems);
    });
  });
}

function animate(prevTime, now, animationState) {
    var elapsed = now - prevTime;
    return {
      frame: animationState.frame + 1,
      triangleRotation: animationState.triangleRotation + (90 * elapsed) / 1000.0,
      squareRotation: animationState.squareRotation + (75 * elapsed) / 1000.0
    };
}

function init() {
  var initialAnimationState = {
    frame: 1,
    triangleRotation: 0.0,
    squareRotation: 0.0
  };
  initScene("lesson01-canvas", initialAnimationState, animate, drawScene);
}
