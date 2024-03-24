class Play extends Phaser.Scene {

    constructor() {
        super({
            key: `play`
        });
        this.userXAcc = this.userYAcc = this.userXSpd = this.userYSpd = 0;
        this.score = 0;
        this.kills = 0;
        this.lastKill = 0;
        this.murderCombo = 0;
        this.firstSpawn = true;
        this.comboTimer = 0;
        this.comboNumber = 0;
        this.newCombo = true;
        this.saidWow = false;
        this.gameLost = false;
    }
    lastFired = 0;

    create() {
        // interaction setup
        this.cursors = this.input.keyboard.createCursorKeys();
        // create world
        this.physics.world.setBounds(0, 0, 1000, 1000);
        this.ground = this.add.tileSprite(0, 0, 2000, 2000, 'grass').setScrollFactor(0, 0);
        // create and setup user
        this.user = this.physics.add.sprite(0, 0, 'user')
            .setMass(30)
            .setBounce(1, 1)
            .setMaxVelocity(100);
        this.user.body.angularDrag = 120;
        this.userHp = 100;
        this.cameras.main.startFollow(this.user);

        this.bulletsPlayer = this.add.group();
        this.bulletsEnemies = this.add.group();
        this.healing = this.add.group();

        this.enemies = this.physics.add.group({
            key: `enemy`,
            quantity: 1,
            bounceX: 1,
            bounceY: 1,
            x: -450,
            y: -450,
            dragX: 50,
            dragY: 50,
            mass: 50,
            createCallback: function (enemy) {
                enemy.hp = 100;
                enemy.fireRate = 1000;
                enemy.lastFire = 0;
            }
        });

        Phaser.Actions.RandomRectangle(this.enemies.getChildren(), this.physics.world.bounds);
        this.physics.add.collider(this.user, this.enemies, this.tanksTouched, null, this);
        this.physics.add.collider(this.enemies, this.enemies);
        this.physics.add.collider(this.enemies, this.bulletsPlayer, this.bulletHitEnemy, null, this);
        this.physics.add.collider(this.bulletsEnemies, this.user, this.bulletHitUser, null, this);
        this.physics.add.overlap(this.healing, this.user, this.userHeal, null, this);


        this.scoreText = this.add.text(0, 0, '', { fontSize: '32px', fontFamily: 'IMPACT', fill: '#ffffff' });
        this.scoreText.setAlign('left')
        this.scoreText.setOrigin(0, 7);
        this.murderText = this.add.text(0, 0, '', { fontSize: '32px', fontFamily: 'IMPACT', fill: '#ffffff' });
        this.murderText.setAlign('center')
        this.murderText.setOrigin(0.5, 0);
        this.murderText.setAlpha(0);

        this.diedText = this.add.text(0, 0, 'YOU DIED\nPress enter to restart', { fontSize: '64px', fontFamily: 'IMPACT', fill: '#ffffff' });
        this.diedText.setAlign('center')
        this.diedText.setOrigin(0.5, 0);
        this.diedText.setAlpha(0);


        this.input.on('pointerdown', (pointer) => {
            if (this.userHp > 1) {
                this.sound.add('shoot').play({ volume: 1 });
                let bullet = this.physics.add.sprite(this.user.x, this.user.y, "bullet");
                let directionX = Math.cos(Phaser.Math.DegToRad(this.user.angle));
                let directionY = Math.sin(Phaser.Math.DegToRad(this.user.angle));
                bullet.setVelocity(directionX * 200, directionY * 200);
                bullet.angle = this.user.body.rotation + 90;
                bullet.setTint(0x00ff00);
                this.bulletsPlayer.add(bullet);
            }
        });
    }

    userHeal(heal, user) {
        this.sound.add('heal').play({ volume: 1 });
        if (this.userHp < 100) {
            this.userHp = 100;
        }
        heal.body.destroy();
        this.healing.remove(heal)
        heal.setActive(false);
        heal.setVisible(false);
    }

    update() {
        const cam = this.cameras.main
        this.userMovement();
        this.murderText.setAlpha(this.murderText.alpha - 0.01);
        this.lastKill++;
        if (this.lastKill > 250) {
            this.murderCombo = 0;
        }
        //delete bullets out of map
        this.bulletsPlayer.children.each(bullet => {
            if (Phaser.Math.Distance.Between(bullet.x, bullet.y, this.user.x, this.user.y) > 600) {
                bullet.body.destroy();
                this.bulletsPlayer.remove(bullet);
                bullet.setActive(false);
                bullet.setVisible(false);
            }
        });
        this.bulletsEnemies.children.each(bullet => {
            if (Phaser.Math.Distance.Between(bullet.x, bullet.y, this.user.x, this.user.y) > 600) {
                bullet.body.destroy();
                this.bulletsEnemies.remove(bullet);
                bullet.setActive(false);
                bullet.setVisible(false);
            }
        });
        // enemies randomly shoot
        this.enemies.children.each(enemy => {
            let random = Phaser.Math.Between(0, 500)
            if (random < 1) {
                let soundDist = Phaser.Math.Distance.Between(this.user.x, this.user.y, enemy.x, enemy.y)
                soundDist = (((Phaser.Math.Clamp(soundDist / 700, 0, 1)) - 1) * -1);
                this.sound.add('shoot').play({ volume: soundDist });
                enemy.lastFire = 0;
                let bullet = this.physics.add.sprite(enemy.x, enemy.y, "bullet");
                bullet.body.setMass(1000);
                let directionX = Math.cos(Phaser.Math.DegToRad(enemy.angle));
                let directionY = Math.sin(Phaser.Math.DegToRad(enemy.angle));
                bullet.setVelocity(directionX * 200, directionY * 200);
                bullet.setTint(0xff0000)
                bullet.angle = enemy.body.rotation + 90;
                this.bulletsEnemies.add(bullet);
            }
            enemy.setRotation(Phaser.Math.Angle.Between(enemy.x, enemy.y, this.user.x, this.user.y));
            this.physics.velocityFromRotation(enemy.rotation, 10, enemy.body.acceleration);
        });

        if (this.enemies.getLength() < this.kills || this.firstSpawn) {
            this.firstSpawn = false;
            let randomizer = Phaser.Math.Between(0, 100);
            console.log("randomizer " + randomizer)
            let randomH, randomV;
            if (randomizer < 50) {
                randomH = this.user.x - this.scale.width / 2;
            } else {
                randomH = this.user.x + this.scale.width / 2;
            }
            randomizer = Phaser.Math.Between(0, 100);
            if (randomizer < 50) {
                randomV = this.user.y + this.scale.height / 2;
            } else {
                randomV = this.user.y + -this.scale.height / 2;
            }
            this.enemies.add(this.physics.add.sprite(randomH, randomV, 'enemy'));
            console.log("spawned at" + randomH + ", " + randomV)
        }
        this.scoreText.setText([`Kills: ${this.kills}`, `Score: ${this.score}`]);
        this.murderText.setText(['MURDER COMBO: ' + this.murderCombo]);
        this.murderText.x = cam.scrollX + this.scale.width / 2;
        this.murderText.y = cam.scrollY + this.scale.height / 3;

        this.diedText.x = cam.scrollX + this.scale.width / 2;
        this.diedText.y = cam.scrollY + this.scale.height / 6;

        this.scoreText.x = cam.scrollX + 50;
        this.scoreText.y = cam.scrollY + 500;
        this.comboTimer++;
        if (this.comboTimer < 250) {
            if (this.comboNumber >= 2 && this.newCombo) {
                this.newCombo = false;
                this.comboTimer = 0;
                if (this.comboNumber < 11) {
                    console.log(`playing combo-${this.comboNumber}`)
                    this.sound.add(`combo-${this.comboNumber}`).play({ volume: 5 });
                } else if (this.comboNumber >= 11 && !this.saidWow) {
                    this.saidWow = true;
                    this.sound.add(`combo-${this.comboNumber}`).play({ volume: 10 });
                }
            }
        } else {
            this.saidWow = false;
            this.comboTimer = 0;
            this.comboNumber = 0;
        }
        // Check enter keypress after loss
        if (this.gameLost && this.input.keyboard.checkDown(this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER))) {
            // Reset the scene and physics
            this.kills = 0;
            this.score = 0;
            this.scene.restart();
            this.gameLost = false;
        }
    }

    /** move user using the arrow keys **/
    userMovement() {
        const { left, right, up, down } = this.cursors;
        const cam = this.cameras.main;
        const body = this.user.body;
        this.ground.setTilePosition(cam.scrollX, cam.scrollY);
        body.setAngularAcceleration(0);
        this.physics.velocityFromRotation(body.rotation, 0, body.acceleration);
        // rotate if left/right arrow keys are down
        if (left.isDown && !right.isDown) {
            this.userXSpd++;
            if (body.angularVelocity > -150) {
                body.setAngularAcceleration(-150);
            }
        } else if (right.isDown && !left.isDown) {
            this.userXSpd++;
            if (body.angularVelocity < 150) {
                body.setAngularAcceleration(150);
            }
        } else { // slow rotation when not pressing keys
            body.setAngularAcceleration(0);
            this.user.setAngularVelocity(body.angularVelocity / 1.05);
        } // move forward/backward with up/down
        up.isDown && this.physics.velocityFromRotation(this.user.rotation, 600, body.acceleration);
        down.isDown && this.physics.velocityFromRotation(this.user.rotation, -300, body.acceleration);
        this.user.setVelocity(body.velocity.x / 1.05, body.velocity.y / 1.05); // lower speed always
    }

    bulletHitEnemy(bullet, enemy) {
        enemy.hp -= 50;
        bullet.body.destroy();
        this.bulletsPlayer.remove(bullet)
        bullet.setActive(false);
        bullet.setVisible(false);
        if (enemy.hp < 1) {
            let soundDist = Phaser.Math.Distance.Between(this.user.x, this.user.y, enemy.x, enemy.y)
            soundDist = (((Phaser.Math.Clamp(soundDist / 700, 0, 1)) - 1) * -1);
            this.sound.add('scream').play({ volume: soundDist });
            this.murderText.setAlpha(1);
            this.murderCombo++;
            this.comboNumber++;
            this.score += this.murderCombo;
            this.kills++;
            this.lastKill = 0;
            let random = Phaser.Math.Between(0, 100);
            if (random < 50) {
                let heal = this.physics.add.sprite(enemy.x, enemy.y, "heart");
                this.healing.add(heal);
            }
            enemy.body.destroy();
            this.newCombo = true;
            this.enemies.remove(enemy)
            enemy.setActive(false);
            enemy.setVisible(false);
        }
    }

    bulletHitUser(bullet, user) {
        this.userHp -= 10;
        console.log(this.userHp)
        bullet.body.destroy();
        this.bulletsEnemies.remove(bullet)
        bullet.setActive(false);
        bullet.setVisible(false);
        if (this.userHp < 1) {
            this.gameLost = true;
            this.diedText.setAlpha(1);
            this.sound.add('scream').play({ volume: 1 });
            user.body.destroy();
            user.setActive(false);
            user.setVisible(false);
        }
    }

    tanksTouched(user, enemy) {
        // if (Phaser.Math.Distance.Between(user.x, user.y, enemy.x, enemy.y)) {
        enemy.hp -= 50;
        this.sound.add('impact').play({ volume: 1 });

        if (enemy.hp < 1) {
            this.murderCombo++;
            this.comboNumber++;
            this.lastKill = 0;
            this.sound.add('scream').play({ volume: 1 });
            enemy.body.destroy();
            this.newCombo = true;
            this.enemies.remove(enemy)
            enemy.setActive(false);
            enemy.setVisible(false);
        }
    }
}