export class Map1 extends Phaser.Scene {
    constructor() {
      super('Map1');
    }

    preload() {
        this.load.image('Startbg', 'assets/Startbg.png');
        this.load.image('Weiter', 'assets/Weiter.png');
        this.load.image('E1', 'assets/E1.png');
    }
  

    create() {
    const startBackground = this.add.image(0, 0, 'Startbg').setOrigin(0, 0).setScale(0.9);

    const ratio = window.devicePixelRatio || 1;
    const gameWidth = this.sys.game.config.width;
    const gameHeight = this.sys.game.config.height;
    startBackground.setDisplaySize(gameWidth, gameHeight);


    const E1 = this.add.image(gameWidth / 2, gameHeight / 2, 'E1').setScale(0.9 / ratio);

    const weiter = this.add.image(gameWidth - 170, gameHeight - 100, 'Weiter').setScale(0.4 / ratio).setInteractive();

      weiter.on('pointerdown', () => {
        this.scene.start('DesertLevel'); // Start the JungleLevel scene
      });
    }
  }