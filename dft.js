(function () {
  var samples = 1000;

  function cosine(freq, offset) {
    return function (n) {
      return Math.cos(n * 2 * Math.PI * freq / samples - (offset || 0));
    };
  }

  function sine(freq, offset) {
    return function (n) {
      return Math.sin(n * 2 * Math.PI * freq / samples - (offset || 0));
    };
  }

  function add(funcs) {
    return function (n) {
      return funcs.reduce(function (prev, func) { return prev + func(n); }, 0);
    };
  }

  function multiply(a, b) {
    if (a.call && b.call) { // vec-vec multiplication
      return function (n) {
        return a(n) * b(n);
      };
    } else { // scalar-vec multiplication
      return function (n) {
        return a * b(n);
      };
    }
  }

  // To 1 decimal place
  function round(num) {
    return Math.round(num * 10) / 10;
  }

  function dot(a, b) {
    var multiplied = multiply(a, b);

    var sum = 0;
    for (var i = 0; i < samples; i++) {
      sum += multiplied(i, i);
    }

    return sum;
  }

  var numComponents = 8;
  var initialValues = [0, 0.5, 0.3, 0.2];


  for (var i = 1; i <= numComponents; i++) {
    var $component = $(".component-template").clone().appendTo("#components");
    $component.removeClass("component-template").addClass("component");
    $component.find(".number").text(i);
    $component.data("number", i);
    $component.find(".amp").val(initialValues[i] || 0);

    var $fourierComponent = $(".fourier-template").clone().appendTo("#fouriers");
    $fourierComponent.removeClass("fourier-template").addClass("fourier");
    $fourierComponent.addClass("fourier-" + i);
    $fourierComponent.find(".number").text(i);
    $fourierComponent.data("number", i);
  }

  $("#fouriers input:first").prop("checked", true); // Select first fourier input


  // returned array is 1-indexed (indexed by component number)
  function getComponents() {
    var components = [];

    $(".component").each(function () {
      var $component = $(this);
      var number = $component.data("number");
      var amp = +$component.find(".amp").val();
      var offset = +$component.find(".offset").val();

      components[number] = multiply(amp, sine(number, Math.PI * offset));
    });

    return components;
  }

  function getMode() {
    return $("#controls input:checked").val();
  }

  function getFourier() {
    var $input = $("#fouriers input:checked");
    var number = $input.closest(".fourier").data("number");
    return { number: number, type: $input.val() };
  }

  function updateDotProducts(components) {
    components.forEach(function (component, i) {
      var sineValue = dot(component, sine(i));
      var cosineValue = dot(component, cosine(i));
      var magnitude = Math.sqrt(sineValue * sineValue + cosineValue * cosineValue);

      var $fourier = $(".fourier-" + i);
      $fourier.find(".sine-value").text(round(sineValue));
      $fourier.find(".cosine-value").text(round(cosineValue));
      $fourier.find(".magnitude").text(round(magnitude));
    });
  }

  function draw(components, mode, fourier) {
    drawing.reset();

    if (mode == "components") {
      drawComponents(components);
      drawSummed(components, true);
    } else if (mode == "fourier") {
      drawSummed(components, false);
      var func = fourier.type == "sine" ? sine : cosine;
      drawing.draw(func(fourier.number), samples, 0.3, false);
      drawing.draw(multiply(add(components), func(fourier.number)), samples, 0.5, true);
    }

    updateDotProducts(components);
  }

  function drawComponents(components) {
    components.forEach(function (component) {
      drawing.draw(component, samples, 0.2, false);
    });
  }

  function drawSummed(components, fill) {
    drawing.draw(add(components), samples, 0.5, fill);
  }

  $(".component input, #controls input, #fouriers input").on("change", function () {
    var components = getComponents();
    var mode = getMode();
    var fourier = getFourier();
    draw(components, mode, fourier);
  });

  $(".component input").change();


})();
