export class Icelevel extends Phaser.Scene {
  constructor() {
    super('Icelevel');
  }
  
  preload() {
    this.load.image('Eiswelt', 'assets/IceLevel/Eiswelt.png');
    this.load.tilemapTiledJSON('iceMap', 'assets/IceLevel/Eislevel.json');
    this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
    this.load.image('item', 'assets/IceLevel/Kompass.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('snowball', 'assets/IceLevel/Schneeball.png');
    this.load.image('iceBackground', 'assets/IceLevel/Eishintergrund.png');
    this.load.image('schalter', 'assets/IceLevel/schalter.png');
    this.load.spritesheet('snowman', 'assets/IceLevel/Schneemann.png', {
      frameWidth:32,
      frameHeight:64
    });
    this.load.spritesheet('eistor', 'assets/IceLevel/eistor.png', {
      frameWidth: 32,
      frameHeight: 96
    });
    this.load.image('teddy', 'assets/IceLevel/Teddy.png')
    this.load.image('Portal', 'assets/Portal.png');
    this.load.audio('jumpSound', 'sounds/Jump.wav');
    this.load.audio('hitSound', 'sounds/Hit2.wav');
    this.load.audio('pickupSound', 'sounds/Pickup1.wav');
    this.load.audio('itemPickupSound', 'sounds/itemPickup.wav');
    this.load.audio('shootSound', 'sounds/Shoot.wav');
    this.load.audio('bgMusic', 'sounds/backgroundMusic.wav');
  }
  
  create() {
    if (!this.sound.get('bgMusic')) {
      const music = this.sound.add('bgMusic', {
          loop: true,
          volume: 0.1
      });
      music.play();
    }

    const bg = this.add.image(0, 0, 'iceBackground').setOrigin(0, 0).setScrollFactor(0).setDepth(-3);

    // Bildschirmgröße
    const gameWidth = this.sys.game.config.width;
    const gameHeight = this.sys.game.config.height;
      
    // Bild auf Fenstergröße skalieren
    bg.setDisplaySize(gameWidth, gameHeight);
      
    const map = this.make.tilemap({ key: 'iceMap' });
    const tileset = map.addTilesetImage('Eiswelt', 'Eiswelt');
    this.visualLayer = map.createLayer('Tile Layer 1', tileset, 0, 0); // Nur fürs Aussehen

    
    this.visualLayer.setDepth(0);

    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    this.eislayer = map.createLayer('Eislayer', tileset, 0, 0);
    this.eislayer.setCollisionByExclusion([-1]);

    console.log(map.layers.map(l => l.name));

      
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

    this.hp = 100;
    this.invulnerable = false;

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
    this.player = this.physics.add.sprite(0, 570, 'dude');

    this.player.setMaxVelocity(200, 500);
    this.player.setDamping(true);
    this.player.body.setDrag(600,0);
    this.player.setBounce(0);
  
    // Kollision mit Plattformen aktivieren
    this.physics.add.collider(this.player, this.platforms);

    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.startFollow(this.player);


    this.item = this.physics.add.sprite(16, 83, 'item');
    this.item.setDepth(1);
    this.physics.add.collider(this.item, this.platforms);
    this.physics.add.overlap(this.player, this.item, this.collectItem, null, this);
    this.physics.add.collider(this.player, this.eislayer);

    this.inSnow = false;
    this.canDoubleJump = false;

      
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

    this.anims.create({
      key: 'snowman_left',
      frames: this.anims.generateFrameNumbers('snowman', { start: 0, end: 1}),
      frameRate: 4,
      repeat: -1
    });

    this.anims.create({
      key: 'snowman_right',
      frames: this.anims.generateFrameNumbers('snowman', { start: 2, end : 3}),
      frameRate: 4,
      repeat: -1
    });

    this.anims.create({
      key: 'open_gate',
      frames: this.anims.generateFrameNumbers('eistor', { start: 0, end: 2 }),
      frameRate: 5,
      repeat: 0
    });

    this.projectiles = this.physics.add.group();
    this.snowballs = this.physics.add.group();

    this.snowmen = this.physics.add.group();
    this.snowman = this.physics.add.sprite(950, 130, 'snowman');
    this.snowmen.add(this.snowman);
    this.snowman.hp = 4;

    this.snowman.healthBarBg = this.add.rectangle(this.snowman.x, this.snowman.y - 40, 34, 6, 0x000000)
      .setScrollFactor(1)
      .setDepth(5);

    this.snowman.healthBar = this.add.rectangle(this.snowman.x, this.snowman.y - 40, 30, 4, 0xff0000)
      .setScrollFactor(1)
      .setDepth(6);
    this.snowman.anims.play('snowman_left', true);
    this.snowman.setCollideWorldBounds(false);
    this.snowmanSpeed = 60;
    this.physics.add.collider(this.snowman, this.platforms);
    this.physics.add.overlap(this.player, this.snowmen, this.hitBySnowman, null, this);
    this.physics.add.overlap(this.projectiles, this.snowmen, this.hitSnowman, null, this);

    this.stars = this.physics.add.group();

    this.stars.create(173, 596, 'star');
    this.stars.create(304, 405, 'star');
    this.stars.create(627, 213, 'star');
    this.stars.create(358, 179, 'star');
    this.stars.create(78, 84, 'star');
    this.stars.create(942, 148, 'star');
    this.stars.create(1481, 149, 'star');
    this.stars.create(1063, 310, 'star');
    this.stars.create(1055, 531, 'star');
    this.stars.create(1295, 594, 'star');
    this.stars.create(528, 275, 'star');
    this.stars.create(433, 339, 'star');

      
    this.physics.add.collider(this.stars, this.platforms);
    this.physics.add.overlap(this.player, this.stars, this.collectStar, null, this);
    this.ammo = 0;
    this.iceBlockData = [];
  
    // Eingaben
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
      
    this.healthBarBackground = this.add.rectangle(100, 30, 104, 24, 0x000000)
      .setScrollFactor(0)
      .setDepth(10);
      
    this.healthBar = this.add.rectangle(100, 30, 100, 20, 0xff0000)
      .setScrollFactor(0)
      .setDepth(11); 

    this.time.addEvent({
      delay: 2000,
      callback: this.throwSnowball,
      callbackScope: this,
      loop: true
    });

    this.physics.add.overlap(this.player, this.snowballs, this.hitBySnowball, null, this);

    this.physics.world.on('worldbounds', (body) => {
      const gameObject = body.gameObject;
      if (gameObject && gameObject.texture?.key === 'snowball') {
        gameObject.destroy();
      }
    });

    this.itemSlot = this.add.image(180, 32, 'item')
      .setScale(1.5)
      .setAlpha(0.3)
      .setScrollFactor(0)
      .setDepth(10);
    
    this.ammoIcon = this.add.image(this.cameras.main.width - 80, 30, 'star')
      .setScale(0.8)
      .setScrollFactor(0)
      .setDepth(10);
    
    this.ammoText = this.add.text(this.cameras.main.width - 60, 18, `: ${this.ammo}`, {
      fontSize: '24px',
      fill: '#000000'
    }).setScrollFactor(0)
      .setDepth(10);

    this.schalter = this.physics.add.staticImage(10 + 6, 244 + 6, 'schalter')
      .setSize(12,12 );

    this.iceBlocks = this.physics.add.staticGroup();
    this.physics.add.collider(this.player, this.iceBlocks);

    const iceObjects = map.getObjectLayer('Eis')?.objects || [];

    iceObjects.forEach(obj => {
      const ice = this.iceBlocks.create(
        obj.x + obj.width / 2,
        obj.y + obj.height / 2,
        null
      )

      .setDisplaySize(obj.width, obj.height)
      .setVisible(false)
      .refreshBody();

      this.iceBlockData.push({
        sprite: ice,
        x: obj.x + obj.width / 2,
        y: obj.y + obj.height / 2
      });
    });

    this.eistorSprites = [];
    const eistorObjects = map.getObjectLayer('Eistor')?.objects || [];

    eistorObjects.forEach(obj => {
      const eistor = this.physics.add.staticSprite(
        obj.x + obj.width / 2,
        obj.y + obj.height / 2,
        'eistor'
      )
      .setOrigin(0.5, 0.5)
      .refreshBody();

      eistor.setDepth(0);

      this.physics.add.collider(this.player, eistor);
      this.eistorSprites.push(eistor);
    });

    this.physics.add.overlap(this.player, this.schalter, () => {
      this.openGate();
      this.schalter.destroy(); // Nur 1× aktivierbar
    }, null, this);

      
    this.eiszapfen = this.physics.add.staticGroup();
    const zapfenObjects = map.getObjectLayer('Eiszapfen')?.objects || [];
    
    zapfenObjects.forEach(obj => {
      const zapfen = this.eiszapfen.create(
        obj.x + obj.width / 2,
        obj.y +obj.height / 2,
        null
      )
      .setDisplaySize(obj.width, obj.height)
      .setVisible(false)
      .refreshBody();
    });

    this.physics.add.collider(this.player, this.eiszapfen, this.hitBySpike, null, this);

    this.eislayer.setDepth(1);
    this.item.setDepth(0);
      
    this.pulverschneeLayer = map.createLayer('Pulverschnee', tileset, 0, 0);
    this.pulverschneeLayer.setDepth(1);
    this.teddy = this.physics.add.sprite(1214, 580, 'teddy');
    this.physics.add.collider(this.teddy, this.platforms);
    this.physics.add.overlap(this.player, this.teddy, this.collectTeddy, null, this);
    this.teddy.setDepth(0);

    this.teddySlot = this.add.image(220, 32, 'teddy')
      .setScale(1.5)
      .setAlpha(0.3)
      .setScrollFactor(0);

    // Schneeobjekte (Pulverschnee-Layer) im Vordergrund anzeigen
    this.snowAreas.setDepth(1);

    this.portal = this.physics.add.sprite(20, 560, 'Portal')
    .setScale( 1.3)
    .setDepth(-1);

    this.portal2 = this.physics.add.sprite(1900, 560, 'Portal')
    .setScale( 1.3)
    .setDepth(-1);

    this.portal.body.allowGravity = false;   
    this.portal.setImmovable(true); 
           

    this.portal2.body.allowGravity = false;
    this.portal2.setImmovable(true);
    

    const portalObjects = map.getObjectLayer('Portal')?.objects || [];
    this.portals = this.physics.add.staticGroup();

    portalObjects.forEach(obj => {
      const portal = this.portals.create(
        obj.x + obj.width / 2,
        obj.y + obj.height / 2,
        null
      )
      .setDisplaySize(obj.width, obj.height)
      .setVisible(false)
      .refreshBody();
    });

    this.portalIsActive = false;

    this.physics.add.overlap(this.player, this.portals, () => {
      if (this.portalIsActive) {
        console.log("Weiter ins nächste Level")
        this.nextLevel();
      } else {
        console.log("Du musst erst alle Items finden");
      }
    }, null, this);

    this.snowmanFallen = false;

    this.collectedItems = {
      item: false,
      teddy: false
    };

    this.jumpSound = this.sound.add('jumpSound');
    this.hitSound = this.sound.add('hitSound');
    this.pickupSound = this.sound.add('pickupSound');
    this.itemPickupSound = this.sound.add('itemPickupSound', { volume: 0.3 });
    this.shootSound = this.sound.add('shootSound');
  }
  
  update() {
    this.inSnow = false;
    this.inSnow = this.physics.overlap(this.player, this.snowAreas);
    const player = this.player;
    const cursors = this.cursors;

    // Ist Spieler im Schnee?
    this.inSnow = this.physics.overlap(this.player, this.snowAreas);

    // Sanftes Fallen im Schnee:
    if (this.inSnow && this.player.body.velocity.y > 0) {
      this.player.body.velocity.y *= 0.5; // Verlangsamt das Einsinken
    }

  
    if (cursors.left.isDown) {
      player.body.setAccelerationX(-400);
      player.flipX = true;
      player.anims.play('right', true);
    } else if (cursors.right.isDown) {
      player.body.setAccelerationX(400);
      player.flipX = false;
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

    if (!this.inSnow && this.cursors.up.isDown && this.player.body.blocked.down) {
      this.player.setVelocityY(-250); // normaler Sprung
    }
      

    if (cursors.down.isDown && !this.isDucking && player.body.blocked.down) {
      this.isDucking = true;
      
      player.setScale(1, 0.5);
      player.body.setSize(32, 24);
      player.body.offset.y = 24;
      
      // Kein neues Laufen mehr beim Ducken, aber aktuelle Geschwindigkeit beibehalten
    }
      
    if (!cursors.down.isDown && this.isDucking) {
      if (this.canStandUp()) {
        this.isDucking = false;
        player.setScale(1, 1);
        player.body.setSize(32, 48);
        player.body.offset.y = 0;
      }
    }
      
    if (!this.isDucking) {
      if (cursors.left.isDown) {
        player.body.setAccelerationX(-400);
        player.flipX = true;
        player.anims.play('right', true);
      } else if (cursors.right.isDown) {
        player.body.setAccelerationX(400);
        player.flipX = false;
        player.anims.play('right', true);
      } else {
        player.anims.play('turn');
      
        const vx = player.body.velocity.x;
        if (Math.abs(vx) > 10) {
          player.setAccelerationX(-Math.sign(vx) * 20);
        } else {
          player.setAccelerationX(0);
          player.setVelocityX(0);
        }
      }
    } else {
      // Wenn geduckt → keine neue Bewegung starten
      player.setAccelerationX(0);
      // keine neue Animation starten (optional)
    }
      
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && this.ammo > 0) {
      this.shoot();
    }

    this.moveSnowmanTowardsPlayer();

    const isOnGround = player.body.blocked.down || this.inSnow;

    if (cursors.up.isDown && isOnGround && !this.jumpKeyPressed) {
      const jumpForce = this.inSnow ? -50 : -250;
      player.setVelocityY(jumpForce);
      this.canDoubleJump = this.inSnow;
      this.jumpKeyPressed = true;
    } else if (
      cursors.up.isDown &&
      this.canDoubleJump &&
      !isOnGround &&
      !this.jumpKeyPressed
    ) {
      const jumpForce = this.inSnow ? -120 : -250;
      player.setVelocityY(jumpForce);
      this.canDoubleJump = false;
      this.jumpKeyPressed = true;
    }
    
    if (!cursors.up.isDown) {
      this.jumpKeyPressed = false;
    }
      
    this.inSnow = false;

    if (this.player.y > 1000) {
      this.killPlayer();
    }

    const minX = this.player.width / 2;
    const maxX = this.physics.world.bounds.width - this.player.width / 2;

    if (this.player.x < minX) {
      this.player.x = minX;
    }
    if (this.player.x > maxX) {
      this.player.x = maxX;
    }
      
    this.projectiles.getChildren().forEach(projectile => {
      const tile = this.eislayer.getTileAtWorldXY(projectile.x, projectile.y);
      
      // Falls Eis-Tile da → entferne es
      if (tile) {
        this.eislayer.removeTileAt(tile.x, tile.y);
        projectile.destroy(); // Nur hier zerstören!
      }
    });
        
    this.physics.add.overlap(this.projectiles, this.iceBlocks, this.destroyIceBlock, null, this);

    if (!this.snowmanFallen && this.snowman.y > 1000) {
      this.snowmanFallen = true;
      this.snowman.destroy();
      console.log("Schneemann ist gefallen!");
    }
    
    if (this.snowman.active && this.snowman.healthBar) {
      this.snowman.healthBarBg.setPosition(this.snowman.x, this.snowman.y - 40);
      this.snowman.healthBar.setPosition(this.snowman.x, this.snowman.y - 40);
    }
  }

  collectItem(player, item) {
    const flyIcon = this.add.image(item.x, item.y, 'item')
      .setScale(1)
      .setScrollFactor(0);

    item.destroy();
    this.itemPickupSound.play();

    this.tweens.add({
      targets: flyIcon,
      x: this.itemSlot.x,
      y: this.itemSlot.y,
      scale: 1.5,
      duration: 500,
      onComplete: () => {
        flyIcon.setAlpha(1);
      }
    });
    this.collectedItems.kompass = true;
    this.checkItemProgress();
    console.log("Du hast dein verlorenes Item gefunden!");
  }
    
  collectStar(player, star) {
    const x = star.x;
    const y = star.y;
      
    star.disableBody(true, true); // Verstecken & deaktivieren statt zerstören
    this.ammo++;
    this.updateAmmoDisplay();
    this.pickupSound.play();
      
    // Respawn nach 30 Sekunden
    this.time.delayedCall(10000, () => {
      star.enableBody(true, x, y, true, true);
    });
  }
      
  
  shoot() {
    const projectile = this.projectiles.create(this.player.x, this.player.y, 'star');
    projectile.setVelocityX(this.player.flipX ? -400 : 400);
    projectile.setGravityY(-350);
    projectile.setCollideWorldBounds(true);
    projectile.body.onWorldBounds = true;

    this.ammo--;
    this.updateAmmoDisplay();
    this.shootSound.play();
  }
  
  hitBySnowman(player, snowman) {
    if (!this.invulnerable) {
      this.hp -= 20;
      this.updateHealthBar();
      console.log(`Leben: ${this.hp}`);
      this.hitSound.play();
  
      player.setVelocityX(snowman.x > player.x ? -200: 200);
  
      this.invulnerable = true;
      this.time.delayedCall(1000, () => {
        this.invulnerable = false;
      });
  
      if (this.hp <= 0) {
        this.player.setTint(0x000000);
        this.player.setVelocity(0,0);
        this.player.anims.stop();
        console.log("Spieler besiegt!");
        this.scene.start('GameOverScene');
      }
    }
  }
  
  hitSnowman(projectile, snowman) {
    projectile.disableBody(true, true);
    projectile.destroy();

    snowman.hp--;
    console.log(snowman.hp);
    const maxWidth = 30;
    const currentWidth = Math.max(0, (snowman.hp / 4) * maxWidth);
    snowman.healthBar.width = currentWidth;

    if (snowman.hp <= 0) {
      snowman.healthBar.destroy();
      snowman.healthBarBg.destroy();
      snowman.destroy();
      console.log("Schneemann besiegt!");
    }
    
  }
  
  updateHealthBar() {
    this.healthBar.width = Math.max(0, this.hp);
  }

  throwSnowball() {
    if (!this.snowman.active || !this.player.active) return;

    const snowball = this.snowballs.create(this.snowman.x, this.snowman.y, 'snowball');
    snowball.setCollideWorldBounds(true);
    snowball.body.onWorldBounds = true;
    snowball.setGravityY(-350);

    const direction = this.player.x < this.snowman.x ? -1 : 1;
    snowball.setVelocityX(direction * 300);
  }

  hitBySnowball(player, snowball) {
    snowball.destroy();

    if (!this.invulnerable) {
      this.hp -= 10;
      this.updateHealthBar();
      console.log(`Leben: ${this.hp}`);
      this.hitSound.play();

      this.invulnerable = true;
      this.time.delayedCall(1000, () => {
        this.invulnerable = false;
      });

      if (this.hp <= 0) {
        this.player.setTint(0x000000);
        this.player.setVelocity(0, 0);
        this.player.anims.stop();
        console.log("Spieler besiegt!");
        this.registry.set('lastLevel', this.scene.key);
        this.scene.start('GameOverScene');
      }
    }
  }

  moveSnowmanTowardsPlayer() {
    if (!this.player.active || !this.snowman.active) return;
      
    
      
    const blockedLeft = this.snowman.body.blocked.left;
    const blockedRight = this.snowman.body.blocked.right;
    const onGround = this.snowman.body.blocked.down;

    const dx = this.player.x - this.snowman.x;
    const direction = Math.sign(dx);

    const nextX = this.snowman.x + direction * 16;
    const nextY = this.snowman.y + 32;

    let isCliff = true;

    this.platforms.getChildren().forEach(platform => {
      const bounds = platform.getBounds();
      if (
        nextX > bounds.left &&
        nextX < bounds.right &&
        nextY >= bounds.top &&
        nextY <= bounds.bottom
      ) {
        isCliff = false;
      }
    });

      
    // Springe bei Hindernis in Bewegungsrichtung
    if (onGround && (
      (blockedLeft && direction < 0) ||
      (blockedRight && direction > 0)
    )) {
      this.snowman.setVelocityY(-200); // Sprunghöhe – ggf. anpassen
    }
      
    // Bewege Schneemann zum Spieler
    if (Math.abs(dx) > 5 && !isCliff) {
      this.snowman.setVelocityX(direction * this.snowmanSpeed);
      
      if (direction < 0) {
        this.snowman.anims.play('snowman_left', true);
      } else {
        this.snowman.anims.play('snowman_right', true);
      }
    } else {
      this.snowman.setVelocityX(0);
      this.snowman.anims.stop();
      this.snowman.setFrame(0);
    }
  }
      
  canStandUp() {
    const player = this.player;
      
    // Temporäre Probe-Hitbox: gleiche Position, aber aufrecht
    const testBox = new Phaser.Geom.Rectangle(
      player.body.x,
      player.body.y - 24, // 24px höher – wegen Duckhöhe
      32,
      48
    );
      
    // Prüfen, ob diese Box mit Plattformen kollidieren würde
    let blocked = false;
    this.platforms.getChildren().forEach(platform => {
      const bounds = platform.getBounds();
      if (Phaser.Geom.Intersects.RectangleToRectangle(testBox, bounds)) {
        blocked = true;
      }
    });
      
    return !blocked;
  }

  killPlayer() {
    if (!this.player.active) return;
      
    this.player.setTint(0x000000);
    this.player.setVelocity(0, 0);
    this.player.anims.stop();
    console.log("Spieler ist in den Abgrund gefallen!");
    this.registry.set('lastLevel', this.scene.key);
    this.scene.start('GameOverScene');
  }
      
  updateAmmoDisplay() {
    this.ammoText.setText(`: ${this.ammo}`);
  }
    
  hitIce(projectile, tile) {
    const tileX = this.eislayer.worldToTileX(projectile.x);
    const tileY = this.eislayer.worldToTileY(projectile.y);

    this.eislayer.removeTileAt(tileX, tileY);
    projectile.destroy();
  }

  openGate() {
    this.eistorSprites.forEach(gate => {
      gate.anims.play('open_gate');

      gate.on('animationcomplete', () => {
        gate.destroy();
      });
    });
  }

  destroyIceBlock(projectile, iceBlock) {
    projectile.destroy();
    iceBlock.destroy();
    
    this.iceBlockData = this.iceBlockData.filter(b => b.sprite !== iceBlock);
  }

  hitBySpike(player, spike) {
    if (!this.invulnerable) {
      this.hp -= 20;
      this.updateHealthBar();
      console.log("Du hast einen Eiszapfen berührt!");
      this.hitSound.play();

      this.invulnerable = true;
      this.time.delayedCall(1000, () => {
        this.invulnerable = false;
      });

      if (this.hp <= 0) {
        this.killPlayer();
      }
    }
  }

  collectTeddy(player, teddy) {
    const flyIcon = this.add.image(teddy.x, teddy.y, 'teddy')
      .setScale(1)
      .setScrollFactor(0);

    teddy.destroy();
    this.itemPickupSound.play();

    this.tweens.add({
      targets: flyIcon,
      x: 220,
      y: 32,
      scale: 1.5,
      duration: 500,
      onComplete: () => {
        flyIcon.setAlpha(1);
      }
    });
    this.collectedItems.teddy = true;
    this.checkItemProgress();
    console.log("Du hast den Teddy gefunden!");
  }

  checkItemProgress() {
    const allCollected = this.collectedItems.kompass && this.collectedItems.teddy;

    if (allCollected) {
      console.log("Alle Items eingesammelt - Portal ist aktiv");
      this.portalIsActive = true;
    }
  }
  
  nextLevel() {
    console.log("Portal betreten, nächstes Level wird geladen!");
    this.scene.start('Map3');
  }

}