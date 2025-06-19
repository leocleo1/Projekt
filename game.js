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
      const platformObjects = map.getObjectLayer('Object Layer 2').objects;
      // Schnee-Zonen (Object Layer "Pulverschnee")
      const snowZones = map.getObjectLayer('Pulverschnee 1')?.objects || [];

      this.snowAreas = this.physics.add.staticGroup();

      snowZones.forEach(obj => {
        const snow = this.snowAreas.create(
          obj.x + obj.width / 2,
          obj.y + obj.height / 2,
          null
        )
        .setDisplaySize(obj.width, obj.height)
        .setVisible(false) // Unsichtbar – rein für Kollision
        .refreshBody();
        });

  
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
      this.player = this.physics.add.sprite(0, 500, 'dude');
      this.player.setCollideWorldBounds(true);

      this.player.setDamping(true);
      this.player.body.setMaxSpeed(200, 500);
      this.player.body.setDrag(600,0);
      this.player.setBounce(0);
  
      // Kollision mit Plattformen aktivieren
      this.physics.add.collider(this.player, this.platforms);

      // Spieler sinkt langsam durch den Schnee
      this.physics.add.overlap(this.player, this.snowAreas, () => {
        this.player.setVelocityY(50); // leichtes, langsames Einsinken
      }, null, this);

  
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
        player.body.setAccelerationX(-500);
        player.anims.play('left', true);
      } else if (cursors.right.isDown) {
        player.body.setAccelerationX(500);
        player.anims.play('right', true);
      } else {
        player.anims.play('turn');

        // Geschwindigkeit lesen
        const vx = player.body.velocity.x;

        // Falls noch Bewegung → leicht abbremsen in Bewegungsrichtung
        if (Math.abs(vx) > 10) {
          player.setAccelerationX(-Math.sign(vx) * 20); // Nur abbremsen, nicht umdrehen
        } else {
          player.setAccelerationX(0);           // Ganz stoppen, wenn langsam genug
          player.setVelocityX(0);               // Kein Ruckeln beim Stillstand
        }
      }
  
      if (cursors.up.isDown && player.body.blocked.down) {
        player.setVelocityY(-600);
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
        gravity: { y: 350 }, // Schwerkraft aktivieren
        debug: false
      }
    }
  };
  
  const game = new Phaser.Game(config);
  