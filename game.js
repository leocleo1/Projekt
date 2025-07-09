import { StartScene } from './scenes/StartScene.js';
import { GameOverScene } from './scenes/GameOverScene.js';
import { Icelevel } from './scenes/Icelevel.js'; 
import { JungleLevel } from './scenes/JungleLevel.js';
import { DesertLevel } from './scenes/DesertLevel.js';

const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  scene: [StartScene, DesertLevel, JungleLevel, Icelevel, GameOverScene],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 350 }, // Schwerkraft aktivieren
      debug: false
    }
  }
};
  
const game = new Phaser.Game(config);
  