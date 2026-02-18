export let foodList = [];

// ---- SPAWN / DISTRIBUTION ----
const MIN_SPAWN_DELAY_MS = 450;
const SPAWN_AHEAD_RANGE = 1100;
const MIN_Y = 60;
const MAX_Y_PADDING = 120;

// ---- SIZES ----
const FISH_BASE_SIZE = 75;
const SQUID_BASE_SIZE = 180;  // 🔥 BIGGER squid

// ---- SPEEDS ----
const FISH_SPEED_MULT_MIN = 0.85;
const FISH_SPEED_MULT_MAX = 1.25;

const SQUID_SPEED_MULT_MIN = 0.35;
const SQUID_SPEED_MULT_MAX = 0.55;  // slower so big squid feel floaty

const SPEED_BONUS_FISH_MAX = 0.9;
const SPEED_BONUS_SQUID_MAX = 0.25;

// ---- SQUID SPRITE ----
const SQUID_FRAMES = 4;
const SQUID_FRAME_MS = 130;

let lastSpawnTime = 0;

export function spawnFood(canvas, worldSpeed) {
  const now = Date.now();
  if (now - lastSpawnTime < MIN_SPAWN_DELAY_MS) return;
  lastSpawnTime = now;

  const yMax = Math.max(MIN_Y + 1, canvas.height - MAX_Y_PADDING);
  const xSpawn = canvas.width + Math.random() * SPAWN_AHEAD_RANGE;

  const type = Math.random() < 0.6 ? "fish" : "squid";

  const base = type === "fish" ? FISH_BASE_SIZE : SQUID_BASE_SIZE;
  const scale = 0.95 + Math.random() * 0.35;
  const size = base * scale;

  const multMin = type === "fish" ? FISH_SPEED_MULT_MIN : SQUID_SPEED_MULT_MIN;
  const multMax = type === "fish" ? FISH_SPEED_MULT_MAX : SQUID_SPEED_MULT_MAX;

  const speedMult = multMin + Math.random() * (multMax - multMin);
  const speedBonus =
    type === "fish"
      ? Math.random() * SPEED_BONUS_FISH_MAX
      : Math.random() * SPEED_BONUS_SQUID_MAX;

  let speed = worldSpeed * speedMult + speedBonus;

  // squid should never outrun world
  if (type === "squid") speed = Math.min(speed, worldSpeed * 0.8);

  foodList.push({
    x: xSpawn,
    y: Math.random() * (yMax - MIN_Y) + MIN_Y,
    baseY: null,
    size,
    type,
    speed,
    bobOffset: Math.random() * 2000
  });
}

export function updateFood(canvas, worldSpeed) {
  if (Math.random() < 0.06) spawnFood(canvas, worldSpeed);

  for (let f of foodList) {
    if (f.baseY === null) f.baseY = f.y;

    f.x -= f.speed;

    const t = (Date.now() + f.bobOffset) * 0.002;

    if (f.type === "fish") {
      f.y = f.baseY + Math.sin(t + f.x * 0.01) * 0.6;
    } else {
      // squid: bigger + more dramatic bob
      f.y = f.baseY + Math.sin(t * 1.15) * 8.0;
    }
  }

  foodList = foodList.filter(f => f.x > -350);
}

export function drawFood(ctx, fishImg, squidImg) {
  for (let f of foodList) {

    if (f.type === "fish") {
      if (!fishImg?.complete) continue;

      ctx.save();
      ctx.translate(f.x + f.size / 2, f.y + f.size / 2);
      ctx.scale(-1, 1);
      ctx.drawImage(fishImg, -f.size / 2, -f.size / 2, f.size, f.size);
      ctx.restore();
      continue;
    }

    // squid
    if (!squidImg?.complete) continue;

    const frameW = squidImg.naturalWidth / SQUID_FRAMES;
    const frameH = squidImg.naturalHeight;

    const aspect = frameW / frameH;
    let drawW, drawH;

    if (aspect >= 1) {
      drawW = f.size;
      drawH = f.size / aspect;
    } else {
      drawH = f.size;
      drawW = f.size * aspect;
    }

    const frame = Math.floor((Date.now() + f.bobOffset) / SQUID_FRAME_MS) % SQUID_FRAMES;

    ctx.save();
    ctx.translate(f.x + drawW / 2, f.y + drawH / 2);
    ctx.scale(-1, 1);

    ctx.drawImage(
      squidImg,
      frame * frameW,
      0,
      frameW,
      frameH,
      -drawW / 2,
      -drawH / 2,
      drawW,
      drawH
    );

    ctx.restore();
  }
}

// ---------- collision ----------
function rectsIntersect(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function getSealHitbox(seal) {
  return {
    x: seal.x + seal.width * 0.28,
    y: seal.y + seal.height * 0.28,
    width: seal.width * 0.44,
    height: seal.height * 0.44
  };
}

function getFoodHitbox(f) {
  // tighter hitbox so big squid aren't too easy
  const w = f.size;
  const h = f.size;

  const padX = w * 0.35;
  const padY = h * 0.35;

  return {
    x: f.x + padX,
    y: f.y + padY,
    width: Math.max(1, w - padX * 2),
    height: Math.max(1, h - padY * 2)
  };
}

export function checkFoodCollision(seal, addScore) {
  const sealHitbox = getSealHitbox(seal);

  for (let i = foodList.length - 1; i >= 0; i--) {
    const f = foodList[i];
    const foodHitbox = getFoodHitbox(f);

    if (rectsIntersect(sealHitbox, foodHitbox)) {
      addScore(200);
      foodList.splice(i, 1);
      return;
    }
  }
}
