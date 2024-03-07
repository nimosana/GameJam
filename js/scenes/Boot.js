class Boot extends Phaser.Scene {
    constructor() {
        super({
            key: `boot`
        });
    }

    preload() {
        this.load.on(`complete`, () => {
            this.scene.start(`play`);
        });
    }
}