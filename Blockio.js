const firebase = require('firebase-admin');

module.exports = class Blockio {
  constructor(gameManager) {
    this.gameManager = gameManager;
    
    // setup player event listeners
    this.players = [];
    const socketIds = Object.keys(socketManager.sockets);
    socketIds.forEach(socketId => {
      const socket = socketManager.sockets[socketId];
      socket.on('minigames/blockio/setPlayer', (playerId, player) => {
        this.players[playerId] = player;
      });
    });

    // setup bot players
    for(let botPlayerId = 0; botPlayerId < 10; botPlayerId++) {
      this.players[botPlayerId] = {
        position: {
          x: Math.random() * 10 - 5,
          y: Math.random() * 10 - 5,
        },
        velocity: {
          x: 0,
          y: 0
        },
        acceleration: {
          x: 0,
          y: 0
        },
        speed: 10,
        targetFoodId: -1
      }
    }

    // setup food
    this.food = [];
    this.nextFoodId = 0;

    // setup state emitter
    this.sendStateInterval = setInterval(() => { this.sendState(); }, 1000 / 60);
  }

  sendState() {
    socketManager.server.emit('minigames/blockio/state', { players: this.players, food: this.food });
  }

  update(delta) {
    this.updateFood();
    this.updatePlayers(delta);
  }

  updateFood() {
    let foodCount = this.food.reduce(x => x + 1, 0);
    while(foodCount < 10) {
      const food = {
        active: true,
        position: {
          x: Math.random() * 10 - 5,
          y: Math.random() * 10 - 5,
        }
      };
      const foodId = this.nextFoodId++;
      this.food[foodId] = food;
      foodCount = this.food.reduce(x => x + 1, 0);
    }
  }

  updatePlayers(delta) {
    delta /= 1000;

    for(let botPlayerId = 0; botPlayerId < 10; botPlayerId++) {
      if(this.players[botPlayerId].targetFoodId === -1) {
        let closestDistanceSquared = 200;
        let closestFoodId;
        const foodIds = Object.keys(this.food);
        foodIds.forEach(foodId => {
          const food = this.food[foodId];
          if(food) {
            const distanceSquared = this.distanceSquared(this.players[botPlayerId].position.x, this.players[botPlayerId].position.y, food.position.x, food.position.y);
            if(distanceSquared < closestDistanceSquared) {
              closestFoodId = foodId;
              closestDistanceSquared = distanceSquared;
            }
          }
        });
        this.players[botPlayerId].targetFoodId = closestFoodId;
      }

      if(this.players[botPlayerId].targetFoodId !== -1) {
        let food = this.food[this.players[botPlayerId].targetFoodId];
        const normalizedDeltaX = (food.position.x - this.players[botPlayerId].position.x) / Math.sqrt(this.distanceSquared(food.position.x, this.players[botPlayerId].position.x, food.position.y, this.players[botPlayerId].position.y));
        const normalizedDeltaY = (food.position.y - this.players[botPlayerId].position.y) / Math.sqrt(this.distanceSquared(food.position.x, this.players[botPlayerId].position.x, food.position.y, this.players[botPlayerId].position.y));
        this.players[botPlayerId].velocity.x += normalizedDeltaX * this.players[botPlayerId].speed * delta;
        this.players[botPlayerId].velocity.y += normalizedDeltaY * this.players[botPlayerId].speed * delta;
        this.players[botPlayerId].targetFoodId = -1;
      }

      this.players[botPlayerId].velocity.x *= 0.95;
      this.players[botPlayerId].velocity.y *= 0.95;
      this.players[botPlayerId].position.x += this.players[botPlayerId].velocity.x * delta;
      this.players[botPlayerId].position.y += this.players[botPlayerId].velocity.y * delta;

      if(this.players[botPlayerId].position.x <= -5) {
        this.players[botPlayerId].position.x = -5;
      }
      if(this.players[botPlayerId].position.x >= 5) {
        this.players[botPlayerId].position.x = 5;
      }
      if(this.players[botPlayerId].position.y <= -5) {
        this.players[botPlayerId].position.y = -5;
      }
      if(this.players[botPlayerId].position.y >= 5) {
        this.players[botPlayerId].position.y = 5;
      }
    }

    // detect player collisions with food
    const playerIds = Object.keys(this.players);
    playerIds.forEach(playerId => {
      const player = this.players[playerId];
      if(player) {
        const foodIds = Object.keys(this.food);
        foodIds.forEach(foodId => {
          const food = this.food[foodId];
          if(food && food.active) {
            const distanceSquared = this.distanceSquared(player.position.x, player.position.y, food.position.x, food.position.y);
            if(distanceSquared < 1) {
              this.food[foodId].active = false;
              this.food = this.food.filter(food => food !== this.food[foodId]);
              this.gameManager.mode.incrementScore(this.gameManager.game.scoreboard, playerId, 1);
            }
          }
        });
      }
    });
  }

  distanceSquared(x1, y1, x2, y2) {
    let distanceSquared = Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2);
    return distanceSquared;
  }

  shutdown() {
    clearInterval(this.sendStateInterval);
  }
}