/** initializes the loading of assets for the war game and starts it once ready. */
class Boot extends Phaser.Scene {
    /** allows the initialization of the asset loading for the war game */
    constructor() {
        super({
            key: `boot`
        });
    }
    //loads required assets for the game
    preload() {
        let comboSounds = 11;
        this.load.image(`user`, `assets/images/tankPlayer.png`);
        this.load.image(`enemy`, `assets/images/tankEnemy.png`);
        this.load.image(`bullet`, `assets/images/bullet.png`);
        this.load.image('grass', 'assets/images/grass.jpg');
        this.load.image('heart', 'assets/images/heart.png');
        this.load.audio('shoot', 'assets/sounds/shoot.mp3');
        this.load.audio('heal', 'assets/sounds/heal.mp3');
        this.load.audio('scream', 'assets/sounds/scream.mp3');
        this.load.audio('impact', 'assets/sounds/impact.mp3');
        for (let i = 2; i <= comboSounds; i++) {
            this.load.audio(`combo-${i}`, `assets/sounds/kill-${i}.mp3`);
        }
        this.load.on(`complete`, () => {
            this.scene.start(`play`);
        });
    }
}