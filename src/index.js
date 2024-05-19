import {
  numberOfDots,
  dotWidth,
  draw,
  isColliding,
  calculatePlayerXPosition,
  calculateGhostXPosition,
  initDots,
  calculateDotsState,
  createStateObject,
} from "./utils";
import { animationFrameScheduler } from "rxjs";
import {
  interval,
  map,
  share,
  fromEvent,
  filter,
  scan,
  combineLatest,
  switchMap,
  withLatestFrom,
  pairwise,
  predicate,
  merge,
  of,
  once,
  switcher,
  first,
  timer,
} from "./rxjssubset";

// every paintable frame. ~60 fps
const tick = interval(0, animationFrameScheduler).pipe(share());

// a stream of randomness
const randomValue = merge(
  of(Math.random()),
  interval(1000).pipe(map(() => Math.random())),
);

// space presses
const spacebuttonDown = fromEvent(document, "keydown").pipe(
  filter((event) => event.code === "Space"),
);

// the direction of pacman
const isMovingRight = merge(
  of(true),
  spacebuttonDown.pipe(scan((curr) => !curr, true)),
);

// the speed of the characters,
// which later can be modified
// so it changes under certain conditions
const playerSpeed = of(4);
const ghostSpeed = of(4.4);

// the position of the player
const playerXPosition = tick.pipe(
  withLatestFrom(isMovingRight, playerSpeed),
  scan((x, [_, ...values]) => {
    return calculatePlayerXPosition(x, ...values);
  }, 10),
  share(),
);

// the state of the dots
const dots = combineLatest([playerXPosition, randomValue]).pipe(
  scan(
    (dots, values) => calculateDotsState(dots, ...values),
    initDots(numberOfDots, dotWidth, 12),
  ),
  share(),
);

// an event which fires when a dot has been eaten
const dotEaten = dots.pipe(
  pairwise(),
  filter(
    ([prev, curr]) =>
      prev.reduce((sum, d) => (d.eaten ? sum + 1 : sum), 0) !==
      curr.reduce((sum, d) => (d.eaten ? sum + 1 : sum), 0),
  ),
  map(() => 1),
  share(),
);

// an observable which emits true
// after a magic dot has been eaten,
// and switches to false after 2.3 second
const isMagicOn = merge(
  of(false),
  dotEaten.pipe(
    withLatestFrom(dots),
    map(([_, dots]) => dots.some((dot) => dot.magic && dot.eaten)),
    predicate(),
    switchMap(() => merge(of(true), once(2300, false))),
    share(),
  ),
);

// an observable, switching from true to false
// every 100 ms, 500 ms before the end of the magic phase
const isBlinking = merge(
  of(false),
  isMagicOn.pipe(
    switchMap((magic) => {
      if (magic) {
        return merge(
          of(false), // in case we magic was already on
          timer(1800).pipe(
            switchMap(() => interval(100).pipe(map((x) => x % 2 === 0))),
          ),
        );
      } else {
        return of(false);
      }
    }),
    share(),
  ),
);

// the position of the ghost
const ghostXPosition = combineLatest([
  playerXPosition,
  isMagicOn,
  ghostSpeed,
  randomValue,
]).pipe(
  scan((x, values) => calculateGhostXPosition(x, ...values), 750),
  share(),
);

// an event which fires when
// pacman is touching the ghost
const isTouching = combineLatest(
  [playerXPosition, ghostXPosition],
  isColliding,
).pipe(predicate());

// an event which fires when
// pacman is touching the ghost
// AND the magic was on
const ghostEaten = isTouching.pipe(
  withLatestFrom(isMagicOn),
  filter(([x, y]) => x && y),
  map(() => 10),
);

// the current score
const score = merge(of(0), dotEaten, ghostEaten).pipe(
  scan((sum, point) => sum + point, 0),
  share(),
);

// an event which fires when
// pacman is touching the ghost
// AND the magic was not on
const gameOver = isTouching.pipe(
  withLatestFrom(isMagicOn, score),
  filter(([_touch, magic, _score]) => !magic),
  map(([_touch, _magic, score]) => score),
  first(),
);

// the latest state of the game
const gameState = combineLatest(
  [playerXPosition, ghostXPosition, dots, isMagicOn, isBlinking, score],
  createStateObject,
);

// a function, creating the state of the
// game over screen from the score
const createGameOverState = (score) => {
  return merge(
    of({ isGameOver: true, text: `Game Over`, score }),
    spacebuttonDown.pipe(
      first(),
      switchMap(() => gameloop),
    ),
  );
};

const gameloop = switcher(gameState, gameOver.pipe(map(createGameOverState)));

gameloop.subscribe(draw);
