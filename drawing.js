var drawing = (function () {
  var canvas = document.getElementById("canvas");
  canvas.height = 301;
  var ctx = canvas.getContext("2d");


  function drawPoint(n, amp, alpha, fill) {
    ctx.globalAlpha = alpha;
    // Negative amp because we draw from top
    ctx.fillRect(n, 150 - amp * 150, 1, fill ? amp * 150 : 1);
  }

  function drawGraph(func, width, alpha, fill) {
    if (canvas.width != width) { // setting width resets the canvas
      canvas.width = width;
    }
    for (var n = 0; n < width; n++) {
      drawPoint(n, func(n), alpha, fill);
    }
  }

  function reset() {
    canvas.width = canvas.width;
  }

  return {
    draw: drawGraph,
    reset: reset
  };
})();
