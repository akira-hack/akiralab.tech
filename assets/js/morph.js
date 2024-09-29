var AsciiMorph = (function() {
    'use strict';
    var element = null;
    var canvasDimensions = {};
    var renderedData = [];
    var framesToAnimate = [];
    var myTimeout = null;
    function extend(target, source) {
      for (var key in source) {
        if (!(key in target)) {
          target[key] = source[key];
        }
      }
      return target;
    }
    function repeat(pattern, count) {
        if (count < 1) return '';
        var result = '';
        while (count > 1) {
            if (count & 1) result += pattern;
            count >>= 1, pattern += pattern;
        }
        return result + pattern;
    }
    function replaceAt(string, index, character ) {
      return string.substr(0, index) + character + string.substr(index+character.length);
    }
    function init(el, canvasSize) {
      element = el;
      canvasDimensions = canvasSize;
    }
    function squareOutData(data) {
       var i;
      var renderDimensions = {
        x: 0,
        y: data.length
      };
      for( i = 0; i < data.length; i++ ) {
        if( data[i].length > renderDimensions.x) {
          renderDimensions.x = data[i].length
        }
      }
      for( i = 0; i < data.length; i++ ) {
        if( data[i].length < renderDimensions.x) {
          data[i] = (data[i] + repeat(' ', renderDimensions.x - data[i].length ));
        }
      }
      var paddings = {
        x: Math.floor((canvasDimensions.x - renderDimensions.x) / 2),
        y: Math.floor((canvasDimensions.y - renderDimensions.y) / 2)
      }
      for( var i = 0; i < data.length; i++ ) {
        data[i] = repeat(' ', paddings.x) + data[i] + repeat(' ', paddings.x);
      }
      for( var i = 0; i < canvasDimensions.y; i++ ) {
        if( i < paddings.y) {
          data.unshift( repeat(' ', canvasDimensions.x));
        } else if (i > (paddings.y + renderDimensions.y)) {
          data.push( repeat(' ', canvasDimensions.x));
        }
      }
      return data;
    }
    function getMorphedFrame(data) {
      var firstInLine, lastInLine = null;
      var found = false;
      for( var i = 0; i < data.length; i++) {
        var line = data[i];
        firstInLine = line.search(/\S/);
        if( firstInLine === -1) {
          firstInLine = null;
        }
        for( var j = 0; j < line.length; j++) {
          if( line[j] != ' ') {
            lastInLine = j;
          }
        }
        if( firstInLine !== null && lastInLine !== null) {
          data = crushLine(data, i, firstInLine, lastInLine)
          found = true;
        }
        firstInLine = null, lastInLine = null;
      }
      if( found ) {
        return data;
      } else {
        return false;
      }
    }
    function crushLine(data, line, start, end) {
      var centers = {
        x: Math.floor(canvasDimensions.x / 2),
        y: Math.floor(canvasDimensions.y / 2)
      }
      var crushDirection = 1;
      if( line > centers.y ) {
        crushDirection = -1;
      }
      var charA = data[line][start];
      var charB = data[line][end];
      data[line] = replaceAt(data[line], start, " ");
      data[line] = replaceAt(data[line], end, " ");
      if( !((end - 1) == (start + 1)) && !(start === end) && !((start + 1) === end)) {
        data[line + crushDirection] = replaceAt(data[line + crushDirection], (start + 1), '+*/\\'.substr(Math.floor(Math.random()*'+*/\\'.length), 1));
        data[line + crushDirection] = replaceAt(data[line + crushDirection], (end - 1), '+*/\\'.substr(Math.floor(Math.random()*'+*/\\'.length), 1));
      } else if ((((start === end) || (start + 1) === end)) && ((line + 1) !== centers.y && (line - 1) !== centers.y && line !== centers.y)) {
        data[line + crushDirection] = replaceAt(data[line + crushDirection], (start), '+*/\\'.substr(Math.floor(Math.random()*'+*/\\'.length), 1));
        data[line + crushDirection] = replaceAt(data[line + crushDirection], (end), '+*/\\'.substr(Math.floor(Math.random()*'+*/\\'.length), 1));
      }
      return data;
    }
    function render(data) {
      var ourData = squareOutData(data.slice());
      renderSquareData(ourData);
    }
    function renderSquareData(data) {
      element.innerHTML = '';
      for( var i = 0; i < data.length; i++ ) {
        element.innerHTML = element.innerHTML + data[i] + '\n';
      }
      renderedData = data;
    }
    function morph(data) {
      clearTimeout(myTimeout);
      var frameData = prepareFrames(data.slice());
      animateFrames(frameData);
    }
    function prepareFrames(data) {
      var deconstructionFrames = [];
      var constructionFrames = [];
      var clonedData = renderedData
      for(var i = 0; i < 100; i++) {
        var newData = getMorphedFrame(clonedData);
        if( newData === false) {
          break;
        }
        deconstructionFrames.push(newData.slice(0)); 
        clonedData = newData;
      }
      var squareData = squareOutData(data);
      constructionFrames.unshift(squareData.slice(0));
      for( var i = 0; i < 100; i++ ) {
        var newData = getMorphedFrame(squareData);
        if( newData === false) {
          break;
        }
        constructionFrames.unshift(newData.slice(0));
        squareData = newData;
      }
      return deconstructionFrames.concat(constructionFrames)
    }
    function animateFrames(frameData) {
      framesToAnimate = frameData;
      animateFrame();
    }
    function animateFrame() {
      myTimeout = setTimeout(function() {
        renderSquareData(framesToAnimate[0]);
        framesToAnimate.shift();
        if( framesToAnimate.length > 0 ) {
          animateFrame();
        }
      }, 20)
    }
    function main(element, canvasSize) {
      if( !element || !canvasSize ) {
        console.log("sorry, I need an element and a canvas size");
        return;   
      }
      init(element, canvasSize);
    }
    return extend(main, {
      render: render,
      morph: morph
    });
    })();
    var element = document.querySelector('pre');
    AsciiMorph(element, {x: 8,y: 8});                       
    var asciis = [[
    " █████╗ ██╗  ██╗██╗██████╗  █████╗ ",
    "██╔══██╗██║ ██╔╝██║██╔══██╗██╔══██╗",                  // ANSII SHADOW
    "███████║█████╔╝ ██║██████╔╝███████║",
    "██╔══██║██╔═██╗ ██║██╔══██╗██╔══██║",
    "██║  ██║██║  ██╗██║██║  ██║██║  ██║",
    "╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═╝╚═╝  ╚═╝",
    ],
    [
    "    ██     ██",
    "  ██████ ██████",
    "  ██████ ██████",
    "  ██████ ██████",
    " █████ ████ ████",
    "█████████████████",
    "████████  ███████",
    "  █████████████",
    ],
    [
    " ______     __  __     __     ______     ______   ",
    "/\\  __ \\   /\\ \\/ /    /\\ \\   /\\  == \\   /\\  __ \\  ",
    "\\ \\  __ \\  \\ \\  _'-.  \\ \\ \\  \\ \\  __<   \\ \\  __ \\ ",
    " \\ \\_\\ \\_\\  \\ \\_\\ \\_\\  \\ \\_\\  \\ \\_\\ \\_\\  \\ \\_\\ \\_\\",
    "  \\/_/\\/_/   \\/_/\\/_/   \\/_/   \\/_/ /_/   \\/_/\\/_/",
    ],
    [
    "    ██     ██",
    "  ██████ ██████",
    "  ██████ ██████",
    "  ██████ ██████",
    " █████ ████ ████",
    "█████████████████",
    "████████  ███████",
    "  █████████████",
      ],
    ];
    AsciiMorph.render(asciis[0]);
    var currentIndex = 2;
    setTimeout(function() {
    AsciiMorph.morph(asciis[1]);
    }, 1000);
    setInterval(function() {
    AsciiMorph.morph(asciis[currentIndex]);
    currentIndex++;
    currentIndex%= asciis.length;
    }, 3000);

