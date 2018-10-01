const firebase = require('firebase-admin');
const FastestFinger = require('./FastestFinger');
const WhackABlock = require('./WhackABlock');
const FlappyFlock = require('./FlappyFlock');
const RedLightGreenLight = require('./RedLightGreenLight');
const Blockio = require('./Blockio');
const FreeForAll = require('./FreeForAll');
const RedVsBlue = require('./RedVsBlue');

class Game {
  constructor() {
    // public state
    this.state = "";
    this.startTime = null;
    this.endTime = null;
    this.round = 0;
    this.minigame = "";
    this.mode = "";
    this.teams = [];
    this.scoreboard = [];
    this.leaderboard = [];
    this.commands = [];

    // internal state
    this.currentMinigame = null;
    this.currentMode = null;
    this.minigameUpdateTimer = 0;

    firebase.database().ref('game').remove();
  }

  logState() {
    console.log('game: { state:', this.state,
        ', startTime:', this.startTime,
        ', endTime:', this.endTime, 
        ', round:', this.round, 
        ', minigame:', this.minigame,
        ', mode:', this.mode,
        ', teams:', this.teams,
        ', scoreboard:', this.scoreboard,
        ', leaderboard: ', this.leaderboard,
        ', commands:', this.commands,
        '}'
    );
  }

  sendSystemMessage(text) {
    let timestamp = firebase.database.ServerValue.TIMESTAMP;
    let user = {
      name: "Block Party",
      _id: "0",
    }
    firebase.database().ref('messages').push({ text, user, timestamp });
  }

  setPregameCountdownState() {
    // set state
    this.state = Game.states.pregameCountdown.name;
    this.startTime = new Date(Date.now());
    this.endTime = new Date(Date.now() + Game.states.pregameCountdown.duration);
    this.round = 0;
    this.minigame = "";
    this.mode = "";
    this.teams = [];
    this.scoreboard = [];
    this.leaderboard = [];
    this.commands = [];
    this.currentMinigame = null;
    this.currentMode = null;
    this.minigameUpdateTimer = 0;
    
    // log state to the console
    this.logState();

    // send state to the database
    firebase.database().ref('game').update({ 
        state: this.state, 
        startTime: this.startTime,
        endTime: this.endTime, 
        round: this.round, 
        minigame: this.minigame, 
        mode: this.mode, 
        teams: this.teams,
        scoreboard: this.scoreboard, 
        leaderboard: this.leaderboard,
        commands: this.commands,
    });

    // start the countdown to the lobby
    setTimeout(() => { this.setPregameTitleState(); }, Game.states.pregameCountdown.duration);
  }

  setPregameTitleState() {
    // set state
    this.state = Game.states.pregameTitle.name;
    this.startTime = new Date(Date.now());
    this.endTime = new Date(Date.now() + Game.states.pregameTitle.duration);
    this.round = 0;
    this.minigame = "";
    this.mode = "";
    this.teams = [];
    this.scoreboard = [];
    this.leaderboard = [];
    this.commands = [];

    this.currentMinigame = null;
    this.currentMode = null;
    this.minigameUpdateTimer = 0;
    
    // log state to the console
    this.logState();

    // send state to the database
    firebase.database().ref('game').update({ 
        state: this.state, 
        startTime: this.startTime,
        endTime: this.endTime, 
        round: this.round, 
        minigame: this.minigame, 
        mode: this.mode, 
        teams: this.teams,
        scoreboard: this.scoreboard, 
        leaderboard: this.leaderboard,
        commands: this.commands,
    });

    // start the countdown to the lobby
    setTimeout(() => { this.setPregameIntroductionState(); }, Game.states.pregameTitle.duration);
  }

