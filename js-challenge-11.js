var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

var player_lives = 3;
var score = 0;

var tank_width = 30;
var tank_height = 40;
var tank_speed = 0.55; //actually used to increment the Y coords of all the blocks, set at 0.3

var tank = new Map();
tank.set("X", canvas.width / 2);
tank.set("Y", canvas.height - 70);
tank.set("width", tank_width);
tank.set("height", tank_height);

var balls = [];
var ball_speed = 1.6;
var since_last_fire = performance.now();

var blocks = [];
var tank_block_collision_bool = true;

var monsters = [];
var monster_speed = 0.6; //speed at which the monsters move along the y axis.

//This part handles the pressing of keys used to move the tank and fire
var right_pressed = false;
var left_pressed = false;
var space_pressed = false;

document.addEventListener("keydown", KeyDownFunc, false);
document.addEventListener("keyup", KeyUpFunc, false);

function KeyDownFunc(e) {
  if (e.keyCode == 39) {
    right_pressed = true;
  } else if (e.keyCode == 37) {
    left_pressed = true;
  } else if (e.keyCode == 32) {
    space_pressed = true;
  }
}

function KeyUpFunc(e) {
  if (e.keyCode == 39) {
    right_pressed = false;
  } else if (e.keyCode == 37) {
    left_pressed = false;
  } else if (e.keyCode == 32) {
    space_pressed = false;
  }
}

//Drawing the Tank
function drawTank() {
  ctx.beginPath();
  ctx.rect(tank.get("X"), tank.get("Y"), tank_width, tank_height);
  ctx.fillStyle = "green";

  ctx.rect(tank.get("X") + tank_width / 2 - 5, tank.get("Y") - 15, 10, 15);
  ctx.fillStyle = "green";

  ctx.fill();
  ctx.closePath();
}

//Drawing the border blocks
function drawBorder() {
  ctx.beginPath();
  ctx.rect(0, 0, 80, canvas.height);
  ctx.rect(canvas.width - 80, 0, 80, canvas.height);
  ctx.fillStyle = "grey";
  ctx.fill();
  ctx.closePath();
}

//Initializing a new ball (starting position), adding it to a list
function drawNewBall(ball_X, ball_Y) {
  ctx.beginPath();
  ctx.arc(ball_X, ball_Y, 5, 0, Math.PI * 2);

  var ball = new Map();
  ball.set("X", ball_X);
  ball.set("Y", ball_Y);
  ball.set("width", 3);
  ball.set("height", 3);
  balls.push(ball);
  since_last_fire = performance.now();
}

//drawing all of the balls of the list
function drawBalls() {
  for (var i = 0; i < balls.length; i++) {
    ctx.beginPath();
    ctx.arc(balls[i].get("X"), balls[i].get("Y"), 5, 0, Math.PI * 2);
    ctx.fillStyle = "red";
    ctx.fill();
    ctx.closePath();
  }
}

//Generates coordinates with 80 < x < (canvas.width - 120) and -260 < y < -60. Returns the coordinates.
function generateCoords() {
  do {
    var X = Math.random() * (canvas.width - 80) + 80;
  } while (X + 120 > canvas.width);

  var Y = Math.random() * (-260 - 60) - 60;
  return [X, Y];
}

//Checks that the distance between TWO blocks is greater than 140 and the difference along the Y-axis is greater than 40
function distanceCheck(X1, Y1, X2, Y2) {
  var distance = Math.sqrt(Math.pow(X1 - X2, 2) + Math.pow(Y1 - Y2, 2));
  if (distance > 140 && Math.abs(Y1 - Y2) > 40) {
    return true;
  } else {
    return false;
  }
}

//function that returns TRUE if we need to generate new coords because the blocks are too close, FALSE otherwise
function blockDistanceChecker(X, Y) {
  if (blocks.length == 0) {
    return false;
  }

  var check = false;
  for (i = 0; i < blocks.length; i++) {
    if (distanceCheck(X, Y, blocks[i].get("X"), blocks[i].get("Y"))) {
      check = check || false;
    } else {
      check = check || true;
    }
  }

  if (!check) {
    return false;
  } else {
    return true;
  }
}

//Creates a new block
function drawNewBlock() {
  do {
    var coords = generateCoords();
    var X = coords[0];
    var Y = coords[1];
  } while (blockDistanceChecker(X, Y));

  var width = 40;
  var height = 60;

  var block = new Map();
  block.set("X", X);
  block.set("Y", Y);
  block.set("width", width);
  block.set("height", height);

  blocks.push(block);
}

function drawBlocks() {
  for (var i = 0; i < blocks.length; i++) {
    ctx.beginPath();
    ctx.rect(blocks[i].get("X"), blocks[i].get("Y"), blocks[i].get("width"), blocks[i].get("height"));
    ctx.fillStyle = "green";
    ctx.fill();
    ctx.closePath();
  }
}

//Mover function: moves blocks elements down (y++) along the y axis
function moverFunc() {
  for (var i = 0; i < blocks.length; i++) {
    blocks[i].set("Y", blocks[i].get("Y") + tank_speed);
    //Drops the block from the blocks array when they're out of view
    if (blocks[i].get("Y") > canvas.width) {
      blocks.splice(i, 1);
    }
  }
}

