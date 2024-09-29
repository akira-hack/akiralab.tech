const chars = "×#-_¯—0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZ";

var Glitch = function(selector, index, numberOfGlitchedLetter, timeGlitch, timePerLetter, timeBetweenGlitch){
  this.selector = selector;
  this.index = index;
  this.numberOfGlitchedLetter = numberOfGlitchedLetter;
  this.innerText;
  this.charArray = [];
  this.charIndex = [];
  this.timeGlitch = timeGlitch;
  this.timeBetweenGlitch = timeBetweenGlitch;
  this.timePerLetter = timePerLetter;
  this.maxCount = Math.floor(this.timeGlitch/this.timePerLetter);
  this.count = 0;
  this.intervalId = null;
  this.timeoutId = null;
}

Glitch.prototype.init = function(){
  this.innerText = this.selector.innerText;
  this.charArray = this.innerText.split("");
  this.numberOfGlitchedLetter = this.charArray.length; // animate all characters
  this.defineCharIndexToRandomize();
}
Glitch.prototype.defineCharIndexToRandomize = function(){
  this.charIndex = [];
  for(let i=0; i<this.numberOfGlitchedLetter; i++){
    let randCharIndex = i; // animate all characters
    this.charIndex.push(randCharIndex);
  }
}

Glitch.prototype.randomize = function(){
  let randomString = Array.from(this.charArray);
  for(let i=0; i<this.numberOfGlitchedLetter; i++){
    let randIndex = Math.floor(Math.random() * chars.length);
    let randCharIndex = this.charIndex[i];
    if(randomString[randCharIndex] !== ' '){
      randomString[randCharIndex] = chars[randIndex];
    }
  }
  this.selector.innerText = randomString.join("");
}

Glitch.prototype.update = function(){
  if(this.count >= this.maxCount - 1){
    this.selector.innerText = this.innerText;
    this.defineCharIndexToRandomize();
    this.count = 0;
  }else{
    this.randomize();
    this.count ++;
  }
}

Glitch.prototype.startGlitch = function(){
  let ctx = this;
  this.intervalId = setInterval(function(){
    ctx.update();
  }, 10); // decreased timePerLetter to 10
  this.timeoutId = setTimeout(function(){
    ctx.stopGlitch();
  }, 200); // decreased glitch time to 0.2 seconds
}

Glitch.prototype.stopGlitch = function(){
  clearInterval(this.intervalId);
  clearTimeout(this.timeoutId);
  this.selector.innerText = this.innerText;
  this.count = 0;
}

var glitchArray = [];

function initAllGlitch(){
  var arrayElements = document.querySelectorAll("a, button");
  for(let i=0; i<arrayElements.length; i++){
    let selector = arrayElements[i];
    let glitch = new Glitch(selector, i, undefined, 200, 10, 400);
    glitch.init();
    glitchArray.push(glitch);
    selector.addEventListener("mouseover", function(){
      glitch.startGlitch();
    });
    selector.addEventListener("mouseout", function(){
      glitch.stopGlitch();
    });
  }
}

initAllGlitch();