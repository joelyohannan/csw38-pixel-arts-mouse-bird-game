// Mouse Bird Game - integrated into Pixal Arts and Entertainment (CSW 38)
"use strict";

const myCanvas = document.getElementById("myCanvas");
const ctx = myCanvas.getContext("2d");

const FPS = 40;
const jump_amount = -10;
const max_fall_speed = 10;
const acceleration = 1;
const pipe_speed = -2;

let game_mode = "prestart";
let time_game_last_running;
let bottom_bar_offset = 0;
let pipes = [];
let assetsReady = false;

function MySprite(img_url) {
  this.x = 0;
  this.y = 0;
  this.visible = true;
  this.velocity_x = 0;
  this.velocity_y = 0;
  this.MyImg = new Image();
  if (img_url) this.MyImg.src = img_url;
  this.angle = 0;
  this.flipV = false;
  this.flipH = false;
}

MySprite.prototype.Do_Frame_Things = function () {
  if (!this.MyImg.complete || !this.MyImg.naturalWidth) return;
  ctx.save();
  ctx.translate(this.x + this.MyImg.width / 2, this.y + this.MyImg.height / 2);
  ctx.rotate((this.angle * Math.PI) / 180);
  if (this.flipV) ctx.scale(1, -1);
  if (this.flipH) ctx.scale(-1, 1);
  if (this.visible) {
    ctx.drawImage(this.MyImg, -this.MyImg.width / 2, -this.MyImg.height / 2);
  }
  this.x += this.velocity_x;
  this.y += this.velocity_y;
  ctx.restore();
};

function ImagesTouching(thing1, thing2) {
  if (!thing1.visible || !thing2.visible) return false;
  if (thing1.x >= thing2.x + thing2.MyImg.width ||
      thing1.x + thing1.MyImg.width <= thing2.x) return false;
  if (thing1.y >= thing2.y + thing2.MyImg.height ||
      thing1.y + thing1.MyImg.height <= thing2.y) return false;
  return true;
}

function Got_Player_Input(event) {
  if (event) event.preventDefault();
  switch (game_mode) {
    case "prestart":
      game_mode = "running";
      bird.velocity_y = jump_amount;
      break;
    case "running":
      bird.velocity_y = jump_amount;
      break;
    case "over":
      if (new Date() - time_game_last_running > 1000) {
        reset_game();
        game_mode = "running";
        bird.velocity_y = jump_amount;
      }
      break;
  }
}

myCanvas.addEventListener("pointerdown", Got_Player_Input);
window.addEventListener("keydown", function (event) {
  if (["Space", "ArrowUp", "Enter"].includes(event.code)) Got_Player_Input(event);
});

function make_bird_slow_and_fall() {
  if (bird.velocity_y < max_fall_speed) bird.velocity_y += acceleration;
  if (bird.y > myCanvas.height - bird.MyImg.height || bird.y < -bird.MyImg.height) {
    bird.velocity_y = 0;
    game_mode = "over";
  }
}

function add_pipe(x_pos, top_of_gap, gap_width) {
  const top_pipe = new MySprite();
  top_pipe.MyImg = pipe_piece;
  top_pipe.x = x_pos;
  top_pipe.y = top_of_gap - pipe_piece.height;
  top_pipe.velocity_x = pipe_speed;
  pipes.push(top_pipe);

  const bottom_pipe = new MySprite();
  bottom_pipe.MyImg = pipe_piece;
  bottom_pipe.flipV = true;
  bottom_pipe.x = x_pos;
  bottom_pipe.y = top_of_gap + gap_width;
  bottom_pipe.velocity_x = pipe_speed;
  pipes.push(bottom_pipe);
}

function make_bird_tilt_appropriately() {
  if (bird.velocity_y < 0) bird.angle = -15;
  else if (bird.angle < 70) bird.angle += 4;
}

function show_the_pipes() {
  for (let i = 0; i < pipes.length; i++) pipes[i].Do_Frame_Things();
}

function check_for_end_game() {
  for (let i = 0; i < pipes.length; i++) {
    if (ImagesTouching(bird, pipes[i])) {
      game_mode = "over";
      time_game_last_running = new Date();
      break;
    }
  }
}

