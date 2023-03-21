// @ts-check

import { loadLevel, chance, rand } from './util.mjs';

/**
 * @typedef {import('./util.mjs').Player} Player
 * @typedef {import('./util.mjs').XY} XY
 */

/**
 * The GameServer manages all game state.
 *
 * It may be used in browsers, or on the server. This means it should
 * not use any browser-specific APIs like Canvas, or server-specific
 * APIs like a Websocket server.
 */
export class GameServer extends EventTarget {

  /**
   * @param {string} levelData
   */
  constructor(levelData) {
    
    super();
    this.level = loadLevel(levelData);
    this.width = this.level.width * this.level.tileSize;
    this.height = this.level.height * this.level.tileSize;

  }

  /**
   * @param {GameEvent} ev
   */
  emit(ev) {

    const player = this.getPlayer(ev.playerId);
    switch(ev.type) {
      case 'move' : {
        player.mode = 'move';
        player.direction = ev.direction ?? player.direction;
        break;
      }
      case 'idle' : {
        player.mode = 'idle';
        break;
      }
      case 'shoot' : {
        this.shoot(player);
        break;
      }
    }

  }

  /**
   * @param {number} id
   */
  getPlayer(id) {

    const player = this.level.players.find(player => player.id === id);
    if (!player) throw new Error(`Player with id ${id} not found`);
    return player;

  }

  /**
   * Returns the player id for the current human player 
   * @returns {number}
   */
  getP1Id() {
    const player = this.level.players.find(player => player.type === 'p1');
    if (!player) throw new Error(`Could not find Player1 in this level`);
    return player.id;

  }

  /**
   * Update the state of every object. This is 1 tick in the game.
   */
  update() {

    for(const player of this.level.players) {

      if (player.type === 'cpu') {
        this.aiDecision(player);
      }

      if (player.mode === 'move') {
        this.movePlayer(player);
      }

    }
    for(const entity of this.level.entities) {

      entity.x += entity.heading[0];
      entity.y += entity.heading[1];

    }


  }


  /**
   * @param {Player} player
   */
  movePlayer(player) {

    /**
     * @type {number}
     */
    let newX = player.x;
    /**
     * @type {number}
     */
    let newY = player.y;

    const speed = 5;

    switch(player.direction) {

      case 1 :
        newY-=speed;
        break;
      case 2 :
        newX+=speed;
        break;
      case 3 :
        newY+=speed;
        break;
      case 4 :
        newX-=speed;
        break;

    }
    if (this.legalPosition(newX, newY, 23)) {

      player.x = newX;
      player.y = newY;
    }

  }

  /**
   * @param {Player} player
   */
  shoot(player) {

    const [x, y] = getMuzzleLocation(player);
    /** @type {XY} */
    let heading = [0, 0];
    const speed = 7;
    switch (player.direction) {
      case 1: heading = [0, -speed]; break;
      case 2: heading = [speed, 0]; break;
      case 3: heading = [0, speed]; break;
      case 4: heading = [-speed, 0]; break;
    }
    this.level.entities.push({
      type: 'bullet',
      playerId: player.id,
      x,
      y,
      heading
    });

  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {number} spriteRadius
   */
  legalPosition(x, y, spriteRadius) {

   // Check the bounding box of the entire level
    if (x < spriteRadius || x > this.width-spriteRadius || y < spriteRadius || y > this.height - spriteRadius) {
      return false;
    }

    // Are we intersecting with any tiles?
    const overlappingTiles = [
      [this.rtt(x-spriteRadius), this.rtt(y-spriteRadius)],
      [this.rtt(x+spriteRadius), this.rtt(y-spriteRadius)],
      [this.rtt(x+spriteRadius), this.rtt(y+spriteRadius)],
      [this.rtt(x-spriteRadius), this.rtt(y+spriteRadius)],
    ];

    for(const [x,y] of overlappingTiles) {

      const tile = this.level.tiles[y][x];
      if (tile === '~' || tile === '#') return false;

    }

    return true;

  }

  /**
   * Coordinate (x/y) of the real level, to the tile x/y position
   *
   * @param {number} input
   * @returns {number}
   */
  rtt(input) {

    return Math.floor(input / this.level.tileSize);

  }

  /**
   * @param {Player} player
   */
  aiDecision(player) {

    if (chance(20)) {
      const newMove = rand(1,6);
      if (newMove === 5) {
        player.mode = 'idle';
      } else {
        player.mode = 'move';
        player.direction = newMove;
      }
    }
    if (chance(100)) {
      this.emit({
        playerId: player.id,
        type: 'shoot',
      });
    }

  }

}



/**
 * @typedef {Object} PlayerMoveEvent
 * @property {number} PlayerMoveEvent.playerId
 * @property {'move'} PlayerMoveEvent.type
 * @property {number} PlayerMoveEvent.direction
 */
/**
 * @typedef {Object} PlayerIdleEvent
 * @property {number} PlayerMoveEvent.playerId
 * @property {'idle'} PlayerMoveEvent.type
 */
/**
 * @typedef {Object} PlayerShootEvent
 * @property {number} PlayerMoveEvent.playerId
 * @property {'shoot'} PlayerMoveEvent.type
 */

/**
 * @typedef {PlayerMoveEvent|PlayerIdleEvent|PlayerShootEvent} GameEvent
 */

/**
 * @param {Player} player
 * @returns {[number, number]}
 */
function getMuzzleLocation(player) {

  switch(player.direction)  {
    default :
    case 1 :
      return [player.x, player.y-25];
    case 2:
      return [player.x+25, player.y];
    case 3 :
      return [player.x, player.y+25];
    case 4:
      return [player.x-25, player.y];
  }

}
