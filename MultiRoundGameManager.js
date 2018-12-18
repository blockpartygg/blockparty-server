const Config = require('./MultiRoundConfiguration');

class MultiRoundGameManager {
  constructor(resultsManager, scoreboardManager) {
    // public game state
    this.game = {
      state: null,
      endTime: null,
      round: 0,
      mode: null,
    };
    this.resultsManager = resultsManager;
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
    this.game.round = 0;
    this.game.mode = null;
    this.scoreboardManager.clear();
    this.logState();
    setTimeout(() => { this.setRoundSetupState(); }, Config.states.pregame.duration);
  }

  setRoundSetupState() {
    this.game.state = Config.states.roundSetup.id;
    this.game.endTime = new Date(Date.now() + Config.states.roundSetup.duration);
    this.game.round++;
    this.game.mode = this.game.mode == null || this.game.mode == Config.modes.survival ? Config.modes.timeAttack : Config.modes.survival;  
    this.resultsManager.clear();
    this.logState();
    setTimeout(() => { this.setPreMinigameState(); }, Config.states.roundSetup.duration);
  }

  setPreMinigameState() {
    this.game.state = Config.states.preMinigame.id;
    this.game.endTime = new Date(Date.now() + Config.states.preMinigame.duration);
    this.logState();
    setTimeout(() => { this.setInMinigameState(); }, Config.states.preMinigame.duration);
  }

  setInMinigameState() {
    this.game.state = Config.states.inMinigame.id;
    this.game.endTime = new Date(Date.now() + Config.states.inMinigame.duration);
    this.logState();
    setTimeout(() => { this.setPostMinigameState(); }, Config.states.inMinigame.duration);
  }

  setPostMinigameState() {
    this.game.state = Config.states.postMinigame.id;
    this.game.endTime = new Date(Date.now() + Config.states.postMinigame.duration);
    this.logState();
    setTimeout(() => { this.setRoundResultsState(); }, Config.states.postMinigame.duration);
  }

  setRoundResultsState() {
    this.game.state = Config.states.roundResults.id;
    this.game.endTime = new Date(Date.now() + Config.states.roundResults.duration);
    this.scoreboardManager.rewardPoints(this.resultsManager);
    this.logState();
    if(this.game.round < Config.roundCount) {
        setTimeout(() => { this.setScoreboardState(); }, Config.states.roundResults.duration);
    }
    else {
        setTimeout(() => { this.setPostgameState(); }, Config.states.roundResults.duration);
    }
  }

  setScoreboardState() {
    this.game.state = Config.states.scoreboard.id;
    this.game.endTime = new Date(Date.now() + Config.states.scoreboard.duration);
    this.logState();
    setTimeout(() => { this.setRoundSetupState(); }, Config.states.scoreboard.duration);
  }

  setPostgameState() {
    this.game.state = Config.states.postgame.id;
    this.game.endTime = new Date(Date.now() + Config.states.postgame.duration);
    this.logState();
    setTimeout(() => { this.setPregameState(); }, Config.states.postgame.duration);
  }
}

module.exports = MultiRoundGameManager;