import { StartScene } from './scenes/StartScene.js';
import { GameOverScene } from './scenes/GameOverScene.js';
import { Icelevel } from './scenes/Icelevel.js'; 
import { JungleLevel } from './scenes/JungleLevel.js';
import { DesertLevel } from './scenes/DesertLevel.js';
import { HomeLevel } from './scenes/HomeLevel.js';

const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  scene: [StartScene, JungleLevel, Icelevel, GameOverScene, HomeLevel, DesertLevel],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 350 }, // Schwerkraft aktivieren
      debug: false
    }
  }
};
  
const game = new Phaser.Game(config);
  