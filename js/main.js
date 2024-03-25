/**
 * WAR TIME
 * @author Nicolas Morales-Sanabria
 * 
 * Tank game using the Phaser 3 library, the user controls a tank through the arrow keys, shooting with SPACE/Click.
 * The user kills endlessly increasing amounts of enemies, trying to survive. Combo mechanics and voices keep track
 * of killstreaks and the player gets more points by having larger combos. The game contains sound effects and an 
 * announcer for an epic fighting experience. */

"use strict";
//phaser config
let config = {
    type: Phaser.AUTO,
    width: 900,
    height: 900,
    physics: {
        default: 'arcade', arcade: {
            gravity: { y: 0 }
        }
    },
    scene: [Boot, Play]
};

let game = new Phaser.Game(config);