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

const levelData = `
################
#    C    C C  #
# ##   ##    # #
# ##   ## #### #
# ##   ## # C  #
#  C   ## #  # #
# ###  ##  C  #
#      ######  #
#           C  #
# ###########  #
#  1           #
################
`;

function main() {

  canvas = /** @type HTMLCanvasElement **/(document.getElementById('game'));

  game = new Game(canvas);

  const level = loadLevel(game, levelData);

  level.sprites.map( sprite => game.sprites.add(sprite) );

  for(const cpuPosition of level.cpuPositions) {
    const tank = new AITank(game, ...cpuPosition, 1);
  }

  const playerTank = new Tank(game, ...level.p1Position, 0);
  game.sprites.add(playerTank);
  playerSprite = playerTank;



  window.addEventListener('keydown', keyDown);
  game.start();

}
document.addEventListener('DOMContentLoaded', main);


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
 * @typedef {object} LevelData
 * @property {VisibleGameObject[]} sprites
 * @property {[number, number]} p1Position,
 * @property {[number, number][]} cpuPositions,
 */

/**
 * Loads a level string and returns a list of sprites
 *
 * @param {Game} game
 * @param {string} levelSpec
 * @returns {LevelData}
 */
function loadLevel(game, levelSpec) {

  const cellSize = 64;
  const spriteSize = 32;
  const spriteRadius = 16;

  /**
   * @type VisibleGameObject[]
   */
  const sprites = [];

  /**
   * @type [number, number]|null
   */
  let p1Position = null;

  /**
   * @type [number, number][]
   */
  let cpuPositions = [];

  let lineNum = 0;

  for(const line of levelSpec.trim().split('\n')) {

    let columnNum = 0;
    for(const cell of line.split('')) {

      /**
       * Center of the cell
       *
       * @type [number, number]
       */
      const cellPosition = [
        columnNum * cellSize + spriteSize,
        lineNum * cellSize + spriteSize
      ];

      switch(cell) {

        case '#' :
          // Every cell in the level results in 4 brick sprites, so they can individually break
          sprites.push(
            new Brick(game, columnNum*cellSize+spriteRadius,   lineNum*cellSize+spriteRadius,   spriteRadius),
            new Brick(game, columnNum*cellSize+spriteRadius*3, lineNum*cellSize+spriteRadius,   spriteRadius),
            new Brick(game, columnNum*cellSize+spriteRadius,   lineNum*cellSize+spriteRadius*3, spriteRadius),
            new Brick(game, columnNum*cellSize+spriteRadius*3, lineNum*cellSize+spriteRadius*3, spriteRadius),
          );
          break;
        case ' ':
          // Empty space
          break;
        case 'C' :
          cpuPositions.push(cellPosition);
          break;
        case '1' :
          p1Position = cellPosition;
          break;
        default:
          throw new Error(`Unexpected character in level file: "${cell}"`);

      }
      columnNum++;

    }

    lineNum++;

  }

  if (!p1Position) {
    throw new Error('Could not find playrer 1 starting position in level data');
  }

  return {
    sprites,
    p1Position,
    cpuPositions,
  }

}
