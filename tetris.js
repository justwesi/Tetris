const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const scoreElement = document.getElementById('score');

context.scale(30, 30); // Scale blocks

const COLORS = [
  null,
  'cyan',    // I
  'blue',    // J
  'orange',  // L
  'yellow',  // O
  'green',   // S
  'purple',  // T
  'red'      // Z
];

const SHAPES = [
  [],
  [[1,1,1,1]],        // I
  [[2,0,0],[2,2,2]],  // J
  [[0,0,3],[3,3,3]],  // L
  [[4,4],[4,4]],      // O
  [[0,5,5],[5,5,0]],  // S
  [[0,6,0],[6,6,6]],  // T
  [[7,7,0],[0,7,7]]   // Z
];

// Arena
function createMatrix(w, h) {
  const matrix = [];
  while(h--) matrix.push(new Array(w).fill(0));
  return matrix;
}

const arena = createMatrix(10, 20);

// Player
const player = {
  pos: {x:0, y:0},
  matrix: null,
  score: 0
};

// Collision
function collide(arena, player){
  const [m, o] = [player.matrix, player.pos];
  for(let y=0;y<m.length;y++){
    for(let x=0;x<m[y].length;x++){
      if(m[y][x]!==0 && (arena[y+o.y] && arena[y+o.y][x+o.x])!==0){
        return true;
      }
    }
  }
  return false;
}

// Merge
function merge(arena, player){
  player.matrix.forEach((row,y)=>{
    row.forEach((value,x)=>{
      if(value!==0) arena[y+player.pos.y][x+player.pos.x] = value;
    });
  });
}

// Draw
function drawMatrix(matrix, offset){
  matrix.forEach((row,y)=>{
    row.forEach((value,x)=>{
      if(value!==0){
        context.fillStyle = COLORS[value];
        context.fillRect(x+offset.x, y+offset.y, 1,1);
      }
    });
  });
}

function draw(){
  context.fillStyle = '#111';
  context.fillRect(0,0,canvas.width,canvas.height);
  drawMatrix(arena, {x:0,y:0});
  drawMatrix(player.matrix, player.pos);
}

// Random piece
function randomPiece(){
  const index = Math.floor(Math.random()*(SHAPES.length-1))+1;
  return SHAPES[index];
}

// Reset player
function playerReset(){
  player.matrix = randomPiece();
  player.pos.y = 0;
  player.pos.x = Math.floor(arena[0].length/2 - player.matrix[0].length/2);
  if(collide(arena, player)){
    arena.forEach(row => row.fill(0));
    player.score = 0;
    updateScore();
  }
}

// Clear rows
function arenaSweep(){
  outer: for(let y=arena.length-1;y>=0;y--){
    for(let x=0;x<arena[y].length;x++){
      if(arena[y][x]===0) continue outer;
    }
    arena.splice(y,1);
    arena.unshift(new Array(10).fill(0));
    player.score += 10;
    updateScore();
    y++;
  }
}

// Move player
function playerMove(dir){
  player.pos.x += dir;
  if(collide(arena, player)) player.pos.x -= dir;
}

// Drop
let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

function playerDrop(){
  player.pos.y++;
  if(collide(arena, player)){
    player.pos.y--;
    merge(arena, player);
    playerReset();
    arenaSweep();
  }
  dropCounter = 0;
}

function update(time=0){
  const deltaTime = time - lastTime;
  lastTime = time;
  dropCounter += deltaTime;
  if(dropCounter > dropInterval) playerDrop();
  draw();
  requestAnimationFrame(update);
}

// Controls
document.addEventListener('keydown', event=>{
  if(event.keyCode===37) playerMove(-1);
  if(event.keyCode===39) playerMove(1);
  if(event.keyCode===40) playerDrop();
  if(event.keyCode===81){ rotate(player.matrix,-1); if(collide(arena,player)) rotate(player.matrix,1);}
  if(event.keyCode===87){ rotate(player.matrix,1); if(collide(arena,player)) rotate(player.matrix,-1);}
});

// Rotate
function rotate(matrix, dir){
  for(let y=0;y<matrix.length;y++){
    for(let x=0;x<y;x++){
      [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
    }
  }
  if(dir>0) matrix.forEach(row => row.reverse());
  else matrix.reverse();
}

// Score
function updateScore(){
  scoreElement.innerText = player.score;
}

// Start game
startBtn.addEventListener('click', ()=>{
  startBtn.style.display = 'none';
  playerReset();
  update();
});
