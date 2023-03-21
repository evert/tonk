// @ts-check

import { GameServer } from './gameserver.mjs';
import { renderer } from './renderer.mjs';

/**
 * @type {HTMLCanvasElement}
 */
let canvas;

/** @type {CanvasRenderingContext2D} */
let ctx;

/** @type GameServer */
let gameServer;

const levelData = `
################
#    C    C C  #
# ##   ##    # #
# ##   ## ## # #
# ##   ## #TTT #
#  C   ## #TTT # #
# ~~~  ##  C   #
# ~~~  ######  #
#           C  #
# ###########  #
#  1           #
################
`;

let frame = 0;
let playerId = 0;

function main() {

  canvas = /** @type HTMLCanvasElement **/(document.getElementById('game'));
  gameServer = new GameServer(levelData);
  playerId = gameServer.getP1Id();
  ctx = /** @type {CanvasRenderingContext2D} */(canvas.getContext('2d'));
  animationLoop();
  setInterval(() => {
    frame++
  }, 64);
  setInterval(() => gameServer.update(), 30);
  window.addEventListener('keydown', keyDown);
  window.addEventListener('keyup', keyUp);

}
document.addEventListener('DOMContentLoaded', main);

function animationLoop() {

  window.requestAnimationFrame(() => {
    renderer(ctx, gameServer.level, frame);
    animationLoop();
  });
}

let lastMoveKey = '';

/**
 * @type Record<string, number>
 */
const directionMap = {
  ArrowUp: 1,
  ArrowRight: 2,
  ArrowDown: 3,
  ArrowLeft: 4
};

/**
 * @param {KeyboardEvent} ev
 */
function keyDown(ev) {

  if (ev.key.startsWith('Arrow')) {
    lastMoveKey = ev.key;
    gameServer.emit({
      playerId,
      type: 'move',
      direction: directionMap[ev.key],
    });
  }

  switch(ev.key) {

    case ' ':
      gameServer.emit({
        playerId,
        type: 'shoot',
      });
      break;

  }

}

/**
 * @param {KeyboardEvent} ev
 */
function keyUp(ev) {

  /**
   * If the last arrow key that was spressed was released, we want to
   * stop the tank
   */
  if (ev.key === lastMoveKey) {
    gameServer.emit({
      playerId,
      type: 'idle',
    });
  }

}
