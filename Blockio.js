const firebase = require('firebase-admin');

module.exports = class Blockio {
  constructor(gameManager) {
    this.gameManager = gameManager;
    this.food = [];
    this.nextFoodId = 0;
    this.players = [];

    socketManager.server.on('connection', socket => {
      socket.on('minigames/blockio/getFood', callback => {
        console.log('get food request');
        callback(this.food);
      });
    });
    // for(let botPlayerId = 0; botPlayerId < 1; botPlayerId++) {
    //   this.players[botPlayerId] = {
    //     positionX: Math.random() * 10 - 5,
    //     positionY: Math.random() * 10 - 5,
    //     velocityX: 0,
    //     velocityY: 0,
    //     accelerationX: 0,
    //     accelerationY: 0,
    //     speed: 5,
    //     targetFoodId: -1
    //   }
    //   socketManager.server.emit('minigames/blockio/setPlayer', botPlayerId, this.players[botPlayerId]);
    // }

    const socketIds = Object.keys(socketManager.sockets);
    socketIds.forEach(socketId => {
      const socket = socketManager.sockets[socketId];
      // socket.on('minigames/blockio/setPlayer', (playerId, player) => {
      //   this.players[playerId] = player;
      // });
      socket.on('minigames/blockio/getFood', callback => {
        console.log('get food request');
        callback(this.food);
      });
      socket.on('minigames/blockio/eatFood', (foodId, playerId) => {
        console.log('eating food ' + foodId + ' ' + playerId);
        if(this.food[foodId]) {
          this.food[foodId].playerId = playerId;
          this.gameManager.mode.incrementScore(this.gameManager.game.scoreboard, playerId, 1);
          socketManager.server.emit('minigames/blockio/removeFood', foodId);
          this.food[foodId] = null;
        }
      });
    });
  }

  update(delta) {
    const length = this.food.reduce(x => x + 1, 0);
    if(length < 1) {
      let food = {};
      food.active = true;
      food.position = {};
      food.position.x = Math.random() * 10 - 5;
      food.position.y = Math.random() * 10 - 5;
      const foodId = this.nextFoodId++;
      this.food[foodId] = food;
      this.food[foodId].id = foodId;
      socketManager.server.emit('minigames/blockio/addFood', foodId, this.food[foodId]);
    }
    // this.updateBots(delta);
  }

  updateBots(delta) {
    delta /= 1000;

    for(let botPlayerId = 0; botPlayerId < 1; botPlayerId++) {
      if(this.players[botPlayerId].targetFoodId === -1) {
        let closestFoodDistanceSquared = 200;
        let closestFoodId;
        this.food.forEach(food => {
          if(food) {
            let distanceSquared = this.distanceSquared(this.players[botPlayerId].positionX, this.players[botPlayerId].positionY, food.position.x, food.position.y);
            if(distanceSquared < closestFoodDistanceSquared) {
              closestFoodId = food.id;
              closestFoodDistanceSquared = distanceSquared;
            }
          }
        });
        this.players[botPlayerId].targetFoodId = closestFoodId;
      }

      if(this.players[botPlayerId].targetFoodId !== -1) {
        const length = this.food.reduce(x => x + 1, 0);
        if(length > 0) {
          let food = this.food.find(f => f && f.id === this.players[botPlayerId].targetFoodId);
          if(food !== undefined) {
            let normalizedDeltaX = (food.position.x - this.players[botPlayerId].positionX) / Math.sqrt(this.distanceSquared(food.position.x, this.players[botPlayerId].positionX, food.position.y, this.players[botPlayerId].positionY));
            let normalizedDeltaY = (food.position.y - this.players[botPlayerId].positionY) / Math.sqrt(this.distanceSquared(food.position.x, this.players[botPlayerId].positionX, food.position.y, this.players[botPlayerId].positionY));
            this.players[botPlayerId].velocityX += normalizedDeltaX * this.players[botPlayerId].speed * delta;
            this.players[botPlayerId].velocityY += normalizedDeltaY * this.players[botPlayerId].speed * delta;
          }
          else {
            this.players[botPlayerId].targetFoodId = -1;
          }
        }
      }
      
      this.players[botPlayerId].velocityX *= 0.95;
      this.players[botPlayerId].velocityY *= 0.95;
      this.players[botPlayerId].positionX += this.players[botPlayerId].velocityX * delta;
      this.players[botPlayerId].positionY += this.players[botPlayerId].velocityY * delta;
      if(this.players[botPlayerId].positionX <= -5) {
        this.players[botPlayerId].positionX = -5;
      }
      if(this.players[botPlayerId].positionX >= 5) {
        this.players[botPlayerId].positionX = 5;
      }
      if(this.players[botPlayerId].positionY <= -5) {
        this.players[botPlayerId].positionY = -5;
      }
      if(this.players[botPlayerId].positionY >= 5) {
        this.players[botPlayerId].positionY = 5;
      }

      const foodIds = Object.keys(this.food);
      foodIds.forEach(foodId => {
        const food = this.food[foodId];
        if(food) {
          let deltaX = this.players[botPlayerId].positionX - food.position.x;
          let deltaY = this.players[botPlayerId].positionY - food.position.y;
          let distance = deltaX * deltaX + deltaY * deltaY;
          if(distance < 1 && food.active) {
            if(this.food[foodId]) {
              this.food[foodId].active = false;
              this.food[foodId].playerId = botPlayerId;
              this.gameManager.mode.incrementScore(this.gameManager.game.scoreboard, botPlayerId, 1);
              this.food[foodId] = null;
              socketManager.server.emit('minigames/blockio/removeFood', foodId);
            }
          }
        }
      });
      
      socketManager.server.emit('minigames/blockio/setPlayer', botPlayerId, this.players[botPlayerId]);
    }
  }

  distanceSquared(x1, y1, x2, y2) {
    let distanceSquared = Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2);
    return distanceSquared;
  }

  shutdown() {
    
  }
}