  setPregameIntroductionState() {
    // set state
    this.state = Game.states.pregameIntroduction.name;
    this.startTime = new Date(Date.now());
    this.endTime = new Date(Date.now() + Game.states.pregameIntroduction.duration);
    this.round = 0;
    this.minigame = "";
    this.mode = "";
    this.teams = [];
    this.scoreboard = [];
    this.leaderboard = [];
    this.commands = [];
    this.currentMinigame = null;
    this.currentMode = null;
    this.minigameUpdateTimer = 0;
    
    // log state to the console
    this.logState();

    // send state to the database
    firebase.database().ref('game').update({ 
        state: this.state, 
        startTime: this.startTime,
        endTime: this.endTime, 
        round: this.round, 
        minigame: this.minigame, 
        mode: this.mode, 
        teams: this.teams,
        scoreboard: this.scoreboard, 
        leaderboard: this.leaderboard,
        commands: this.commands,
    });

    // start the countdown to the lobby
    setTimeout(() => { this.setRoundIntroductionState(); }, Game.states.pregameIntroduction.duration);
  }

  setRoundIntroductionState() {
    // set state
    this.state = Game.states.roundIntroduction.name;
    this.startTime = new Date(Date.now());
    this.endTime = new Date(Date.now() + Game.states.roundIntroduction.duration);
    this.round++;
    //this.minigame = Game.minigames[Math.floor(Math.random() * 3)];
    this.minigame =  Game.minigames[2];
    this.mode = Game.modes[Math.floor(Math.random() * 2)];
    // this.mode = Game.modes[1];
    
    // set teams here
    if(this.mode === Game.modes[0]) {
        this.currentMode = new FreeForAll();
    }
    else if(this.mode === Game.modes[1]) {
        this.currentMode = new RedVsBlue();
    }
    this.currentMode.setupTeams(this.teams);

    // setup the rest of minigame state
    this.scoreboard = [];
    this.commands = [];

    // log state to the console
    this.logState();

    // send state to the database
    firebase.database().ref('game').update({
        state: this.state, 
        startTime: this.startTime,
        endTime: this.endTime,
        round: this.round,
        minigame: this.minigame,
        mode: this.mode,
        teams: this.teams,
        scoreboard: this.scoreboard,
        commands: this.commands,
    });

    // start the countdown to the lobby
    setTimeout(() => { this.setRoundInstructionsState(); }, Game.states.roundIntroduction.duration);
  }

  setRoundInstructionsState() {
    // set state
    this.state = Game.states.roundInstructions.name;
    this.startTime = new Date(Date.now());
    this.endTime = new Date(Date.now() + Game.states.roundInstructions.duration);
    
    // log state to the console
    this.logState();

    // send state to the database
    firebase.database().ref('game').update({ 
        state: this.state, 
        startTime: this.startTime,
        endTime: this.endTime, 
    });

    // start the countdown to the lobby
    setTimeout(() => { this.setMinigameStartState(); }, Game.states.roundInstructions.duration);
  }

  setMinigameStartState() {
    // set state
    this.state = Game.states.minigameStart.name;
    this.startTime = new Date(Date.now());
    this.endTime = new Date(Date.now() + Game.states.minigameStart.duration);
    
    // log state to the console
    this.logState();

    // send state to the database
    firebase.database().ref('game').update({ 
        state: this.state, 
        startTime: this.startTime,
        endTime: this.endTime, 
    });

    firebase.database().ref('minigame').remove();

    // start the countdown to the lobby
    setTimeout(() => { this.setMinigamePlayState(); }, Game.states.minigameStart.duration);
  }

