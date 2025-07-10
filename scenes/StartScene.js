export class StartScene extends Phaser.Scene {
    constructor() {
      super('StartScene');
    }
  
    preload() {
      this.load.image('Start', 'assets/Start.png');
      this.load.image('Startbg', 'assets/Startbg.png');
      this.load.image('Logo', 'assets/Logo.png');
    }
  
    create() {
      const startBackground = this.add.image(0, 0, 'Startbg').setOrigin(0, 0).setScale(0.9);
      const logo = this.add.image(window.innerWidth /2 , 300, 'Logo').setScale(0.7);
      const start = this.add.image(window.innerWidth/2, 600, 'Start').setScale(0.7).setInteractive();

      const gameWidth = window.innerWidth
      const gameHeight = window.innerHeight;
      startBackground.setDisplaySize(gameWidth, gameHeight);
  
      
      start.on('pointerdown', () => {
        this.scene.start('Map1'); 
      });
    }
  }