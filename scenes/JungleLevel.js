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
    this.load.image('Blitz', 'assets/JungleLevel/Blitz.png');
    this.load.image('Fritz', 'assets/JungleLevel/Fritz.png');

    this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
    this.load.image('star', 'assets/star.png');
    this.load.image('Potion', 'assets/JungleLevel/Potion.png');
    this.load.image('Zauberstab', 'assets/JungleLevel/Zauberstab.png');
    this.load.image('Portal', 'assets/Portal.png');
    this.load.image('Green', 'assets/JungleLevel/Green.png');
    this.load.audio('jumpSound', 'sounds/Jump.wav');
    this.load.audio('hitSound', 'sounds/Hit2.wav');
    this.load.audio('pickupSound', 'sounds/Pickup1.wav');
    this.load.audio('itemPickupSound', 'sounds/itemPickup.wav');
    this.load.audio('shootSound', 'sounds/Shoot.wav');
    this.load.audio('bgMusic', 'sounds/backgroundMusic.wav');
    this.load.audio('powerupSound', 'sounds/PowerUp.wav');
  }


  create() {
    if (!this.sound.get('bgMusic')) {
      const music = this.sound.add('bgMusic', {
          loop: true,
          volume: 0.3
      });
      music.play();
    }
    const green = this.add.image(0, 0, 'Green').setOrigin(0, 0).setScrollFactor(1).setDepth(-5);
    const bg = this.add.image(window.innerWidth / 2 - 480, 0, 'JungleBackground').setOrigin(0, 0).setScrollFactor(1).setDepth(-3);

    // Bildschirmgröße
    const gameWidth = window.innerWidth
    const gameHeight = window.innerHeight;
    //const gameHeight = this.sys.game.config.height;
    
    
    const offsetX = window.innerWidth / 2 - 480;
    const map = this.make.tilemap({ key: 'JungleMap' });

    const jungleTiles = map.addTilesetImage('JungleTiles', 'JungleTiles');
    const bodenTiles = map.addTilesetImage('Boden', 'Boden');
    const starTiles = map.addTilesetImage('Stars', 'star');

    const bodenLayer = map.createLayer('Boden', bodenTiles, window.innerWidth / 2 - 480, 0);
    const jungleLayer = map.createLayer('JungleTiles', jungleTiles, window.innerWidth / 2- 480, 0);
    const böseBlumenLayer = map.createLayer('BöseBlumen', jungleTiles, window.innerWidth / 2- 480, 0).setDepth(1);
    const guteBlumenLayer = map.createLayer('GuteBlumen', jungleTiles, window.innerWidth / 2 - 480, 0);
    const starLayer = map.createLayer('Stars', starTiles, window.innerWidth / 2 - 480, 0);
    const dekoLayer = map.createLayer('Deko', jungleTiles, window.innerWidth / 2 - 480, 0);


 
    // Kollisionsebenen
    bodenLayer.setCollisionByExclusion([-1]);
    jungleLayer.setCollisionByExclusion([-1]);
    böseBlumenLayer.setCollisionByExclusion([-1]);
    guteBlumenLayer.setCollisionByExclusion([-1]);

    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.physics.world.setBounds(offsetX, 0, map.widthInPixels, map.heightInPixels);




    // Spieler erstellen
    //this.player = this.physics.add.sprite(100, map.heightInPixels - 100, 'dude');
    this.player = this.physics.add.sprite(100, 3120, 'dude');
    //his.player = this.physics.add.sprite(850, 100, 'dude');

    this.player.setMaxVelocity(200, 500);
    this.player.setDamping(true);
    this.player.body.setDrag(600,0);
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);



    //Fritz hinzufügen
    this.fritz = this.physics.add.sprite(500, 200, 'Fritz');
    this.fritz.setCollideWorldBounds(true);
    this.fritz.setBounce(1, 1);
    this.fritzSpeed = 100;

    // // Health für Fritz
    // this.fritz.hp = 3;
    

    // // Healthbar für Fritz
    // this.fritz.healthBarBg = this.add.rectangle(this.fritz.x, this.fritz.y - 40, 34, 6, 0x000000)
    //     .setScrollFactor(1)
    //     .setDepth(5);

    // this.fritz.healthBar = this.add.rectangle(this.fritz.x, this.fritz.y - 40, 30, 4, 0xff0000)
    //     .setScrollFactor(1)
    //     .setDepth(6);

    // const maxWidth = 30;
    // const currentWidth = Math.max(0, (this.fritz.hp / 3) * maxWidth);
    // this.fritz.healthBar.width = currentWidth;



    this.physics.add.collider(this.player, bodenLayer);
    this.physics.add.collider(this.player, jungleLayer);
    this.physics.add.collider(this.player, böseBlumenLayer, () => {
      // Schaden zufügen, aber nur einmal pro Kontakt
      if (!this.player.isOnBöseBlume) {
        this.hp -= 1;
        this.hitSound.play();
        this.updateHealthBar();
        this.player.isOnBöseBlume = true;
        // Optional: Feedback, z.B. rot färben
        this.player.setTint(0xff0000);
        this.time.delayedCall(200, () => this.player.clearTint());
      }
    }, null, this);


    this.physics.add.collider(this.player, guteBlumenLayer, () => {
      if (!this.jumpBoostActive) {
        this.jumpBoostActive = true;
        this.powerupSound.play();
        this.player.setTint(0x00ff00);

        // Health um 10 erhöhen, aber maximal 100
        this.hp = Math.min(this.hp + 10, 100);
        this.updateHealthBar();

        // Timer für 1 Sekunde Boost
        if (this.jumpBoostTimer) this.jumpBoostTimer.remove();
        this.jumpBoostTimer = this.time.delayedCall(1000, () => {
          this.jumpBoostActive = false;
          this.player.clearTint();
        });
      }
    }, null, this);

    this.physics.add.collider(this.fritz, bodenLayer);
    this.physics.add.collider(this.fritz, jungleLayer);
    this.physics.add.collider(this.fritz, böseBlumenLayer);

    

    //Blitze
    this.blitze = this.physics.add.group();

    this.physics.add.collider(this.blitze, bodenLayer, (blitz) => blitz.destroy(), null, this);
    this.physics.add.collider(this.blitze, jungleLayer, (blitz) => blitz.destroy(), null, this);
    this.physics.add.collider(this.blitze, böseBlumenLayer, (blitz) => blitz.destroy(), null, this);

    // Blitz abschießen alle 2 Sekunden
    this.time.addEvent({
        delay: 2000,
        callback: () => this.shootBlitz(),
        callbackScope: this,
        loop: true
    });
    
    // Kollision Blitz und Spieler
    this.physics.add.overlap(this.player, this.blitze, (player, blitz) => {
        blitz.destroy();
        this.hp -= 20;
        this.updateHealthBar();
        player.setTint(0xffff00);
        this.time.delayedCall(200, () => player.clearTint());
    }, null, this);

   


    this.ammo = 0; // Anzahl der verfügbaren Schüsse

    // Stern-Counter
    this.ammoIcon = this.add.image(window.innerWidth / 2 - 480 + 960 - 80, 30, 'star')
      .setScale(0.8)
      .setScrollFactor(0)
      .setDepth(10);

    this.ammoText = this.add.text(window.innerWidth / 2 - 480 + 960 - 60, 18, `: ${this.ammo}`, {
      fontSize: '24px',
      fill: '#000000'
    }).setScrollFactor(0)
      .setDepth(10);

    // Projektile
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.projectiles = this.physics.add.group();


    this.projectiles.children.each((projectile) => {
        projectile.body.onWorldBounds = true;
        });
        this.physics.world.on('worldbounds', (body) => {
        if (body.gameObject && body.gameObject.texture.key === 'star') {
            body.gameObject.destroy();
        }
    });

    this.physics.add.overlap(this.projectiles, this.fritz, this.hitFritz, null, this);

    this.physics.add.collider(this.projectiles, bodenLayer, (projectile) => projectile.destroy(), null, this);
    this.physics.add.collider(this.projectiles, jungleLayer, (projectile) => projectile.destroy(), null, this);
    this.physics.add.collider(this.projectiles, böseBlumenLayer, (projectile) => projectile.destroy(), null, this);

    
    // Gruppe für einsammelbare Sterne
    this.stars = this.physics.add.group();

    // Alle Tiles im Star-Layer durchgehen
    starLayer.forEachTile(tile => {
      if (tile.index !== -1) {
        // Weltkoordinaten berechnen
        const worldX = tile.getCenterX();
        const worldY = tile.getCenterY();
        // Physics-Stern erzeugen
        const star = this.stars.create(worldX, worldY, 'star');
        star.body.allowGravity = false;
        star.setImmovable(true);
        // Tile entfernen
        starLayer.removeTileAt(tile.x, tile.y);
      }
    });

    // Nach dem Umwandeln der Tiles in Sterne:
    this.physics.add.overlap(this.player, this.stars, this.collectStar, null, this);


    //Zauberstab
    this.zauberstab = this.physics.add.sprite(window.innerWidth / 2 - 480 + 400, 2020, 'Zauberstab');
    this.physics.add.collider(this.zauberstab, jungleLayer);
    this.physics.add.collider(this.zauberstab, bodenLayer);
    this.physics.add.overlap(this.player, this.zauberstab, this.collectZauberstab, null, this);
    this.zauberstab.setDepth(0);

    this.zauberstabSlot = this.add.image(window.innerWidth / 2 - 480 + 220, 32, 'Zauberstab')
      .setScale(1.5)
      .setAlpha(0.3)
      .setScrollFactor(0);

    
    // Potion
    this.potion = this.physics.add.sprite(window.innerWidth / 2 - 480 + 595, 1400, 'Potion');
    this.physics.add.collider(this.potion, jungleLayer);
    this.physics.add.collider(this.potion, bodenLayer);
    this.physics.add.overlap(this.player, this.potion, this.collectPotion, null, this);
    this.potion.setDepth(0);
    
    this.potionSlot = this.add.image(window.innerWidth / 2 - 480 + 260, 32, 'Potion')
      .setScale(1.5)
      .setAlpha(0.5)
      .setScrollFactor(0);
    
    
    this.physics.add.overlap(this.player, this.potion, this.collectPotion, null, this);

    //Portal
    this.portal = this.physics.add.sprite(window.innerWidth / 2 - 480 + 30, 3120, 'Portal')
    .setScale( 1.3)
    .setDepth(-1);

    this.portal2 = this.physics.add.sprite(window.innerWidth / 2 - 480 +930, 110, 'Portal')
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
        obj.x + obj.width / 2 + offsetX,
        obj.y + obj.height / 2,
        null
      )
      .setDisplaySize(obj.width, obj.height)
      .setVisible(false)
      .refreshBody();
    });

    this.physics.add.overlap(this.player, this.portals, () => {
      if (this.hasZauberstab && this.hasPotion) {
        this.nextLevel();
      }
      this.nextLevel();
    }, null, this);

    
    
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
    this.healthBarBackground = this.add.rectangle(window.innerWidth / 2 - 480 + 100, 30, 104, 24, 0x000000).setScrollFactor(0);
    this.healthBar = this.add.rectangle(window.innerWidth / 2 - 480 + 100, 30, 100, 20, 0x00ff00).setScrollFactor(0);

    

    // Beispiel-Spieler
    
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setZoom(1); // Kamera-Zoom anpassen
    //this.cameras.main.scrollY = map.heightInPixels - this.cameras.main.height;

    // Eingaben initialisieren
    this.cursors = this.input.keyboard.createCursorKeys();
    this.isDucking = false;

    this.jumpCount = 0;
    this.maxJumps = 2;
    this.wasOnGround = false;
    this.jumpKeyPressed = false;
    this.fallStartY = null;
    this.bodenLayer = bodenLayer; 
    this.böseBlumenLayer = böseBlumenLayer;
    this.guteBlumenLayer = guteBlumenLayer;
    this.dangerTimer = 0;
    this.lastDangerTile = null;
    this.jumpBoostActive = false;
    this.jumpBoostTimer = null;
    this.hasZauberstab = false;
    this.hasPotion = false

    this.jumpSound = this.sound.add('jumpSound');
    this.hitSound = this.sound.add('hitSound');
    this.pickupSound = this.sound.add('pickupSound');
    this.itemPickupSound = this.sound.add('itemPickupSound');
    this.shootSound = this.sound.add('shootSound');
    this.powerupSound = this.sound.add('powerupSound');
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
        this.lastShootDir = { x: -1, y: 0 };
      } else if (cursors.right.isDown) {
        player.setVelocityX(200);
        player.flipX = false;
        player.anims.play('right', true);     // Animation abspielen
        this.lastShootDir = { x: 1, y: 0 };
      } else {
        player.setVelocityX(0);
        player.anims.play('turn');            // Idle-Animation
      }
    } else {
      player.setVelocityX(0);
      player.anims.play('turn');              // Beim Ducken Idle-Animation
    }

    // Springen & Double Jump

    // Beim Springen & Double Jump:
    const jumpVelocity = this.jumpBoostActive ? -400 : -230; // Boost: höherer Sprung

    if (cursors.up.isDown && !this.jumpKeyPressed && this.jumpCount < this.maxJumps) {
      player.setVelocityY(jumpVelocity);
      this.jumpKeyPressed = true;
      this.jumpCount++;
      this.jumpSound.play();
      this.lastShootDir = { x: 0, y: -1 };

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
          this.hitSound.play();
          this.player.setTint(0xff0000);
          this.time.delayedCall(200, () => this.player.clearTint());
        } else if (blocks >= 9 && blocks < 15) {
          this.hp -= 20;
          this.updateHealthBar();
          this.hitSound.play();
          this.player.setTint(0xff0000);
          this.time.delayedCall(200, () => this.player.clearTint());
        } else if (blocks >= 15 && blocks < 20) {
          this.hp -= 50;
          this.hitSound.play();
          this.updateHealthBar();
        } else if (blocks >= 20) {
          this.hp = 0;
          this.updateHealthBar();
          this.player.setTint(0x000000);
          this.player.setVelocity(0, 0);
          this.player.anims.stop();
          this.scene.start('GameOverScene');
          this.registry.set('lastLevel', this.scene.key);
        }
        this.fallStartY = null; // Nach Landung zurücksetzen
      }

      if (this.fritz && this.fritz.active && this.fritz.healthBar) {
        this.fritz.healthBarBg.setPosition(this.fritz.x, this.fritz.y - 40);
        this.fritz.healthBar.setPosition(this.fritz.x, this.fritz.y - 40);
        }
    }



    // Gefährliche Tiles entfernen
    const playerLeft = this.player.x - this.player.width / 2 + 1;
    const playerRight = this.player.x + this.player.width / 2 - 1;
    const playerFeetY = this.player.y + this.player.height / 2;

    // Alle Tiles unter dem Spieler finden (von links nach rechts)
    const tileLeft = this.bodenLayer.getTileAtWorldXY(playerLeft, playerFeetY);
    const tileRight = this.bodenLayer.getTileAtWorldXY(playerRight, playerFeetY);

    // Timer und Tile-Tracking wie gehabt, aber für beide Tiles:
    if (tileLeft && tileRight) {
      // Prüfe, ob wir noch auf denselben Tiles stehen wie im letzten Frame
      if (
        this.lastDangerTile &&
        this.lastDangerTile.leftX === tileLeft.x &&
        this.lastDangerTile.rightX === tileRight.x &&
        this.lastDangerTile.y === tileLeft.y // beide Tiles haben gleiche y
      ) {
        this.dangerTimer += this.game.loop.delta;
        if (this.dangerTimer >= 1000) {
          this.bodenLayer.removeTileAt(tileLeft.x, tileLeft.y);
          if (tileRight.x !== tileLeft.x) {
            this.bodenLayer.removeTileAt(tileRight.x, tileRight.y);
          }
          this.dangerTimer = 0;
          this.lastDangerTile = null;
        }
      } else {
        // Neues Tile betreten
        this.dangerTimer = 0;
        this.lastDangerTile = { leftX: tileLeft.x, rightX: tileRight.x, y: tileLeft.y };
      }
    } else {
      // Kein Tile unter dem Spieler
      this.dangerTimer = 0;
      this.lastDangerTile = null;
    }

    // Im update() zurücksetzen, wenn keine Berührung mehr:
    if (!this.physics.world.collide(this.player, this.böseBlumenLayer)) {
      this.player.isOnBöseBlume = false;
    }

    

    // Fritz verfolgt den Spieler
    if (this.fritz && this.fritz.body && this.fritz.active && this.player && this.player.body) {
      const dx = this.player.x - this.fritz.x;
      const dy = this.player.y - this.fritz.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      const minDist = 64; // 2 Blöcke Abstand

      // Nur Bewegung stoppen, nicht den ganzen Block returnen!
      if (dist < minDist) {
        this.fritz.setVelocity(0, 0);
      } else {
        let vx, vy;
        const body = this.fritz.body;

        // Wenn Fritz aktuell ausweicht, bleibe in dieser Richtung bis Timer abgelaufen
        if (this.fritz.lastEscapeDir && this.fritz.lastEscapeTimer > this.time.now) {
          switch (this.fritz.lastEscapeDir) {
            case 'right': vx = this.fritzSpeed; vy = 0; break;
            case 'left': vx = -this.fritzSpeed; vy = 0; break;
            case 'down': vx = 0; vy = this.fritzSpeed; break;
            case 'up': vx = 0; vy = -this.fritzSpeed; break;
            default: vx = 0; vy = 0;
          }
        } else {
          // Prüfe, ob Fritz blockiert ist
          if ((body.blocked.up || body.blocked.down) && !(body.blocked.left || body.blocked.right)) {
            // Horizontal ausweichen
            vy = 0;
            vx = dx === 0 ? 0 : (dx / Math.abs(dx)) * this.fritzSpeed;
            this.fritz.lastEscapeDir = vx > 0 ? 'right' : 'left';
            this.fritz.lastEscapeTimer = this.time.now + 3000; // 3 Sekunden
          } else if ((body.blocked.left || body.blocked.right) && !(body.blocked.up || body.blocked.down)) {
            // Vertikal ausweichen
            vx = 0;
            vy = dy === 0 ? 0 : (dy / Math.abs(dy)) * this.fritzSpeed;
            this.fritz.lastEscapeDir = vy > 0 ? 'down' : 'up';
            this.fritz.lastEscapeTimer = this.time.now + 3000;
          } else if ((body.blocked.left || body.blocked.right) && (body.blocked.up || body.blocked.down)) {
            // Komplett eingeklemmt: wähle eine zufällige freie Richtung
            if (!body.blocked.right) {
              vx = this.fritzSpeed; vy = 0; this.fritz.lastEscapeDir = 'right';
            } else if (!body.blocked.left) {
              vx = -this.fritzSpeed; vy = 0; this.fritz.lastEscapeDir = 'left';
            } else if (!body.blocked.down) {
              vx = 0; vy = this.fritzSpeed; this.fritz.lastEscapeDir = 'down';
            } else if (!body.blocked.up) {
              vx = 0; vy = -this.fritzSpeed; this.fritz.lastEscapeDir = 'up';
            } else {
              vx = 0; vy = 0; this.fritz.lastEscapeDir = null;
            }
            this.fritz.lastEscapeTimer = this.time.now + 3000;
          } else {
            // Nicht blockiert: folge dem Spieler
            vx = (dx / dist) * this.fritzSpeed;
            vy = (dy / dist) * this.fritzSpeed;
            this.fritz.lastEscapeDir = null;
            this.fritz.lastEscapeTimer = 0;
          }
        }

        this.fritz.setVelocity(vx, vy);
      }
    }

    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && this.ammo > 0) {
      this.shoot();
    }
  }

  updateHealthBar() {
    this.healthBar.width = Math.max(0, this.hp);

    if (this.hp <= 0) {
      this.player.setTint(0x000000);
      this.player.setVelocity(0, 0);
      this.player.anims.stop();
      this.scene.start('GameOverScene');
      this.registry.set('lastLevel', this.scene.key);
    }
  }

  shootBlitz() {
    if (!this.fritz.active || !this.player.active) return;
    const blitz = this.blitze.create(this.fritz.x, this.fritz.y, 'Blitz');
    this.physics.moveToObject(blitz, this.player, 300);
    blitz.setCollideWorldBounds(true);
    blitz.body.onWorldBounds = true;
    blitz.body.allowGravity = false;
    blitz.setDepth(2);

    // Blitz zerstören, wenn er die Welt verlässt
    blitz.body.world.on('worldbounds', function(body) {
      if (body.gameObject === blitz) {
        blitz.destroy();
      }
    });
  }

  collectStar(player, star) {
    const x = star.x;
    const y = star.y;
    star.disableBody(true, true); // Stern verstecken & deaktivieren
    this.ammo++;
    this.pickupSound.play();
    this.updateAmmoDisplay();

    // Respawn nach 30 Sekunden
    this.time.delayedCall(30000, () => {
      star.enableBody(true, x, y, true, true);
    });
  }

  updateAmmoDisplay() {
    this.ammoText.setText(`: ${this.ammo}`);
  }

