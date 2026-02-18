export let obstacles = [];

export function spawnObstacle(canvas) {
  let type = Math.random();

  if (type < 0.5) {
    // ground obstacle
    obstacles.push({
      x: canvas.width,
      y: canvas.height - 120,
      width: 80,
      height: 120,
      kind: "ground"
    });
  } else {
    // floating obstacle
    obstacles.push({
      x: canvas.width,
      y: Math.random() * (canvas.height - 250),
      width: 90,
      height: 120,
      kind: "float"
    });
  }
}

export function updateObstacles(worldSpeed, canvas) {
  for (let obs of obstacles) obs.x -= worldSpeed;

  obstacles = obstacles.filter(o => o.x > -200);

  if (Math.random() < 0.02) spawnObstacle(canvas);
}

export function drawObstacles(ctx) {
  for (let obs of obstacles) {
    ctx.fillStyle = "#495057";
    ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
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
  // tighter than before (sprites usually have lots of transparent padding)
  return {
    x: seal.x + seal.width * 0.28,
    y: seal.y + seal.height * 0.28,
    width: seal.width * 0.44,
    height: seal.height * 0.44
  };
}

function getObstacleHitbox(obs) {
  // Make obstacle hitbox smaller so "near-misses" don't count as hits
  // Ground obstacles tend to feel unfair → shrink slightly more.
  const padX = obs.kind === "ground" ? 18 : 14;
  const padY = obs.kind === "ground" ? 18 : 14;

  return {
    x: obs.x + padX,
    y: obs.y + padY,
    width: Math.max(1, obs.width - padX * 2),
    height: Math.max(1, obs.height - padY * 2)
  };
}

// ✅ Much tighter collision (fixes dying "without bumping")
export function checkObstacleCollision(seal, onLifeLost, onGameOver) {
  const sealHitbox = getSealHitbox(seal);

  for (let obs of obstacles) {
    const obsHitbox = getObstacleHitbox(obs);

    if (rectsIntersect(sealHitbox, obsHitbox)) {
      if (!seal.invincible) {
        seal.lives--;
        seal.invincible = true;
        seal.invincibleTimer = 90;

        if (seal.lives <= 0) onGameOver();
        else onLifeLost();
      }

      // stop after first hit this frame
      return;
    }
  }
}
