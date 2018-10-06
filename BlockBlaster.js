const socketManager = require('./SocketManager');

module.exports = class BlockBlaster {
  constructor(game) {
    this.game = game;
    this.blocks = [];

    const socketKeys = Object.keys(socketManager.sockets);
    socketKeys.forEach(key => {
      const socket = socketManager.sockets[key];
      socket.on('minigames/blockBlaster/blocks_get', () => {
        socket.emit('minigames/blockBlaster/blocks', this.blocks);
      }); // I don't think this currently works
      socket.on('minigames/blockBlaster/block_changed', (blockId, playerId) => {
        if(this.blocks[blockId]) {
          this.blocks[blockId].playerId = playerId;
          this.game.mode.incrementScore(this.game.game.scoreboard, playerId, this.blocks[blockId].value);
          socketManager.server.emit('minigames/blockBlaster/block_removed', blockId, this.blocks[blockId]);
          this.blocks.splice(blockId, 1);
        }
      });
    });
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
      const blockId = this.blocks.length - 1;
      this.blocks[blockId].id = blockId;
      socketManager.server.emit('minigames/blockBlaster/block_added', blockId, this.blocks[blockId]);
    }

    this.updateBots();
  }

  updateBots() {
    for(var playerId = 0; playerId < 10; playerId++) {
      if(Math.random() >= 0.995) {
        let blockId = Math.floor(Math.random() * this.blocks.length);
        if(this.blocks[blockId]) {
          this.blocks[blockId].playerId = playerId;
          this.game.mode.incrementScore(this.game.game.scoreboard, playerId, this.blocks[blockId].value);
          socketManager.server.emit('minigames/blockBlaster/block_removed', blockId, this.blocks[blockId]);
        }
      }
    }
  }

  shutdown() {
    this.blocks = [];
  }
}