const firebase = require('./Firebase');
const RedLightGreenLight = require('./RedLightGreenLight');
const BlockBlaster = require('./BlockBlaster');
const Blockio = require('./Blockio');
const FreeForAll = require('./FreeForAll');
const RedVsBlue = require('./RedVsBlue');

class GameManager {
  constructor() {
    // public game state
    this.game = {
      state: "",
      startTime: null,
      endTime: null,
      round: 0,
      minigame: "",
      mode: "",
      teams: [],
      scoreboard: [],
      leaderboard: [],
    };

    // internal state
    this.minigame = null;
    this.mode = null;
    this.minigameUpdateTimer = 0;

    firebase.database.ref('game').remove();

    this.setPregameCountdownState();
  }

  // log game state to the console
  logState() {
    console.log(this.game);
  }

  // write game state to the firebase database
  writeState() {
    firebase.database.ref('game/state').set(this.game.state);
    firebase.database.ref('game').update({ 
      startTime: this.game.startTime,
      endTime: this.game.endTime,
    });
    firebase.database.ref('game/round').set(this.game.round);
    firebase.database.ref('game/minigame').set(this.game.minigame);
    firebase.database.ref('game/mode').set(this.game.mode);
    firebase.database.ref('game/teams').set(this.game.teams);
    firebase.database.ref('game/scoreboard').set(this.game.scoreboard);
    firebase.database.ref('game/leaderboard').set(this.game.leaderboard);
  }

  setPregameCountdownState() {
    this.game.state = Config.gameStates.pregameCountdown.name;
    this.game.startTime = new Date(Date.now());
    this.game.endTime = new Date(Date.now() + Config.gameStates.pregameCountdown.duration);
    this.game.round = 0;
    this.game.minigame = {};
    this.game.mode = {};
    this.game.teams = [];
    this.game.scoreboard = [];
    this.game.leaderboard = [];
    this.minigame = null;
    this.mode = null;
    this.minigameUpdateTimer = 0;    
    this.logState();
    this.writeState();
    setTimeout(() => { this.setPregameTitleState(); }, Config.gameStates.pregameCountdown.duration);
  }

  setPregameTitleState() {
    this.game.state = Config.gameStates.pregameTitle.name;
    this.game.startTime = new Date(Date.now());
    this.game.endTime = new Date(Date.now() + Config.gameStates.pregameTitle.duration)
    this.logState();
    this.writeState();
    setTimeout(() => { this.setPregameIntroductionState(); }, Config.gameStates.pregameTitle.duration);
  }

  setPregameIntroductionState() {
    this.game.state = Config.gameStates.pregameIntroduction.name;
    this.game.startTime = new Date(Date.now());
    this.game.endTime = new Date(Date.now() + Config.gameStates.pregameIntroduction.duration);
    this.logState();
    this.writeState();
    setTimeout(() => { this.setRoundIntroductionState(); }, Config.gameStates.pregameIntroduction.duration);
  }

  setRoundIntroductionState() {
    this.game.state = Config.gameStates.roundIntroduction.name;
    this.game.startTime = new Date(Date.now());
    this.game.endTime = new Date(Date.now() + Config.gameStates.roundIntroduction.duration);
    this.game.round++;
    this.game.scoreboard = [];
    this.selectMinigame();
    this.selectMode();
    this.logState();
    this.writeState();
    setTimeout(() => { this.setRoundInstructionsState(); }, Config.gameStates.roundIntroduction.duration);
  }

  selectMinigame() {
    do {
      this.game.minigame = this.getRandomMinigame();
    }
    while(this.game.minigame === Config.minigames.blockio);

    switch(this.game.minigame) {
      case Config.minigames.redLightGreenLight:
        this.minigame = new RedLightGreenLight(this);
        break;
      case Config.minigames.blockBlaster:
        this.minigame = new BlockBlaster(this);  
        break;
      case Config.minigames.blockio:
        this.minigame = new Blockio(this);
        break;
    }
  }

  getRandomMinigame() {
    const minigameKeys = Object.keys(Config.minigames);
    const minigameIndex = Math.floor(Math.random() * minigameKeys.length);
    const minigameKey = minigameKeys[minigameIndex];
    const minigame = Config.minigames[minigameKey];
    return minigame;
  }

  selectMode() {
    this.game.mode = this.getRandomMode();
    switch(this.game.mode) {
      case Config.modes.freeForAll:
        this.mode = new FreeForAll();
        break;
      case Config.modes.redVsBlue:
        this.mode = new RedVsBlue(this.game);
        break;
    }
  }

  getRandomMode() {
    const modeKeys = Object.keys(Config.modes);
    const modeIndex = Math.floor(Math.random() * modeKeys.length);
    const modeKey = modeKeys[modeIndex];
    const mode = Config.modes[modeKey];
    return mode
  }

  setRoundInstructionsState() {
    this.game.state = Config.gameStates.roundInstructions.name;
    this.game.startTime = new Date(Date.now());
    this.game.endTime = new Date(Date.now() + Config.gameStates.roundInstructions.duration);
    this.logState();
    this.writeState();
    setTimeout(() => { this.setMinigameStartState(); }, Config.gameStates.roundInstructions.duration);
  }

  setMinigameStartState() {
    this.game.state = Config.gameStates.minigameStart.name;
    this.game.startTime = new Date(Date.now());
    this.game.endTime = new Date(Date.now() + Config.gameStates.minigameStart.duration);
    this.logState();
    this.writeState();
    firebase.database.ref('minigame').remove();
    setTimeout(() => { this.setMinigamePlayState(); }, Config.gameStates.minigameStart.duration);
  }

