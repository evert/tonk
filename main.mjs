// @ts-check

import { Tank, AITank } from './gameobjects.mjs';
import { rand } from './util.mjs';
import { Game } from './game.mjs';

/**
 * @type {HTMLCanvasElement}
 */
let canvas;

/**
 * @type {Game}
 */
let game;

/**
 * @type {Tank}
 */
let playerSprite;

function main() {

  canvas = /** @type HTMLCanvasElement **/(document.getElementById('game'));

  game = new Game(canvas);

  for(let i=0; i<10;i++) {
    const tank = new AITank(game, rand(100,900),rand(100,700));
  }

  const playerTank = new Tank(game, rand(100,900),rand(100,700), '#FF0000');
  game.sprites.add(playerTank);
  playerSprite = playerTank;

  game.animationLoop();
  window.addEventListener('keydown', keyDown);

  setInterval(step,30);

}


function step() {

  for(const player of game.behaviours) {
    player.step();
  }

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

}

document.addEventListener('DOMContentLoaded', main);


