export class DesertLevel extends Phaser.Scene {
    constructor() {
        super('DesertLevel');
    }

    preload() {
        // Hintergrund und Tiles
        this.load.image('desertBackground', 'assets/DesertLevel/Wüstenhintergrund.png');
        this.load.tilemapTiledJSON('desertMap', 'assets/DesertLevel/Wüstenlevel.json');
        this.load.image('Wüstenwelt', 'assets/DesertLevel/Wüstenwelt.png'); //Tileset

        // Spieler und Gegner
        this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
        this.load.spritesheet('sandstorm', 'assets/DesertLevel/Sandsturm.png', {
            frameWidth: 32,
            frameHeight: 32
        });

        // Items und Objekte
        this.load.image('star', 'assets/star.png');
        this.load.image('backpack', 'assets/DesertLevel/Rucksack.png');
        this.load.image('Portal', 'assets/Portal.png');

        //Sounds
        this.load.audio('jumpSound', 'sounds/Jump.wav');
        this.load.audio('hitSound', 'sounds/Hit2.wav');
        this.load.audio('pickupSound', 'sounds/Pickup1.wav');
        this.load.audio('itemPickupSound', 'sounds/itemPickup.wav');
        this.load.audio('shootSound', 'sounds/Shoot.wav');
        this.load.audio('bgMusic', 'sounds/backgroundMusic.wav');

    }

