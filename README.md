# functional reactive 1D pacman <img alt="pacman" widht="50px" height="50px" src="https://github.com/63r6o/frp-pacman/assets/102681223/f704d6a2-0982-403f-abad-9f5e2e11f431">

A 1D pacman game, inspired by <a href="https://abagames.github.io/crisp-game-lib-11-games/?pakupaku">paku paku</a>, implimented with a subset of RxJS, **_roughly_** equivalent to <a href="http://conal.net/talks/essence-and-origins-of-frp-lambdajam-2015.pdf">Conal Elliott's original FRP formulation</a>.

The game's state is calculated as a pure function of _time_ (animationFrames) and space presses, with the only side-effect being the actual drawing of the canvas.

![image](https://github.com/63r6o/frp-pacman/assets/102681223/27291d97-0a0a-43d5-9de5-35479df0ec0a)

The shape of the game's state:
```ts
{
    playerX: number,
    ghostX: number,
    dots: { x: number, magic: boolean, eaten: boolean }[],
    isMagicOn: boolean,
    isBlinking: boolean,
    score: number,

    isGameOver: boolean,
    text: string
  }
```

## Installation
If you'd like to run it locally, clone the repository, `npm install` the dependencies then run the dev server with `npm run server`.

## Structure
```
└── src/
    ├── index.html      // the html page with the canvas
    ├── index.js        // the observable streams calculating the state of the game
    ├── rxjssubset.js   // the "white-listed" functions of RxJS
    └── utils.js        // functions related to position calculations and drawing

```
