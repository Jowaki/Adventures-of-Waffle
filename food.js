export let foodList = [];

// ---- TUNING ----
const MIN_SPAWN_DELAY_MS = 450;  // a bit faster but still spaced
const SPAWN_AHEAD_RANGE = 1100;  // spread fish further ahead
const MIN_Y = 60;
const MAX_Y_PADDING = 120;

// How fast fish should be relative to the world speed.
// If obstacles are moving at worldSpeed, fish should generally move faster than that
// so they look like they're actively swimming.
const FISH_SPEED_MULT_MIN = 0.95;
const FISH_SPEED_MULT_MAX = 1.55;

// Add a bit of extra random px/frame so fish don't all match worldSpeed perfectly
const FISH_SPEED_BONUS_MIN = 0.0;
const FISH_SPEED_BONUS_MAX = 1.6;

let lastSpawnTime = 0;

export function spawnFood(canvas, worldSpeed) {
  const now = Date.now();
  if (now - lastSpawnTime < MIN_SPAWN_DELAY_MS) return;
  lastSpawnTime = now;

  const yMax = Math.max(MIN_Y + 1, canvas.height - MAX_Y_PADDING);

  // Spawn into an off-screen band for better spacing distribution
  const xSpawn = canvas.width + Math.random() * SPAWN_AHEAD_RANGE;

  // Slight size variation
  const baseSize = 70;
  const scale = 0.85 + Math.random() * 0.35;

  // ✅ Speed tied to worldSpeed so fish never feel like they're drifting backwards
  const speedMult =
    FISH_SPEED_MULT_MIN + Math.random() * (FISH_SPEED_MULT_MAX - FISH_SPEED_MULT_MIN);
  const speedBonus =
    FISH_SPEED_BONUS_MIN + Math.random() * (FISH_SPEED_BONUS_MAX - FISH_SPEED_BONUS_MIN);

  const speed = worldSpeed * speedMult + speedBonus;

  foodList.push({
    x: xSpawn,
    y: Math.random() * (yMax - MIN_Y) + MIN_Y,
    width: baseSize * scale,
    height: baseSize * scale,
    type: Math.random() < 0.7 ? "fish" : "squid",

    // swim speed in px/frame
    speed,

    // bobbing
    bobOffset: Math.random() * 1000
  });
}

export function updateFood(canvas, worldSpeed) {
  // Spawn with probability but spacing is enforced by MIN_SPAWN_DELAY_MS + band spawn
  if (Math.random() < 0.06) spawnFood(canvas, worldSpeed);

  for (let f of foodList) {
    // ✅ swim right -> left
    f.x -= f.speed;

    // gentle floating motion
    f.y += Math.sin((Date.now() + f.bobOffset) * 0.002 + f.x * 0.01) * 0.6;
  }

  foodList = foodList.filter(f => f.x > -200);
}

export function drawFood(ctx, fishImg) {
  for (let f of foodList) {
    // ✅ Auto-face based on movement direction:
    // If moving left (x decreasing), the fish should face LEFT.
    // We don't assume your art direction; we make it correct visually.
    // By default, many sprites face RIGHT in the source image.
    // So: moving left => flip horizontally.
    const movingLeft = true;

    ctx.save();
    ctx.translate(f.x + f.width / 2, f.y + f.height / 2);

    // If your sprite already faces LEFT by default, set this to false:
    // const SPRITE_DEFAULT_FACES_RIGHT = false;
    const SPRITE_DEFAULT_FACES_RIGHT = true;

    const shouldFlip = SPRITE_DEFAULT_FACES_RIGHT && movingLeft;

    if (shouldFlip) ctx.scale(-1, 1);

    ctx.drawImage(
      fishImg,
      -f.width / 2,
      -f.height / 2,
      f.width,
      f.height
    );

    ctx.restore();
  }
}

// ---------- collision helpers ----------
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
  const padX = f.width * 0.25;
  const padY = f.height * 0.25;

  return {
    x: f.x + padX,
    y: f.y + padY,
    width: Math.max(1, f.width - padX * 2),
    height: Math.max(1, f.height - padY * 2)
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
