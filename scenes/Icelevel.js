export class Icelevel extends Phaser.Scene {
    constructor() {
      super('MainScene');
    }
  
    preload() {
      this.load.image('Eiswelt', 'assets/Eiswelt.png');
      this.load.tilemapTiledJSON('map', 'assets/Eislevel.json');
      this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
      this.load.image('item', 'assets/Kompass.png');
      this.load.image('star', 'assets/star.png');
      this.load.image('snowball', 'assets/Schneeball.png');
      this.load.image('background', 'assets/Eishintergrund.png');
      this.load.image('schalter', 'assets/schalter.png');
      this.load.spritesheet('snowman', 'assets/Schneemann.png', {
        frameWidth:32,
        frameHeight:64
      });
    }
  
    create() {
      const bg = this.add.image(0, 0, 'background').setOrigin(0, 0).setScrollFactor(0);

      // Bildschirmgröße
      const gameWidth = this.sys.game.config.width;
      const gameHeight = this.sys.game.config.height;
      
      // Bild auf Fenstergröße skalieren
      bg.setDisplaySize(gameWidth, gameHeight);
      

      const map = this.make.tilemap({ key: 'map' });
      const tileset = map.addTilesetImage('Eiswelt', 'Eiswelt');
      map.createLayer('Tile Layer 1', tileset, 0, 0); // Nur fürs Aussehen

      this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

      this.eislayer = map.createLayer('Eislayer', tileset, 0, 0);
      this.eislayer.setCollisionByExclusion([-1]);
      
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
      this.player = this.physics.add.sprite(0, 500, 'dude');

      this.player.setMaxVelocity(200, 500);
      this.player.setDamping(true);
      this.player.body.setDrag(600,0);
      this.player.setBounce(0);
  
      // Kollision mit Plattformen aktivieren
      this.physics.add.collider(this.player, this.platforms);

      this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
      this.cameras.main.startFollow(this.player);


      this.item = this.physics.add.sprite(500, 500, 'item');
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
        frames: this.anims.generateFrameNumbers('snowman', { start: 2, edn : 3}),
        frameRate: 4,
        repeat: -1
      });

      this.projectiles = this.physics.add.group();
      this.snowballs = this.physics.add.group();

      this.snowman = this.physics.add.sprite(600, 500, 'snowman');
      this.snowman.anims.play('snowman_left', true);
      this.snowman.setCollideWorldBounds(true);
      this.snowmanSpeed = 60;
      this.physics.add.collider(this.snowman, this.platforms);
      this.physics.add.overlap(this.player, this.snowman, this.hitBySnowman, null, this);
      this.physics.add.overlap(this.projectiles, this.snowman, this.hitSnowman, null, this);

      this.stars = this.physics.add.group({
        key: 'star',
        repeat: 5,
        setXY: { x: 100, y: 0, stepX: 150 }
      });
      
      this.physics.add.collider(this.stars, this.platforms);
      this.physics.add.overlap(this.player, this.stars, this.collectStar, null, this);
      this.ammo = 0;
  
      // Eingaben
      this.cursors = this.input.keyboard.createCursorKeys();
      this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
      
      this.healthBarBackground = this.add.rectangle(100, 30, 104, 24, 0x000000).setScrollFactor(0);
      this.healthBar = this.add.rectangle(100, 30, 100, 20, 0xff0000).setScrollFactor(0);

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
        .setScrollFactor(0);

      this.ammoIcon = this.add.image(this.cameras.main.width - 80, 30, 'star')
        .setScale(0.8)
        .setScrollFactor(0);

      this.ammoText = this.add.text(this.cameras.main.width - 60, 18, `: ${this.ammo}`, {
        fontSize: '24px',
        fill: '#000000'
      }).setScrollFactor(0);

      this.schalter = this.physics.add.staticImage(10 + 6, 244 + 6, 'schalter')
        .setSize(12,12 )

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
        });

       
      
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

        if (tile) {
          this.eislayer.removeTileAt(tile.x, tile.y);
          projectile.destroy();
        }
      })
    }

    collectItem(player, item) {
        const flyIcon = this.add.image(item.x, item.y, 'item')
        .setScale(1)
        .setScrollFactor(0);

        item.destroy();

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
        console.log("Du hast dein verlorenes Item gefunden!");
      }
    
      collectStar(player, star) {
        star.destroy();
        this.ammo++;
        console.log(`Sterne gesammelt: ${this.ammo}`);
        this.updateAmmoDisplay();
      }
  
      shoot() {
        const projectile = this.projectiles.create(this.player.x, this.player.y, 'star');
        projectile.setVelocityX(this.player.flipX ? -400 : 400);
        projectile.setGravityY(-350);
        projectile.setCollideWorldBounds(true);
        projectile.body.onWorldBounds = true;

        this.ammo--;
        this.updateAmmoDisplay();
      }
  
      hitBySnowman(player, snowman) {
        if (!this.invulnerable) {
          this.hp -= 20;
          this.updateHealthBar();
          console.log(`Leben: ${this.hp}`);
  
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
        projectile.destroy();
        snowman.destroy();
        console.log("Schneemann besiegt!");
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
          this.hp -= 20;
          this.updateHealthBar();
          console.log(`Leben: ${this.hp}`);

          this.invulnerable = true;
          this.time.delayedCall(1000, () => {
            this.invulnerable = false;
          });

          if (this.hp <= 0) {
            this.player.setTint(0x000000);
            this.player.setVelocity(0, 0);
            this.player.anims.stop();
            console.log("Spieler besiegt!");
            this.scene.start('GameOverScene');
          }
        }
      }

      moveSnowmanTowardsPlayer() {
        if (!this.player.active || !this.snowman.active) return;
      
        const dx = this.player.x - this.snowman.x;
        const direction = Math.sign(dx);
      
        const blockedLeft = this.snowman.body.blocked.left;
        const blockedRight = this.snowman.body.blocked.right;
        const onGround = this.snowman.body.blocked.down;
      
        // Springe bei Hindernis in Bewegungsrichtung
        if (onGround && (
            (blockedLeft && direction < 0) ||
            (blockedRight && direction > 0)
        )) {
          this.snowman.setVelocityY(-200); // Sprunghöhe – ggf. anpassen
        }
      
        // Bewege Schneemann zum Spieler
        if (Math.abs(dx) > 5) {
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
  }