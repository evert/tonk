// @ts-check
import { Tank, AITank, Brick } from './gameobjects.mjs';
import { rand } from './util.mjs';
import { Game } from './game.mjs';

/**
 * @typedef { import("./gameobjects.mjs").VisibleGameObject } VisibleGameObject
 */

/**
 * @type {HTMLCanvasElement}
 */
let canvas;

/**
 * @type {Game}
 */
let game;

/**
 * @type {Tank}
 */
let playerSprite;

const level = `
################
#              #
# ##   ##    # #
# ##   ## #### #
# ##   ## #    #
#      ## #  # #
# ###  ##      #
#      ######  #
#              #
# ###########  #
#              #
################
`;

function main() {

  canvas = /** @type HTMLCanvasElement **/(document.getElementById('game'));

  game = new Game(canvas);

  for(let i=0; i<10;i++) {
    const tank = new AITank(game, rand(100,900),rand(100,700));
  }

  const playerTank = new Tank(game, rand(100,900),rand(100,700), '#FF0000');
  game.sprites.add(playerTank);
  playerSprite = playerTank;

  loadLevel(game, level).map( sprite => game.sprites.add(sprite) );

  game.animationLoop();
  window.addEventListener('keydown', keyDown);

  setInterval(step,30);

}
document.addEventListener('DOMContentLoaded', main);

function step() {

  for(const player of game.behaviours) {
    player.step();
  }

}

/**
 * @param {KeyboardEvent} ev
 */
function keyDown(ev) {

  switch(ev.key) {

    case 'ArrowUp' : playerSprite.move(1); break;
    case 'ArrowRight': playerSprite.move(2); break;
    case 'ArrowDown': playerSprite.move(3); break;
    case 'ArrowLeft': playerSprite.move(4); break;
    case ' ': playerSprite.shoot(); break;

  }

}

/**
 * Loads a level string and returns a list of sprites
 *
 * @param {Game} game
 * @param {string} levelSpec
 * @return {VisibleGameObject[]}
 */
function loadLevel(game, levelSpec) {

  const cellSize = 64;
  const spriteSize = 32;
  const spriteRadius = 16;

  const result = [];
  let lineNum = 0;
  for(const line of levelSpec.trim().split('\n')) {

    let columnNum = 0;
    for(const cell of line.split('')) {
     
      switch(cell) {

        case '#' :
          // Every cell in the level results in 4 brick sprites, so they can individually break
          result.push(
            new Brick(game, columnNum*cellSize+spriteRadius,   lineNum*cellSize+spriteRadius,   spriteRadius),
            new Brick(game, columnNum*cellSize+spriteRadius*3, lineNum*cellSize+spriteRadius,   spriteRadius),
            new Brick(game, columnNum*cellSize+spriteRadius,   lineNum*cellSize+spriteRadius*3, spriteRadius),
            new Brick(game, columnNum*cellSize+spriteRadius*3, lineNum*cellSize+spriteRadius*3, spriteRadius),
          );
          break;
        case ' ':
          // Empty space
          break;
        default:
          throw new Error(`Unexpected character in level file: "${cell}"`);

      }
      columnNum++;

    }

    lineNum++;

  }

  return result;

}