//   shoot() {
//     const projectile = this.projectiles.create(this.player.x, this.player.y, 'star');
//     projectile.setVelocityX(this.player.flipX ? -400 : 400);
//     projectile.setGravityY(-350);
//     projectile.setCollideWorldBounds(true);
//     projectile.body.onWorldBounds = true;

//     this.ammo--;
//     this.updateAmmoDisplay();
//   }
    
  shoot() {
  const star = this.projectiles.create(this.player.x, this.player.y, 'star');
  star.setCollideWorldBounds(true);
  star.body.onWorldBounds = true;

  const dirX = this.lastShootDir?.x || 1;
  const dirY = this.lastShootDir?.y || 0;
  const speed = 500;

  star.setVelocity(dirX * speed, dirY * speed);

  this.ammo--;
  this.shootSound.play();
  this.ammoText.setText(`: ${this.ammo}`);
}

   
// hitFritz(projectile, fritz) {
//   projectile.destroy();
//     fritz.hp--;
//   // Healthbar anpassen
//   const maxWidth = 30;
//   const currentWidth = Math.max(0, (fritz.hp / 3) * maxWidth);
//   fritz.healthBar.width = currentWidth;

//   if (fritz.hp <= 0) {
//     if (fritz.healthBar) fritz.healthBar.destroy();
//     if (fritz.healthBarBg) fritz.healthBarBg.destroy();
//     fritz.destroy();
//   }

