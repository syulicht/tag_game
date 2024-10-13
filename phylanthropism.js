class Sprite {
  x = 0;
  y = 0;
  width;
  height;
  scaleX = 1;
  scaleY = 1;
  adjustX = 0;
  adjustY = 0;
  adjustWidth;
  adjustHeight;
  ratio;
  rotation = 0;
  img = new Image();
  src = '';
  availabelDisplay = true;
  availabelTouch = true;
  availabelCollision = false;
  touch = false;
  update = function(){};
  touchStart = function(){};
  touchEnd = function(){};
  touchMove = function(){};
  touchOver = function(){};
  updateEvent = true;
  touchStartEvent = false;
  touchEndEvent = false;
  touchMoveEvent = false;
  touchOverEvent = false;
  status = 'not_in_use';
  default_option = {rect_style: 'rgba(0, 0, 0, 0)'};
  sheet_option = {frame: 0, width: 0, height: 0, sx: 0, sy: 0};
  vertices = new Array();

  constructor(x, y, width, height){
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.ratio = elements.ratio;
    this.adjustValue();
  }

  display(){
    if(this.availabelDisplay === false) return;
    this.adjustValue();
    ctx.save();
    this.rotation -= Math.floor(this.rotation / 360) * 360;
    ctx.translate(this.adjustX + this.adjustWidth / 2, this.adjustY + this.adjustHeight / 2);
    ctx.rotate((Math.PI / 180) * this.rotation);
    ctx.translate(-(this.adjustX + this.adjustWidth / 2), -(this.adjustY + this.adjustHeight / 2));
    if(this.status === 'in_use_as_image') {
      ctx.drawImage(this.img, this.adjustX, this.adjustY, this.adjustWidth, this.adjustHeight);
    } else if(this.status === 'in_use_as_spritesheet'){
      ctx.drawImage(this.img, this.sheet_option.sx, this.sheet_option.sy, this.sheet_option.width, this.sheet_option.height, this.adjustX, this.adjustY, this.adjustWidth, this.adjustHeight);
    }
    else if(this.status === 'in_use_as_default') {
      ctx.fillStyle = this.default_option.rect_style;
      if('form' in this.default_option === true){
        if(this.default_option.form === 'circle'){
          ctx.beginPath();
          ctx.arc(this.adjustX + (this.adjustWidth / 2), this.adjustY + (this.adjustHeight / 2), this.adjustWidth / 2, 0, 2 * Math.PI, true);
          ctx.fill();
        } else if(this.default_option.form === 'rect') ctx.fillRect(this.adjustX, this.adjustY, this.adjustWidth, this.adjustHeight);
      } else ctx.fillRect(this.adjustX, this.adjustY, this.adjustWidth, this.adjustHeight);
      if('text_content' in this.default_option === true){
        if('text_color' in this.default_option === true) ctx.fillStyle = this.default_option.text_color;
        else ctx.fillStyle = 'rgba(0, 0, 0, 1)';
        if('text_font' in this.default_option === true) ctx.font = (Number(this.default_option.text_font.slice(0, 2)) * this.ratio).toString() + this.default_option.text_font.slice(2);
        if('text_line' in this.default_option === true) ctx.textBaseline = this.default_option.text_line;
        if('text_align' in this.default_option === true) ctx.textAlign = this.default_option.text_align;
        ctx.fillText(this.default_option.text_content, this.adjustX, this.adjustY, this.adjustWidth);
      }
      if('border' in this.default_option === true){
        ctx.lineWidth = this.default_option.border * this.ratio;
        if('border_color' in this.default_option === true) ctx.strokeStyle = this.default_option.border_color;
        ctx.strokeRect(this.adjustX, this.adjustY, this.adjustWidth, this.adjustHeight);
      }
    }
    ctx.restore();
  }

  setEvent(type, listener){
    if(type === 'update'){
      this.update = listener;
      this.updateEvent = true;
    } else if(type === 'touchstart'){
      this.touchStart = listener;
      this.touchStartEvent = true;
    } else if(type === 'touchend'){
      this.touchEnd = listener;
      this.touchEndEvent = true;
    } else if(type === 'touchmove'){
      this.touchMove = listener;
      this.touchMoveEvent = true;
    } else if(type === 'touchover'){
      this.touchOver = listener;
      this.touchOverEvent = true;
    }
  }

  isOnMouse(x, y){
    this.getFourVertices();
    var a = this.outerProduct(this.vertices[1].x - this.vertices[0].x, this.vertices[1].y - this.vertices[0].y, x - this.vertices[0].x, y - this.vertices[0].y);
    var b = this.outerProduct(this.vertices[2].x - this.vertices[1].x, this.vertices[2].y - this.vertices[1].y, x - this.vertices[1].x, y - this.vertices[1].y);
    var c = this.outerProduct(this.vertices[3].x - this.vertices[2].x, this.vertices[3].y - this.vertices[2].y, x - this.vertices[2].x, y - this.vertices[2].y);
    var d = this.outerProduct(this.vertices[0].x - this.vertices[3].x, this.vertices[0].y - this.vertices[3].y, x - this.vertices[3].x, y - this.vertices[3].y);
    if(a > 0 && b > 0 && c > 0 && d > 0) return true;
    else return false;
  }

  getFourVertices(){
    this.adjustValue();
    this.vertices.length = 0;
    let hypot = Math.hypot(this.adjustWidth / 2, this.adjustHeight / 2);
    let rad_a = (Math.PI * this.rotation) / 180;
    let rad_b = Math.asin((this.adjustHeight / 2) / hypot);
    this.vertices.push({x: Math.cos(rad_a + rad_b) * hypot + this.adjustX + (this.adjustWidth / 2), y: Math.sin(rad_a + rad_b) * hypot + this.adjustY + (this.adjustHeight / 2)});
    this.vertices.push({x: Math.cos((Math.PI - rad_b) + rad_a) * hypot + this.adjustX + (this.adjustWidth / 2), y: Math.sin((Math.PI - rad_b) + rad_a) * hypot + this.adjustY + (this.adjustHeight / 2)});
    this.vertices.push({x: Math.cos((Math.PI + rad_b) + rad_a) * hypot + this.adjustX + (this.adjustWidth / 2), y: Math.sin((Math.PI + rad_b) + rad_a) * hypot + this.adjustY + (this.adjustHeight / 2)});
    this.vertices.push({x: Math.cos((Math.PI * 2 - rad_b) + rad_a) * hypot + this.adjustX + (this.adjustWidth / 2), y: Math.sin((Math.PI * 2 - rad_b) + rad_a) * hypot + this.adjustY + (this.adjustHeight / 2)});
  }

  outerProduct(ax, ay, bx, by){
    return ax * by - ay * bx;
  }

  sheetStyle(width, height, frame){
    if(this.status === 'in_use_as_image'){
      this.status = 'in_use_as_spritesheet';
      this.sheet_option.width = width;
      this.sheet_option.height = height;
      this.changeFrame(frame);
    }
  }

  changeFrame(frame){
    if(this.status === 'in_use_as_spritesheet'){
      this.sheet_option.frame = frame;
      let row = Math.floor(this.img.width / this.sheet_option.width);
      let line = Math.floor(this.img.height / this.sheet_option.height);
      this.sheet_option.sx = (this.sheet_option.frame % row) * this.sheet_option.width;
      this.sheet_option.sy = Math.floor(this.sheet_option.frame / row) * this.sheet_option.height;
    }
  }

  adjustValue(){
    this.adjustX = this.x * this.ratio;
    this.adjustY = this.y * this.ratio;
    this.adjustWidth = this.width * this.scaleX * this.ratio;
    this.adjustHeight = this.height * this.scaleY * this.ratio;
  }

  adjustReverseValue(){
    this.x = this.adjustX / this.ratio;
    this.y = this.adjustY / this.ratio;
    this.width = this.adjustWidth / (this.scaleX * this.ratio);
    this.height = this.adjustHeight / (this.scaleY * this.ratio);
  }

  //"isCollided" is inperfect. It has to be finished finally.
  isCollided(target, type){
    if(this.availabelCollision === false || target.availabelCollision === false) return false;
    let bool = false;
    if(type === 'rectangle' || type === 'rectangle_simple'){
      if(this.rotation === 0 || this.rotation === 180 || type === 'rectangle_simple'){
        let width = Math.abs((this.x + this.width * this.scaleX / 2) - (target.x + target.width * target.scaleX / 2));
        let height = Math.abs((this.y + this.height * this.scaleY / 2) - (target.y + target.height * target.scaleY / 2));
        if(width < this.width / 2 + target.width / 2 && height < this.height / 2 + target.height / 2) bool = true;
      } else {
        this.getFourVertices();
        target.getFourVertices();
        for(let vertex of target.vertices){
          let a = this.outerProduct(this.vertices[1].x - this.vertices[0].x, this.vertices[1].y - this.vertices[0].y, vertex.x - this.vertices[0].x, vertex.y - this.vertices[0].y);
          let b = this.outerProduct(this.vertices[2].x - this.vertices[1].x, this.vertices[2].y - this.vertices[1].y, vertex.x - this.vertices[1].x, vertex.y - this.vertices[1].y);
          let c = this.outerProduct(this.vertices[3].x - this.vertices[2].x, this.vertices[3].y - this.vertices[2].y, vertex.x - this.vertices[2].x, vertex.y - this.vertices[2].y);
          let d = this.outerProduct(this.vertices[0].x - this.vertices[3].x, this.vertices[0].y - this.vertices[3].y, vertex.x - this.vertices[3].x, vertex.y - this.vertices[3].y);
          if(a > 0 && b > 0 && c > 0 && d > 0) {
            bool = true;
            break;
          }
        }
      }
    } else if(type === 'circle'){
      let hypot = Math.hypot(Math.abs(this.x + (this.width * this.scaleX / 2) - target.x - (target.width * target.scaleY / 2)), Math.abs(this.y + (this.height * this.scaleY / 2) - target.y - (target.height * target.scaleY / 2)));
      if(hypot < this.width + target.width) bool = true;
      else bool = false;
    }
    return bool;
  }
}

