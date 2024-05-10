// constants of the canvas
const canvasWidth = 800;
const characterWidth = 36;
export const numberOfDots = 16;
export const dotWidth = 16;

// drawing
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

export const draw = (state) => {
  ctx.clearRect(0, 0, canvasWidth, canvasWidth / 2);

  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvasWidth, canvasWidth / 2);

  if (state.isGameOver) {
    ctx.fillStyle = "white";

    ctx.font = "bold 92px monospace";
    ctx.textAlign = "center";
    ctx.fillText(state.text, canvasWidth / 2, canvasWidth / 4);

    ctx.font = "bold 42px monospace";
    ctx.fillText(
      `Your score is: ${state.score}`,
      canvasWidth / 2,
      canvasWidth / 3,
    );

    ctx.font = "bold 22px monospace";
    ctx.fillStyle = "#ffff00";
    ctx.fillText(
      "[press space to continue]",
      canvasWidth / 2,
      canvasWidth / 2 - 42,
    );
    return;
  }

  ctx.fillStyle = "white";
  ctx.font = "bold 92px monospace";
  ctx.textAlign = "center";
  ctx.fillText(state.score, canvasWidth / 2, 118);

  state.dots.forEach((dot) => {
    if (dot.magic) {
      ctx.fillStyle = "white";
      if (!dot.eaten)
        ctx.fillRect(
          dot.x,
          canvasWidth / 4 + dotWidth / 2,
          dotWidth * 1.1,
          dotWidth * 1.1,
        );
    } else {
      ctx.fillStyle = "#ffb751";
      if (!dot.eaten)
        ctx.fillRect(dot.x, canvasWidth / 4 + dotWidth / 2, dotWidth, dotWidth);
    }
  });

  ctx.fillStyle = "#2121ff";
  ctx.fillRect(0, canvasWidth / 4 - characterWidth, canvasWidth, 5);
  ctx.fillRect(0, canvasWidth / 4 - characterWidth + 15, canvasWidth, 5);

  ctx.fillRect(0, canvasWidth / 4 + characterWidth + 15, canvasWidth, 5);
  ctx.fillRect(0, canvasWidth / 4 + characterWidth + 30, canvasWidth, 5);

  ctx.fillStyle = "#ffff00";
  ctx.fillRect(state.playerX, canvasWidth / 4, characterWidth, characterWidth);

  if (state.isMagicOn && !state.isBlinking) ctx.fillStyle = "#2121ff";
  else if (state.isMagicOn && state.isBlinking) ctx.fillStyle = "white";
  else ctx.fillStyle = "#ff0000";

  ctx.fillRect(state.ghostX, canvasWidth / 4, characterWidth, characterWidth);
};

// position-calculation related functions
export const isColliding = (
  x1,
  x2,
  width1 = characterWidth,
  width2 = width1,
) => {
  return x1 + width1 >= x2 && x1 <= x2 + width2;
};

export const calculatePlayerXPosition = (x, movingRight, playerSpeed) => {
  if (movingRight) {
    return (x + playerSpeed) % canvasWidth;
  } else if (x - playerSpeed < -characterWidth) {
    return canvasWidth;
  } else {
    return x - playerSpeed;
  }
};

export const calculateGhostXPosition = (
  currentX,
  playerX,
  magicOn,
  ghostSpeed,
  randomValue,
) => {
  if (magicOn && isColliding(currentX, playerX))
    return randomValue < 0.5
      ? 0 - characterWidth * 7
      : canvasWidth + characterWidth * 7;

  if (playerX > currentX) {
    if (magicOn && 0 < currentX) {
      return currentX - ghostSpeed * 0.5 < 0 ? 0 : currentX - ghostSpeed * 0.5;
    }

    return currentX + ghostSpeed;
  } else {
    if (magicOn && currentX < canvasWidth - characterWidth) {
      return currentX + ghostSpeed * 0.5 > canvasWidth - characterWidth
        ? canvasWidth - characterWidth
        : currentX + ghostSpeed * 0.5;
    }

    return currentX - ghostSpeed;
  }
};

export const initDots = (numberOfDots, dotWidth, magicIndex) =>
  Array(numberOfDots)
    .fill(0)
    .map((_, i) => ({
      x: i * dotWidth * 3 + dotWidth * 1.5, // canvasWidth / numberOfDots + dotWidth * 1.5
      magic: i === magicIndex,
      eaten: false,
    }));

export const calculateDotsState = (currentDots, playerX, randomValue) => {
  const magicIndex = Math.floor(randomValue * numberOfDots);
  if (currentDots.every((dot) => dot.eaten)) {
    return initDots(numberOfDots, dotWidth, magicIndex);
  }

  return currentDots.map((dot) => {
    if (isColliding(dot.x, playerX, dotWidth, characterWidth)) {
      return { ...dot, eaten: true };
    } else {
      return dot;
    }
  });
};

export const createStateObject = (
  playerX,
  ghostX,
  dots,
  isMagicOn,
  isBlinking,
  score,
) => {
  return {
    playerX,
    ghostX,
    dots,
    isMagicOn,
    isBlinking,
    score,
  };
};