//Mover function: moves the balls the balls up (y--) along the y axis //ADDED: Moving the monsters
function moveBalls() {
  //Moving the Balls
  for (var i = 0; i < balls.length; i++) {
    balls[i].set("Y", balls[i].get("Y") - ball_speed);
    //Drops the ball from the balls array when they're out of view
    if (balls[i].get("Y") < 0) {
      balls.splice(i, 1);
    }
  }

  //Moving the Monsters
  for (var j = 0; j < monsters.length; j++) {
    monsters[j].set("Y", monsters[j].get("Y") + monster_speed);
    //Drops the monsters from the list when they're out of view
    if (monsters[j].get("Y") > canvas.width) {
      monsters.splice(j, 1);
    }
  }
}

//Block Collision detection function
function tank_block_collision() {

  for (i = 0; i < blocks.length; i++) {
    var conflict_X = false;
    var conflict_Y = false;

    if (tank.get("X") + tank_width > blocks[i].get("X") && tank.get("X") < blocks[i].get("X") + 40) {
      conflict_X = conflict_X || true;
    }
    if (tank.get("Y") < blocks[i].get("Y") + 60 && tank.get("Y") > blocks[i].get("Y")) {
      conflict_Y = conflict_Y || true;
    }
    if (conflict_X && conflict_Y) {
      tank_block_collision_bool = false;
      player_lives -= 1;
      return;
    }
  }
  tank_block_collision_bool = true;
}

//Generates X and Y coordinates for a new monster
function create_monster() {
  var coords = generateCoords();
  var X = coords[0];
  var Y = coords[1];

  var monster = new Map();
  monster.set("X", X);
  monster.set("Y", Y);
  monster.set("width", 25);
  monster.set("height", 29);
  monsters.push(monster);
}

//Draws a monster
function draw_monster(X, Y) {
  var scale = 0.8;
  var h = 9; //height
  var a = 5;

  ctx.beginPath();
  //First trapezoid
  ctx.moveTo(X, Y);
  ctx.lineTo(X - a * scale, Y + h * scale);
  ctx.lineTo(X + (a * 4) * scale, Y + h * scale);
  ctx.lineTo(X + (a * 3) * scale, Y);
  //Second trapezoid
  ctx.moveTo(X - (a + 5) * scale, Y + h * scale);
  ctx.lineTo(X - (a) * scale, Y + (h + 20) * scale);
  ctx.lineTo(X + (a + 15) * scale, Y + (h + 20) * scale);
  ctx.lineTo(X + (a + 20) * scale, Y + (h) * scale);

  ctx.fillStyle = "purple";
  ctx.fill();
  ctx.closePath();
}

//Draws all monsters in the monsters list
function draw_monsters() {
  for (i = 0; i < monsters.length; i++) {
    var X = monsters[i].get("X");
    var Y = monsters[i].get("Y");
    draw_monster(X, Y);
  }
}

//Collision detector: detects a collision along the Y-axis between two objects (Maps) with the following template: ["X", "Y", "width", "height"]
function collision_detector(first, second) {
  var x1 = first.get("X");
  var y1 = first.get("Y");
  var width1 = first.get("width");
  var height1 = first.get("height");
  var x2 = second.get("X");
  var y2 = second.get("Y");
  var width2 = second.get("width");
  var height2 = second.get("height");

  if (x2 > x1 && x2 < x1 + width1 || x1 > x2 && x1 < x2 + width2) {
    if (y2 > y1 && y2 < y1 + height1 || y1 > y2 && y1 < y2 + height2) {
      return true;
    }
  } else {
    return false;
  }
}

//detects a collion betweenn balls and monsters
function ball_monster_collision() {
  for (var i = 0; i < monsters.length; i++) {
    var monster = monsters[i];
    for (var j = 0; j < balls.length; j++) {
      var ball = balls[j];
      if (collision_detector(monster, ball)) {
        balls.splice(j, 1);
        monsters.splice(i, 1);
        score += 2;
      }
    }
  }
}

//Used to display the number of lives remaining and game score
function drawInfo() {
  ctx.font = "bold 15px Gill Sans MT";
  ctx.fillStyle = "blue";
  ctx.fillText("Lives: " + player_lives, 635, 22);
  ctx.fillText("Score: " + score, 13, 22)
}

//Main function, will be used to run the game
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height); 
  drawBorder();
  drawInfo();
  drawTank();
  drawBalls();
  drawBlocks();
  draw_monsters();
  moveBalls();
  tank_block_collision();
  ball_monster_collision();
  moverFunc();

  if (space_pressed && balls.length < 10 && performance.now() - since_last_fire > 500) {
    drawNewBall(tank.get("X") + 15, tank.get("Y") - 30);
  }
  if (right_pressed && tank.get("X") + tank_width < canvas.width) {
    tank.set("X", tank.get("X") + 1);
  }
  if (left_pressed && tank.get("X") > 0) {
    tank.set("X", tank.get("X") - 1);
  }

  if (blocks.length < 3) {
    drawNewBlock();
  }
  if (monsters.length < 1) {
    create_monster();
  }
  if (!tank_block_collision_bool && player_lives < 0) {
     alert("You lost");
     document.location.reload()
  }

  requestAnimationFrame(draw);
}

draw();

