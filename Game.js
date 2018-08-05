const firebase = require('firebase-admin');
const FastestFinger = require('./FastestFinger');
const WhackABlock = require('./WhackABlock');
const FreeForAll = require('./FreeForAll');
const RedVsBlue = require('./RedVsBlue');

class Game {
  constructor() {
    // public state
    this.state = "";
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

  setPregameState() {
    // set state
    this.state = Game.states.pregame.name;
    this.endTime = new Date(Date.now() + Game.states.pregame.duration);
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
    setTimeout(() => { this.setLobbyState(); }, Game.states.pregame.duration);
  }

  setLobbyState() {
    // set state
    this.state = Game.states.lobby.name;
    this.endTime = new Date(Date.now() + Game.states.lobby.duration);
    this.round++;
    this.minigame = Math.random() > 0.5 ? Game.minigames.fastestFinger : Game.minigames.whackABlock; 
    this.mode = Math.random() > 0.5 ? Game.modes.freeForAll : Game.modes.redVsBlue;
    
    // set minigame.teams here
    if(this.mode === Game.modes.freeForAll) {
        this.currentMode = new FreeForAll();
    }
    else if(this.mode === Game.modes.redVsBlue) {
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
        endTime: this.endTime,
        round: this.round,
        minigame: this.minigame,
        mode: this.mode,
        teams: this.teams,
        scoreboard: this.scoreboard,
        commands: this.commands,
    });

    // start the countdown to the minigame state
    setTimeout(() => { this.setMinigameState(); }, Game.states.lobby.duration);
  }

  setMinigameState() {
    // set state
    this.state = Game.states.minigame.name;
    this.endTime = new Date(Date.now() + Game.states.minigame.duration);
    
    // set private game state
    if(this.minigame === Game.minigames.fastestFinger) {
        this.currentMinigame = new FastestFinger(this.currentMode, this.scoreboard);
    }
    else if(this.minigame === Game.minigames.whackABlock) {
        this.currentMinigame = new WhackABlock(this.currentMode, this.scoreboard);
    }

    // log state to the console
    this.logState();

    // send state to the database
    firebase.database().ref('game').update({
        state: this.state,
        endTime: this.endTime
    });

    // setup command listener
    firebase.database().ref('game/commands').on('child_added', snapshot => { this.currentMinigame.handleCommandAdded(snapshot); });

    // start the minigame update interval, updating 60 times per second (tweak this as needed)
    this.minigameUpdateTimer = setInterval(() => { this.currentMinigame.update(); }, 1000 / 60);

    // start the countdown to the results state
    setTimeout(() => { this.setResultsState(); }, Game.states.minigame.duration);
  }

  setResultsState() {
    // set game state
    this.state = Game.states.results.name;
    this.endTime = new Date(Date.now() + Game.states.results.duration);

    // update the leaderboard
    this.currentMode.updateLeaderboard(this.leaderboard);

    // log state to the console
    this.logState();

    // send state to the database
    firebase.database().ref('game').update({ state: this.state, endTime: this.endTime });

    // turn off command event listener
    firebase.database().ref('game/commands').off();

    // stop the game update interval
    clearInterval(this.minigameUpdateTimer);

    if(this.round < 5) {
        // start the countdown to the lobby
        setTimeout(() => { this.setLobbyState(); }, Game.states.results.duration);
    }
    else {
        // start the countdown to the postgame
        setTimeout(() => { this.setPostgameState(); }, Game.states.results.duration);
    }
  }

  setPostgameState() {
    // set game state
    this.state = Game.states.postgame.name;
    this.endTime = new Date(Date.now() + Game.states.postgame.duration);

    this.logState();

    // send state to the database
    firebase.database().ref('game').update({ state: this.state, endTime: this.endTime });

    // start the countdown to the pregame
    setTimeout(() => { this.setPregameState(); }, Game.states.postgame.duration)
  }
}
Game.states = {
  pregame: {
    name: "pregame",
    duration: 5000
  },
  lobby: {
    name: "lobby",
    duration: 5000
  },
  minigame: {
    name: "minigame",
    duration: 30000
  },
  results: {
    name: "results",
    duration: 5000
  },
  postgame: {
    name: "postgame",
    duration: 5000
  }
};
Game.minigames = {
  fastestFinger: "fastestFinger",
  whackABlock: "whackABlock",
  blockParty: "blockParty",
  vectorArena: "vectorArena"
};
Game.modes = {
  freeForAll: "freeForAll",
  redVsBlue: "redVsBlue",
  oneVsOneMillion: "OneVsOneMillion",
  teams: "teams",
  playerVsEnemy: "playerVsEnemy"
};

module.exports = Game;