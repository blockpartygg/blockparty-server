const firebase = require('firebase-admin');

module.exports = class RedLightGreenLight {
  constructor(mode, scoreboard) {
    this.greenLight = true;
    this.goTime = Date.now();
    this.stopTime = Date.now();
    this.mode = mode;
    this.scoreboard = scoreboard;
    this.bots = [];
    this.lastTime = Date.now();

    for(let bot = 0; bot < 10; bot++) {
      this.bots[bot] = {
        positionY: 0,
        velocityY: 0,
        tapAccelerationY: 5
      }
      firebase.database().ref('minigame/redLightGreenLight/players/' + bot).set(this.bots[bot]);
    }

    firebase.database().ref('minigame/redLightGreenLight/greenLight').set(this.greenLight);

    firebase.database().ref('minigame/redLightGreenLight/players').on('child_changed', snapshot => {
        let player = snapshot.val();
        if(player) {
            this.mode.setScore(this.scoreboard, snapshot.key, Math.floor(player.positionY));
        }
    });
  }

  logState() {
    console.log('redLightGreenLight: { greenLight:', this.greenLight,
      ', goTime:', this.goTime,
      ', stopTime:', this.stopTime,
      '}'
    );
  }

  update(delta) {
      if(this.greenLight && Date.now() - this.goTime >= 3000 && Math.random() >= 0.99) {
        this.greenLight = false;
        firebase.database().ref('minigame/redLightGreenLight/greenLight').set(this.greenLight);
        this.stopTime = Date.now();
      }
      
      if(!this.greenLight && Date.now() - this.stopTime >= 3000 && Math.random() >= 0.99) {
        this.greenLight = true;
        firebase.database().ref('minigame/redLightGreenLight/greenLight').set(this.greenLight);
        this.goTime = Date.now();
      }

      this.updateBots(delta);
  }

  updateBots(delta) {
    delta /= 1000;

    for(let i = 0; i < 10; i++) {
      this.bots[i].velocityY *= 0.95;
      this.bots[i].positionY += this.bots[i].velocityY * delta;
      if(this.bots[i].positionY <= 0) {
        this.bots[i].positionY = 0;
      }

      
      if(this.greenLight) {
        if(Math.random() >= 0.8) {
          this.bots[i].velocityY = this.bots[i].tapAccelerationY;
        }
      }
      else {
        if(Math.random() >= 0.995) {
          this.bots[i].velocityY = -2 * this.bots[i].tapAccelerationY;
        }
      }

      firebase.database().ref('minigame/redLightGreenLight/players/' + i).set(this.bots[i]);
    }
  }

  shutdown() {
    firebase.database().ref('minigame/redLightGreenLight/players').off();
  }
}