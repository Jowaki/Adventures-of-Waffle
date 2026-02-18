export let foodList = [];

export function spawnFood(canvas) {
  foodList.push({
    x: canvas.width,
    y: Math.random() * (canvas.height - 100) + 50,
    width: 70,
    height: 70,
    frame: 0,
    type: Math.random() < 0.7 ? "fish" : "squid"
  });
}

export function updateFood(canvas) {
  const swimSpeed = 1.5; // control fish speed here

  for (let f of foodList) {
    f.x -= swimSpeed;
    f.y += Math.sin(Date.now() * 0.002 + f.x * 0.01) * 0.4;
  }

  foodList = foodList.filter(f => f.x > -100);

  if (Math.random() < 0.01) spawnFood(canvas);
}

export function drawFood(ctx, fishImg) {
  for (let f of foodList) {
    ctx.drawImage(fishImg, f.x, f.y, f.width, f.height);
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
  // match the tighter seal hitbox used in obstacles.js
  return {
    x: seal.x + seal.width * 0.28,
    y: seal.y + seal.height * 0.28,
    width: seal.width * 0.44,
    height: seal.height * 0.44
  };
}

function getFoodHitbox(f) {
  // Fish sprite likely has transparent padding → tighten a lot
  const padX = f.width * 0.25;
  const padY = f.height * 0.25;

  return {
    x: f.x + padX,
    y: f.y + padY,
    width: Math.max(1, f.width - padX * 2),
    height: Math.max(1, f.height - padY * 2)
  };
}

// ✅ Fixes "eats food without contact"
export function checkFoodCollision(seal, addScore) {
  const sealHitbox = getSealHitbox(seal);

  for (let i = foodList.length - 1; i >= 0; i--) {
    const f = foodList[i];
    const foodHitbox = getFoodHitbox(f);

    if (rectsIntersect(sealHitbox, foodHitbox)) {
      addScore(200);
      foodList.splice(i, 1);
      return; // only eat one per frame
    }
  }
}
