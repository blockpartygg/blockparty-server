const firebase = require('./Firebase');
const socketManager = require('./SocketManager');
const playerManager = require('./PlayerManager');

module.exports = class RedLightGreenLight {
  constructor(game) {
    this.game = game;
    
    this.setupPlayers();
    this.setupGreenLight();
    this.setupPlayerListeners();
    this.setupStateEmitter();

    this.doneMovingBot = this.doneMovingBot.bind(this);
  }

  setupPlayers() {
    this.players = {};
    for(let playerId = 0; playerId < 10; playerId++) {
      this.players["bot" + playerId] = {
        id: "bot" + playerId,
        positionX: playerId,
        positionZ: 0,
        moving: false,
      }
    }
  }

  setupGreenLight() {
    this.greenLight = true;
    this.goTime = Date.now();
    this.stopTime = Date.now();
    this.lastTime = Date.now();
  }

  setupPlayerListeners() {
    this.nextPositionX = 10;
    const socketKeys = Object.keys(socketManager.sockets);
    socketKeys.forEach(key => {
      const socket = socketManager.sockets[key];
      socket.on('redLightGreenLight/joinGame', playerId => {
        this.players[playerId] = {
          id: playerId,
          positionX: this.nextPositionX++,
          positionZ: 0,
          moving: false
        };
      });
      socket.on('redLightGreenLight/playerState', (playerId, player) => {
        const playerObject = JSON.parse(player);
        if(this.players[playerId]) {
          this.players[playerId].positionZ = playerObject.positionZ;
        }
        this.game.mode.setScore(this.game.game.scoreboard, playerId, Math.floor(playerObject.positionZ));
      });
    });
  }

  setupStateEmitter() {
    this.sendStateInterval = setInterval(() => { this.sendState(); }, 1000 / 60);
  }

  sendState() {
    socketManager.server.emit('redLightGreenLight/state', { players: this.players, greenLight: this.greenLight });
  }

  update() {
    this.updateGreenLight();  
    this.updateBots();
  }

  updateGreenLight() {
    if(this.greenLight && Date.now() - this.goTime >= 3000 && Math.random() >= 0.99) {
      this.greenLight = false;
      this.stopTime = Date.now();
    }
    
    if(!this.greenLight && Date.now() - this.stopTime >= 3000 && Math.random() >= 0.99) {
      this.greenLight = true;
      this.goTime = Date.now();
    }
  }

  updateBots() {
    for(let playerId = 0; playerId < 10; playerId++) {
      if(!this.players["bot" + playerId].moving) {
        if(this.greenLight) {
          if(Math.random() >= 0.925) {
            this.players["bot" + playerId].moving = true;
            setTimeout(this.doneMovingBot, 151, playerId, 1);
          }
        }
        else {
          if(Math.random() >= 0.99) {
            this.players["bot" + playerId].moving = true;
            setTimeout(this.doneMovingBot, 151, playerId, -2);
          }
        }
      }
    }
  }

  doneMovingBot(playerId, distance) {
    this.players["bot" + playerId].positionZ += distance;
    this.game.mode.setScore(this.game.game.scoreboard, "bot" + playerId, Math.floor(this.players["bot" + playerId].positionZ));
    this.players["bot" + playerId].moving = false;
  }

  shutdown() {
    clearInterval(this.sendStateInterval);
  }
}