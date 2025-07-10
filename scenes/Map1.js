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
      const startBackground = this.add.image(window.innerWidth /2 - 800, 0, 'Startbg').setOrigin(0, 0).setScale(0.9);
      const E1 = this.add.image(window.innerWidth /2 , 420, 'E1').setScale(0.5);
      const weiter = this.add.image(1300, 750, 'Weiter').setScale(0.25).setInteractive();

      const gameWidth = window.innerWidth
      const gameHeight = window.innerHeight;
  
      
      weiter.on('pointerdown', () => {
        this.scene.start('DesertLevel'); // Start the JungleLevel scene
      });
    }
  }