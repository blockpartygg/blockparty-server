const firebase = require('firebase-admin');

module.exports = class WhackABlock {
  constructor(mode, scoreboard) {
      this.blocks = [];
      this.mode = mode;
      this.scoreboard = scoreboard;

      firebase.database().ref('minigame/whackABlock/blocks').remove();
  }

  logState() {
    console.log('whackABlock: { blocks:', this.blocks, '}');
  }

  handleCommandAdded(snapshot) {
    let command = snapshot.val();

    let i = this.blocks.findIndex(block => block.id === command.blockId);
    if(i !== -1) {
      let block = this.blocks[i];
      this.blocks.splice(i, 1);
      firebase.database().ref('minigame/whackABlock/blocks/' + block.id).remove();
      this.mode.updateScoreboard(this.scoreboard, command.playerId, block.value);
    }
  }

  update() {
    if(this.blocks.length < 2000) {
      let block = {};
      block.position = {};
      block.position.x = Math.random() * 800 - 400;
      block.position.y = Math.random() * 800 - 400;
      block.position.z = Math.random() * 800 - 400;

      block.scale = {};
      block.scale.x = Math.random() + 0.5;
      block.scale.y = Math.random() + 0.5;
      block.scale.z = Math.random() + 0.5;
      
      block.rotation = {};
      block.rotation.x = Math.random() * 2 * Math.PI;
      block.rotation.y = Math.random() * 2 * Math.PI;
      block.rotation.z = Math.random() * 2 * Math.PI;

      block.value = Math.floor(Math.random() * 10) * 10;

      this.blocks.push(block);
      let key = firebase.database().ref('minigame/whackABlock/blocks').push(this.blocks[this.blocks.length - 1]).key;
      this.blocks[this.blocks.length - 1].id = key;
    }
    //this.updateBots();
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

  shutdown() {}
}