const Config = require('./Configuration');

class SimpleGameManager {
  constructor(scoreboardManager) {
    // public game state
    this.game = {
      state: null,
      endTime: null,
      mode: null,
    };
    this.scoreboardManager = scoreboardManager;
    
    this.setPregameState();
  }

  // log game state to the console
  logState() {
    console.log(this.game);
  }

  setPregameState() {
    this.game.state = Config.states.pregame.id;
    this.game.endTime = new Date(Date.now() + Config.states.pregame.duration);
    this.game.mode = this.game.mode == null || this.game.mode == Config.modes.survival ? Config.modes.timeAttack : Config.modes.survival;  
    this.scoreboardManager.clear();
    this.logState();
    setTimeout(() => { this.setInGameState(); }, Config.states.pregame.duration);
  }

  setInGameState() {
    this.game.state = Config.states.inGame.id;
    this.game.endTime = new Date(Date.now() + Config.states.inGame.duration);
    this.logState();
    setTimeout(() => { this.setPostgameState(); }, Config.states.inGame.duration);
  }

  setPostgameState() {
    this.game.state = Config.states.postgame.id;
    this.game.endTime = new Date(Date.now() + Config.states.postgame.duration);
    this.logState();
    setTimeout(() => { this.setScoreboardState(); }, Config.states.postgame.duration);
  }

  setScoreboardState() {
      this.game.state = Config.states.scoreboard.id;
      this.game.endTime = new Date(Date.now() + Config.states.scoreboard.duration);
      this.logState();
      setTimeout(() => { this.setPregameState(); }, Config.states.scoreboard.duration);
  }
}

module.exports = SimpleGameManager;