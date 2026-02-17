// export function drawUI(ctx, score, seal, gameOver, canvas) {

//   ctx.fillStyle = "white";
//   ctx.font = "22px monospace";
//   ctx.fillText("Score: " + score, 20, 40);
//   ctx.fillText("Lives: " + seal.lives, 20, 70);

//   if (gameOver) {
//     ctx.font = "50px monospace";
//     ctx.fillText("GAME OVER", canvas.width/2 - 150, canvas.height/2);
//   }
// }

export function drawUI(ctx, score, seal, gameOver, canvas, foodEaten) {

  ctx.fillStyle = "white";
  ctx.font = "22px monospace";

  ctx.fillText("Score: " + score, 20, 40);
  ctx.fillText("Lives: " + seal.lives, 20, 70);
  ctx.fillText("Fish Consumed: " + foodEaten, 20, 100);

  if (gameOver) {
    ctx.font = "50px monospace";
    ctx.fillText(
      "GAME OVER",
      canvas.width / 2 - 150,
      canvas.height / 2
    );
  }
}

