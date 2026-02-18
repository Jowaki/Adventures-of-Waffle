export let obstacles = [];

// Toggle hitbox drawing (press H in game)
let debugHitboxes = false;
export function toggleObstacleDebug() {
  debugHitboxes = !debugHitboxes;
}

// ---------------- SEAWEED SETTINGS ----------------
const SEAWEED_FRAMES = 2;
const SEAWEED_ANIM_MS = 500;
const MIN_SEAWEED_SPACING = 260;

// ---------------- TRASH SETTINGS ----------------
const TRASH_FRAMES = 2;
const TRASH_ANIM_MS = 650;
const TRASH_SPEED_MULT = 0.70;
const TRASH_BOB_AMPLITUDE = 1.2;
const TRASH_BOB_FREQ = 0.0022;

// Bigger trash
const TRASH_BASE_W = 240;
const TRASH_BASE_H = 240;

// --------------------------------------------------

export function spawnObstacle(canvas) {
  let type = Math.random();

  if (type < 0.5) {
    // Seaweed (ground)
    const lastSeaweed = [...obstacles].reverse().find(o => o.kind === "seaweed");
    if (lastSeaweed && canvas.width - lastSeaweed.x < MIN_SEAWEED_SPACING) return;

    const baseHeight = 160;
    const scale = 0.9 + Math.random() * 0.3;

    const height = baseHeight * scale;
    const width = 130 * scale;

    obstacles.push({
      x: canvas.width,
      y: canvas.height - height,
      width,
      height,
      kind: "seaweed",
      animOffset: Math.random() * 2000
    });
  } else {
    // Trash (floating)
    const scale = 0.9 + Math.random() * 0.4;

    obstacles.push({
      x: canvas.width + Math.random() * 300,
      y: Math.random() * (canvas.height - 360) + 80,
      width: TRASH_BASE_W * scale,
      height: TRASH_BASE_H * scale,
      kind: "trash",
      animOffset: Math.random() * 2000,
      bobOffset: Math.random() * 2000
    });
  }
}

export function updateObstacles(worldSpeed, canvas) {
  for (let obs of obstacles) {
    if (obs.kind === "trash") {
      obs.x -= worldSpeed * TRASH_SPEED_MULT;
      obs.y += Math.sin((Date.now() + obs.bobOffset) * TRASH_BOB_FREQ) * TRASH_BOB_AMPLITUDE;
    } else {
      obs.x -= worldSpeed;
    }
  }

  obstacles = obstacles.filter(o => o.x > -450);

  if (Math.random() < 0.02) spawnObstacle(canvas);
}

export function drawObstacles(ctx, seaweedImg, trashImg) {
  for (let obs of obstacles) {
    if (obs.kind === "seaweed") {
      drawSeaweed(ctx, obs, seaweedImg);
    } else if (obs.kind === "trash") {
      drawTrash(ctx, obs, trashImg);
    } else {
      ctx.fillStyle = "#495057";
      ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
    }

    if (debugHitboxes) {
      drawHitbox(ctx, obs);
    }
  }
}

function drawSeaweed(ctx, obs, seaweedImg) {
  if (!seaweedImg || !seaweedImg.complete || !seaweedImg.naturalWidth) {
    ctx.fillStyle = "#2a9d8f";
    ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
    return;
  }

  const frameW = seaweedImg.naturalWidth / SEAWEED_FRAMES;
  const frameH = seaweedImg.naturalHeight;

  const t = Date.now() + obs.animOffset;
  const frame = Math.floor(t / SEAWEED_ANIM_MS) % SEAWEED_FRAMES;

  ctx.drawImage(
    seaweedImg,
    frame * frameW,
    0,
    frameW,
    frameH,
    obs.x,
    obs.y,
    obs.width,
    obs.height
  );
}

function drawTrash(ctx, obs, trashImg) {
  if (!trashImg || !trashImg.complete || !trashImg.naturalWidth) {
    ctx.fillStyle = "#6c757d";
    ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
    return;
  }

  const frameW = trashImg.naturalWidth / TRASH_FRAMES;
  const frameH = trashImg.naturalHeight;

  const t = Date.now() + obs.animOffset;
  const frame = Math.floor(t / TRASH_ANIM_MS) % TRASH_FRAMES;

  ctx.drawImage(
    trashImg,
    frame * frameW,
    0,
    frameW,
    frameH,
    obs.x,
    obs.y,
    obs.width,
    obs.height
  );
}

// ---------------- Circle collision (fixes “invisible hits”) ----------------

function circleIntersect(a, b) {
  const dx = a.cx - b.cx;
  const dy = a.cy - b.cy;
  const r = a.r + b.r;
  return dx * dx + dy * dy <= r * r;
}

function getSealCircle(seal) {
  // Small, forgiving hit radius (tightened)
  const r = Math.min(seal.width, seal.height) * 0.22;
  return {
    cx: seal.x + seal.width * 0.52,
    cy: seal.y + seal.height * 0.55,
    r
  };
}

function getObstacleCircle(obs) {
  if (obs.kind === "seaweed") {
    // Only base/rocks should hurt (NOT leafy top)
    return {
      cx: obs.x + obs.width * 0.50,
      cy: obs.y + obs.height * 0.80,
      r: Math.min(obs.width, obs.height) * 0.22
    };
  }

  if (obs.kind === "trash") {
    // Tight circle inside the bag (ignores surrounding bubbles/chips)
    return {
      cx: obs.x + obs.width * 0.55,
      cy: obs.y + obs.height * 0.55,
      r: Math.min(obs.width, obs.height) * 0.23
    };
  }

  // fallback
  return {
    cx: obs.x + obs.width * 0.5,
    cy: obs.y + obs.height * 0.5,
    r: Math.min(obs.width, obs.height) * 0.25
  };
}

function drawHitbox(ctx, obs) {
  const c = getObstacleCircle(obs);
  ctx.save();
  ctx.strokeStyle = "rgba(255, 0, 0, 0.8)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(c.cx, c.cy, c.r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

export function checkObstacleCollision(seal, onLifeLost, onGameOver) {
  const sealC = getSealCircle(seal);

  for (let obs of obstacles) {
    const obsC = getObstacleCircle(obs);

    if (circleIntersect(sealC, obsC)) {
      if (!seal.invincible) {
        seal.lives--;
        seal.invincible = true;
        seal.invincibleTimer = 90;

        if (seal.lives <= 0) onGameOver();
        else onLifeLost();
      }
      return; // one collision per frame
    }
  }
}
