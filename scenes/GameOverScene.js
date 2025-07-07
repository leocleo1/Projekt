export class GameOverScene extends Phaser.Scene {
    constructor() {
      super('GameOverScene');
    }

    create() {
      this.cameras.main.setBackgroundColor('#000000');

      this.add.text(480, 240, 'Game Over', {
        fontSize: '48px',
        color: '#ff0000'
      }).setOrigin(0.5);

      this.add.text(480, 340, 'Klicke oder drücke eine Taste, um neu zu starten.', {
        fontSize: '20px',
        color: '#ffffff'
      }).setOrigin(0.5);

      this.input.keyboard.once('keydown', () => {
        this.scene.start('JungleLevel');
      });

      this.input.once('pointerdown', () => {
        this.scene.start('JungLevel');
      });
    }
  }