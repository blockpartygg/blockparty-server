const socketManager = require('./SocketManager');

module.exports = class RedLightGreenLight {
  constructor(gameManager) {
    this.gameManager = gameManager;
    
    this.setupPlayers();
    this.setupGreenLight();
    this.setupPlayerEliminator();
    this.setupPlayerListeners();
    this.setupStateEmitter();
  }

  setupPlayers() {
    this.players = {};
    for(let playerId = 0; playerId < 10; playerId++) {
      this.players["bot" + playerId] = {
        id: "bot" + playerId,
        active: true,
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

  setupPlayerEliminator() {
    this.playerEliminationCountdown = 5000;
    this.playerToEliminate = null;
  }

  setupPlayerListeners() {
    this.nextPositionX = 10;
    const socketKeys = Object.keys(socketManager.sockets);
    socketKeys.forEach(key => {
      const socket = socketManager.sockets[key];
      socket.on('redLightGreenLight/joinGame', playerId => {
        this.players[playerId] = {
          id: playerId,
          active: true,
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
        this.gameManager.mode.setScore(this.gameManager.game.scoreboard, playerId, Math.floor(playerObject.positionZ));
      });
    });
  }

  setupStateEmitter() {
    this.sendStateInterval = setInterval(() => { this.sendState(); }, 1000 / 60);
  }

  sendState() {
    socketManager.server.emit('redLightGreenLight/state', { players: this.players, greenLight: this.greenLight, playerEliminationCountdown: this.playerEliminationCountdown, playerToEliminate: this.playerToEliminate });
  }

  update(timeElapsed) {
    this.updateGreenLight();  
    this.updateBots();
    this.updatePlayerEliminator(timeElapsed);
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
      if(this.players["bot" + playerId].active && !this.players["bot" + playerId].moving) {
        if(this.greenLight) {
          if(Math.random() >= 0.85) {
            this.players["bot" + playerId].moving = true;
            setTimeout(() => { this.doneMovingBot(playerId, 1); }, 100);
          }
        }
        else {
          if(Math.random() >= 0.99) {
            this.players["bot" + playerId].moving = true;
            setTimeout(() => { this.doneMovingBot(playerId, -2); }, 100);
          }
        }
      }
    }
  }

  doneMovingBot(playerId, distance) {
    this.players["bot" + playerId].positionZ += distance;
    this.gameManager.mode.setScore(this.gameManager.game.scoreboard, "bot" + playerId, Math.floor(this.players["bot" + playerId].positionZ));
    this.players["bot" + playerId].moving = false;
  }

  updatePlayerEliminator(timeElapsed) {
    const scoreboard = this.gameManager.game.scoreboard;
    let lowestScorePlayerId = -1;
    let lowestScore = 100000;
    const playerIds = Object.keys(scoreboard);
    playerIds.forEach(playerId => {
      if(this.players[playerId] && this.players[playerId].active && scoreboard[playerId] < lowestScore) {
        lowestScore = scoreboard[playerId];
        lowestScorePlayerId = playerId;
      }
    });
    if(lowestScorePlayerId !== -1) {
      this.playerToEliminate = lowestScorePlayerId;
      this.playerEliminationCountdown -= timeElapsed;
      if(this.playerEliminationCountdown <= 0) {
        this.players[lowestScorePlayerId].active = false;
        socketManager.server.emit('redLightGreenLight/eliminatePlayer', lowestScorePlayerId);
        this.playerEliminationCountdown = 5000;
      }
    }
  }

  shutdown() {
    clearInterval(this.sendStateInterval);
  }
}