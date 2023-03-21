/**
 * @param {number} min Lower boundary (inclusive)
 * @param {number} max Upper boundary (exclusive)
 * @returns {number}
 */
export function rand(min, max) {

  return Math.floor((Math.random()*(max-min))+min);

}

/**
 * @param {number} max
 * @returns {boolean}
 */
export function chance(max) {

  return rand(0, max)===0;

}

/**
 * @typedef {[number, number]} XY
 */

/**
 * @typedef {Object} LevelData
 * @property {number} LevelData.width
 * @property {number} LevelData.height
 * @property {number} LevelData.tileSize
 * @property {string[]} LevelData.tiles
 * @property {Player[]} LevelData.players
 * @property {Entity[]} LevelData.entities
 */

/**
 * @typedef {Object} Player
 * @property {number} id
 * @property {'cpu'|'p1'} Player.type
 * @property {number} Player.x
 * @property {number} Player.y
 * @property {'idle'|'move'} mode
 * @property {number} direction
 * @property {number} variant
 * @property {number} color
 */

/**
 * @typedef {Bullet} Entity
 */

/**
 * @typedef {Object} Bullet
 * @property {'bullet'} Bullet.type
 * @property {number} Bullet.x
 * @property {number} Bullet.y
 * @property {number} Bullet.playerId
 * @property {XY} Bullet.heading
 */

/**
 * Loads a level string and returns a list of sprites
 *
 * @param {string} levelSpec
 * @returns {LevelData}
 */
export function loadLevel(levelSpec, scale = 2) {

  const tileSize = 32;

  /**
   * @type {Player[]}
   */
  let players = [];

  const tiles = []; 
    
  let lineNum = 0;

  let maxCol = 0;

  for(const line of levelSpec.trim().split('\n')) {

    let columnNum = 0;
    let outLine = '';

    for(const cell of line.split('')) {

      /**
       * Center of the cell
       *
       * @type [number, number]
       */
      const cellPosition = [
        (columnNum + 1) * tileSize,
        (lineNum + 1) * tileSize 
      ];


      switch(cell) {

        case '~' :
        case 'T' :
        case '#' :
        case ' ' :
          outLine += cell.repeat(scale);
          break;
        case 'C' :
          players.push({
            id: players.length+1,
            type: 'cpu',
            x: cellPosition[0],
            y: cellPosition[1],
            mode: 'idle',
            direction: 1,
            color: 1,
            variant: rand(1,9),
          });
          outLine += ' '.repeat(scale);
          break;
        case '1' :
          players.push({
            id: players.length+1,
            type: 'p1',
            x: cellPosition[0],
            y: cellPosition[1],
            mode: 'idle',
            direction: 1,
            color: 0,
            variant: 1,
          });
          outLine += ' '.repeat(scale);
          break;
        default:
          throw new Error(`Unexpected character in level file: "${cell}"`);

      }

      columnNum+=2;

    }
    maxCol = Math.max(maxCol, columnNum*2);
    for(let i=0; i<scale; i++) tiles.push(outLine);

    lineNum += scale;

  }

  return {
    width: maxCol+1,
    height: lineNum,
    tileSize,
    tiles,
    players,
    entities: [],
  }

}
