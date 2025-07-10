export class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  // preload() {
  //   this.preload.image('Gameover', 'assets/Gameover.png');
  // }

  create() {
    const { width, height } = this.scale;
    // const gameOverBackground = this.add.image(0, 0, 'Gameover').setOrigin(0, 0).setScale(0.9).setDepth(-1);

    this.cameras.main.setBackgroundColor('#000000');

    this.add.text(width / 2, height / 2 - 50, 'Game Over', {
      fontSize: '48px',
      color: '#ff0000'
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 + 30, 'Klicke oder drücke eine Taste, um neu zu starten.', {
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);

    console.log("Letzter Level war:", this.registry.get('lastLevel'));

    const lastLevel = this.registry.get('lastLevel');

    this.input.keyboard.once('keydown', () => {
      this.scene.start(lastLevel);
    });

    this.input.once('pointerdown', () => {
      this.scene.start(lastLevel);
    });
  }
}
