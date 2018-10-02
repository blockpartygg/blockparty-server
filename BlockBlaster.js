const firebase = require('firebase-admin');

module.exports = class BlockBlaster {
  constructor(game) {
      this.game = game;
      this.blocks = [];

      firebase.database().ref('minigame/whackABlock/blocks').remove();
  }

  setMode(mode) {
    this.mode = mode;
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
      firebase.database().ref('minigame/whackABlock/blocks/' + block.id).update({ playerId: command.playerId }).then(() => {
        firebase.database().ref('minigame/whackABlock/blocks/' + block.id).remove();
      });
      this.game.mode.updateScoreboard(this.game.game.scoreboard, command.playerId, block.value);
    }
  }

  update() {
    if(this.blocks.length < 100) {
      let block = {};
      block.position = {};
      block.position.x = Math.random() * 200 - 100;
      block.position.y = Math.random() * 200 - 100;
      block.position.z = Math.random() * 200 - 100;
      block.scale = {};
      let scale = Math.random() * 20 + 1;
      block.scale.x = scale;
      block.scale.y = scale;
      block.scale.z = scale;
      block.rotation = {};
      block.rotation.x = Math.random() * 2 * Math.PI;
      block.rotation.y = Math.random() * 2 * Math.PI;
      block.rotation.z = Math.random() * 2 * Math.PI;
      block.value = Math.floor(Math.random() * 10) + 1;

      this.blocks.push(block);
      let key = firebase.database().ref('minigame/whackABlock/blocks').push(this.blocks[this.blocks.length - 1]).key;
      this.blocks[this.blocks.length - 1].id = key;
    }

    this.updateBots();
  }

  updateBots() {
    for(var i = 0; i < 10; i++) {
      if(Math.random() >= 0.995) {
        let blockKey = Math.floor(Math.random() * this.blocks.length);
        if(this.blocks[blockKey]) {
          firebase.database().ref('game/commands').push({
            playerId: i,
            blockId: this.blocks[blockKey].id
          });
        }
      }
    }
  }

  shutdown() {}
}