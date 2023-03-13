// @ts-check


/**
 * @type {HTMLCanvasElement}
 */
let game;

/**
 * @type {CanvasRenderingContext2D} ctx
 */
let ctx;

/**
 * @type {Tank}
 */
let playerSprite;

const sprites = new Set();
const behaviours = new Set();

function main() {

  game = /** @type HTMLCanvasElement **/(document.getElementById('game'));
  ctx = /** @type {CanvasRenderingContext2D} */(game.getContext('2d'));

  for(let i=0; i<10;i++) {
    const tank = new AITank(rand(100,900),rand(100,700));
  }
   
  const playerTank = new Tank(rand(100,900),rand(100,700), '#FF0000');
  sprites.add(playerTank);
  playerSprite = playerTank;

  window.requestAnimationFrame(render);
  window.addEventListener('keydown', keyDown);

  setInterval(step,30);

}

/**
 * @param {number} x
 * @param {number} y
 * @param {number} spriteRadius
 */
function legalPosition(x, y, spriteRadius) {

  if (x < spriteRadius || x > game.width-spriteRadius || y < spriteRadius || y > game.height - spriteRadius) {
    return false;
  } else {
    return true;
  }

}

function step() {
  
  for(const player of behaviours) {
    player.step();
  }

}

function render() {

  ctx.clearRect(0, 0, game.width, game.height);
  for(const sprite of sprites) sprite.draw(ctx);
  window.requestAnimationFrame(render);

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
  console.log(ev.key); 

}



class GameObject {

  /**
   * @param {number} posX
   * @param {number} posY
   * @param {number} spriteRadius
   */
  constructor(posX, posY, spriteRadius) {

    this.spriteRadius = spriteRadius;
    this.posX = posX;
    this.posY = posY;
    if ('step' in this) {
      behaviours.add(this);
    }
    if ('draw' in this) {
      sprites.add(this);
    }

  }

  free() {
    sprites.delete(this);
    behaviours.delete(this);
  }

  /**
   * @param {GameObject} sprite
   */
  intersects(sprite) {

    const aXmin = this.posX-this.spriteRadius;
    const aXmax = this.posX+this.spriteRadius;
    const aYmin = this.posY-this.spriteRadius;
    const aYmax = this.posY+this.spriteRadius;
    const bXmin = sprite.posX-sprite.spriteRadius;
    const bXmax = sprite.posX+sprite.spriteRadius;
    const bYmin = sprite.posY-sprite.spriteRadius;
    const bYmax = sprite.posY+sprite.spriteRadius;
    return aXmax >= bXmin && bXmax >= aXmin && aYmax >= bYmin && bYmax >= aYmin;


  }

}


class Tank extends GameObject {

  /**
   * @param {number} posX
   * @param {number} posY
   * @param {string|null} color
   */
  constructor(posX, posY, color = null) {

    super(posX, posY, 25);
    this.speed = 3;
    this.orientation = rand(1,5); 
    this.color = color ?? `rgb(${rand(0,128)},${rand(0,128)},${rand(0,128)}`;

  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   */
  draw(ctx) {

    ctx.save();
    ctx.fillStyle = this.color;
    ctx.beginPath();
    // Find middle 
    ctx.translate(this.posX, this.posY);
    ctx.rotate(Math.PI*(this.orientation/2-0.5));
    ctx.moveTo(0, -this.spriteRadius);
    ctx.lineTo(this.spriteRadius, this.spriteRadius);
    ctx.lineTo(-this.spriteRadius, this.spriteRadius);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

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
    if (legalPosition(newX, newY, this.spriteRadius)) {
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

    new Bullet(...this.getMuzzleLocation(), this.orientation, this);

  }

  die() {

    this.free();

  }

}

class Bullet extends GameObject {

  /**
   * @param {number} posX
   * @param {number} posY
   * @param {number|null} direction 
   * @param {GameObject} owner
   */
  constructor(posX, posY, direction, owner) {
    super(posX, posY, 5);
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
    this.color = '#000000';
  }

  draw() {

    ctx.save();
    ctx.fillStyle = this.color;
    ctx.beginPath();
    // Find middle 
    ctx.translate(this.posX, this.posY);
    ctx.arc(0, 0, this.spriteRadius, 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.restore();

  }

  step() {

    this.posX += this.speedX;
    this.posY += this.speedY;

    for(const sprite of sprites) {
      if (sprite === this || sprite === this.owner) {
        continue;
      }
      if (this.intersects(sprite)) {
        // Hit!
        sprite.free();
        this.free();
      }
    }

    if (!legalPosition(this.posX, this.posY, this.spriteRadius)) {
        
      this.free();

    }

  }

}


class AITank extends Tank { 

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


document.addEventListener('DOMContentLoaded', main);

/**
 * @param {number} min Lower boundary (inclusive)
 * @param {number} max Upper boundary (exclusive)
 * @returns {number}
 */
function rand(min, max) {

  return Math.floor((Math.random()*(max-min))+min);

}

/**
 * @param {number} max
 * @returns {boolean}
 */
function chance(max) {

  return rand(0, max)===0;

}
