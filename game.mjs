export class Game {

  /**
   * @param {HTMLCanvasElement} canvas
   */
  constructor(canvas) {
    this.sprites = new Set();
    this.behaviours = new Set();
    this.canvas = canvas;
    this.ctx = /** @type {CanvasRenderingContext2D} */(canvas.getContext('2d'));
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
    for(const sprite of this.sprites) sprite.render(this.ctx);


  }

  animationLoop() {

    window.requestAnimationFrame(() => {
      this.render();
      this.animationLoop();
    });

  }

}
