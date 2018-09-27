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
        positionZ: 0,
        moving: false,
      }
      firebase.database().ref('minigame/redLightGreenLight/players/' + bot).set(this.bots[bot]);
    }

    firebase.database().ref('minigame/redLightGreenLight/greenLight').set(this.greenLight);

    firebase.database().ref('minigame/redLightGreenLight/players').on('child_changed', snapshot => {
      let player = snapshot.val();
      if(player) {
          this.mode.setScore(this.scoreboard, snapshot.key, Math.floor(player.positionZ));
      }
    });

    this.doneMovingBot = this.doneMovingBot.bind(this);
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
      if(!this.bots[i].moving) {
        if(this.greenLight) {
          if(Math.random() >= 0.925) {
            this.bots[i].moving = true;
            setTimeout(this.doneMovingBot, 151, i, 1);
          }
        }
        else {
          if(Math.random() >= 0.99) {
            this.bots[i].moving = true;
            setTimeout(this.doneMovingBot, 151, i, -2);
          }
        }
      }
    }
  }

  doneMovingBot(botId, distance) {
    this.bots[botId].positionZ += distance;
    firebase.database().ref('minigame/redLightGreenLight/players/' + botId).set(this.bots[botId]); 
    this.bots[botId].moving = false;
  }

  shutdown() {
    firebase.database().ref('minigame/redLightGreenLight/players').off();
  }
}