var requestAnimFrame = (function(){
  return window.requestAnimationFrame       ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame    ||
      window.oRequestAnimationFrame      ||
      window.msRequestAnimationFrame     ||
      function(callback){
          window.setTimeout(callback, 1000 / 60);
      }
})();

//Set canvas
var canvas = document.createElement('canvas');
var ctx = canvas.getContext('2d');
canvas.width = 512;
canvas.height = 480;
document.body.appendChild(canvas);

//Game loop
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

//load assets
resources.load([
  'img/terrain.png',
  'img/player.png',
  'img/bricks2.png',
  'img/cursor.png'
]);
resources.onReady(init);

//Game state
var player = {
  pos: [0,0],
  sprite: new Sprite('img/player.png',[0,0],[24,30])
};
var mouse = {
  x: 0,
  y: 0,
  sprite: new Sprite('img/cursor.png',[0,0],[10,10])
};
var gravity = {
  onGround: false,
  timeOffGround: 0
}
var jump = false;

var gameTime = 0;
var isGameOver;
var terrainPattern;

var score = 0;
var scoreEl = document.getElementById('score');

var playerSpeed = 200; //px per sec

//update loop
function update(dt) {
  gameTime += dt;

  handleInput(dt);
  updateEntities(dt);
  //checkCollisions(); replaces with check checkPlayerBounds() for now
  checkPlayerBounds();
  //jump code
  if (gravity.onGround === false) {
    var a = gravity.timeOffGround;
    var b = a + 1;
    gravity.timeOffGround = b;
    player.pos[1] = player.pos[1] + (gravity.timeOffGround / 9);
  }
  if (jump === true) {
    player.pos[1] -= playerSpeed * dt;
  }
  if (gravity.onGround === true) {
    jump = false;
  }
}

//Player inputs
function handleInput(dt) {
  if(input.isDown('DOWN') && gravity.onGround === true || input.isDown('s') && gravity.onGround === true) {
    player.pos[1] += playerSpeed * dt;
  }
  if(input.isDown('UP') && gravity.onGround === true || input.isDown('w') && gravity.onGround === true) {
    jump = true;
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

//Collisions
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

//Boundaries
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

    gravity.onGround = true;
    gravity.timeOffGround = 0;
  }
  if (player.pos[1] < canvas.height - player.sprite.size[1]) {
    gravity.onGround = false;
  }
}

//RESOLVE Collisions
//function checkCollisions() {
//  checkPlayerBounds();
//  for (var i = 0; i < blocks.length; i++) {
//    var pos = blocks[i].pos;
//    var size = blocks[i].sprite.size;
//    if(boxCollides(pos,size,player.pos,player.sprite.size)) {
//      player.pos[1] = canvas.height - 46;
//    }else {
//      player.pos[1] = player.pos[1] + .09;
//    }
//  }
//}

//DRAW EVERYTHING
function render() {
  ctx.fillStyle = terrainPattern;
  ctx.fillRect(0,0,canvas.width,canvas.height);

  if(!isGameOver) {
    renderEntity(player);
  }
  //renderEntity(mouse);
  //Use renderEntities(); for multiput entities
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

  player.pos = [50, canvas.height / 2];

  gravity.onGround = false;
  gravity.timeOffGround = 0;
}
