class Play extends Phaser.Scene {

    constructor() {
        super({
            key: `play`
        });
        this.userXAcc = this.userYAcc = this.userXSpd = this.userYSpd = 0;
    }

    create() {
        // interaction setup
        this.cursors = this.input.keyboard.createCursorKeys();
        // create world
        this.physics.world.setBounds(0, 0, 999999, 999999);
        this.ground = this.add.tileSprite(0, 0, 2000, 2000, 'grass').setScrollFactor(0, 0);
        // create and setup user
        this.user = this.physics.add.sprite(0, 0, 'user')
            .setMass(30)
            .setBounce(1, 1)
            .setMaxVelocity(100);
        this.user.body.angularDrag = 120;
        this.cameras.main.startFollow(this.user);
    }

    update() {
        this.userMovement();
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
}