export class HomeLevel extends Phaser.Scene {
  constructor() {
    super('HomeLevel');
  }

  preload() {
    this.load.image('pilzhaus', 'assets/HomeLevel/Pilzhaus.png');
    this.load.audio('victory', 'sounds/victory.mp3')

  }

  create() {
    this.pilzhaus = this.physics.add.staticImage(800, 300, 'pilzhaus');
    this.victorySound = this.victorySound.add('victory');

    this.physics.add.collider(this.player, this.pilzhaus,  this.reachHouse, null, this);

    this.reachedHouse = false;
  }

  reachHouse(player, house) {
    if (this.reachedHouse) return;
    this.reachedHouse = true;

    this.player.setVelocityX(0); // Anhalten
    this.keySound.play();

    // Fade-Out & Game Over
    this.cameras.main.fade(2000, 0, 0, 0);

    this.cameras.main.once('camerafadeoutcomplete', () => {
        this.add.text(200, 200, 'Du bist wieder zuhause. Danke fürs Spielen!', {
            fontSize: '20px',
            fill: '#fff'
        });
        // Optional: Spiel stoppen
        this.scene.pause();
    });
  }
}