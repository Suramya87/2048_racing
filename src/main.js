
"use strict"

let config = {
    type: Phaser.AUTO, 
    width:1280,
    height:960,
    render:{
        pixelArt:true
    },
    physics:{
        default: 'arcade',
        arcade: {
            debug: true,
        }
    },
    scene: [ MainMenu, Play],
}

let game = new Phaser.Game(config)