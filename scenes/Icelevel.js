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
      this.load.spritesheet('snowman', 'assets/Schneemann.png', {
        frameWidth:32,
        frameHeight:64
      });
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
      this.player.setCollideWorldBounds(true);

      this.player.setDamping(true);
      this.player.body.setMaxSpeed(200, 500);
      this.player.body.setDrag(600,0);
      this.player.setBounce(0);
  
      // Kollision mit Plattformen aktivieren
      this.physics.add.collider(this.player, this.platforms);

      this.item = this.physics.add.sprite(800, 500, 'item');
      this.physics.add.overlap(this.player, this.item, this.collectItem, null, this);

      // Spieler sinkt langsam durch den Schnee
      this.physics.add.overlap(this.player, this.snowAreas, () => {
        this.player.setVelocityY(50); // leichtes, langsames Einsinken
      }, null, this);
      
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
        key: 'snowman_walk',
        frames:this.anims.generateFrameNumbers('snowman', { start: 0, end: 3 }),
        frameRate: 4,
        repeat:-1
      })

      this.projectiles = this.physics.add.group();

      this.snowman = this.physics.add.sprite(600, 500, 'snowman');
      this.snowman.anims.play('snowman_walk', true);
      this.snowman.setCollideWorldBounds(true);
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
    }
  
    update() {
      const player = this.player;
      const cursors = this.cursors;
  
      if (cursors.left.isDown) {
        player.body.setAccelerationX(-500);
        player.flipX = true;
        player.anims.play('right', true);
      } else if (cursors.right.isDown) {
        player.body.setAccelerationX(500);
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
  
      if (cursors.up.isDown && player.body.blocked.down) {
        player.setVelocityY(-600);
      }

      if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && this.ammo > 0) {
        this.shoot();
        this.ammo--;
      }
    }

    collectItem(player, item) {
        item.destroy();
        console.log("Du hast dein verlorenes Item gefunden!");
      }
    
      collectStar(player, star) {
        star.destroy();
        this.ammo++;
        console.log(`Sterne gesammelt: ${this.ammo}`);
      }
  
      shoot() {
        const projectile = this.projectiles.create(this.player.x, this.player.y, 'star');
        projectile.setVelocityX(this.player.flipX ? -400 : 400);
        projectile.setGravityY(-350);
        projectile.setCollideWorldBounds(true);
        projectile.body.onWorldBounds = true;
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
    }