// }

 hitFritz(projectile, fritz) {
    projectile.destroy();
  fritz.destroy();

    // projectile.disableBody(true, true);
    // projectile.destroy();

    // fritz.hp--;
    // console.log(fritz.hp);
    // const maxWidth = 30;
    // const currentWidth = Math.max(0, (fritz.hp / 3) * maxWidth);
    // fritz.healthBar.width = currentWidth;

    // if (fritz.healthBar) {
    //     fritz.healthBar.width = currentWidth;
    // }

    // if (fritz.hp <= 0) {
    //     if (fritz.healthBar) fritz.healthBar.destroy();
    //     if (fritz.healthBarBg) fritz.healthBarBg.destroy();
    //     fritz.destroy();
    //     this.fritz = null;
    //     console.log("Fritz besiegt!");
    // }
  }




 collectZauberstab(player, zauberstab) {
    const flyIcon = this.add.image(zauberstab.x, zauberstab.y, 'Zauberstab')
      .setScale(1)
      .setScrollFactor(0);

    zauberstab.destroy();
    this.itemPickupSound.play();
    this.hasZauberstab = true; // Zauberstab als gesammelt markieren

    this.tweens.add({
      targets: flyIcon,
      x:  window.innerWidth / 2 - 480 + 220,
      y: 32,
      scale: 1.5,
      duration: 500,
      onComplete: () => {
        flyIcon.setAlpha(1);
      }
    });

    console.log("Du hast den Zauberstab gefunden!");
  }

  collectPotion(player, potion) {
    const flyIcon = this.add.image(potion.x, potion.y, 'Potion')
      .setScale(1)
      .setScrollFactor(0);

    potion.destroy();
    this.itemPickupSound.play();
    this.hasPotion = true; // Potion als gesammelt markieren

    this.tweens.add({
      targets: flyIcon,
      x: window.innerWidth / 2 - 480 + 260,
      y: 32,
      scale: 1.5,
      duration: 500,
      onComplete: () => {
        flyIcon.setAlpha(1);
      }
    });

    console.log("Du hast den Zauberstab gefunden!");
  }

  nextLevel() {
    console.log("Portal betreten, du gehst nach Hause!");
    this.scene.start('HomeLevel');
  }

}