// @ts-check

import { chance, rand } from './util.mjs';

/**
 * @typedef { import('./game.mjs').Game } Game
 */

export class GameObject {

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

export class VisibleGameObject extends GameObject {

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
    this.zIndex = 10;

  }

  /**
   * Renders the object.
   *
   * This function will save and restore the canvas state, and set pixel
   * translation to the center of the object.
   *
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} frame
   */
  render(ctx, frame) {

    if (!('draw' in this)) {
      throw new Error('This GameObject is not drawable');
    }
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.translate(this.posX, this.posY);
    (this).draw(ctx, frame);

    if (this.game.showBoundingBoxes) {
      const box = this.getRelativeBoundingBox();
      ctx.lineWidth = 1;
      ctx.strokeStyle = "#0F0";
      ctx.strokeRect(box.xMin, box.yMin, box.xMax-box.xMin, box.yMax-box.yMin);
    }
    if (this.game.showHitBoxes) {
      ctx.restore();
      ctx.save()
      const box = this.getHitBox();
      ctx.lineWidth = 1;
      ctx.strokeStyle = "#F00";
      ctx.strokeRect(box.xMin, box.yMin, box.xMax-box.xMin, box.yMax-box.yMin);
    }
    ctx.restore();

  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} frame
   * @abstract
   */
  draw(ctx, frame) {

    throw new Error('Draw is not implemented');

  }

  /**
   * @param {VisibleGameObject} sprite
   */
  intersects(sprite, quick = true) {

    // Wide check
    const a = this.getBoundingBox();
    const b = sprite.getBoundingBox();

    const boundingBoxIntersect = a.xMax >= b.xMin && b.xMax >= a.xMin && a.yMax >= b.yMin && b.yMax >= a.yMin;
    if (!boundingBoxIntersect) return false;

    if (quick) {
      return true;
    }

    /**
     * Actually checking for overlapping pixels
     */
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
   * Returns the hitbox.
   *
   * This box will be used to determine if something intersected.
   */
  getHitBox() {

    return this.getBoundingBox();

  }

  /**
   * Returns the bounding box coordinates globally.
   */
  getBoundingBox() {

    const r = this.getRelativeBoundingBox();
    return {
      xMin: this.posX+r.xMin,
      xMax: this.posX+r.xMax,
      yMin: this.posY+r.yMin,
      yMax: this.posY+r.yMax,
    };

  }

  /**
   * Returns bounding box of the object relative to the center of the object.
   */
  getRelativeBoundingBox() {
    return {
      xMin: -this.spriteRadius,
      xMax: +this.spriteRadius,
      yMin: -this.spriteRadius,
      yMax: +this.spriteRadius,
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
    this.draw(octx,0);

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



export class Bullet extends VisibleGameObject {

  /**
   * @param {Game} game
   * @param {number} posX
   * @param {number} posY
   * @param {number|null} direction
   * @param {GameObject} owner
   */
  constructor(game, posX, posY, direction, owner) {
    super(game, posX, posY, 7);
    this.posX = posX;
    this.posY = posY;
    this.owner = owner;
    const speed = 7;
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
    this.color = '#CCC';
  }


  /**
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} frame
   */
  draw(ctx, frame) {

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
      if (sprite instanceof Water) {
        continue;
      }
      if (sprite instanceof Tree) {
        continue;
      }
      if (this.intersects(sprite, false)) {
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



