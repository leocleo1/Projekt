import { StartScene } from './scenes/StartScene.js';
import { GameOverScene } from './scenes/GameOverScene.js';
import { Icelevel } from './scenes/Icelevel.js'; 
import { JungleLevel } from './scenes/JungleLevel.js';
import { DesertLevel } from './scenes/DesertLevel.js';
import { HomeLevel } from './scenes/HomeLevel.js';
import { Map1 } from './scenes/Map1.js';
import { Map2 } from './scenes/Map2.js';
import { Map3 } from './scenes/Map3.js';

const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  scene: [StartScene, JungleLevel, Icelevel, GameOverScene, HomeLevel, DesertLevel, Map1, Map2, Map3],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 350 }, // Schwerkraft aktivieren
      debug: false
    }
  }
};
  
const game = new Phaser.Game(config);
  