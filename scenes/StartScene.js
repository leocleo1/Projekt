export class StartScene extends Phaser.Scene {
    constructor() {
      super('StartScene');
    }
  
    preload() {}
  
    create() {
      this.cameras.main.setBackgroundColor('#ffffff');
  
      const startButton = this.add.text(480, 320, 'Start', {
        fontSize: '32px',
        color: '#000000',
        backgroundColor: '#0077cc',
        padding: { x: 20, y: 10 }
      }).setOrigin(0.5).setInteractive();
  
      startButton.on('pointerdown', () => {
        this.scene.start('Icelevel'); 
      });
    }
  }