export class Map3 extends Phaser.Scene {
    constructor() {
      super('Map3');
    }

     preload() {
        this.load.image('Startbg', 'assets/Startbg.png');
        this.load.image('Weiter', 'assets/Weiter.png');
        this.load.image('E3', 'assets/E3.png');
    }
  

    create() {

    // Erklärscreen 3 anzeigen
    const startBackground = this.add.image(0, 0, 'Startbg').setOrigin(0, 0).setScale(0.9);


    const ratio = window.devicePixelRatio || 1;
    const gameWidth = this.sys.game.config.width;
    const gameHeight = this.sys.game.config.height;
    startBackground.setDisplaySize(gameWidth, gameHeight);


    const E3 = this.add.image(gameWidth / 2, gameHeight / 2, 'E3').setScale(0.9 / ratio);

    const weiter = this.add.image(gameWidth - 170, gameHeight - 100, 'Weiter').setScale(0.4 / ratio).setInteractive();

      weiter.on('pointerdown', () => {
        this.scene.start('JungleLevel'); // Start the JungleLevel scene
      });
    }
  }