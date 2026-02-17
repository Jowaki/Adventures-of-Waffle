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

  const swimSpeed = 1.5;   // ← control fish speed here

  for (let f of foodList) {

    // constant slow swim speed
    f.x -= swimSpeed;

    // gentle floating motion
    f.y += Math.sin(Date.now() * 0.002 + f.x * 0.01) * 0.4;
  }

  foodList = foodList.filter(f => f.x > -100);

  // slower spawn rate
  if (Math.random() < 0.01) spawnFood(canvas);
}

export function drawFood(ctx, fishImg) {
  for (let f of foodList) {

    ctx.drawImage(
      fishImg,
      f.x,
      f.y,
      f.width,
      f.height
    );

  }
}

export function checkFoodCollision(seal, addScore) {

  for (let i = foodList.length - 1; i >= 0; i--) {

    let f = foodList[i];

    if (
      seal.x < f.x + f.width &&
      seal.x + seal.width > f.x &&
      seal.y < f.y + f.height &&
      seal.y + seal.height > f.y
    ) {
      addScore(200);  // simple fixed reward
      foodList.splice(i, 1);
    }
  }
}

