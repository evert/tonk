import { GameObject, VisibleGameObject } from './gameobjects.mjs';
import { Tank } from './tank.mjs';

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

export class Game {

  /**
   * @param {HTMLCanvasElement} canvas
   */
  constructor(canvas) {
    this.sprites = new Set();
    this.behaviours = new Set();
    this.players = new Map();
    this.canvas = canvas;
    this.ctx = /** @type {CanvasRenderingContext2D} */(canvas.getContext('2d'));
    this.spriteSheet = new Image();
    this.spriteSheet.src = 'sprites/battle-city.png';
    // For sprite animation we keep track of a frame number.
    this.frame = 0;

    this.showBoundingBoxes = false;
    this.showHitBoxes = false;

    this.lastPlayerId = 0;

  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {number} spriteRadius
   */
  legalPosition(x, y, spriteRadius) {

   // Check the bounding box of the entire level
    if (x < spriteRadius || x > this.canvas.width-spriteRadius || y < spriteRadius || y > this.canvas.height - spriteRadius) {
      return false;
    } else {
      return true;
    }

  }

  render() {

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.sprites = new Set(
      Array.from(this.sprites).sort( (a,b) => a.zIndex - b.zIndex)
    );

    for(const sprite of this.sprites) sprite.render(this.ctx, this.frame);


  }

  animationLoop() {

    window.requestAnimationFrame(() => {
      this.render();
      this.animationLoop();
    });

  }

  start() {

    /**
     * This loop is simply a frame counter.
     * This lets sprites rotate through multiple animations
     */
    setInterval(() => {
      this.frame++
    }, 64)
    this.animationLoop();
    setInterval(() => this.step(),30);

  }


  step() {

    for(const player of this.behaviours) {
      player.step();
    }

  }

  /**
   * @param {GameObject} obj
   */
  addObject(obj) {
    if (obj instanceof VisibleGameObject) {
      this.sprites.add(obj);
    }
    if ('step' in obj) {
      this.behaviours.add(obj);
    }
    if (obj instanceof Tank) {
      const tankId = ++this.lastPlayerId;
      obj.playerId = tankId;
      this.players.set(tankId, obj);
    }
  }

  /**
   * @param {GameEvent} ev
   */
  emit(ev) {

    switch(ev.type) {
      case 'move' :
        this.players.get(ev.playerId).setMode('move', ev.direction);
        break;
      case 'idle' :
        this.players.get(ev.playerId).setMode('idle');
        break;
      case 'shoot' :
        this.players.get(ev.playerId).shoot();
        break;
    }

  }

}
