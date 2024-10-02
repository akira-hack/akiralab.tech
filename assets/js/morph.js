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

    const parallaxContainer = document.querySelector('.parallax-container');
    const parallaxImage = document.querySelector('.parallax-image');
    window.addEventListener('scroll', () => {
      const scrollPosition = window.scrollY;
      const containerTop = parallaxContainer.offsetTop;
      const containerHeight = parallaxContainer.offsetHeight;
      const yPos = (scrollPosition - containerTop) * 0.5;
      parallaxImage.style.transform = `translateY(${Math.min(0, yPos)}px)`;
    });
    function changeText() {
      const div = document.getElementById('myDiv');
      let textIndex = 0;
      const texts = [' +_+', ' *_*', ' 0_0', ' $_$',' ^_^',' @_@',' x_x',' O_o'];
      let currentText = '';
      let charIndex = 0;
      setInterval(() => {
        if (charIndex < texts[textIndex].length) {
          currentText += texts[textIndex][charIndex];
          div.textContent = currentText;
          charIndex++;
        } else {
          setTimeout(() => {
            textIndex = (textIndex + 1) % texts.length;
            currentText = '';
            charIndex = 0;
          }, 1000);
        }
      }, 100);
    }
    changeText();








    const canvas = document.querySelector("canvas");
    const gl = canvas.getContext("webgl");
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
    
    // Configurable parameters
    const config = {
  particleCount: 5000,
  textArray: ["ENGINEER."],
  mouseRadius: 0.08, 
  particleSize: 2,
  forceMultiplier: 0.002, 
  returnSpeed: 0.0075,
  velocityDamping: 0.95,
  saturationMultiplier: 1000,
  textChangeInterval: 10000,
  rotationForceMultiplier: 0.5
};
    
    let currentTextIndex = 0;
    let nextTextTimeout;
    let textCoordinates = [];
    
    const mouse = {
      x: -500,
      y: -500,
      radius: config.mouseRadius
    };
    
    const particles = [];
    for (let i = 0; i < config.particleCount; i++) {
      particles.push({ x: 0, y: 0, baseX: 0, baseY: 0, vx: 0, vy: 0 });
    }
    
    const vertexShaderSource = `
        attribute vec2 a_position;
        attribute float a_hue;
        attribute float a_saturation;
        varying float v_hue;
        varying float v_saturation;
        void main() {
            gl_PointSize = ${config.particleSize.toFixed(1)};
            gl_Position = vec4(a_position, 0.0, 1.0);
            v_hue = a_hue;
            v_saturation = a_saturation;
        }
    `;
    
    const fragmentShaderSource = `
    precision mediump float;
    varying float v_hue;
    varying float v_saturation;
    void main() {
      vec3 color = vec3(1.0, 0.28, 0.08); // #FA4C14
      gl_FragColor = vec4(color, 1.0);
    }
  `;
    
    function createShader(gl, type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }
    
    function createProgram(gl, vertexShader, fragmentShader) {
      const program = gl.createProgram();
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
      }
      return program;
    }
    
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(
      gl,
      gl.FRAGMENT_SHADER,
      fragmentShaderSource
    );
    const program = createProgram(gl, vertexShader, fragmentShader);
    
    const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    const hueAttributeLocation = gl.getAttribLocation(program, "a_hue");
    const saturationAttributeLocation = gl.getAttribLocation(
      program,
      "a_saturation"
    );
    
    const positionBuffer = gl.createBuffer();
    const hueBuffer = gl.createBuffer();
    const saturationBuffer = gl.createBuffer();
    
    const positions = new Float32Array(config.particleCount * 2);
    const hues = new Float32Array(config.particleCount);
    const saturations = new Float32Array(config.particleCount);
    
    function getTextCoordinates(text) {
      const ctx = document.createElement("canvas").getContext("2d");
      ctx.canvas.width = canvas.width;
      ctx.canvas.height = canvas.height;
      const fontSize = Math.min(canvas.width / 6, canvas.height / 6);
      ctx.font = `900 ${fontSize}px Arial`;
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, canvas.width / 2, canvas.height / 2);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      const coordinates = [];
      for (let y = 0; y < canvas.height; y += 4) {
        for (let x = 0; x < canvas.width; x += 4) {
          const index = (y * canvas.width + x) * 4;
          if (imageData[index + 3] > 128) {
            coordinates.push({
              x: (x / canvas.width) * 2 - 1,
              y: (y / canvas.height) * -2 + 1
            });
          }
        }
      }
      return coordinates;
    }
    
    function createParticles() {
      textCoordinates = getTextCoordinates(config.textArray[currentTextIndex]);
      for (let i = 0; i < config.particleCount; i++) {
        const randomIndex = Math.floor(Math.random() * textCoordinates.length);
        const { x, y } = textCoordinates[randomIndex];
        particles[i].x = particles[i].baseX = x;
        particles[i].y = particles[i].baseY = y;
      }
    }
    function updateParticles() {
      for (let i = 0; i < config.particleCount; i++) {
        const particle = particles[i];
        const dx = mouse.x - particle.x;
        const dy = mouse.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const forceDirectionX = dx / distance;
        const forceDirectionY = dy / distance;
        const maxDistance = mouse.radius;
        const force = (maxDistance - distance) / maxDistance;
        const directionX = forceDirectionX * force * config.forceMultiplier;
        const directionY = forceDirectionY * force * config.forceMultiplier;
    
        const angle = Math.atan2(dy, dx);
    
        const rotationForceX = Math.sin(
          -Math.cos(angle * -1) *
            Math.sin(config.rotationForceMultiplier * Math.cos(force)) *
            Math.sin(distance * distance) *
            Math.sin(angle * distance)
        );
    
        const rotationForceY = Math.sin(
          Math.cos(angle * 1) *
            Math.sin(config.rotationForceMultiplier * Math.sin(force)) *
            Math.sin(distance * distance) *
            Math.cos(angle * distance)
        );
    
        if (distance < mouse.radius) {
          particle.vx -= directionX + rotationForceX;
          particle.vy -= directionY + rotationForceY;
        } else {
          particle.vx += (particle.baseX - particle.x) * config.returnSpeed;
          particle.vy += (particle.baseY - particle.y) * config.returnSpeed;
        }
    
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vx *= config.velocityDamping;
        particle.vy *= config.velocityDamping;
    
        const speed = Math.sqrt(
          particle.vx * particle.vx + particle.vy * particle.vy
        );
        const hue = (speed * config.colorMultiplier) % 360;
    

        positions[i * 2] = particle.x;
        positions[i * 2 + 1] = particle.y;
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, positions, gl.DYNAMIC_DRAW);
      gl.bindBuffer(gl.ARRAY_BUFFER, hueBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, hues, gl.DYNAMIC_DRAW);
      gl.bindBuffer(gl.ARRAY_BUFFER, saturationBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, saturations, gl.DYNAMIC_DRAW);
    }
    
    function animate() {
      updateParticles();
    
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(positionAttributeLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, hueBuffer);
      gl.disableVertexAttribArray(hueAttributeLocation);
      gl.disableVertexAttribArray(saturationAttributeLocation);
      gl.useProgram(program);
      gl.drawArrays(gl.POINTS, 0, config.particleCount);
      requestAnimationFrame(animate);
    }
    
    canvas.addEventListener("mousemove", (event) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / canvas.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / canvas.height) * 2 + 1;
    });
    
    canvas.addEventListener("mouseleave", () => {
      mouse.x = -500;
      mouse.y = -500;
    });
    
    window.addEventListener("resize", () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
      createParticles();
    });
    
    gl.clearColor(0, 0, 0, 1);
    createParticles();
    animate();
    nextTextTimeout = setTimeout(changeText, config.textChangeInterval);


    const wrapper = document.querySelector('.gridblock');