  setMinigamePlayState() {
    // set state
    this.state = Game.states.minigamePlay.name;
    this.startTime = new Date(Date.now());
    this.endTime = new Date(Date.now() + Game.states.minigamePlay.duration);
    
    // set private game state
    if(this.minigame === Game.minigames[0]) {
      this.currentMinigame = new RedLightGreenLight(this.currentMode, this.scoreboard);
    }
    else if(this.minigame === Game.minigames[1]) {
      this.currentMinigame = new WhackABlock(this.currentMode, this.scoreboard);
    }
    else if(this.minigame === Game.minigames[2]) {
      this.currentMinigame = new Blockio(this.currentMode, this.scoreboard);
    }
    else if(this.minigame === Game.minigames[3]) {
      this.currentMinigame = new FastestFinger(this.currentMode, this.scoreboard);
    }
    else if(this.minigame === Game.minigames[4]) {
      this.currentMinigame = new FlappyFlock(this.currentMode, this.scoreboard);
    }

    // log state to the console
    this.logState();

    // send state to the database
    firebase.database().ref('game').update({
        state: this.state,
        startTime: this.startTime,
        endTime: this.endTime
    });

    // setup command listener
    firebase.database().ref('game/commands').on('child_added', snapshot => { this.currentMinigame.handleCommandAdded(snapshot); });

    // start the minigame update interval, updating 60 times per second (tweak this as needed)
    this.minigameUpdateTimer = setInterval(() => { this.currentMinigame.update(1000/ 60); }, 1000 / 60);

    // start the countdown to the lobby
    setTimeout(() => { this.setMinigameEndState(); }, Game.states.minigamePlay.duration);
  }

  setMinigameEndState() {
    // set state
    this.state = Game.states.minigameEnd.name;
    this.startTime = new Date(Date.now());
    this.endTime = new Date(Date.now() + Game.states.minigameEnd.duration);
    
    // update the leaderboard
    this.currentMode.updateLeaderboard(this.leaderboard);

    // log state to the console
    this.logState();

    // send state to the database
    firebase.database().ref('game').update({ 
      state: this.state, 
      startTime: this.startTime,
      endTime: this.endTime });

    // turn off command event listener
    firebase.database().ref('game/commands').off();

    // stop the game update interval
    clearInterval(this.minigameUpdateTimer);
    this.currentMinigame.shutdown();

    // start the countdown to the lobby
    setTimeout(() => { this.setRoundResultsScoreboardState(); }, Game.states.minigameEnd.duration);
  }

  setRoundResultsScoreboardState() {
    // set state
    this.state = Game.states.roundResultsScoreboard.name;
    this.startTime = new Date(Date.now());
    this.endTime = new Date(Date.now() + Game.states.roundResultsScoreboard.duration);
    
    // log state to the console
    this.logState();

    // send state to the database
    firebase.database().ref('game').update({ 
        state: this.state, 
        startTime: this.startTime,
        endTime: this.endTime, 
    });

    if(this.round < 5) {
      setTimeout(() => { this.setRoundResultsLeaderboardState(); }, Game.states.roundResultsScoreboard.duration);
    }
    else {
      setTimeout(() => { this.setPostgameCelebrationState(); }, Game.states.roundResultsScoreboard.duration);
    }
  }

  setRoundResultsLeaderboardState() {
    // set state
    this.state = Game.states.roundResultsLeaderboard.name;
    this.startTime = new Date(Date.now());
    this.endTime = new Date(Date.now() + Game.states.roundResultsLeaderboard.duration);
    
    // log state to the console
    this.logState();

    // send state to the database
    firebase.database().ref('game').update({ 
        state: this.state, 
        startTime: this.startTime,
        endTime: this.endTime, 
    });

    if(this.round < 5) {
      // start the countdown to the lobby
      setTimeout(() => { this.setRoundIntroductionState(); }, Game.states.roundResultsLeaderboard.duration);
    }
    else {
      // start the countdown to the postgame
      setTimeout(() => { this.setPostgameCelebrationState(); }, Game.states.postgameCelebration.duration);
    }
  }

  setPostgameCelebrationState() {
    // set state
    this.state = Game.states.postgameCelebration.name;
    this.startTime = new Date(Date.now());
    this.endTime = new Date(Date.now() + Game.states.postgameCelebration.duration);
    
    // log state to the console
    this.logState();

    // send state to the database
    firebase.database().ref('game').update({ 
        state: this.state, 
        startTime: this.startTime,
        endTime: this.endTime, 
    });

    // start the countdown to the lobby
    setTimeout(() => { this.setPostgameRewardsState(); }, Game.states.postgameCelebration.duration);
  }

