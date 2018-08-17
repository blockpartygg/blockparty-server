const firebase = require('firebase-admin');

module.exports = class WhackABlock {
  constructor(mode, scoreboard) {
      this.blocks = [];
      this.mode = mode;
      this.scoreboard = scoreboard;

      firebase.database().ref('whackABlock/blocks').set(this.blocks);
  }

  logState() {
    console.log('whackABlock: { blocks:', this.blocks, '}');
  }

  handleCommandAdded(snapshot) {
    let command = snapshot.val();

    this.blocks.forEach(block => {
      if(command.x >= block.x - block.width / 2 && 
        command.x <= block.x + block.width / 2 && 
        command.y >= block.y - block.height / 2 && 
        command.y <= block.y + block.height / 2) {
        this.blocks.splice(this.blocks.indexOf(block), 1);
        firebase.database().ref('whackABlock/blocks/' + block.id).remove();
        this.mode.updateScoreboard(this.scoreboard, command.playerId, block.value);
      }
    });
  }

  update() {
    if(this.blocks.length < 10) {
      let size = Math.random() * 10 + 10;
      this.blocks.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        width: size,
        height: size,
        value: Math.floor(Math.random() * 10) * 100
      });
      let key = firebase.database().ref('whackABlock/blocks').push(this.blocks[this.blocks.length - 1]).key;
      this.blocks[this.blocks.length - 1].id = key;
      this.logState();
    }
    this.updateBots();
  }

  updateBots() {
    for(var i = 0; i < 10; i++) {
      if(Math.random() >= 0.99) {
        firebase.database().ref('game/commands').push({
          playerId: Math.floor(Math.random() * 10),
          x: Math.random() * 100,
          y: Math.random() * 100
        });
      }
    }
  }
}