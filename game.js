elements.preload = function(){
  elements.addImage('discover_mark.png');
  elements.addImage('magic_circle.png');
  elements.addImage('medal_spritesheet.png');
};

elements.setCanvasSize(800, 800);
elements.preload();
elements.imgLoad();


elements.onload = function(){
  stage = new Stage(originalMap);
  stage.setStage();
  stage.setCharacter();
  infomation = new Label(0, 700, 800, 800);
  infomation.inputText('start');
  elements.insert(infomation, elements.childs.length - 1);
};

class Stage extends Sprite{
  originalMap;
  map = new Array();
  blocks = new Array();
  player;
  enemys = new Array();
  teleport = {available: false, circles: new Array(), tick: 0};
  treasure = {available: false, medals: new Array(), count: 0, tick: 0};
  heap = new Heap(originalMap);


  constructor(map){
    super(0, 0, 800, 800);
    this.originalMap = map;
    this.availabelTouch = false;
    this.default_option.rect_style = 'rgba(0, 0, 0, 1)';
    this.setEvent('update', function(){
      if(this.teleport.available === false){
        if(this.teleport.tick < 500) this.teleport.tick++;
        else this.appearMagicCircle();
      }
      if(this.treasure.available === false){
        if(this.treasure.tick < 500) this.treasure.tick++;
        else {
          if(this.treasure.count < 3) this.appearMedal();
        }
      }
      this.writeInfo('Medal: ' + this.treasure.count);
    });
    elements.addChild(this);
  }

  setStage(){
    for(let i = 0; i < this.originalMap.length; i++){
      this.map.push(new Array());
      for(let j = 0; j < this.originalMap[0].length; j++){
        this.map[i].push(new Block(j, i));
        if(this.originalMap[i][j] === 0) this.map[i][j].disable(0);
      }
    }
    this.teleport.circles.push(new MagicCircle(0));
    this.teleport.circles.push(new MagicCircle(1));
    for(var i = 0; i < 3; i++){
      this.treasure.medals.push(new Medal(i));
    }
    this.heap.createHeap();
    this.appearMagicCircle();
  }

  setCharacter(){
    this.player = new Player(1, 1);
    this.enemys.push(new Enemy(18, 18));
    this.enemys.push(new Enemy(1, 18));
    this.enemys.push(new Enemy(18, 1));
  }

  appearMagicCircle(){
    let id_a = this.heap.vacantVertices[rand(this.heap.vacantVertices.length - 1)];
    let id_b = this.heap.vacantVertices[rand(this.heap.vacantVertices.length - 1)];
    this.teleport.circles[0].turnON(id_a, 500);
    this.teleport.circles[1].turnON(id_b, 500);
    this.teleport.available = true;
    this.teleport.tick = 0;
  }

  disappearMagicCircle(){
    this.teleport.circles[0].turnOff();
    this.teleport.circles[1].turnOff();
    this.teleport.available = false;
  }

  teleportPlayer(index){
    let id = this.teleport.circles[(index + 1) % 2].id;
    this.player.x = (id % option.modules_count) * option.module_length + (option.module_length - this.player.width) / 2;
    this.player.y = Math.floor(id / option.modules_count) * option.module_length + (option.module_length - this.player.height) / 2;
    this.teleport.circles[0].count = 10;
    this.teleport.circles[1].count = 10;
    this.teleport.available = false;
    this.player.getCord();
  }

  appearMedal(){
    let id = this.heap.vacantVertices[rand(this.heap.vacantVertices.length - 1)];
    this.treasure.medals[this.treasure.count].turnON(id);
    this.treasure.available = true;
  }

  getMedal(index){
    this.treasure.medals[index].turnOff();
    this.treasure.count++;
    this.treasure.tick = 0;
    this.treasure.available = false;
    if(this.treasure.count === 3) this.gameClear();
  }

  writeInfo(text){
    infomation.inputText(text, 'rgba(255, 255, 255, 1)', '36px serif', 'bottom', 'left');
  }

  gameClear(){
    elements.end = true;
    this.writeInfo('Medal: 3, Game Clear!');
  }
}

class ParentPlayer extends Sprite{
  row;
  line;
  id;

  constructor(row, line){
    super(row * option.module_length, line * option.module_length, 20, 20);
    this.row = row;
    this.line = line;
    this.id = this.line * option.modules_count + this.row;
    this.default_option.rect_style = 'rgba(255, 0, 0, 1)';
    this.default_option.form = 'rect';
  }

