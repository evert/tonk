export class Game {

  /**
   * @param {HTMLCanvasElement} canvas
   */
  constructor(canvas) {
    this.sprites = new Set();
    this.behaviours = new Set();
    this.canvas = canvas;
    this.ctx = /** @type {CanvasRenderingContext2D} */(canvas.getContext('2d'));
    this.spriteSheet = new Image();
    this.spriteSheet.src = 'sprites/battle-city.png';
    // For sprite animation we keep track of a frame number.
    this.frame = 0; 
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {number} spriteRadius
   */
  legalPosition(x, y, spriteRadius) {

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
}
