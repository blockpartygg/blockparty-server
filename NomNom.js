const firebase = require('firebase-admin');

module.exports = class NomNom {
  constructor(mode, scoreboard) {
    this.mode = mode;
    this.scoreboard = scoreboard;
  }

  logState() {
    console.log('nomNom: {}');
  }

  handleCommandAdded(snapshot) {
    let command = snapshot.val();
    let score;
    this.mode.updateScoreboard(this.scoreboard, command.playerId, score);
  }

  update() {
      this.updateBots();
  }

  updateBots() {
    
  }

  shutdown() {}
}