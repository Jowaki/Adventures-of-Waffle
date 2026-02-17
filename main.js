import { seal, updateSeal, drawSeal } from "./seal.js";
import { updateObstacles, drawObstacles, checkObstacleCollision } from "./obstacles.js";
import { updateFood, drawFood, checkFoodCollision } from "./food.js";
import { drawBackground, updateBubbles, drawBubbles } from "./effects.js";
import { drawUI } from "./ui.js";

let foodEaten = 0;

// ---------------- GAME STATE ----------------
let gameState = "welcome"; 
// "welcome", "playing", "lifeLost", "gameOver"

let memoryImages = [
  "assets/memory1.jpg",
  "assets/memory2.jpg",
  "assets/memory3.jpg",
  "assets/memory4.jpg",
  "assets/memory5.jpg"
];

let currentMemoryIndex = 0;
let memoryImg = new Image();

let gamePaused = false;
let showMemory = false;

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const sealImg = new Image();
sealImg.src = "assets/sealion_swim.png";

const fishImg = new Image();
fishImg.src = "assets/fish_single.png";

const welcomeImg = new Image();
welcomeImg.src = "assets/Welcome page.jpg";

const honkSound = new Audio("assets/honk.mp3");

let keys = {};
let score = 0;
let worldSpeed = 4;

document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

document.getElementById("honkBtn").addEventListener("click", () => {
  honkSound.currentTime = 0;
  honkSound.play();
});

function gameLoop() {

  drawBackground(ctx, canvas);

  // -------- WELCOME --------
  if (gameState === "welcome") {
    drawWelcomeScreen();
    requestAnimationFrame(gameLoop);
    return;
  }

  // -------- PLAYING --------
  if (gameState === "playing" && !gamePaused) {

    updateSeal(keys, canvas);
    updateObstacles(worldSpeed, canvas);
    updateFood(canvas);
    updateBubbles(canvas);

    checkObstacleCollision(
      seal,
      () => {
        gameState = "lifeLost";
        gamePaused = true;
      },
      () => {
        gameState = "gameOver";
      }
    );

    checkFoodCollision(seal, (points) => {
      score += points;
      foodEaten++;

      if (foodEaten % 5 === 0 && currentMemoryIndex < memoryImages.length) {
        gamePaused = true;
        showMemory = true;
        memoryImg.src = memoryImages[currentMemoryIndex];
        currentMemoryIndex++;
      }
    });

    score++;
    worldSpeed += 0.0005;
  }

  drawBubbles(ctx);
  drawObstacles(ctx);
  drawFood(ctx, fishImg);
  drawSeal(ctx, sealImg);

  drawUI(ctx, score, seal, gameState === "gameOver", canvas, foodEaten);

  if (showMemory) drawMemoryScreen();
  if (gameState === "lifeLost") drawLifeLostScreen();

  requestAnimationFrame(gameLoop);
}

// ---------------- WELCOME SCREEN ----------------
function drawWelcomeScreen() {

  if (welcomeImg.complete) {
    ctx.drawImage(welcomeImg, 0, 0, canvas.width, canvas.height);
  }

  ctx.fillStyle = "white";
  ctx.fillRect(canvas.width / 2 - 120, canvas.height - 200, 240, 70);

  ctx.fillStyle = "black";
  ctx.font = "30px monospace";
  ctx.fillText(
    "START GAME",
    canvas.width / 2 - 100,
    canvas.height - 155
  );
}

// ---------------- LIFE LOST ----------------
function drawLifeLostScreen() {

  ctx.fillStyle = "rgba(0,0,0,0.7)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "white";
  ctx.font = "50px monospace";
  ctx.fillText(
    "Ouch! Life Lost!",
    canvas.width / 2 - 220,
    canvas.height / 2 - 20
  );

  ctx.font = "28px monospace";
  ctx.fillText(
    "CLICK TO CONTINUE",
    canvas.width / 2 - 170,
    canvas.height / 2 + 40
  );
}

// ---------------- MEMORY ----------------
function drawMemoryScreen() {

  ctx.fillStyle = "rgba(0,0,0,0.7)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let imgWidth = 500;
  let imgHeight = 350;

  ctx.drawImage(
    memoryImg,
    canvas.width / 2 - imgWidth / 2,
    canvas.height / 2 - imgHeight / 2,
    imgWidth,
    imgHeight
  );

  ctx.fillStyle = "white";
  ctx.font = "30px monospace";
  ctx.fillText(
    "CLICK TO CONTINUE",
    canvas.width / 2 - 170,
    canvas.height / 2 + 220
  );
}

// ---------------- CLICK HANDLER ----------------
canvas.addEventListener("click", () => {

  if (gameState === "welcome") {
    gameState = "playing";
    return;
  }

  if (gameState === "lifeLost") {
    gameState = "playing";
    gamePaused = false;
    return;
  }

  if (showMemory) {
    showMemory = false;
    gamePaused = false;
  }
});

sealImg.onload = () => {
  requestAnimationFrame(gameLoop);
};
