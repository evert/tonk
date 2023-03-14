// @ts-check

import { chance, rand } from './util.mjs';

/**
 * @typedef { import('./game.mjs').Game } Game
 */

class GameObject {

  /**
   * @param {Game} game
   */
  constructor(game) {

    this.game = game;

  }

  free() {
    this.game.sprites.delete(this);
    this.game.behaviours.delete(this);
  }

}

class VisibleGameObject extends GameObject {

  /**
   * @param {Game} game
   * @param {number} posX
   * @param {number} posY
   * @param {number} spriteRadius
   */
  constructor(game, posX, posY, spriteRadius) {

    super(game);
    this.spriteRadius = spriteRadius;
    this.posX = posX;
    this.posY = posY;
    if ('step' in this) {
      this.game.behaviours.add(this);
    }
    if ('draw' in this) {
      this.game.sprites.add(this);
    }

  }

  /**
   * Renders the object.
   *
   * This function will save and restore the canvas state, and set pixel
   * translation to the center of the object.
   *
   * @param {CanvasRenderingContext2D} ctx
   */
  render(ctx) {

    if (!('draw' in this)) {
      throw new Error('This GameObject is not drawable');
    }
    ctx.save();
    ctx.translate(this.posX, this.posY);
    (this).draw(ctx);
    ctx.restore();

  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   * @abstract
   */
  draw(ctx) {

    throw new Error('Draw is not implemented');

  }

  /**
   * @param {VisibleGameObject} sprite
   */
  intersects(sprite) {

    // Wide check
    const a = this.getBoundingBox();
    const b = sprite.getBoundingBox();

    const boundingBoxIntersect = a.xMax >= b.xMin && b.xMax >= a.xMin && a.yMax >= b.yMin && b.yMax >= a.yMin;
    if (!boundingBoxIntersect) return false;

    // Narrow check
    const bMask = sprite.getMask();
    const aMask = this.getMask();

    for(const xy of aMask) {
      if (bMask.has(xy)) {
        return true;
      }
    }

    return false;

  }

  /**
   * Returns the bounding box coordinates
   */
  getBoundingBox() {

    return {
      xMin: this.posX-this.spriteRadius,
      xMax: this.posX+this.spriteRadius,
      yMin: this.posY-this.spriteRadius,
      yMax: this.posY+this.spriteRadius,
    };

  }

  /**
   * Returns a Set with coorindates of all pixels this object occupies on the
   * canvas.
   *
   * Used for hit detection.
   */
  getMask() {

    /**
     * Create a tiny invisible canvas to draw the item in
     */
    const offscreenCanvas = new OffscreenCanvas(this.spriteRadius*2, this.spriteRadius*2);
    const octx = /** @type any */ (offscreenCanvas.getContext('2d'));
    octx.translate(this.spriteRadius,this.spriteRadius);
    this.draw(octx);

    const imgData = octx.getImageData(0,0,this.spriteRadius*2,this.spriteRadius*2);

    /* @ts-ignore */
    //document.getElementById('debug-canvas').getContext('2d').putImageData(imgData, this.posX-this.spriteRadius, this.posY-this.spriteRadius);

    const mask = [];
    for(let y=0; y<imgData.height;y++) {
      for(let x=0; x<imgData.width;x++) {
        const offset = (y*imgData.width*4)+(x*4);
        const hasPixel = imgData.data[offset+3]!==0;
        if (hasPixel) {
          mask.push(`${x+this.posX-this.spriteRadius},${y+this.posY-this.spriteRadius}`);
          //mask2.push(`${x},${y}`);
        }
      }
    }
    /*
    const testResult = new Set(mask2);
    let str = '';
    for(let y=0; y<imgData.height;y++) {
      for(let x=0; x<imgData.width;x++) {
       str+=(testResult.has(`${x},${y}`)?'#':' ');
      }
      str+='\n';
    }
    console.log(str);

    console.log(imgData);
    */
    return new Set(mask);

  }

}

export class Tank extends VisibleGameObject {

  /**
   * @param {Game} game
   * @param {number} posX
   * @param {number} posY
   * @param {string|null} color
   */
  constructor(game, posX, posY, color = null) {

    super(game, posX, posY, 25);
    this.speed = 3;
    this.orientation = rand(1,5);
    this.color = color ?? `rgb(${rand(0,128)},${rand(0,128)},${rand(0,128)}`;

  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   */
  draw(ctx) {

    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.rotate(Math.PI*(this.orientation/2-0.5));

    // bottom left
    ctx.moveTo(-25, 25);
    ctx.lineTo(25, 25);
    ctx.lineTo(25, -15);

    // nuzzle start
    ctx.lineTo(5, -15);
    ctx.lineTo(5, -25);
    ctx.lineTo(-5, -25);
    ctx.lineTo(-5, -15);

    // Complete the box
    ctx.lineTo(-25, -15);
    ctx.closePath();
    ctx.fill();

  }

  /**
   * @param {number|null} direction
   */
  move(direction = null) {

    this.orientation = direction ?? this.orientation;

    /**
     * @type {number}
     */
    let newX = this.posX;
    /**
     * @type {number}
     */
    let newY = this.posY;

    switch(this.orientation) {

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
      this.posX = newX;
      this.posY = newY;
    }

  }

  /**
   * @returns {[number, number]}
   */
  getMuzzleLocation() {

    switch(this.orientation)  {
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

    new Bullet(this.game, ...this.getMuzzleLocation(), this.orientation, this);

  }

  die() {

    this.free();

  }

}

export class Bullet extends VisibleGameObject {

  /**
   * @param {Game} game
   * @param {number} posX
   * @param {number} posY
   * @param {number|null} direction
   * @param {GameObject} owner
   */
  constructor(game, posX, posY, direction, owner) {
    super(game, posX, posY, 10);
    this.posX = posX;
    this.posY = posY;
    this.owner = owner;
    const speed = 5;
    this.speedX = 0;
    this.speedY = 0;
    switch(direction) {
      case 1:
        this.speedY = - speed;
        break;
      case 2:
        this.speedX = speed;
        break;
      case 3 :
        this.speedY = speed;
        break;
      case 4 :
        this.speedX = -speed;
        break;
    }

    this.direction = direction;
    this.color = '#000000';
  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   */
  draw(ctx) {

    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(0, 0, this.spriteRadius, 0, 2 * Math.PI, false);
    ctx.fill();

  }

  step() {

    this.posX += this.speedX;
    this.posY += this.speedY;

    for(const sprite of this.game.sprites) {
      if (sprite === this || sprite === this.owner) {
        continue;
      }
      if (this.intersects(sprite)) {
        // Hit!
        sprite.free();
        this.free();
      }
    }

    if (!this.game.legalPosition(this.posX, this.posY, this.spriteRadius)) {

      this.free();

    }

  }

}


export class AITank extends Tank {

  step() {

    if (chance(20)) {
      this.orientation = rand(1,5);
    }
    if (chance(100)) {
      this.shoot();
    }
    this.move();

  }

}
