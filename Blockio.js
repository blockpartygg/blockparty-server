const firebase = require('firebase-admin');

module.exports = class Blockio {
  constructor(mode, scoreboard) {
    this.mode = mode;
    this.scoreboard = scoreboard;
    this.food = [];
    this.bots = [];

    firebase.database().ref('minigame/blockio/food').remove();

    for(let bot = 0; bot < 10; bot++) {
      this.bots[bot] = {
        positionX: Math.random() * 10 - 5,
        positionY: Math.random() * 10 - 5,
        velocityX: 0,
        velocityY: 0,
        accelerationX: 0,
        accelerationY: 0,
        speed: 1,
        targetFoodId: -1
      }
      firebase.database().ref('minigame/blockio/players/' + bot).set(this.bots[bot]);
    }
  }

  logState() {
    // console.log('redLightGreenLight: { greenLight:', this.greenLight,
    //   ', goTime:', this.goTime,
    //   ', stopTime:', this.stopTime,
    //   '}'
    // );
  }

  handleCommandAdded(snapshot) {
    let command = snapshot.val();

    let i = this.food.findIndex(food => food.id === command.foodId);
    if(i !== -1) {
      let foodId = this.food[i].id;
      this.food.splice(i, 1);
      firebase.database().ref('minigame/blockio/food/' + foodId).remove();
      this.mode.updateScoreboard(this.scoreboard, command.playerId, 1);
    }
  }

  update(delta) {
    if(this.food.length < 10) {
      let food = {};
      food.position = {};
      food.position.x = Math.random() * 10 - 5;
      food.position.y = Math.random() * 10 - 5;
      
      this.food.push(food);
      let key = firebase.database().ref('minigame/blockio/food').push(this.food[this.food.length - 1]).key;
      this.food[this.food.length - 1].id = key;
    }
      this.updateBots(delta);
  }

  updateBots(delta) {
    delta /= 1000;

    for(let i = 0; i < 10; i++) {
      if(this.bots[i].targetFoodId === -1) {
        let closestFoodDistanceSquared = 200;
        let closestFoodId;
        this.food.forEach(food => {
          let distanceSquared = this.distanceSquared(this.bots[i].positionX, this.bots[i].positionY, food.position.x, food.position.y);
          if(distanceSquared < closestFoodDistanceSquared) {
            closestFoodId = food.id;
            closestFoodDistanceSquared = distanceSquared;
          }
        });
        this.bots[i].targetFoodId = closestFoodId;
      }

      if(this.bots[i].targetFoodId !== -1) {
        let food = this.food.find(f => f.id === this.bots[i].targetFoodId);
        if(food !== undefined) {
          let normalizedDeltaX = (food.position.x - this.bots[i].positionX) / Math.sqrt(this.distanceSquared(food.position.x, this.bots[i].positionX, food.position.y, this.bots[i].positionY));
          let normalizedDeltaY = (food.position.y - this.bots[i].positionY) / Math.sqrt(this.distanceSquared(food.position.x, this.bots[i].positionX, food.position.y, this.bots[i].positionY));
          this.bots[i].velocityX += normalizedDeltaX * this.bots[i].speed * delta;
          this.bots[i].velocityY += normalizedDeltaY * this.bots[i].speed * delta;
        }
        else {
          this.bots[i].targetFoodId = -1;
        }
      }
      
      this.bots[i].velocityX *= 0.95;
      this.bots[i].velocityY *= 0.95;
      this.bots[i].positionX += this.bots[i].velocityX * delta;
      this.bots[i].positionY += this.bots[i].velocityY * delta;
      if(this.bots[i].positionX <= -5) {
        this.bots[i].positionX = -5;
      }
      if(this.bots[i].positionX >= 5) {
        this.bots[i].positionX = 5;
      }
      if(this.bots[i].positionY <= -5) {
        this.bots[i].positionY = -5;
      }
      if(this.bots[i].positionY >= 5) {
        this.bots[i].positionY = 5;
      }

      for(var key in this.food) {
        let food = this.food[key];
        let deltaX = this.bots[i].positionX - food.position.x;
        let deltaY = this.bots[i].positionY - food.position.y;
        let distance = deltaX * deltaX + deltaY * deltaY;
        if(distance < 1) {
          let foodId = food.id;
          firebase.database().ref('game/commands').push({
              playerId: i,
              foodId: foodId
          });
        }
      }

      firebase.database().ref('minigame/blockio/players/' + i).set(this.bots[i]);
    }
  }

  distanceSquared(x1, y1, x2, y2) {
    let distanceSquared = Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2);
    return distanceSquared;
  }

  shutdown() {
    
  }
}