const items = wrapper.querySelectorAll('.gridblockspan');

const onPointerMove = (pointer) => {
  items.forEach(item => {
    const rect = item.getBoundingClientRect();
    const x = rect.x + (rect.width / 2);
    const y = rect.y + (rect.height / 2);
    
    const b = pointer.x - x;
    const a = pointer.y - y;
    const c = Math.sqrt(Math.pow(a,2) + Math.pow(b,2));
    const r = (Math.acos(b / c) * 180 / Math.PI) * (pointer.y > y ? 1 : -1);
    
    item.style.setProperty('--rotate', `${r}deg`);
  });
};

window.addEventListener('pointermove', onPointerMove);

onPointerMove(items[32].getBoundingClientRect());








const scrollIndicatorBars = document.getElementById('scroll-indicator-bars');
const maxBars = 20;

window.addEventListener('scroll', () => {
  const scrollPosition = window.scrollY;
  const documentHeight = document.body.offsetHeight;
  const viewportHeight = window.innerHeight;
  const scrollPercentage = (scrollPosition / (documentHeight - viewportHeight)) * 100;

  const numBars = Math.round((scrollPercentage / 100) * maxBars);
  const barsHtml = Array(numBars).fill('|').join('') + Array(maxBars - numBars).fill('-').join('');

  scrollIndicatorBars.innerHTML = barsHtml;
});






const scrollProgress = document.getElementById('scroll-progress');

