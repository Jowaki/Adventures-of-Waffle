export const sealFrameCount = 2;
export const sealRow = 0;

const SPRITE_WIDTH = 836;
const SPRITE_HEIGHT = 1024;
const FRAME_WIDTH = SPRITE_WIDTH / sealFrameCount;
const FRAME_HEIGHT = SPRITE_HEIGHT;

const SEAL_SCALE = 0.23;

let sealAnimTime = 0;
const sealAnimFPS = 2;

export let sealFrame = 0;

export const seal = {
  x: 200,
  y: 200,
  baseY: 200,
  width: FRAME_WIDTH * SEAL_SCALE,
  height: FRAME_HEIGHT * SEAL_SCALE,
  speed: 5,
  lives: 3,
  invincible: false,
  invincibleTimer: 0,

  // ✅ new: dizzy effect timer (frames)
  dizzyTimer: 0
};

export function updateSeal(keys, canvas) {
  sealAnimTime += 1 / 60;

  // Floaty bob
  seal.y = seal.baseY + Math.sin(sealAnimTime * 2) * 6;

  if (keys["ArrowUp"]) seal.baseY -= seal.speed;
  if (keys["ArrowDown"]) seal.baseY += seal.speed;
  if (keys["ArrowLeft"]) seal.x -= seal.speed;
  if (keys["ArrowRight"]) seal.x += seal.speed;

  // Bounds
  if (seal.baseY < 0) seal.baseY = 0;
  if (seal.baseY > canvas.height - seal.height) seal.baseY = canvas.height - seal.height;

  if (seal.x < 0) seal.x = 0;
  if (seal.x > canvas.width - seal.width) seal.x = canvas.width - seal.width;

  // Invincibility timer
  if (seal.invincible) {
    seal.invincibleTimer--;
    if (seal.invincibleTimer <= 0) {
      seal.invincible = false;
    }
  }

  // ✅ dizzy timer
  if (seal.dizzyTimer > 0) {
    seal.dizzyTimer--;
  }
}

export function drawSeal(ctx, sealImg) {
  if (!sealImg.complete) return;

  sealFrame = Math.floor(sealAnimTime * sealAnimFPS) % sealFrameCount;

  // Flash while invincible
  if (seal.invincible && Math.floor(Date.now() / 100) % 2 === 0) {
    // skip drawing every other tick for a flicker effect
  } else {
    ctx.drawImage(
      sealImg,
      sealFrame * FRAME_WIDTH,
      0,
      FRAME_WIDTH,
      FRAME_HEIGHT,
      seal.x,
      seal.y,
      seal.width,
      seal.height
    );
  }

  // ✅ Dizzy circles
  if (seal.dizzyTimer > 0) {
    drawDizzyCircles(ctx);
  }
}

function drawDizzyCircles(ctx) {
  // Position above the seal’s head
  const headX = seal.x + seal.width * 0.62;
  const headY = seal.y + seal.height * 0.18;

  const t = Date.now() * 0.006;
  const fade = Math.min(1, seal.dizzyTimer / 60); // fade out near the end

  ctx.save();
  ctx.globalAlpha = 0.85 * fade;
  ctx.lineWidth = 3;

  // 3 little circles orbiting
  const orbitR = 18;
  const circleR = 6;

  for (let i = 0; i < 3; i++) {
    const a = t + i * (Math.PI * 2) / 3;
    const cx = headX + Math.cos(a) * orbitR;
    const cy = headY + Math.sin(a) * (orbitR * 0.6);

    ctx.strokeStyle = "rgba(255,255,255,0.95)";
    ctx.beginPath();
    ctx.arc(cx, cy, circleR, 0, Math.PI * 2);
    ctx.stroke();
  }

  // little “spark” dots for extra oomph
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  for (let i = 0; i < 4; i++) {
    const a = -t * 1.2 + i * (Math.PI * 2) / 4;
    const dx = headX + Math.cos(a) * (orbitR * 1.35);
    const dy = headY + Math.sin(a) * (orbitR * 0.8);
    ctx.beginPath();
    ctx.arc(dx, dy, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}
