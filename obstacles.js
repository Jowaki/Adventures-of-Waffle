export let obstacles = [];

export function spawnObstacle(canvas) {
  let type = Math.random();

  if (type < 0.5) {
    obstacles.push({
      x: canvas.width,
      y: canvas.height - 120,
      width: 80,
      height: 120
    });
  } else {
    obstacles.push({
      x: canvas.width,
      y: Math.random() * (canvas.height - 250),
      width: 90,
      height: 120
    });
  }
}

export function updateObstacles(worldSpeed, canvas) {
  for (let obs of obstacles) {
    obs.x -= worldSpeed;
  }

  obstacles = obstacles.filter(o => o.x > -200);

  if (Math.random() < 0.02) spawnObstacle(canvas);
}

export function drawObstacles(ctx) {
  for (let obs of obstacles) {
    ctx.fillStyle = "#495057";
    ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
  }
}

// ✅ Improved collision with smaller hitboxes
export function checkObstacleCollision(seal, onLifeLost, onGameOver) {

  // Seal hitbox (shrunken)
  const sealHitbox = {
    x: seal.x + seal.width * 0.2,
    y: seal.y + seal.height * 0.2,
    width: seal.width * 0.6,
    height: seal.height * 0.6
  };

  for (let obs of obstacles) {

    // Smaller obstacle hitbox
    const obsHitbox = {
      x: obs.x + 10,
      y: obs.y + 10,
      width: obs.width - 20,
      height: obs.height - 20
    };

    if (
      sealHitbox.x < obsHitbox.x + obsHitbox.width &&
      sealHitbox.x + sealHitbox.width > obsHitbox.x &&
      sealHitbox.y < obsHitbox.y + obsHitbox.height &&
      sealHitbox.y + sealHitbox.height > obsHitbox.y
    ) {

      if (!seal.invincible) {

        seal.lives--;
        seal.invincible = true;
        seal.invincibleTimer = 90;

        if (seal.lives <= 0) {
          onGameOver();
        } else {
          onLifeLost();
        }
      }
    }
  }
}