  setMinigamePlayState() {
    this.game.state = Config.gameStates.minigamePlay.name;
    this.game.startTime = new Date(Date.now());
    this.game.endTime = new Date(Date.now() + Config.gameStates.minigamePlay.duration);
    this.logState();
    this.writeState();
    this.minigameUpdateTimer = setInterval(() => { this.minigame.update(1000/ 60); }, 1000 / 60);
    setTimeout(() => { this.setMinigameEndState(); }, Config.gameStates.minigamePlay.duration);
  }

  setMinigameEndState() {
    this.game.state = Config.gameStates.minigameEnd.name;
    this.game.startTime = new Date(Date.now());
    this.game.endTime = new Date(Date.now() + Config.gameStates.minigameEnd.duration);
    this.mode.updateLeaderboard(this.game.leaderboard);
    this.logState();
    this.writeState();
    clearInterval(this.minigameUpdateTimer);
    this.minigame.shutdown();
    setTimeout(() => { this.setRoundResultsScoreboardState(); }, Config.gameStates.minigameEnd.duration);
  }

  setRoundResultsScoreboardState() {
    this.game.state = Config.gameStates.roundResultsScoreboard.name;
    this.game.startTime = new Date(Date.now());
    this.game.endTime = new Date(Date.now() + Config.gameStates.roundResultsScoreboard.duration);
    this.logState();
    this.writeState();
    if(this.game.round < 5) {
      setTimeout(() => { this.setRoundResultsLeaderboardState(); }, Config.gameStates.roundResultsScoreboard.duration);
    }
    else {
      console.log('going to celebreation');
      setTimeout(() => { this.setPostgameCelebrationState(); }, Config.gameStates.roundResultsScoreboard.duration);
    }
  }

  setRoundResultsLeaderboardState() {
    this.game.state = Config.gameStates.roundResultsLeaderboard.name;
    this.game.startTime = new Date(Date.now());
    this.game.endTime = new Date(Date.now() + Config.gameStates.roundResultsLeaderboard.duration);
    this.logState();
    this.writeState();
    setTimeout(() => { this.setRoundIntroductionState(); }, Config.gameStates.roundResultsLeaderboard.duration);
  }

  setPostgameCelebrationState() {
    console.log('setting celebration');
    this.game.state = Config.gameStates.postgameCelebration.name;
    this.game.startTime = new Date(Date.now());
    this.game.endTime = new Date(Date.now() + Config.gameStates.postgameCelebration.duration);
    this.logState();
    this.writeState();
    setTimeout(() => { this.setPostgameRewardsState(); }, Config.gameStates.postgameCelebration.duration);
  }

  setPostgameRewardsState() {
    this.game.state = Config.gameStates.postgameRewards.name;
    this.game.startTime = new Date(Date.now());
    this.game.endTime = new Date(Date.now() + Config.gameStates.postgameRewards.duration);
    this.logState();
    this.writeState();
    firebase.database.ref('players').once('value', snapshot => {
      snapshot.forEach(player => {
        if(!player.val().playing || player.val().isGuest || player.key === "redTeamId" || player.key === "blueTeamId" || player.key === "0" || player.key === "1" || player.key === "2" || player.key === "3" || player.key === "4" || player.key === "5" || player.key === "6" || player.key === "7" || player.key === "8" || player.key === "9") {
          return;
        }
        const currentCurrency = player.val().currency;
        player.ref.update({ currency: currentCurrency + 100 });
      });
    });
    setTimeout(() => { this.setPregameCountdownState(); }, Config.gameStates.postgameRewards.duration);
  }
}

Config = {
  gameStates: {
    pregameCountdown: {
      name: "pregameCountdown",
      duration: 60000
      // duration: 1000
    },
    pregameTitle: {
      name: "pregameTitle",
      duration: 5000,
      // duration: 1000
    },
    pregameIntroduction: {
      name: "pregameIntroduction",
      duration: 10000,
      // duration: 1000
    },
    roundIntroduction: {
      name: "roundIntroduction",
      duration: 5000,
      // duration: 1000
    },
    roundInstructions: {
      name: "roundInstructions",
      duration: 10000,
      // duration: 1000
    },
    minigameStart: {
      name: "minigameStart",
      duration: 3000
      // duration: 1000
    },
    minigamePlay: {
      name: "minigamePlay",
      duration: 30000
      // duration: 1000
    },
    minigameEnd: {
      name: "minigameEnd",
      duration: 3000
      // duration: 1000
    },
    roundResultsScoreboard: {
      name: "roundResultsScoreboard",
      duration: 10000
      // duration: 1000
    },
    roundResultsLeaderboard: {
      name: "roundResultsLeaderboard",
      duration: 10000
      // duration: 1000
    },
    postgameCelebration: {
      name: "postgameCelebration",
      duration: 10000
      // duration: 1000
    },
    postgameRewards: {
      name: "postgameRewards",
      duration: 10000
      // duration: 1000
    }
  },
  minigames: {
    redLightGreenLight: {
      name: "Red Light Green Light",
      instructions: "Run as far as possible by tapping, but stop running when you see the Red Light, which causes you to move backward.",
    },
    blockBlaster: {
      name: "Block Blaster",
      instructions: "Tap blocks to score points. Be fast! Other players are gunning for the same blocks.",
    },
    blockio: {
      name: "Block.io",
      instructions: "Eat the smaller blocks while avoiding the bigger ones."
    },
  },
  modes: {
    freeForAll: {
      name: "Free For All",
      instructions: "It’s every player for themself. Leaderboard points are rewarded based on your performance compared to other competitors. Score as many points as you can.",
    },
    redVsBlue: {
      name: "Red Vs Blue",
      instructions: "It's red against blue.",
    },
  }
}

module.exports = GameManager;