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
  }


  create() {
    const bg = this.add.image(0, 0, 'JungleBackground').setOrigin(0, 0).setScrollFactor(1);

    // Bildschirmgröße
    const gameWidth = window.innerWidth
    const gameHeight = window.innerHeight;
    //const gameHeight = this.sys.game.config.height;
    
    

    const map = this.make.tilemap({ key: 'JungleMap' });

    const jungleTiles = map.addTilesetImage('JungleTiles', 'JungleTiles');
    const bodenTiles = map.addTilesetImage('Boden', 'Boden');

    const bodenLayer = map.createLayer('Boden', bodenTiles, 0, 0);
    const jungleLayer = map.createLayer('JungleTiles', jungleTiles, 0, 0);
    const böseBlumenLayer = map.createLayer('BöseBlumen', jungleTiles, 0, 0);
    const guteBlumenLayer = map.createLayer('GuteBlumen', jungleTiles, 0, 0);

 
    // Kollisionsebenen
    bodenLayer.setCollisionByExclusion([-1]);
    jungleLayer.setCollisionByExclusion([-1]);
    böseBlumenLayer.setCollisionByExclusion([-1]);
    guteBlumenLayer.setCollisionByExclusion([-1]);





    // Spieler erstellen
    this.player = this.physics.add.sprite(100, map.heightInPixels - 100, 'dude');

    this.player.setMaxVelocity(200, 500);
    this.player.setDamping(true);
    this.player.body.setDrag(600,0);
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);


    //Fritz hinzufügen
    this.fritz = this.physics.add.sprite(600, 200, 'Fritz');
    this.fritz.setCollideWorldBounds(true);
    this.fritz.setBounce(1, 1);
    this.fritzSpeed = 120;

    this.physics.add.collider(this.player, bodenLayer);
    this.physics.add.collider(this.player, jungleLayer);
    this.physics.add.collider(this.player, böseBlumenLayer, () => {
      // Schaden zufügen, aber nur einmal pro Kontakt
      if (!this.player.isOnBöseBlume) {
        this.hp -= 1;
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
        this.player.setTint(0x00ff00);
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
    this.bodenLayer = bodenLayer; 
    this.böseBlumenLayer = böseBlumenLayer;
    this.guteBlumenLayer = guteBlumenLayer;
    this.dangerTimer = 0;
    this.lastDangerTile = null;
    this.jumpBoostActive = false;
    this.jumpBoostTimer = null;

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

    // Beim Springen & Double Jump:
    const jumpVelocity = this.jumpBoostActive ? -400 : -250; // Boost: höherer Sprung

    if (cursors.up.isDown && !this.jumpKeyPressed && this.jumpCount < this.maxJumps) {
      player.setVelocityY(jumpVelocity);
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
          this.player.setTint(0xff0000);
          this.time.delayedCall(200, () => this.player.clearTint());
        } else if (blocks >= 9 && blocks < 15) {
          this.hp -= 20;
          this.updateHealthBar();
          this.player.setTint(0xff0000);
          this.time.delayedCall(200, () => this.player.clearTint());
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
    if (this.fritz && this.player) {
      const dx = this.player.x - this.fritz.x;
      const dy = this.player.y - this.fritz.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      const minDist = 64; // 2 Blöcke Abstand
      if (dist < minDist) {
        this.fritz.setVelocity(0, 0);
        return;
      }

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

  updateHealthBar() {
    this.healthBar.width = Math.max(0, this.hp);

    if (this.hp <= 0) {
      this.player.setTint(0x000000);
      this.player.setVelocity(0, 0);
      this.player.anims.stop();
      this.scene.start('GameOverScene');
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
}