const firebase = require('./Firebase');
const socketManager = require('./SocketManager');
const playerManager = require('./PlayerManager');

module.exports = class RedLightGreenLight {
  constructor(game) {
    this.game = game;
    this.goTime = Date.now();
    this.stopTime = Date.now();
    this.lastTime = Date.now();

    this.players = [];
    for(let playerId = 0; playerId < 10; playerId++) {
      this.players[playerId] = {
        positionZ: 0,
        moving: false,
      }
      socketManager.server.emit('minigames/redLightGreenLight/player', playerId, this.players[playerId]);
    }

    this.greenLight = true;
    socketManager.server.emit('minigames/redLightGreenLight/greenLight', this.greenLight);

    const socketKeys = Object.keys(socketManager.sockets);
    socketKeys.forEach(key => {
      const socket = socketManager.sockets[key];
      socket.on('minigames/redLightGreenLight/player', (playerId, player) => {
        this.game.mode.setScore(this.game.game.scoreboard, playerId, Math.floor(player.positionZ));
      });
    });

    this.doneMovingBot = this.doneMovingBot.bind(this);
  }

  update(delta) {
      if(this.greenLight && Date.now() - this.goTime >= 3000 && Math.random() >= 0.99) {
        this.greenLight = false;
        socketManager.server.emit('minigames/redLightGreenLight/greenLight', this.greenLight);
        this.stopTime = Date.now();
      }
      
      if(!this.greenLight && Date.now() - this.stopTime >= 3000 && Math.random() >= 0.99) {
        this.greenLight = true;
        socketManager.server.emit('minigames/redLightGreenLight/greenLight', this.greenLight);
        this.goTime = Date.now();
      }

      this.updateBots(delta);
  }

  updateBots(delta) {
    delta /= 1000;

    for(let playerId = 0; playerId < 10; playerId++) {
      if(!this.players[playerId].moving) {
        if(this.greenLight) {
          if(Math.random() >= 0.925) {
            this.players[playerId].moving = true;
            setTimeout(this.doneMovingBot, 151, playerId, 1);
          }
        }
        else {
          if(Math.random() >= 0.99) {
            this.players[playerId].moving = true;
            setTimeout(this.doneMovingBot, 151, playerId, -2);
          }
        }
      }
    }
  }

  doneMovingBot(playerId, distance) {
    this.players[playerId].positionZ += distance;
    socketManager.server.emit('minigames/redLightGreenLight/player', playerId, this.players[playerId]);
    this.game.mode.setScore(this.game.game.scoreboard, playerId, Math.floor(this.players[playerId].positionZ));
    this.players[playerId].moving = false;
  }

  shutdown() {
    firebase.database.ref('minigame/redLightGreenLight/players').off();
  }
}