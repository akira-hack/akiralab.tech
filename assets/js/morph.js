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

const parallaxContainer=document.querySelector(".parallax-container"),parallaxImage=document.querySelector(".parallax-image");function changeText(){const e=document.getElementById("myDiv");let t=0;const a=[" +_+"," *_*"," 0_0"," $_$"," ^_^"," @_@"," x_x"," O_o"];let n="",l=0;setInterval((()=>{l<a[t].length?(n+=a[t][l],e.textContent=n,l++):setTimeout((()=>{t=(t+1)%a.length,n="",l=0}),1e3)}),100)}window.addEventListener("scroll",(()=>{const e=window.scrollY,t=parallaxContainer.offsetTop,a=(parallaxContainer.offsetHeight,.5*(e-t));parallaxImage.style.transform=`translateY(${Math.min(0,a)}px)`})),changeText();
const scrollIndicatorBars=document.getElementById("scroll-indicator-bars"),maxBars=20;window.addEventListener("scroll",(()=>{const o=window.scrollY/(document.body.offsetHeight-window.innerHeight)*100,n=Math.round(o/100*20),r=Array(n).fill("|").join("")+Array(20-n).fill("-").join("");scrollIndicatorBars.innerHTML=r}));const scrollProgress=document.getElementById("scroll-progress");window.addEventListener("scroll",(()=>{const o=window.scrollY/(document.body.offsetHeight-window.innerHeight)*100,n=`${Math.round(o).toString().padStart(3,"0")}`;scrollProgress.textContent=n}));




























    
const wrapper = document.querySelector(".gridblock"),
    items = wrapper.querySelectorAll(".gridblockspan"),
    onPointerMove = (t) => {
        items.forEach((e) => {
            const a = e.getBoundingClientRect(),
                r = a.x + a.width / 2,
                n = a.y + a.height / 2,
                i = t.x - r,
                o = t.y - n,
                c = Math.sqrt(Math.pow(o, 2) + Math.pow(i, 2)),
                s = ((180 * Math.acos(i / c)) / Math.PI) * (t.y > n ? 1 : -1);
            e.style.setProperty("--rotate", `${s}deg`);
        });
    };
window.addEventListener("pointermove", onPointerMove), onPointerMove(items[32].getBoundingClientRect());
















const ascii = ".:-=+*#%@",
    myCanvas = document.createElement("canvas");
(myCanvas.width = 32), (myCanvas.height = 48);
const myCtx = myCanvas.getContext("2d"),
    asciicontainer = document.querySelector(".ascii"),
    map = (t, o, e, a, x) => ((t - e) / (o - e)) * (a - x) + x,
    lerp = (t, o, e) => o + (e - o) * t,
    map_table = new Array(255).fill(1).map((t, o) => Math.ceil(map(o, 255, 0, 8, 0))),
    line = (t, o, e, a) => {
        myCtx.beginPath();
        let x = myCtx.createLinearGradient(t, o, e, a);
        x.addColorStop(0, "rgba(255, 255, 255, 0.75)"),
            x.addColorStop(0.5, "rgba(255, 255, 255, 0.35)"),
            x.addColorStop(1, "rgba(255, 255, 255, 0.12)"),
            (myCtx.strokeStyle = x),
            myCtx.moveTo(t, o),
            myCtx.lineTo(e, a),
            myCtx.stroke(),
            myCtx.closePath();
    },
    getAsciiOutput = (t, o) => {
        let e = o.getImageData(0, 0, t.width, t.height).data,
            a = "";
        for (let o = 0, x = e.length; o < x; o += 4) {
            let x = (o / 4) % t.width,
                i = ascii[map_table[e[o]]];
            0 == x ? (a += "<div>") : x == t.width - 1 && (a.innerHTML += "</div>"), (a += i == ascii[0] ? `<span style="color: #FA4C14">${i}</span>` : i);
        }
        return a;
    },
    randomBox = () => ({ x: Math.floor(10 * Math.random()) + 7, y: Math.floor(15 * Math.random()) + 7, sx: 0, sy: 0, w: 6, h: 10, progress: 0 });
let box = randomBox();
(box.sx = box.x), (box.sy = box.y);
let nextPos = randomBox(),
    tick = 0,
    mouseState = !1;
const loop = () => {
    (tick += 0.025),
        (myCtx.fillStyle = "#000"),
        myCtx.fillRect(0, 0, myCanvas.width, myCanvas.height),
        (myCtx.fillStyle = "#f4f4f4"),
        myCtx.fillRect(box.x, box.y, box.w, box.h),
        line(box.x, box.y, 0, 0),
        line(box.x + box.w, box.y, myCanvas.width, 0),
        line(box.x, box.y + box.h, 0, myCanvas.height),
        line(box.x + box.w, box.y + box.h, myCanvas.width, myCanvas.height),
        myCtx.beginPath();
    let t = box.x + box.w / 2,
        o = box.y + box.h / 2,
        e = myCtx.createRadialGradient(t, o, 5, t, o, 20);
    e.addColorStop(0, "rgba(255, 255, 255, 0.5)"),
        e.addColorStop(0.5, "rgba(0, 0, 0, 0)"),
        e.addColorStop(1, "rgba(0, 0, 0, 0)"),
        (myCtx.fillStyle = e),
        myCtx.arc(t, o, 6 + 2.5 * Math.acos((Math.sin(tick) * Math.PI) / 4), 0, 2 * Math.PI),
        myCtx.fill(),
        myCtx.closePath(),
        mouseState ||
            (box.progress < 0.99
                ? ((box.progress += 0.005), (box.x = lerp(box.progress, box.sx, nextPos.x)), (box.y = lerp(box.progress, box.sy, nextPos.y)))
                : ((box = Object.assign({}, nextPos)), (box.sx = box.x), (box.sy = box.y), (nextPos = randomBox()))),
        (asciicontainer.innerHTML = getAsciiOutput(myCanvas, myCtx)),
        requestAnimationFrame(loop);
};
loop(),
    window.addEventListener("mouseover", (t) => {
        mouseState = !0;
    }),
    window.addEventListener("mouseout", (t) => {
        mouseState = !1;
    }),
    window.addEventListener("mousemove", (t) => {
        mouseState && ((box.x = map(t.clientX, window.innerWidth, 0, myCanvas.width, 0) - box.w / 2), (box.y = map(t.clientY, window.innerHeight, 0, myCanvas.height, 0) - box.h / 2));
    });