class Elements {
  childs = new Array();
  preload = function(){};
  onload = function(){};
  imageAsset = new Array();
  frame = 0;
  keyboard = {'ArrowRight': false, 'ArrowUp': false, 'ArrowLeft': false, 'ArrowDown': false};
  screenWidth;
  screenHeight;
  canvasWidth;
  canvasHeight;
  ratio;
  fps = 20;
  mspf = 50;
  end = false;
  timeStamp = 0;
  animationMode = 'timeout';

  constructor(){
  }

  addChild(element){
    element.status = 'in_use_as_default';
    if(element.src !== '' && this.imageAsset.some(img => img.name === element.src)){
      element.status = 'in_use_as_image';
      element.img = this.imageAsset.find(img => img.name === element.src).img;
    }
    this.childs.push(element);
  }

  removeChild(element){
    this.childs = this.childs.filter(child => child !== element);
  }

  imgLoad(){
    for(var img of this.imageAsset){
      img.img.src = img.name;
    }
  }

  addImage(name){
    this.imageAsset.push({name: name, img: new Image(), finish: false});
  }

  insert(object, index){
    if(typeof index !== 'number' || index > this.childs.length || index < 0) return;
    this.childs = this.childs.filter(child => child !== object);
    this.childs.splice(index, 0, object);
  }

