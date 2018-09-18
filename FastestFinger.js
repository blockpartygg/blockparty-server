const firebase = require('firebase-admin');

module.exports = class FastestFinger {
  constructor(mode, scoreboard) {
    this.penalty = false;
    this.goTime = Date.now();
    this.stopTime = Date.now();
    this.mode = mode;
    this.scoreboard = scoreboard;
  }

  logState() {
    console.log('fastestFinger: { penalty:', this.penalty,
      ', goTime:', this.goTime,
      ', stopTime:', this.stopTime,
      '}'
    );
  }

  handleCommandAdded(snapshot) {
    let command = snapshot.val();
    let score;
    if(!this.penalty) {
      score = 1000;
    }
    else {
      score = -3000;
    }
    this.mode.updateScoreboard(this.scoreboard, command.playerId, score);
  }

  update() {
      if(this.penalty && Date.now() - this.goTime >= 3000 && Math.random() >= 0.99) {
        this.penalty = false;
        firebase.database().ref('fastestFinger/penalty').set(this.penalty);
        this.stopTime = Date.now();
      }
      
      if(!this.penalty && Date.now() - this.stopTime >= 3000 && Math.random() >= 0.99) {
        this.penalty = true;
        firebase.database().ref('fastestFinger/penalty').set(this.penalty);
        this.goTime = Date.now();
      }

      this.updateBots();
  }

  updateBots() {
    for(var i = 0; i < 10; i++) {
      if(Math.random() >= 0.99) {
        let playerId = Math.floor(Math.random() * 10);
        firebase.database().ref('game/commands').push({ playerId: playerId});
      }
    }
  }

  shutdown() {}
}