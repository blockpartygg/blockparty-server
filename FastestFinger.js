const socketManager = require('./SocketManager');

module.exports = class FastestFinger {
  constructor(gameManager) {
    this.gameManager = gameManager;

    this.setupPlayers();
    this.setupPlayerListeners();
    this.setupStateEmitter();
  }

  setupPlayers() {
    this.players = {};
    this.botCount = 10;
    this.botMoveProbability = 0.85;
    for(let playerId = 0; playerId < this.botCount; playerId++) {
      this.spawnPlayer("bot" + playerId, playerId);
    }
  }

  spawnPlayer(playerId, x) {
    this.players[playerId] = {
      id: playerId,
      active: true,
      position: {
        x: x,
        z: 0,
      },
      moving: false
    };
  }

  setupPlayerListeners() {
    this.nextPositionX = this.botCount;
    const socketIds = Object.keys(socketManager.sockets);
    socketIds.forEach(socketId => {
      const socket = socketManager.sockets[socketId];
      socket.on('fastestFinger/joinGame', playerId => {
        this.spawnPlayer(playerId, this.nextPositionX++);
      });
      socket.on('fastestFinger/playerState', (playerId, player) => {
        const playerObject = JSON.parse(player);
        if(this.players[playerId]) {
          this.players[playerId].position = playerObject.position;
        }
        this.gameManager.mode.setScore(this.gameManager.game.scoreboard, playerId, Math.floor(playerObject.position.z));
      });
    });
  }

  setupStateEmitter() {
    this.sendStateInterval = setInterval(() => { this.sendState(); }, 1000 / 60);
  }

  sendState() {
    socketManager.server.emit('fastestFinger/state', { players: this.players });
  }

  update(timeElapsed) {
    this.updateBots();
  }

  updateBots() {
    for(let playerId = 0; playerId < this.botCount; playerId++) {
      if(this.players["bot" + playerId].active && !this.players["bot" + playerId].moving) {
        if(Math.random() >= this.botMoveProbability) {
          this.players["bot" + playerId].moving = true;
          setTimeout(() => { this.doneMovingBot(playerId); }, 100);
        }
      }
    }
  }

  doneMovingBot(playerId) {
    this.players["bot" + playerId].position.z += 1;
    this.gameManager.mode.setScore(this.gameManager.game.scoreboard, "bot" + playerId, Math.floor(this.players["bot" + playerId].position.z));
    this.players["bot" + playerId].moving = false;
  }

  shutdown() {
    clearInterval(this.sendStateInterval);
  }
}