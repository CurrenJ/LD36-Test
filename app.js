//Make requestAnimFrame cross browser
var requestAnimFrame = (function(){
    return window.requestAnimationFrame       ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        window.oRequestAnimationFrame      ||
        window.msRequestAnimationFrame     ||
        function(callback){
            window.setTimeout(callback, 1000 / 60);
        };
})();

//Set canvas
var canvas = document.createElement('canvas');
var ctx = canvas.getContext('2d');
canvas.width = 512;
canvas.height = 480;
document.body.appendChild(canvas);

//Set game loop
var lastTime;
function main() {
  var now = Date.now();
  var dt = (now - lastTime) / 1000.0;
  update(dt);
  render();
  lastTime = now;
  requestAnimFrame(main);
}

function init() {
  terrainPattern = ctx.createPattern(resources.get('img/terrain.png'),'repeat');
  document.getElementById('play-again').addEventListener('click',function() {
    reset();
  });
  reset();
  lastTime = Date.now();
  main();
}

//Load all game sprites here
resources.load([
  'img/terrain.png',
  'img/player.png',
  'img/bricks2.png'
]);
resources.onReady(init);

//Game state
var player = {
  pos: [0,0],
  sprite: new Sprite('img/player.png',[0,0],[24,30])
};
var blocks = [];

//for (var i = 0; i < Math.floor(canvas.width / 16); i++) {
//  blocks.push({
//    pos: [i * 16,canvas.height - 16],
//    sprite: new Sprite('img/bricks2.png',[0,0],[16,16])
//  });
//}

var gravity = 0;

var mouse = {
  x: 0,
  y: 0
};

var lastFire = Date.now();
var gameTime = 0;
var isGameOver;
var terrainPattern;

var score = 0;
var scoreEl = document.getElementById('score');

var playerSpeed = 200; //px per sec

//Update loop
function update(dt) {
  gameTime += dt;

  handleInput(dt);
  updateEntities(dt);

  checkCollisions();
}

//Handle player input
function handleInput(dt) {
  if(input.isDown('DOWN') || input.isDown('s')) {
    player.pos[1] += playerSpeed * dt;
  }
  if(input.isDown('UP') || input.isDown('w')) {
    player.pos[1] -= playerSpeed * dt;
  }
  if(input.isDown('LEFT') || input.isDown('a')) {
    player.pos[0] -= playerSpeed * dt;
  }
  if(input.isDown('RIGHT') || input.isDown('d')) {
    player.pos[0] += playerSpeed * dt;
  }
}

//Update entities
function updateEntities(dt) {
  player.sprite.update(dt);
}

//deal with collisions

function collides(x, y, r, b, x2, y2, r2, b2) {
    return !(r <= x2 || x > r2 ||
             b <= y2 || y > b2);
}

function boxCollides(pos, size, pos2, size2) {
    return collides(pos[0], pos[1],
                    pos[0] + size[0], pos[1] + size[1],
                    pos2[0], pos2[1],
                    pos2[0] + size2[0], pos2[1] + size2[1]);
}

function checkCollisions() {
  checkPlayerBounds();
  //run detection for gems and the player
  for (var i = 0; i < blocks.length; i++) {
    var pos = blocks[i].pos;
    var size = blocks[i].sprite.size;

    if(boxCollides(pos,size,player.pos,player.sprite.size)) {
      player.pos[1] = canvas.height - 46; //!THIS NEEDS TO CHANGE!
    }else {
      player.pos[1] = player.pos[1] + .09;//first attempt at gravity, need to impelement a 'time off ground function'
    }
  }
}

function checkPlayerBounds() {
  if(player.pos[0] < 0) {
    player.pos[0] = 0;
  } else if (player.pos[0] > canvas.width - player.sprite.size[0]) {
    player.pos[0] = canvas.width - player.sprite.size[0];
  }

  if(player.pos[1] < 0) {
    player.pos[1] = 0;
  }else if(player.pos[1] > canvas.height - player.sprite.size[1]) {
    player.pos[1] = canvas.height - player.sprite.size[1];
  }
}

//Have the canvas draw everything
function render() {
  ctx.fillStyle = terrainPattern;
  ctx.fillRect(0,0,canvas.width,canvas.height);

  if(!isGameOver) {
    renderEntity(player);
  }
  renderEntities(blocks);
}

function renderEntities(list) {
  for(var i = 0; i < list.length; i++) {
    renderEntity(list[i]);
  }
}

function renderEntity(entity) {
  ctx.save();
  ctx.translate(entity.pos[0], entity.pos[1]);
  entity.sprite.render(ctx);
  ctx.restore();
}

//game over
function gameOver() {
  document.getElementById('game-over').style.display = 'block';
  document.getElementById('game-over-overlay').style.display = 'block';
  isGameOver = true;
}

function reset() {
  document.getElementById('game-over').style.display = 'none';
  document.getElementById('game-over-overlay').style.display = 'none';
  isGameOver = false;
  gameTime = 0;
  score = 0;

  gems = [];

  player.pos = [50, canvas.height / 2];
}
