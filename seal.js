// // --- Sprite config ---
// export const sealFrameCount = 2;
// export const sealRow = 0;

// const SPRITE_WIDTH = 836;
// const SPRITE_HEIGHT = 1024;
// const FRAME_WIDTH = SPRITE_WIDTH / sealFrameCount;
// const FRAME_HEIGHT = SPRITE_HEIGHT;

// // Tweak this only 👇
// const SEAL_SCALE = 0.23;

// // --- Animation ---
// let sealAnimTime = 0;
// const sealAnimFPS = 2; // slow cozy swim

// export let sealFrame = 0;

// // --- Seal object ---
// export const seal = {
//   x: 200,
//   y: 200,
//   baseY: 200,
//   width: FRAME_WIDTH * SEAL_SCALE,
//   height: FRAME_HEIGHT * SEAL_SCALE,
//   speed: 5,
//   lives: 3,
//   invincible: false,
//   invincibleTimer: 0
// };

// // --- Update ---
// export function updateSeal(keys, canvas) {
//   sealAnimTime += 1 / 60;

//   // Floaty bob (no drift)
//   seal.y = seal.baseY + Math.sin(sealAnimTime * 2) * 6;

//   if (keys["ArrowUp"]) seal.baseY -= seal.speed;
//   if (keys["ArrowDown"]) seal.baseY += seal.speed;
//   if (keys["ArrowLeft"]) seal.x -= seal.speed;
//   if (keys["ArrowRight"]) seal.x += seal.speed;

//   // Bounds
//   if (seal.baseY < 0) seal.baseY = 0;
//   if (seal.baseY > canvas.height - seal.height)
//     seal.baseY = canvas.height - seal.height;

//   if (seal.x < 0) seal.x = 0;
//   if (seal.x > canvas.width - seal.width)
//     seal.x = canvas.width - seal.width;
// }

// // --- Draw ---
// export function drawSeal(ctx, sealImg) {
//   if (!sealImg.complete) return;

//   sealFrame = Math.floor(sealAnimTime * sealAnimFPS) % sealFrameCount;

//   ctx.drawImage(
//     sealImg,
//     sealFrame * FRAME_WIDTH,
//     0,
//     FRAME_WIDTH,
//     FRAME_HEIGHT,
//     seal.x,
//     seal.y,
//     seal.width,
//     seal.height
//   );
// }


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
  invincibleTimer: 0
};

export function updateSeal(keys, canvas) {

  sealAnimTime += 1 / 60;

  seal.y = seal.baseY + Math.sin(sealAnimTime * 2) * 6;

  if (keys["ArrowUp"]) seal.baseY -= seal.speed;
  if (keys["ArrowDown"]) seal.baseY += seal.speed;
  if (keys["ArrowLeft"]) seal.x -= seal.speed;
  if (keys["ArrowRight"]) seal.x += seal.speed;

  if (seal.baseY < 0) seal.baseY = 0;
  if (seal.baseY > canvas.height - seal.height)
    seal.baseY = canvas.height - seal.height;

  if (seal.x < 0) seal.x = 0;
  if (seal.x > canvas.width - seal.width)
    seal.x = canvas.width - seal.width;

  // invincibility timer
  if (seal.invincible) {
    seal.invincibleTimer--;
    if (seal.invincibleTimer <= 0) {
      seal.invincible = false;
    }
  }
}

export function drawSeal(ctx, sealImg) {
  if (!sealImg.complete) return;

  sealFrame = Math.floor(sealAnimTime * sealAnimFPS) % sealFrameCount;

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
