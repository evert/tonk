/**
 * @typedef { import('./game.mjs').Game } Game
 */
import { VisibleGameObject, Bullet, Tree } from './gameobjects.mjs';
import { chance, rand } from './util.mjs';

export class Tank extends VisibleGameObject {

  /**
   * @param {Game} game
   * @param {number} posX
   * @param {number} posY
   * @param {number} color
   */
  constructor(game, posX, posY, color, variant = 1) {

    super(game, posX, posY, 25);
    this.speed = 5;
    this.direction = rand(1,5);
    this.color = color;
    /** @type {'idle'|'move'} */
    this.mode = 'idle';
    this.spriteVariant = variant;
    this.playerId = 0;

  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} frame
   */
  draw(ctx, frame) {

    /**
     * Alternative moving frames but only if we're moving
     */
    const frameOffset = this.mode === 'idle' ? 0 : frame % 2;

    const offset =
      frameOffset +
      // Funny formula to deal with the fact that the
      // orientation on the sprite sheet is counter clockwise
      // and ours is clockwise
      ((5-this.direction) % 4) * 2 +
      this.color * 8;

    ctx.drawImage(
      this.game.spriteSheet,
      (1+offset*16), 1+(this.spriteVariant-1)*16, 14, 14,
      -25, -25, 26*2, 26*2,
    );


  }

  /**
   * @param {'idle'|'move'} mode
   * @param {number|null} direction
   */
  setMode(mode, direction = null) {

    this.mode = mode;
    this.direction = direction ?? this.direction;

  }

  step() {

    switch(this.mode) {

      case 'idle' :
        break;
      case 'move' :
        /**
         * @type {number}
         */
        let newX = this.posX;
        /**
         * @type {number}
         */
        let newY = this.posY;

        switch(this.direction) {

          case 1 :
            newY-=this.speed;
            break;
          case 2 :
            newX+=this.speed;
            break;
          case 3 :
            newY+=this.speed;
            break;
          case 4 :
            newX-=this.speed;
            break;

        }
        if (this.game.legalPosition(newX, newY, this.spriteRadius)) {

          /**
           * Temporarily storing old positin
           */
          const oldPos = [this.posX, this.posY];

          this.posX = newX;
          this.posY = newY;

          for(const sprite of this.game.sprites) {

            if (sprite instanceof Tree) {
              continue;
            }
            if (sprite !== this && this.intersects(sprite)) {
              // Roll back
              [this.posX, this.posY] = oldPos;
              break;
            }

          }
        }


    }

  }

  /**
   * @param {number|null} direction
   */
  move(direction = null) {

    //const orientationChanged = direction && direction !== this.orientation;
    //this.orientation = direction ?? this.orientation;

    /*
    if (orientationChanged && !this.game.legalPosition(this.posX, this.posY, this.spriteRadius)) {

      /**
       * @type {[number, number][]}
       */
      /*
      const potentialPositions = [
        [this.posX-10, this.posY],
        [this.posX+10, this.posY],
        [this.posX, this.posY-10],
        [this.posX, this.posY+10],
      ];
      potentialPositions.sort((a,b) => Math.random());
      for(const [x,y] of potentialPositions) {

        if (this.game.legalPosition(x, y, this.spriteRadius)) {
          this.posX = x;
          this.posY = y;
          break;
        }
      }

    }
    */

  }

  /**
   * @returns {[number, number]}
   */
  getMuzzleLocation() {

    switch(this.direction)  {
      default :
      case 1 :
        return [this.posX, this.posY-25];
      case 2:
        return [this.posX+25, this.posY];
      case 3 :
        return [this.posX, this.posY+25];
      case 4:
        return [this.posX-25, this.posY];
    }

  }

  shoot() {

    new Bullet(
      this.game,
      ...this.getMuzzleLocation(),
      this.direction,
      this
    );

  }

  /**
   * Returns the hitbox.
   *
   * This box will be used to determine if something intersected.
   */
  getHitBox() {

    return this.getBoundingBox();

  }

  die() {

    this.free();

  }

}

export class AITank extends Tank {

  step() {

    if (chance(20)) {
      const newMove = rand(1,6);
      if (newMove === 5) {
        this.setMode('idle');
      } else {
        this.setMode('move', newMove);
      }
    }
    if (chance(100)) {
      this.shoot();
    }
    super.step();

  }

}