    create() {
        //Hintergrund und Musik
        if (!this.sound.get('bgMusic')) {
            const music = this.sound.add('bgMusic', {
                loop: true,
                volume: 0.1
            });
            music.play();
        }
        const bg = this.add.image(0, 0, 'desertBackground')
            .setOrigin(0, 0)
            .setScrollFactor(0); // bleibt relativ zur Kamera

        // Bildschirmgröße
        const gameWidth = this.sys.game.config.width;
        const gameHeight = this.sys.game.config.height;

        // Bild auf Fenstergröße skalieren
        bg.setDisplaySize(gameWidth, gameHeight);

        // Damit der Hintergrund ganz hinten bleibt
        bg.setDepth(-1);

        // Map und Tileset
        const map = this.make.tilemap({ key: 'desertMap' });
        const tileset = map.addTilesetImage('Wüstenwelt', 'Wüstenwelt');
        this.visualLayer = map.createLayer('Tile Layer 1', tileset, 0, 0); // Nur fürs Aussehen
        this.visualLayer.setDepth(0);

        this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

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

        // Leiter 
        const ladderObjects = map.getObjectLayer('Ladder')?.objects || [];

        this.ladders = this.physics.add.staticGroup();
        
        ladderObjects.forEach(obj => {
          const ladder = this.ladders.create(
            obj.x + obj.width / 2,
            obj.y + obj.height / 2,
            null
          ).setDisplaySize(obj.width, obj.height)
           .setVisible(false) // Optional
           .refreshBody();
        });

        const blockZones = map.getObjectLayer('StormBlockZone')?.objects || [];
        this.stormBlockArea = blockZones.map(obj => 
            new Phaser.Geom.Rectangle(obj.x, obj.y, obj.width, obj.height)
        );
                
      
        // Spieler erstellen
        this.hp = 100;
        this.isDucking = false;
        this.invulnerable = false;
        this.knockbackActive = false;

        this.player = this.physics.add.sprite(0, 770, 'dude');
        this.player.setCollideWorldBounds(false);
        this.physics.add.collider(this.player, this.platforms);

        this.onLadder = false;
        this.physics.add.overlap(this.player, this.ladders, () => {
            this.onLadder = true;
        }, null, this);

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

        this.anims.create({
            key: 'sandstorm_anim',
            frames: this.anims.generateFrameNumbers('sandstorm', { start: 0, end: 3 }),
            frameRate: 6,
            repeat: -1
        });

        // Sterne 

        this.projectiles = this.physics.add.group();

        this.stars = this.physics.add.group();

        this.stars.create(1193, 786, 'star');
        this.stars.create(1220, 786, 'star');
        this.stars.create(1246, 786, 'star');
        this.stars.create(1272, 786, 'star');
        this.stars.create(1969, 467, 'star');
        this.stars.create(1937, 467, 'star');
        this.stars.create(1824, 401, 'star');
        this.stars.create(1697, 369, 'star');
        this.stars.create(1376, 341, 'star');
        this.stars.create(1042, 338, 'star');
        this.stars.create(751, 305, 'star');
        this.stars.create(720, 305, 'star');
        this.stars.create(495, 272, 'star');
        this.stars.create(465, 272, 'star');
        this.stars.create(334, 143, 'star');
        this.stars.create(467, 145, 'star');
        this.stars.create(624, 143, 'star');
        this.stars.create(561, 144, 'star');

        

      
        this.physics.add.collider(this.stars, this.platforms);
        this.physics.add.overlap(this.player, this.stars, this.collectStar, null, this);
        this.ammo = 0;
        
        //Eingaben
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spacekey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        
        // HUD
        this.healthBarBackground = this.add.rectangle(100, 30, 104, 24, 0x000000)
            .setScrollFactor(0)
            .setDepth(10);
      
        this.healthBar = this.add.rectangle(100, 30, 100, 20, 0x00ff00)
            .setScrollFactor(0)
            .setDepth(11);

        this.ammoIcon = this.add.image(this.cameras.main.width - 80, 30, 'star')
            .setScale(0.8)
            .setScrollFactor(0)
            .setDepth(10);
          
        this.ammoText = this.add.text(this.cameras.main.width - 60, 18, `: ${this.ammo}`, {
            fontSize: '24px',
            fill: '#000000'
        }).setScrollFactor(0)
          .setDepth(10);

        //Portal und Wechsel
        this.portal = this.physics.add.sprite(20, 750, 'Portal')
          .setScale( 1.3)
          .setDepth(-1);
      
        this.portal2 = this.physics.add.sprite(3170, 585, 'Portal')
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
                this.nextLevel();
            } else {
                console.log("Du musst erst den Rucksack finden");
            }
            
        }, null, this);

        // Gegner mit Trigger Zones

        this.sandstorms = this.physics.add.group();
        this.sandstormSpawned = false;

        const triggerObjects = map.getObjectLayer('Trigger')?.objects || [];

        if (triggerObjects.length > 0) {
            const obj = triggerObjects[0]; // Erstes (und einziges) Objekt
        
            this.sandstormTriggerZone = this.add.zone(
                obj.x + obj.width / 2,
                obj.y + obj.height / 2,
                obj.width,
                obj.height
            );
            this.physics.world.enable(this.sandstormTriggerZone);
            this.sandstormTriggerZone.body.setAllowGravity(false);
            this.sandstormTriggerZone.body.setImmovable(true);
        
            this.physics.add.overlap(this.player, this.sandstormTriggerZone, this.spawnSandstorm, null, this);
        }

        // Tutorial Text
        this.add.text(50, 750, 'Benutze ← → um dich zu bewegen', { fontSize: '14px', fill: '#000' });
        this.add.text(500, 700, 'Benutze ↑ um zu springen', { fontSize: '14px', fill: '#000' });
        this.add.text(800, 620, 'Benutze ↓ um dich zu ducken', { fontSize: '14px', fill: '#000'});
        this.add.text(1130, 700, 'Laufe durch Sterne um sie einzusammeln', { fontsize: '14px', fill: '#000' });
        this.add.text(1130, 720, 'Diese sind deine Munition', { fontsize: '14px', fill: '#000'});

        this.backpack = this.physics.add.sprite(340, 50, 'backpack');
        this.backpack.setDepth(1);
        this.physics.add.collider(this.backpack, this.platforms);
        this.physics.add.overlap(this.player, this.backpack, this.collectBackpack, null, this);

        this.collectedItems = {
            backpack: false
        };

        this.itemSlot = this.add.image(180, 32, 'backpack')
            .setScale(1.0)
            .setAlpha(0.3)
            .setScrollFactor(0)
            .setDepth(10);

        // Sounds
        this.jumpSound = this.sound.add('jumpSound');
        this.hitSound = this.sound.add('hitSound');
        this.pickupSound = this.sound.add('pickupSound');
        this.itemPickupSound = this.sound.add('itemPickupSound', { volume: 0.3 });
        this.shootSound = this.sound.add('shootSound');

        // Sandsturm der Respawnt
        this.spawnRecurringSandstorm(); // Startet sofort den ersten
        this.time.addEvent({
            delay: 60000,
            loop: true,
            callback: () => {
                // Prüfen, ob ALLE Sandstürme nicht mehr aktiv sind
                const aktiveStürme = this.sandstorms.getChildren().filter(s => s.active);
                if (aktiveStürme.length === 0) {
                    this.spawnRecurringSandstorm();
                }
            },
            callbackScope: this
        });

    }

    update() {
        //Spieler Bewegung
        const player = this.player;
        const cursors = this.cursors;
        this.onLadder = false;
        

        if (!this.knockbackActive) {
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
        }
        
        

        // Springen
        if (cursors.up.isDown && this.player.body.blocked.down) {
            this.player.setVelocityY(-260);
            
        }
  
        // Ducken
        if (cursors.down.isDown && !this.isDucking && this.player.body.blocked.down) {
            this.isDucking = true;
            this.player.setScale(1, 0.5);
            this.player.body.setSize(32, 24);
            this.player.body.offset.y = 24;
        }
  
        if (!cursors.down.isDown && this.isDucking) {
            if (this.canStandUp()) {
                this.isDucking = false;
                this.player.setScale(1, 1);
                this.player.body.setSize(32, 48);
                this.player.body.offset.y = 0;
            }
        }
        
        if (Phaser.Input.Keyboard.JustDown(this.spacekey) && this.ammo > 0) {
            this.shoot();
        }

        // Prüfen, ob der Spieler auf einer Leiter steht
        this.physics.overlap(this.player, this.ladders, () => {
            this.onLadder = true;
  
            // Hoch oder runter klettern
            if (this.cursors.up.isDown) {
                this.player.setVelocityY(-100);
            } else if (this.cursors.down.isDown) {
                this.player.setVelocityY(100);
            } else {
                this.player.setVelocityY(0);
            }
  
            // Gravitation deaktivieren beim Klettern
            this.player.body.allowGravity = false;
        }, null, this);
  
        // Falls nicht auf der Leiter → Gravitation reaktivieren
        if (!this.onLadder) {
            this.player.body.allowGravity = true;
        }
          

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

        // Gegner
        if (this.sandstorm) {
            this.moveSandstormTowardsPlayer();
        }
        

        this.sandstorms.getChildren().forEach(storm => {
            if (storm.active && storm.healthBar && storm.healthBarBg) {
                storm.healthBarBg.setPosition(storm.x, storm.y - 30);
                storm.healthBar.setPosition(storm.x, storm.y - 30);
            }
        });
        
        
        this.sandstorms.getChildren().forEach(storm => {
            if (!storm.active) return;
            const dx = this.player.body.center.x - storm.body.center.x;
            const dy = this.player.body.center.y - storm.body.center.y;
            const dist = Math.hypot(dx, dy);
            if (dist === 0) return;
        
            const speed = storm.isDashing ? this.sandstormDashSpeed : this.sandstormNormalSpeed;
            const vx = (dx / dist) * speed;
            const vy = (dy / dist) * speed;
        
            storm.setVelocity(vx, vy);
        });   
    }

    //Hilfsfunktionen

    collectStar(player, star) {
        const x = star.x;
        const y = star.y;
          
        star.disableBody(true, true); // Verstecken & deaktivieren statt zerstören
        this.ammo++;
        this.updateAmmoDisplay();
        this.pickupSound.play();
          
        // Respawn nach 30 Sekunden
        this.time.delayedCall(30000, () => {
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

    updateHealthBar() {
        this.healthBar.width = Math.max(0, this.hp);
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

    moveSandstormTowardsPlayer() {
        if (!this.player.active || !this.sandstorm.active) return;
      
        const dx = this.player.body.center.x - this.sandstorm.body.center.x;
        const dy = this.player.body.center.y - this.sandstorm.body.center.y;
        const dist = Math.hypot(dx, dy);
      
        if (dist === 0) return;

        const speed = this.sandstormSpeed;

        // Vorschau, wo der Sandsturm als Nächstes wäre
        const nextX = this.sandstorm.x + (dx / dist) * speed;
        const nextY = this.sandstorm.y + (dy / dist) * speed;
      
        const wouldEnterBlockedZone = this.stormBlockArea.some(area =>
            area.contains(nextX, nextY)
        );
    
        if (wouldEnterBlockedZone) {
            this.sandstorm.setVelocity(0, 0); // Stoppen oder ausweichen
        } else {
            const vx = (dx / dist) * this.sandstormSpeed;
            const vy = (dy / dist) * this.sandstormSpeed;
            this.sandstorm.setVelocity(vx, vy);
        }
    }
      
    hitSandstorm(projectile, sandstorm) {
        projectile.disableBody(true, true);
        projectile.destroy();
    
        sandstorm.hp--;
        console.log(sandstorm.hp);
        const maxWidth = 30;
        const currentWidth = Math.max(0, (sandstorm.hp / 4) * maxWidth);
        sandstorm.healthBar.width = currentWidth;
    
        if (sandstorm.hp <= 0) {
          sandstorm.healthBar.destroy();
          sandstorm.healthBarBg.destroy();
          sandstorm.destroy();
          console.log("Sandsturm besiegt!");
        }
        
      }
    
    
    sandstormHitsPlayer(player, sandstorm) {
        if (!this.invulnerable) {
            this.hp -= 20;
            this.updateHealthBar();
            console.log(`Leben: ${this.hp}`);
            this.hitSound.play();

            if (this.hp > 0) {
                player.setTint(0xff0000);
                this.time.delayedCall(200, () => {
                    player.clearTint();
                }); 
            }

            this.knockbackActive = true;
            
        
            const pushStrength = 250;
            const direction = player.x < sandstorm.x ? -1 : 1;
            player.setVelocityX(direction * pushStrength);

            this.time.delayedCall(500, () => {
                this.knockbackActive = false;
            });
        
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

    spawnSandstorm() {
        this.add.text(1700, 700, 'Benutze Leertaste um zu schießen', { fontsize: '14px', fill: '#000'});
        // Falls bereits gespawnt → nichts tun
        if (this.sandstormSpawned) return;
    
        this.sandstormSpawned = true;
    
        // Zone entfernen
        this.sandstormTriggerZone.destroy();
        this.time.delayedCall(1000, () => {
            this.sandstorm = this.physics.add.sprite(1808, 753, 'sandstorm');
            this.sandstorms.add(this.sandstorm);
            this.sandstorm.anims.play('sandstorm_anim');
            this.sandstorm.setCollideWorldBounds(true);
            this.sandstorm.setBounce(1);
            this.physics.add.collider(this.sandstorm, this.platforms);
            this.sandstorm.lastEscapeDir = null;
            this.sandstorm.lastEscapeTimer = 0;
            this.sandstormSpeed = 100;
            this.sandstormNormalSpeed = 100;
            this.sandstormDashSpeed = 350;
            this.sandstormIsDashing = false;
            this.sandstorm.hp = 4;

            this.sandstorm.healthBarBg = this.add.rectangle(this.sandstorm.x, this.sandstorm.y - 40, 34, 6, 0x000000)
                .setScrollFactor(1)
                .setDepth(5);

            this.sandstorm.healthBar = this.add.rectangle(this.sandstorm.x, this.sandstorm.y - 40, 30, 4, 0xff0000)
                .setScrollFactor(1)
                .setDepth(6);


            this.physics.add.overlap(this.projectiles, this.sandstorms, this.hitSandstorm, null, this);
            this.physics.add.collider(this.player, this.sandstorms, this.sandstormHitsPlayer, null, this);

            this.time.addEvent({
                delay: 5000,
                loop: true,
                callback: () => {
                    this.sandstormIsDashing = true;
                    this.sandstormSpeed = this.sandstormDashSpeed;

                    this.time.delayedCall(800, () => {
                        this.sandstormIsDashing = false;
                        this.sandstormSpeed = this.sandstormNormalSpeed;
                    });
                }
            });
        });
        
    }

    collectBackpack(player, backpack) {
        const flyIcon = this.add.image(backpack.x, backpack.y, 'backpack')
          .setScale(1)
          .setScrollFactor(0);
    
        backpack.destroy();
        this.itemPickupSound.play();
    
        this.tweens.add({
          targets: flyIcon,
          x: this.itemSlot.x,
          y: this.itemSlot.y,
          scale: 1.0,
          duration: 500,
          onComplete: () => {
            flyIcon.setAlpha(1);
          }
        });

        this.collectedItems.backpack = true;
        this.checkItemProgress();
        console.log("Du hast dein verlorenes Item gefunden!");
    }

    checkItemProgress() {
        const allCollected = this.collectedItems.backpack;

        if (allCollected) {
            console.log("Alle Items im Wüstenlevel eingesammelt - Portal ist aktiv");
            this.portalIsActive = true;
        }
    }

    spawnRecurringSandstorm() {
        const storm = this.physics.add.sprite(1200, 80, 'sandstorm');
        this.sandstorms.add(storm);
        storm.anims.play('sandstorm_anim');
        storm.setCollideWorldBounds(true);
        storm.setBounce(1);
        this.physics.add.collider(storm, this.platforms);
        this.physics.add.overlap(this.projectiles, this.sandstorms, this.hitSandstorm, null, this);
        this.physics.add.collider(this.player, this.sandstorms, this.sandstormHitsPlayer, null, this);
    
        storm.lastEscapeDir = null;
        storm.lastEscapeTimer = 0;
        this.sandstormNormalSpeed = 100;
        this.sandstormDashSpeed = 350;
        this.sandstormSpeed = this.sandstormNormalSpeed;
        storm.isDashing = false;
        storm.hp = 4;
    
        storm.healthBarBg = this.add.rectangle(storm.x, storm.y - 40, 34, 6, 0x000000)
            .setScrollFactor(1)
            .setDepth(5);
    
        storm.healthBar = this.add.rectangle(storm.x, storm.y - 40, 30, 4, 0xff0000)
            .setScrollFactor(1)
            .setDepth(6);
    
        this.time.addEvent({
            delay: 5000,
            loop: true,
            callback: () => {
                if (!storm.active) return;
                storm.isDashing = true;
                this.sandstormSpeed = this.sandstormDashSpeed;
    
                this.time.delayedCall(800, () => {
                    storm.isDashing = false;
                    this.sandstormSpeed = this.sandstormNormalSpeed;
                });
            }
        });
    }
    
    
      

    nextLevel() {
        console.log("Portal betreten, nächstes Level wird geladen!");
        this.scene.start('Map2');
        
    }
}    