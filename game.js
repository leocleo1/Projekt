import { StartScene } from './scenes/StartScene.js';
import { GameOverScene } from './scenes/GameOverScene.js';
import { Icelevel } from './scenes/Icelevel.js'; 

const config = {
  type: Phaser.AUTO,
  width: 960,
  height: 640,
  scene: [StartScene, Icelevel, GameOverScene],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 350 }, // Schwerkraft aktivieren
      debug: false
    }
  }
};
  
const game = new Phaser.Game(config);
  