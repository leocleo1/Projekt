export class JungleLevel extends Phaser.Scene {
  constructor() {
    super('JungleLevel');
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
    this.player.setCollideWorldBounds(true);

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

    //Healthbar erstellen
    this.hp = 100;
    this.healthBarBackground = this.add.rectangle(100, 30, 104, 24, 0x000000).setScrollFactor(0);
    this.healthBar = this.add.rectangle(100, 30, 100, 20, 0x00ff00).setScrollFactor(0);

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
    this.fallStartY = null;
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


    // Fallschaden
    if (!player.body.blocked.down) {
      // Start des Falls merken, wenn noch nicht gesetzt
      if (this.fallStartY === null) {
        this.fallStartY = player.y;
      }
    } else {
      // Landung: Fallschaden berechnen, wenn ein Fall stattgefunden hat
      if (this.fallStartY !== null) {
        const fallDistance = Math.abs(this.fallStartY - player.y);
        const blockHeight = 32;
        const blocks = fallDistance / blockHeight;

        if (blocks >= 7 && blocks < 9) {
          this.hp -= 10;
          this.updateHealthBar();
        } else if (blocks >= 9 && blocks < 15) {
          this.hp -= 20;
          this.updateHealthBar();
        } else if (blocks >= 15 && blocks < 20) {
          this.hp -= 50;
          this.updateHealthBar();
        } else if (blocks >= 20) {
          this.hp = 0;
          this.updateHealthBar();
          this.player.setTint(0x000000);
          this.player.setVelocity(0, 0);
          this.player.anims.stop();
          this.scene.start('GameOverScene');
        }
        this.fallStartY = null; // Nach Landung zurücksetzen
      }
    }
  }

  updateHealthBar() {
    this.healthBar.width = Math.max(0, this.hp);

    if (this.hp <= 0) {
      this.player.setTint(0x000000);
      this.player.setVelocity(0, 0);
      this.player.anims.stop();
      this.scene.start('GameOverScene');
    }
  }

  
}