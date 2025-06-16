class StartScene extends Phaser.Scene {
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
        this.scene.start('MainScene');
      });
    }
  }
  
  class MainScene extends Phaser.Scene {
    constructor() {
      super('MainScene');
    }
  
    preload() {
      this.load.image('Eiswelt', 'assets/Eiswelt.png');
      this.load.tilemapTiledJSON('map', 'assets/Eislevel.json');
      this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
    }
  
    create() {
      const map = this.make.tilemap({ key: 'map' });
      const tileset = map.addTilesetImage('Eiswelt', 'Eiswelt');
      map.createLayer('Tile Layer 1', tileset, 0, 0); // Nur fürs Aussehen
  
      // Objektlayer "Plattformen" laden
      const platformObjects = map.getObjectLayer('Object Layer 1').objects;
  
      // Statische Gruppe für Plattformen
      this.platforms = this.physics.add.staticGroup();
  
      platformObjects.forEach(obj => {
        const platform = this.platforms.create(
            obj.x + obj.width / 2,
            obj.y + obj.height / 2, // Y-Offset korrigiert
            null
          )
          
        .setDisplaySize(obj.width, obj.height)
        .setVisible(false) // Unsichtbar – nur Kollision
        .refreshBody();
      });
  
      // Spieler erstellen
      this.player = this.physics.add.sprite(100, 100, 'dude');
      this.player.setCollideWorldBounds(true);
  
      // Kollision mit Plattformen aktivieren
      this.physics.add.collider(this.player, this.platforms);
  
      // Animationen
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
  
      // Eingaben
      this.cursors = this.input.keyboard.createCursorKeys();
    }
  
    update() {
      const player = this.player;
      const cursors = this.cursors;
  
      if (cursors.left.isDown) {
        player.setVelocityX(-160);
        player.anims.play('left', true);
      } else if (cursors.right.isDown) {
        player.setVelocityX(160);
        player.anims.play('right', true);
      } else {
        player.setVelocityX(0);
        player.anims.play('turn');
      }
  
      if (cursors.up.isDown && player.body.blocked.down) {
        player.setVelocityY(-330);
      }
    }
  }
  
  const config = {
    type: Phaser.AUTO,
    width: 960,
    height: 640,
    scene: [StartScene, MainScene],
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 500 }, // Schwerkraft aktivieren
        debug: false
      }
    }
  };
  
  const game = new Phaser.Game(config);
  