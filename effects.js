export let bubbles = [];
let bgOffset = 0;

export function drawBackground(ctx, canvas) {

  bgOffset -= 0.5;

  let gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#003049");
  gradient.addColorStop(0.5, "#005f73");
  gradient.addColorStop(1, "#001219");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

export function updateBubbles(canvas) {

  for (let b of bubbles) b.y -= 2;

  bubbles = bubbles.filter(b => b.y > -10);

  if (Math.random() < 0.05) {
    bubbles.push({
      x: Math.random() * canvas.width,
      y: canvas.height,
      size: Math.random() * 6 + 2
    });
  }
}

export function drawBubbles(ctx) {

  ctx.fillStyle = "rgba(255,255,255,0.3)";

  for (let b of bubbles) {
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
    ctx.fill();
  }
}