  getWindowSize(width, height){
    this.screenWidth = width;
    this.screenHeight = height;
    let widthRatio = this.screenWidth / this.canvasWidth;
    let heightRatio = this.screenHeight / this.canvasHeight;
    if(widthRatio < 1 || heightRatio < 1){
      if(widthRatio < heightRatio) this.ratio = widthRatio;
      else this.ratio = heightRatio;
      this.canvasWidth *= this.ratio;
      this.canvasHeight *= this.ratio;
    } else this.ratio = 1;
  }

  setCanvasSize(width, height){
    this.canvasWidth = width;
    this.canvasHeight = height;
  }

  setFps(fps){
    this.fps = fps;
    this.mspf = Math.floor(1000 / this.fps);
  }

  updateTimeStamp(){
    if(this.timeStamp === 0 || (Date.now() - this.timeStamp) >= this.mspf){
      this.timeStamp = Date.now();
      return true;
    } else return false;
  }
}

function set(){
  canvas.id = 'canvas';
  elements.getWindowSize(window.innerWidth, window.innerHeight - 10);
  canvas.width = elements.canvasWidth;
  canvas.height = elements.canvasHeight;
  document.body.appendChild(canvas);
  if(canvas.getContext){
    ctx = canvas.getContext('2d');

    document.addEventListener('mousedown', function(e){
      let target = elements.childs.findLast(child => child.touch === false && child.isOnMouse(e.pageX, e.pageY) && child.availabelTouch);
      if(typeof target !== 'undefined') {
        if(target.touchStartEvent) target.touchStart(e.pageX, e.pageY);
        target.touch = true;
      }
    });
    document.addEventListener('mouseup', function(e){
      let target = elements.childs.findLast(child => child.touch === true);
      if(typeof target !== 'undefined') {
        if(target.touchEndEvent) target.touchEnd(e.pageX, e.pageY);
        target.touch = false;
      }
    });
    document.addEventListener('mousemove', function(e){
      let target = elements.childs.findLast(child => child.touch === true);
      if(typeof target !== 'undefined'){
        if(target.touchMoveEvent) target.touchMove(e.pageX, e.pageY);
      } else {
        target = elements.childs.findLast(child => child.touch === false && child.isOnMouse(e.pageX, e.pageY) && child.availabelTouch && child.touchOverEvent);
        if(typeof target !== 'undefined'){
          if(target.touchOverEvent) target.touchOver(e.pageX, e.pageY);
        }
      }
    });
    document.addEventListener('keydown', function(e){
      if(e.code === 'ArrowRight'){
        elements.keyboard.ArrowRight = true;
      } else if(e.code === 'ArrowLeft'){
        elements.keyboard.ArrowLeft = true;
      } else if(e.code === 'ArrowUp'){
        elements.keyboard.ArrowUp = true;
      } else if(e.code === 'ArrowDown'){
        elements.keyboard.ArrowDown = true;
      }
    });
    document.addEventListener('keyup', function(e){
      if(e.code === 'ArrowRight'){
        elements.keyboard.ArrowRight = false;
      } else if(e.code === 'ArrowLeft'){
        elements.keyboard.ArrowLeft = false;
      } else if(e.code === 'ArrowUp'){
        elements.keyboard.ArrowUp = false;
      } else if(e.code === 'ArrowDown'){
        elements.keyboard.ArrowDown = false;
      }
    });

    elements.onload();
    start();
  } else {

  }
}

function start(){
  elements.setFps(50);
  if(elements.animationMode === 'request') loop = window.requestAnimationFrame(update);
  else loop = setTimeout(update, elements.mspf);
  console.log('start');
}

function update(){
  ctx.save();
  ctx.clearRect(0, 0, elements.canvasWidth, elements.canvasHeight);
  if(elements.animationMode === 'request'){
    if(elements.updateTimeStamp()){
      for(var element of elements.childs){
        if(element.updateEvent) element.update();
      }
      elements.frame ++;
    }
    for(var element of elements.childs){
      element.display();
    }
    if(elements.end === false) loop = window.requestAnimationFrame(update);
  } else {
    for(var element of elements.childs){
      if(element.updateEvent) element.update();
    }
    elements.frame ++;
    for(var element of elements.childs){
      element.display();
    }
    if(elements.end === false) loop = setTimeout(update, elements.mspf);
  }
}

var canvas = document.createElement('canvas');
var ctx;
var loop;
var elements = new Elements();

window.addEventListener('load', set);

var rand = function(n){
  return Math.floor(Math.random() * (n + 1));
};