window.addEventListener('scroll', () => {
  const scrollPosition = window.scrollY;
  const documentHeight = document.body.offsetHeight;
  const viewportHeight = window.innerHeight;
  const scrollPercentage = (scrollPosition / (documentHeight - viewportHeight)) * 100;

  const percentageText = `${Math.round(scrollPercentage).toString().padStart(3, '0')}`;
  scrollProgress.textContent = percentageText;
});









const ascii = ".:-=+*#%@"; 

const myCanvas = document.createElement('canvas');
myCanvas.width = 32;
myCanvas.height = 48;

const myCtx = myCanvas.getContext('2d');

const asciicontainer = document.querySelector('.ascii');

const map = (x, max, min, tmax, tmin) => (x - min) / (max - min) * (tmax - tmin) + tmin;

const lerp = (x, a, b) => a + (b - a) * x;

const map_table = new Array(255).fill(1).map((_, i) => Math.ceil(map(i, 255, 0, ascii.length - 1, 0)));

const line = (x1, y1, x2, y2) => {
    myCtx.beginPath();

    let grad = myCtx.createLinearGradient(x1, y1, x2, y2);
    grad.addColorStop(0, "rgba(255, 255, 255, 0.75)");
    grad.addColorStop(0.5, "rgba(255, 255, 255, 0.35)");
    grad.addColorStop(1, "rgba(255, 255, 255, 0.12)");
    
    myCtx.strokeStyle = grad;
    myCtx.moveTo(x1, y1);
    myCtx.lineTo(x2, y2);
    myCtx.stroke();
    myCtx.closePath();
}

const getAsciiOutput = (canvas, ctx) => {
    let imgd = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let pix = imgd.data;

    let output = '';

    for (let i = 0, n = pix.length; i < n; i += 4) {
        let xpos = (i / 4) % canvas.width;
        let char = ascii[map_table[pix[i]]];
        
        if (xpos == 0) {
            output += '<div>';
        } else if (xpos == canvas.width - 1) {
            output.innerHTML += '</div>';
        }

        output += char == ascii[0] ? `<span style="color: #FA4C14">${char}</span>` : char;
    }

    return output;
}

const randomBox = () => ({
    x: Math.floor(Math.random() * 10) + 7,
    y: Math.floor(Math.random() * 15) + 7,
    sx: 0,
    sy: 0,
    w: 6,
    h: 10,
    progress: 0
});

let box = randomBox();
box.sx = box.x;
box.sy = box.y;

let nextPos = randomBox();

let tick = 0;
let mouseState = false;

const loop = () => {
    tick += 0.025;

    myCtx.fillStyle = '#000';
    myCtx.fillRect(0, 0, myCanvas.width, myCanvas.height);

    myCtx.fillStyle = '#f4f4f4'
    myCtx.fillRect(box.x, box.y, box.w, box.h);


    line(box.x, box.y, 0, 0);
    line(box.x + box.w, box.y, myCanvas.width, 0);
    line(box.x, box.y + box.h, 0, myCanvas.height);
    line(box.x + box.w, box.y + box.h, myCanvas.width, myCanvas.height);

    myCtx.beginPath();
    let x = box.x + box.w / 2;
    let y = box.y + box.h / 2;

    let grad = myCtx.createRadialGradient(x, y, 5, x, y, 20);
    grad.addColorStop(0, "rgba(255, 255, 255, 0.5)");
    grad.addColorStop(0.5, "rgba(0, 0, 0, 0)");
    grad.addColorStop(1, "rgba(0, 0, 0, 0)");
    
    myCtx.fillStyle = grad;
    myCtx.arc(x, y, 6 + 2.5 * Math.acos(Math.sin(tick) * Math.PI / 4), 0, 2 * Math.PI);
    myCtx.fill();
    myCtx.closePath();

    if (!mouseState) {
        if (box.progress < 0.99) {
            box.progress += 0.005;
            box.x = lerp(box.progress, box.sx, nextPos.x);
            box.y = lerp(box.progress, box.sy, nextPos.y);
        } else {
            box = Object.assign({}, nextPos);
            box.sx = box.x;
            box.sy = box.y;
            nextPos = randomBox();
        }
    }

    asciicontainer.innerHTML = getAsciiOutput(myCanvas, myCtx);
    
    requestAnimationFrame(loop);
}

loop();

window.addEventListener('mouseover', _ => {
  mouseState = true;
});

window.addEventListener('mouseout', _ => {
  mouseState = false;
});

window.addEventListener('mousemove', e => {
  if (mouseState) {
      box.x = map(e.clientX, window.innerWidth, 0, myCanvas.width, 0) - box.w / 2;
      box.y = map(e.clientY, window.innerHeight, 0, myCanvas.height, 0) - box.h / 2;
  }
});