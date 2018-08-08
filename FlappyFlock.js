const firebase = require('firebase-admin');

module.exports = class FlappyFlock {
  constructor(mode, scoreboard) {
    this.mode = mode;
    this.scoreboard = scoreboard;
    this.birds = [];
    this.bird = {
      gravityAccelerationY: 0.0003,
      flapAccelerationY: -0.1,
      width: 10,
      height: 10,
      respawnDelay: 3000,
    }
    this.pipes = [];
    this.pipeCount = 10;
    this.pipeSpawnTimer = 0;
    this.pipeSpawnInterval = 3000;
    this.pipeToSpawn = 0;
    this.pipeToCollide = 0;
    this.pipeSpace = this.bird.height * 4;
    this.pipeWidth = this.bird.width;
    this.pipeHeight = 100;
    this.pipeVelocityX = -0.01;

    firebase.database().ref('flappyFlock').remove();
  }

  logState() {
    console.log('flappyFlock: { }'
    );
  }

  handleCommandAdded(snapshot) {
    let command = snapshot.val();
    let score = 1;
    this.mode.updateScoreboard(this.scoreboard, command.playerId, score);
  }

  update(delta) {
    this.pipeSpawnTimer += delta;
    if(this.pipeSpawnTimer >= this.pipeSpawnInterval) {
      this.pipes[this.pipeToSpawn] = {};
      this.pipes[this.pipeToSpawn].positionX = 100;
      this.pipes[this.pipeToSpawn].positionY = Math.random() * 100;
      this.pipeSpawnTimer = 0;
      this.pipeToSpawn = (this.pipeToSpawn + 1) % this.pipeCount;

      firebase.database().ref('flappyFlock/pipes').set(this.pipes);
    }

    for(let pipe = 0; pipe < this.pipeCount; pipe++) {
      if(this.pipes[pipe]) {
        this.pipes[pipe].positionX += this.pipeVelocityX * delta;
      }
    }

    this.updateBots();
  }

  updateBots() {

  }
}