  setPostgameRewardsState() {
    // set state
    this.state = Game.states.postgameRewards.name;
    this.startTime = new Date(Date.now());
    this.endTime = new Date(Date.now() + Game.states.postgameRewards.duration);
    
    // log state to the console
    this.logState();

    // send state to the database
    firebase.database().ref('game').update({ 
        state: this.state, 
        startTime: this.startTime,
        endTime: this.endTime, 
    });

    firebase.database().ref('players').once('value', snapshot => {
      snapshot.forEach(player => {
        if(!player.val().playing || player.val().isGuest || player.key === "redTeamId" || player.key === "blueTeamId" || player.key === "0" || player.key === "1" || player.key === "2" || player.key === "3" || player.key === "4" || player.key === "5" || player.key === "6" || player.key === "7" || player.key === "8" || player.key === "9") {
          return;
        }

        const currentCurrency = player.val().currency;
        player.ref.update({ currency: currentCurrency + 100 });
      });
    });

    // start the countdown to the lobby
    setTimeout(() => { this.setPregameCountdownState(); }, Game.states.postgameRewards.duration);
  }
}

Game.states = {
  pregameCountdown: {
    name: "pregameCountdown",
    // duration: 60000
    duration: 1000
  },
  pregameTitle: {
    name: "pregameTitle",
    // duration: 5000,
    duration: 1000
  },
  pregameIntroduction: {
    name: "pregameIntroduction",
    // duration: 10000,
    duration: 1000
  },
  roundIntroduction: {
    name: "roundIntroduction",
    // duration: 5000,
    duration: 1000
  },
  roundInstructions: {
    name: "roundInstructions",
    // duration: 10000,
    duration: 1000
  },
  minigameStart: {
    name: "minigameStart",
    duration: 3000
    // duration: 1000
  },
  minigamePlay: {
    name: "minigamePlay",
    // duration: 30000
    duration: 600000
  },
  minigameEnd: {
    name: "minigameEnd",
    duration: 3000
    // duration: 1000
  },
  roundResultsScoreboard: {
    name: "roundResultsScoreboard",
    // duration: 10000
    duration: 1000
  },
  roundResultsLeaderboard: {
    name: "roundResultsLeaderboard",
    // duration: 10000
    duration: 1000
  },
  postgameCelebration: {
    name: "postgameCelebration",
    // duration: 10000
    duration: 1000
  },
  postgameRewards: {
    name: "postgameRewards",
    // duration: 10000
    duration: 1000
  }
};
Game.minigames = [
  {
    name: "Red Light Green Light",
    instructions: "Run as far as possible by tapping, but stop running when you see the Red Light, which causes you to move backward.",
  },
  {
    name: "Block Blaster",
    instructions: "Tap blocks to score points. Be fast! Other players are gunning for the same blocks.",
  },
  {
    name: "Block.io",
    instructions: "Eat the smaller blocks while avoiding the bigger ones."
  },
  {
    name: "Fastest Finger",
    instructions: "Click as fast as possible to score points. But watch out for the STOP sign, which will deduct points if you click while it's showing.",
  },
  {
    name: "Flappy Flock",
    instructions: "tap to flap"
  },
  {
    name: "Block Party",
    instructions: "coming soon",
  },
  {
    name: "Vector Arena",
    instructions: "coming soon",
  }
];
Game.modes = [
  {
    name: "Free For All",
    instructions: "It’s every player for themself. Leaderboard points are rewarded based on your performance compared to other competitors. Score as many points as you can.",
  },
  {
    name: "Red Vs Blue",
    instructions: "It's red against blue.",
  },
  {
    name: "1 Vs 100",
    instructions: "One super player vs the rest",
  },
  {
    name: "Teams",
    instructions: "team up with your friends and compete",
  },
  {
    name: "Player Vs Enemy",
    instructions: "it's everyone against the bots",
  }
];

module.exports = Game;