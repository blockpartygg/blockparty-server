const Config = require('./MultiRoundConfiguration');

class MultiRoundGameManager {
  constructor(scoreboardManager, leaderboardManager) {
    // public game state
    this.game = {
      state: null,
      endTime: null,
      round: 0,
      mode: null,
    };
    this.scoreboardManager = scoreboardManager;
    this.leaderboardManager = leaderboardManager;
    
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
    this.leaderboardManager.clear();
    this.logState();
    setTimeout(() => { this.setPreRoundState(); }, Config.states.pregame.duration);
  }

  setPreRoundState() {
    this.game.state = Config.states.preRound.id;
    this.game.endTime = new Date(Date.now() + Config.states.preRound.duration);
    this.game.round++;
    this.game.mode = this.game.mode == null || this.game.mode == Config.modes.survival ? Config.modes.timeAttack : Config.modes.survival;  
    this.scoreboardManager.clear();
    this.logState();
    setTimeout(() => { this.setPreMinigameState(); }, Config.states.preRound.duration);
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
    // this.scoreboardManager.addScore("RonSolo", Math.floor(Math.random() * 10));
    // this.scoreboardManager.addScore("CMoneyTruDat", Math.floor(Math.random() * 10));
    // this.scoreboardManager.addScore("Doc4bz", Math.floor(Math.random() * 10));
    this.logState();
    setTimeout(() => { this.setScoreboardState(); }, Config.states.postMinigame.duration);
  }

  setScoreboardState() {
    this.game.state = Config.states.scoreboard.id;
    this.game.endTime = new Date(Date.now() + Config.states.scoreboard.duration);
    this.leaderboardManager.rewardPoints(this.scoreboardManager);
    this.logState();
    if(this.game.round < Config.roundCount) {
        setTimeout(() => { this.setLeaderboardState(); }, Config.states.scoreboard.duration);
    }
    else {
        setTimeout(() => { this.setPostgameState(); }, Config.states.scoreboard.duration);
    }
  }

  setLeaderboardState() {
    this.game.state = Config.states.leaderboard.id;
    this.game.endTime = new Date(Date.now() + Config.states.leaderboard.duration);
    this.logState();
    setTimeout(() => { this.setPreRoundState(); }, Config.states.leaderboard.duration);
  }

  setPostgameState() {
    this.game.state = Config.states.postgame.id;
    this.game.endTime = new Date(Date.now() + Config.states.postgame.duration);
    this.logState();
    setTimeout(() => { this.setPregameState(); }, Config.states.postgame.duration);
  }
}

module.exports = MultiRoundGameManager;