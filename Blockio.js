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
        positionX: Math.random() * 100 - 50,
        positionY: Math.random() * 100 - 50,
        velocityX: 0,
        velocityY: 0,
        accelerationX: 0,
        accelerationY: 0,
        speed: 20,
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
      let food = this.food[i];
      this.food.splice(i, 1);
      firebase.database().ref('minigame/blockio/food/' + food.id).remove();
      this.mode.updateScoreboard(this.scoreboard, command.playerId, 1);
    }
  }

  update(delta) {
    if(this.food.length < 1000) {
      let food = {};
      food.position = {};
      food.position.x = Math.random() * 100 - 50;
      food.position.y = Math.random() * 100 - 50;
      
      this.food.push(food);
      let key = firebase.database().ref('minigame/blockio/food').push(this.food[this.food.length - 1]).key;
      this.food[this.food.length - 1].id = key;
    }
      this.updateBots(delta);
  }

  updateBots(delta) {
    delta /= 1000;

    for(let i = 0; i < 10; i++) {
      this.bots[i].velocityX += Math.cos(Date.now()) * this.bots[i].speed * delta;
      this.bots[i].velocityY += Math.sin(Date.now()) * this.bots[i].speed * delta;
      this.bots[i].velocityX *= 0.95;
      this.bots[i].velocityY *= 0.95;
      this.bots[i].positionX += this.bots[i].velocityX * delta;
      this.bots[i].positionY += this.bots[i].velocityY * delta;
      if(this.bots[i].positionX <= -50) {
        this.bots[i].positionX = -50;
      }
      if(this.bots[i].positionX >= 50) {
        this.bots[i].positionX = 50;
      }
      if(this.bots[i].positionY <= -50) {
        this.bots[i].positionY = -50;
      }
      if(this.bots[i].positionY >= 50) {
        this.bots[i].positionY = 50;
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

  shutdown() {
    
  }
}