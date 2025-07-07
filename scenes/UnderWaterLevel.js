export class UnderWaterLevel extends Phaser.Scene {
  constructor() {
    super('UnderWaterLevel');
  }

  preload() {
    this.load.image('JungleBackground', 'assets/JungleLevel/JungleBackground.png'); 
    this.load.image('JungleTiles', 'assets/JungleLevel/JungleTiles.png');
    this.load.image('Boden', 'assets/JungleLevel/Boden.png');
    this.load.image('Lianen', 'assets/JungleLevel/Lianen.png');
    this.load.image('Pflanzen', 'assets/JungleLevel/Pflanzen.png');
    this.load.tilemapTiledJSON('JungleMap', 'assets/JungleLevel/JungleMap.json');

    this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
    this.load.image('star', 'assets/star.png');
  }


  create() {
    const bg = this.add.image(0, 0, 'JungleBackground').setOrigin(0, 0).setScrollFactor(1);

    // Bildschirmgröße
    const gameWidth = this.sys.game.config.width;
    const gameHeight = this.sys.game.config.height;
    
    

    const map = this.make.tilemap({ key: 'JungleMap' });

    const jungleTiles = map.addTilesetImage('JungleTiles', 'JungleTiles');
    const bodenTiles = map.addTilesetImage('Boden', 'Boden');

    const bodenLayer = map.createLayer('Tile Layer 1', bodenTiles, 0, 0);
    const jungleLayer = map.createLayer('Tile Layer 2', jungleTiles, 0, 0);
 
    // Kollisionsebenen
    bodenLayer.setCollisionByExclusion([-1]);
    jungleLayer.setCollisionByExclusion([-1]);





    // Spieler erstellen
    this.player = this.physics.add.sprite(100, map.heightInPixels - 100, 'dude');

    this.player.setMaxVelocity(200, 500);
    this.player.setDamping(true);
    this.player.body.setDrag(600,0);
    this.player.setBounce(0);

    this.physics.add.collider(this.player, bodenLayer);
    this.physics.add.collider(this.player, jungleLayer);

    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    // Animationen für den Spieler
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
      });
  
      this.anims.create({
        key: 'turn',
        frames: [{ key: 'dude', frame: 4 }],
        frameRate: 20
      });
  
      this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
      });


    

    // Welt- und Kamera-Bounds
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    // Beispiel-Spieler
    
    this.cameras.main.startFollow(this.player);this.cameras.main.scrollY = map.heightInPixels - this.cameras.main.height;

    // Eingaben initialisieren
    this.cursors = this.input.keyboard.createCursorKeys();
    this.isDucking = false;

    this.jumpCount = 0;
    this.maxJumps = 2;
    this.wasOnGround = false;
    this.jumpKeyPressed = false;
  }




  

  // Update-Methode für Bewegung, Springen, Ducken
  update() {
    const player = this.player;
    const cursors = this.cursors;

    // Laufen
    if (!this.isDucking) {
      if (cursors.left.isDown) {
        player.setVelocityX(-200);
        player.flipX = true;
        player.anims.play('right', true);      // Animation abspielen
      } else if (cursors.right.isDown) {
        player.setVelocityX(200);
        player.flipX = false;
        player.anims.play('right', true);     // Animation abspielen
      } else {
        player.setVelocityX(0);
        player.anims.play('turn');            // Idle-Animation
      }
    } else {
      player.setVelocityX(0);
      player.anims.play('turn');              // Beim Ducken Idle-Animation
    }

    // Springen & Double Jump

    if (cursors.up.isDown && !this.jumpKeyPressed && this.jumpCount < this.maxJumps) {
      player.setVelocityY(-250);
      this.jumpKeyPressed = true;
      this.jumpCount++;
    }
    if (!cursors.up.isDown) {
      this.jumpKeyPressed = false;
    }

    // Zähler zurücksetzen, wenn auf Boden
    if (player.body.blocked.down) {
      if (!this.wasOnGround) {
        this.jumpCount = 0;
        this.wasOnGround = true;
      }
    } else {
        this.wasOnGround = false;
    }

    // Ducken
    if (cursors.down.isDown && !this.isDucking //&& player.body.blocked.down
        ) {
      this.isDucking = true;
      player.setScale(1, 0.5);
      player.body.setSize(32, 24);
      player.body.offset.y = 24;
    }
    if (!cursors.down.isDown && this.isDucking) {
      this.isDucking = false;
      player.setScale(1, 1);
      player.body.setSize(32, 48);
      player.body.offset.y = 0;
    }

    //Laufen && Ducken
    if (this.isDucking) {
      if (cursors.left.isDown) {
        player.setVelocityX(-100); //langsames Laufen beim Ducken
        player.flipX = true;
      } else if (cursors.right.isDown) {
        player.setVelocityX(100);
        player.flipX = false;
      } else {
        player.setVelocityX(0);
      }
      player.anims.play('turn'); // Beim Ducken Idle-Animation
    }
  }
}