  move(dir, speed){
    switch(dir){
      case 'right': if(this.isOnWall(this.x + speed, this.y)) this.x += speed; break;
      case 'left': if(this.isOnWall(this.x - speed, this.y)) this.x -= speed; break;
      case 'up': if(this.isOnWall(this.x, this.y - speed)) this.y -= speed; break;
      case 'down': if(this.isOnWall(this.x, this.y + speed)) this.y += speed; break;
      default: break;
    }
    this.getCord()
  }

  isOnWall(x, y){
    let bool = true;
    root : for(let i = 0; i < stage.map.length; i++){
      for(let j = 0; j < stage.map[0].length; j++){
        if(stage.map[i][j].condition === 0) continue;
        if(stage.map[i][j].isTouchPlayer(x, y, this.width, this.height) === false){
          bool = false;
          break root;
        }
      }
    }
    return bool;
  }

  getCord(){
    this.row = Math.round((this.x + this.width / 2 + (option.module_length / 2)) / option.module_length) - 1;
    this.line = Math.round((this.y + this.height / 2 + (option.module_length / 2)) / option.module_length) - 1;
    this.id = this.line * option.modules_count + this.row;
  }
}

class Player extends ParentPlayer{
  constructor(row, line){
    super(row, line);
    this.setEvent('update', function(){
      if(elements.keyboard.ArrowRight) this.move('right', 6);
      else if(elements.keyboard.ArrowLeft) this.move('left', 6);
      else if(elements.keyboard.ArrowUp) this.move('up', 6);
      else if(elements.keyboard.ArrowDown) this.move('down', 6);
    });
    this.default_option.rect_style = 'rgba(0, 150, 250, 1)';
    this.availabelCollision = true;
    elements.addChild(this);
  }
}

class Enemy extends ParentPlayer{
  heap;
  track = new Array();
  next;
  random;
  mark;
  speed;
  player;

  constructor(row, line){
    super(row, line);
    this.default_option.rect_style = 'rgba(255, 150, 0, 1)';
    this.speed = 3;
    this.heap = new Heap(originalMap);
    this.heap.createHeap();
    this.random = this.heap.vacantVertices[rand(this.heap.vacantVertices.length - 1)];
    this.track = this.heap.getTrack(this.random, this.id);
    this.next = this.track.shift();
    this.mark = new Mark(this.x + this.width, this.y, this);
    this.player = stage.player;

    this.setEvent('update', function(){
      if(this.id === this.player.id){
        stage.writeInfo('Lose... You are caught...');
        elements.end = true;
      } else {
        let dis = Math.hypot(Math.abs(this.x - this.player.x), Math.abs(this.y - this.player.y));
        if((dis < 200 && this.random !== -1) || (dis < 250 && this.random === -1)){
          if(this.random !== -1){
            this.speed = 6;
            this.default_option.rect_style = 'rgba(255, 0, 0, 1)';
            this.appearMark();
            this.random = -1;
          }
          if(!this.onCenter(this.next)){
            this.goToNext(this.next);
          } else {
            this.track = this.heap.getTrack(this.player.id, this.id);
            this.next = this.track.shift();
            this.goToNext(this.next);
          }
        } else {
          if(this.random === -1){
            this.speed = 4;
            this.default_option.rect_style = 'rgba(255, 150, 0, 1)';
            this.random = this.heap.vacantVertices[rand(this.heap.vacantVertices.length - 1)];
            this.track = this.heap.getTrack(this.random, this.id);
            this.next = this.track.shift();
          }
          if(this.track.length === 0){
            this.random = this.heap.vacantVertices[rand(this.heap.vacantVertices.length - 1)];
            this.track = this.heap.getTrack(this.random, this.id);
            this.next = this.track.shift();
          } else {
            if(!this.onCenter(this.next)){
              this.goToNext(this.next);
            } else {
              this.next = this.track.shift();
              this.goToNext(this.next);
            }
          }
        }
      }
    });
    elements.addChild(this);
  }

  onCenter(id){
    return (this.x + this.width / 2 === (id % option.modules_count) * option.module_length + option.module_length / 2) && (this.y + this.height / 2 === Math.floor(id / option.modules_count) * option.module_length + option.module_length / 2)
  }

