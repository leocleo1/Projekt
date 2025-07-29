export class HomeLevel extends Phaser.Scene {
  constructor() {
    super('HomeLevel');
  }

  preload() {
    this.load.image('homeBackground', 'assets/HomeLevel/HomeLevelHintergrund.png');
    this.load.image('pilzhaus', 'assets/HomeLevel/Pilzhaus.png');
    this.load.audio('victorySound', 'sounds/victory.mp3');
    this.load.tilemapTiledJSON('homeMap', 'assets/HomeLevel/Homelevel.json');
    this.load.image('Homewelt', 'assets/HomeLevel/Homewelt.png'); //Tileset
    this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
    this.load.image('portal', 'assets/Portal.png');
    this.load.audio('bgMusic', 'sounds/backgroundMusic.wav');
        

  }

  create() {
    if (!this.sound.get('bgMusic')) {
      const music = this.sound.add('bgMusic', {
          loop: true,
          volume: 0.3
      });
      music.play();
    }

    const bg = this.add.image(0, 0, 'homeBackground')
            .setOrigin(0, 0)
            .setScrollFactor(0); // bleibt relativ zur Kamera

    // Bildschirmgröße
    const gameWidth = this.sys.game.config.width;
    const gameHeight = this.sys.game.config.height;

    // Bild auf Fenstergröße skalieren
    bg.setDisplaySize(gameWidth, gameHeight);

    // Damit der Hintergrund ganz hinten bleibt
    bg.setDepth(-1);

    this.pilzhaus = this.physics.add.staticSprite(800, 670, 'pilzhaus');
  
    const map = this.make.tilemap({ key: 'homeMap' });
    const tileset = map.addTilesetImage('Homewelt', 'Homewelt');
    this.visualLayer = map.createLayer('Tile Layer 1', tileset, 0, 0); // Nur fürs Aussehen
    this.visualLayer.setDepth(0);

    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    const platformObjects = map.getObjectLayer('Object Layer').objects;

    
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
    this.player = this.physics.add.sprite(0, 770, 'dude');
    this.player.setCollideWorldBounds(false);
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.player, this.pilzhaus,  this.reachHouse, null, this);


    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.startFollow(this.player);

    this.physics.world.on('worldbounds', (body) => {
      if (body.gameObject && body.gameObject.texture.key === 'star') {
        body.gameObject.destroy();
      }
    });

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

    this.cursors = this.input.keyboard.createCursorKeys();

    this.portal = this.physics.add.sprite(20, 750, 'portal')
          .setScale( 1.3)
          .setDepth(-1);

    this.portal.body.allowGravity = false;   
    this.portal.setImmovable(true); 

    this.victorySound = this.sound.add('victorySound', {
      volume: 0.01
    });



    this.reachedHouse = false;
  }

  update() {
    const player = this.player;
    const cursors = this.cursors;

    if (cursors.left.isDown) {
      player.setVelocityX(-200);
      player.flipX = true;
      player.anims.play('right', true);
    } else if (cursors.right.isDown) {
     player.setVelocityX(200);

      player.flipX = false;
      player.anims.play('right', true);
    } else {
      player.setVelocityX(0);
      player.anims.play('turn');
    }

    if (cursors.up.isDown && this.player.body.blocked.down) {
      this.player.setVelocityY(-260);
      
    }
  }

  reachHouse(player, house) {
    this.reachedHouse = true;

    this.player.body.enable = false;

    const bgMusic = this.sound.get('bgMusic');
    if (bgMusic && bgMusic.isPlaying) {
      bgMusic.pause();
    }
    
    this.player.setVelocityX(0);
    this.victorySound.play();
    
    // Dunkler Hintergrund als Fake-Fade
    this.add.rectangle(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      this.cameras.main.width,
      this.cameras.main.height,
      0x000000,
      0.8
    ).setScrollFactor(0).setDepth(10);
    
    this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      'Du bist wieder Zuhause.\nDanke fürs Spielen!',
      {
        fontSize: '24px',
        fill: '#ffffff',
        align: 'center'
      }
    ).setOrigin(0.5)
     .setScrollFactor(0)
     .setDepth(11);
    // Szene kurz danach pausieren
    this.time.delayedCall(3000, () => {
      this.scene.pause();
    });
    
  }
}