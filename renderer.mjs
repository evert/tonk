// @ts-check

/**
 * @typedef {import('./util.mjs').LevelData} LevelData
 * @typedef {import('./util.mjs').Player} Player
 * @typedef {import('./util.mjs').Entity} Entity
 */

const spriteSheet = new Image();
spriteSheet.src = 'sprites/battle-city.png';

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {LevelData} gameState
 * @param {number} frame
 */
export function renderer(ctx, gameState, frame) {

  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, gameState.width * tileSize, gameState.height * tileSize);

  renderTiles(ctx, gameState, frame);
  renderPlayers(ctx, gameState, frame);
  renderEntities(ctx, gameState, frame);
  renderTiles(ctx, gameState, frame, false);

}

const tileSize = 32;

/**
 * The tiles that should render above the tanks.
 */
const ceilingTiles = new Set(['T']);

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {LevelData} gameState
 * @param {number} frame
 * @param {boolean} floor
 */
function renderTiles(ctx, gameState, frame, floor = true) {

  for(let x = 0; x < gameState.width; x++) {
    for(let y = 0; y < gameState.height; y++) {
      const tile = gameState.tiles[y][x];
      /**
       * If we are rendering the floor, don't render the ceiling tiles.
       * If we are not rendering the floor, do render the ceiling tiles
       */
      if (floor !== ceilingTiles.has(tile)) {
        renderTile(ctx, x, y, tile, frame);
      }
    }
  }

}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y 
 * @param {string} tile 
 * @param {number} frame
 */
function renderTile(ctx, x, y, tile, frame) {

  ctx.save();
  ctx.translate(x * tileSize, y * tileSize);

  switch (tile) {
     
    case '#' :
      ctx.drawImage(
        spriteSheet,
        256, 64, 8, 8,
        0, 0, tileSize, tileSize,
      );
      break;
    case 'T' :
      ctx.drawImage(
        spriteSheet,
        272, 32, 8, 8,
        0, 0, tileSize, tileSize,
      );
      break;
    case '~' :
      const frameOffset = (Math.floor(frame/10) % 2) * 16;
      ctx.drawImage(
        spriteSheet,
        256+frameOffset, 48, 8, 8,
        0, 0, tileSize, tileSize,
      );
    default: 
      //throw new Error(tile);

  }
  ctx.restore();

}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {LevelData} gameState
 * @param {number} frame
 */
function renderPlayers(ctx, gameState, frame) {


  for(const player of gameState.players) {
    renderPlayer(ctx, player, frame);
  }

}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {Player} player
 * @param {number} frame
 */
function renderPlayer(ctx, player, frame) {

  ctx.save();
  ctx.translate(player.x, player.y);

  /**
   * Alternative moving frames but only if we're moving
   */
  const frameOffset = player.mode === 'idle' ? 0 : frame % 2;

  const offset =
    frameOffset +
    // Funny formula to deal with the fact that the
    // orientation on the sprite sheet is counter clockwise
    // and ours is clockwise
    ((5-player.direction) % 4) * 2 +
    player.color * 8;

  ctx.drawImage(
    spriteSheet,
    (1+offset*16), 1+(player.variant-1)*16, 14, 14,
    -25, -25, 26*2, 26*2,
  );
  ctx.restore();

}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {LevelData} gameState
 * @param {number} frame
 */
function renderEntities(ctx, gameState, frame) {


  for(const entity of gameState.entities) {
    renderEntity(ctx, entity, frame);
  }

}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {Entity} entity
 * @param {number} frame
 */
function renderEntity(ctx, entity, frame) {

  ctx.save();
  ctx.translate(entity.x, entity.y);

  switch (entity.type) {
     
    case 'bullet' :
      ctx.fillStyle = '#CCC';
      ctx.beginPath();
      ctx.arc(0, 0, 7, 0, 2 * Math.PI, false);
      ctx.fill();
      break;
    default: 
      //throw new Error(tile);

  }
  ctx.restore();

}