  goToNext(id){
    if(id === -1 || id === undefined){
      this.track = this.heap.getTrack(this.heap.vacantVertices[rand(this.heap.vacantVertices.length - 1)], this.id);
      this.next = this.track.shift();
    }
    this.x = Math.floor(this.x);
    this.y = Math.floor(this.y);
    for(let i = 0; i < this.speed; i++){
      if(Math.abs((this.y + this.height / 2) - (Math.floor(id / option.modules_count) * option.module_length + option.module_length / 2)) === 0){
        if(Math.abs((this.x + this.width / 2) - ((id % option.modules_count) * option.module_length + option.module_length / 2)) === 0) continue;
        else {
          if((this.x + this.width / 2) < (id % option.modules_count) * option.module_length + option.module_length / 2) this.x+= 1;
          else this.x-= 1;
        }
      } else {
        if((this.y + this.height / 2) < Math.floor(id / option.modules_count) * option.module_length + option.module_length / 2) this.y+= 1;
        else this.y-= 1;
      }
    }
    this.getCord();
  }

  appearMark(){
    this.mark.availabelDisplay = true;
    this.mark.tick = 20;
    this.mark.x = this.x + this.width / 2;
    this.mark.y = this.y;
  }
}

class Block extends Sprite{
  row;
  line;
  id;
  condition;

  constructor(row, line){
    super(row * option.module_length, line * option.module_length, option.module_length, option.module_length);
    this.row = row;
    this.line = line;
    this.id = this.line * option.modules_count + this.row;
    this.default_option.rect_style = 'rgba(150, 100, 0, 1)';
    this.condition = 1;
    elements.addChild(this);
  }

  disable(value){
    this.condition = value;
    if(this.condition === 0) this.default_option.rect_style = 'rgba(0, 0, 0, 0)';
  }

  isTouchPlayer(x, y, width, height){
    return (this.x >= x + width || this.x + this.width <= x) || (this.y >= y + height || this.y + this.height <= y);
  }
}

class Mark extends Sprite{
  parent;
  tick;

  constructor(x, y, parent){
    super(x, y, 50, 50);
    this.src = 'discover_mark.png';
    this.tick = 0;
    this.availabelDisplay = false;
    this.parent = parent;
    this.setEvent('update', function(){
      if(this.tick === 0) this.availabelDisplay = false;
      else {
        this.x = this.parent.x;
        this.y = this.parent.y - this.height;
        this.tick--;
      }
    });
    elements.addChild(this);
  }
}

class Heap{
  vertices = new Array();
  openList = new Array();
  closeList = new Array();
  map;
  xMax;
  yMax;
  vacantVertices = new Array();

  constructor(map){
    this.map = map;
    this.xMax = this.map.length;
    this.yMax = this.map[0].length;
  }

  createHeap(){
    for(let i = 0; i < this.yMax; i++){
      for(let j = 0; j < this.xMax; j++){
        this.vertices.push(new Vertex(j, i, this.map[i][j]));
        if(this.map[i][j] === 0) this.vacantVertices.push(i * option.modules_count + j);
      }
    }
    for(let i = 0; i < this.yMax; i++){
      for(let j = 0; j < this.xMax; j++){
        if(this.vertices[i * this.xMax + j].wall) continue;
        if(j + 1 < this.xMax && this.map[i][j + 1] === 0) this.vertices[i * this.xMax + j].setAdj(i * this.xMax + j + 1, 0);
        if(j - 1 >= 0 && this.map[i][j - 1] === 0) this.vertices[i * this.xMax + j].setAdj(i * this.xMax + j - 1, 1);
        if(i + 1 < this.yMax && this.map[i + 1][j] === 0) this.vertices[i * this.xMax + j].setAdj((i + 1) * this.xMax + j, 2);
        if(i - 1 >= 0 && this.map[i - 1][j] === 0) this.vertices[i * this.xMax + j].setAdj((i - 1) * this.xMax + j, 3);
      }
    }
  }

  getDist(u, v){
    return Math.abs(u.x - v.x) + Math.abs(u.y - v.y);
  }