function display_intro_instructions() {
  ctx.font = "bold 22px Arial";
  ctx.fillStyle = "#b00020";
  ctx.textAlign = "center";
  ctx.fillText("Click, tap, or press a key", myCanvas.width / 2, myCanvas.height / 4);
  ctx.fillText("to start", myCanvas.width / 2, myCanvas.height / 4 + 29);
}

function display_game_over() {
  let score = 0;
  for (let i = 0; i < pipes.length; i++) {
    if (pipes[i].x < bird.x) score += 0.5;
  }
  ctx.font = "bold 36px Arial";
  ctx.fillStyle = "#b00020";
  ctx.textAlign = "center";
  ctx.fillText("Game Over", myCanvas.width / 2, 100);
  ctx.fillText("Score: " + score, myCanvas.width / 2, 150);
  ctx.font = "18px Arial";
  ctx.fillText("Click, tap, or press to play again", myCanvas.width / 2, 300);
}

function display_bar_running_along_bottom() {
  if (bottom_bar_offset <= -bottom_bar.width) bottom_bar_offset = 0;
  if (bottom_bar.complete && bottom_bar.naturalWidth) {
    for (let x = bottom_bar_offset; x < myCanvas.width; x += bottom_bar.width) {
      ctx.drawImage(bottom_bar, x, myCanvas.height - bottom_bar.height);
    }
  }
}

function reset_game() {
  bird.y = myCanvas.height / 2;
  bird.x = myCanvas.width / 3;
  bird.angle = 0;
  bird.velocity_y = 0;
  bottom_bar_offset = 0;
  pipes = [];
  add_all_my_pipes();
}

function add_all_my_pipes() {
  pipes = [];
  add_pipe(800, 90, 150);
  add_pipe(1120, 55, 150);
  add_pipe(1440, 250, 150);
  add_pipe(1760, 150, 135);
  add_pipe(2080, 100, 135);
  add_pipe(2400, 175, 135);
  add_pipe(2720, 225, 130);
  add_pipe(3040, 250, 130);
  add_pipe(3360, 55, 120);
  add_pipe(3680, 300, 120);
  add_pipe(4000, 110, 100);
  add_pipe(4320, 250, 100);
  add_pipe(4640, 70, 90);

  const finish_line = new MySprite("end.png");
  finish_line.x = 5000;
  finish_line.velocity_x = pipe_speed;
  pipes.push(finish_line);
}

const pipe_piece = new Image();
const bottom_bar = new Image();
const bird = new MySprite("bird.png");

let loadedImages = 0;
const requiredImages = 3;
function imageLoaded() {
  loadedImages++;
  if (loadedImages === requiredImages) {
    assetsReady = true;
    reset_game();
  }
}

pipe_piece.onload = imageLoaded;
bottom_bar.onload = imageLoaded;
bird.MyImg.onload = imageLoaded;
pipe_piece.onerror = () => console.error("Could not load pipe.png. Check the filename and path.");
bottom_bar.onerror = () => console.error("Could not load bottom.png. Check the filename and path.");
bird.MyImg.onerror = () => console.error("Could not load bird.png. Check the filename and path.");
pipe_piece.src = "pipe.png";
bottom_bar.src = "bottom.png";
bird.x = myCanvas.width / 3;
bird.y = myCanvas.height / 2;

function Do_a_Frame() {
  ctx.clearRect(0, 0, myCanvas.width, myCanvas.height);
  if (!assetsReady) {
    ctx.font = "18px Arial";
    ctx.fillStyle = "#18334a";
    ctx.textAlign = "center";
    ctx.fillText("Loading game...", myCanvas.width / 2, myCanvas.height / 2);
    return;
  }
  bird.Do_Frame_Things();
  display_bar_running_along_bottom();

  switch (game_mode) {
    case "prestart":
      display_intro_instructions();
      break;
    case "running":
      time_game_last_running = new Date();
      bottom_bar_offset += pipe_speed;
      show_the_pipes();
      make_bird_tilt_appropriately();
      make_bird_slow_and_fall();
      check_for_end_game();
      break;
    case "over":
      display_game_over();
      break;
  }
}
setInterval(Do_a_Frame, 1000 / FPS);