  aster(start, end){
    for(let vertex of this.vertices){
      vertex.reset();
    }
    this.vertices[start].g = 0;
    this.vertices[start].f = this.getDist(this.vertices[start], this.vertices[end]);
    this.openList.length = 0;
    this.closeList.length = 0;
    this.openList.push(this.vertices[start]);

    while(this.openList.length > 0){
      this.openList.sort((a, b) => a.f - b.f);
      let u = this.openList.shift();
      if(u.id === end) break;
      for(let a of u.adj){
        if(a === -1) continue;
        let v = this.vertices[a];
        let f = u.g + 1 + this.getDist(v, this.vertices[end]);
        if(this.openList.includes(v)){
          if(f < v.f){
            v.f = f;
            v.g = u.g + 1;
            v.pred = u.id;
            this.openList.sort((a, b) => a.f - b.f);
          }
        } else if(this.closeList.includes(v)){
          if(f < v.f){
            v.f = f;
            v.g = u.g + 1;
            v.pred = u.id;
            this.closeList.filter(e => e !== v);
            this.openList.push(v);
            this.openList.sort((a, b) => a.f - b.f);
          }
        } else{
          v.f = f;
          v.g = u.g + 1;
          v.pred = u.id;
          this.openList.push(v);
          this.openList.sort((a, b) => a.f - b.f);
        }
      }
      this.closeList.push(u);
    }
  }

  getTrack(start, end){
    let track = new Array();
    this.aster(start, end);
    let id = end;
    for(let i = 0; i < 400; i++){
      if(id === -1){
        break;
      }
      id = this.vertices[id].pred;
      track.push(id);
      if(id === start){
        break;
      }
    }
    return track;
  }
}

class Vertex{
  x;
  y;
  id;
  g = 10000;
  f = 10000;
  wall;
  pred;
  adj = [-1, -1, -1, -1];

  constructor(x, y, cond){
    this.x = x;
    this.y = y;
    this.id = this.x + this.y * option.modules_count;
    this.wall = cond === 1 ? true : false;
  }

  setAdj(id, index){
    if(index >= 4) return;
    this.adj[index] = id;
  }

  reset(){
    this.g = 1000;
    this.f = 1000;
    this.pred = -1;
  }
}

class MagicCircle extends Sprite{
  index;
  id = -1;
  counter = 0;

  constructor(index){
    super(0, 0, option.module_length, option.module_length);
    this.src = 'magic_circle.png';
    this.setEvent('update', function(){
      if(this.count <= 0){
        stage.disappearMagicCircle();
      }
      if(stage.teleport.available === true && this.isCollided(stage.player, 'rectangle_simple')){
        stage.teleportPlayer(this.index);
      }
      this.count--;
    });
    this.availabelDisplay = false;
    this.availabelCollision = true;
    this.index = index;
    elements.addChild(this);
  }

  turnON(id, count){
    this.id = id;
    this.x = (this.id % option.modules_count) * option.module_length;
    this.y = Math.floor(this.id / option.modules_count) * option.module_length
    this.count = count;
    this.availabelDisplay = true;
  }

  turnOff(){
    this.id = -1;
    this.availabelDisplay = false;
  }
}

class Medal extends Sprite{
  index;
  condition = 0;
  id;

  constructor(index){
    super(0, 0, option.module_length, option.module_length);
    this.index = index;
    this.src = 'medal_spritesheet.png';
    this.setEvent('update', function(){
      if(this.condition === 1){
        if(this.isCollided(stage.player, 'rectangle_simple')){
          stage.getMedal(this.index);
        }
        if(elements.frame % 2 == 0){
          this.changeFrame((this.sheet_option.frame + 1) % 12);
        }
      }
    });
    this.availabelDisplay = false;
    this.availabelCollision = true;
    elements.addChild(this);
    this.sheetStyle(40, 40, 0);
  }

  turnON(id){
    this.condition = 1;
    this.id = id;
    this.x = (id % option.modules_count) * option.module_length;
    this.y = Math.floor(id / option.modules_count) * option.module_length;
    this.availabelDisplay = true;
  }

  turnOff(){
    this.condition = 3;
    this.availabelDisplay = false;
  }
}

class Label extends Sprite{

  constructor(x, y, width, height){
    super(x, y, width, height);
    elements.addChild(this);
  }

  inputText(text, color, font, line, align){
    this.default_option.text_content = text;
    this.default_option.text_color = color;
    this.default_option.text_font = font;
    this.default_option.text_line = line;
    this.default_option.text_align = align;
  }
}

originalMap = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1],
  [1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];
option = {module_length: 40, modules_count: 20};
