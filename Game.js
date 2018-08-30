const firebase = require('firebase-admin');
const FastestFinger = require('./FastestFinger');
const WhackABlock = require('./WhackABlock');
const FlappyFlock = require('./FlappyFlock');
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

  setPregameState() {
    // set state
    this.state = Game.states.pregame.name;
    this.startTime = new Date(Date.now());
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
    setTimeout(() => { this.setLobbyState(); }, Game.states.pregame.duration);
  }

  setLobbyState() {
    // set state
    this.state = Game.states.lobby.name;
    this.startTime = new Date(Date.now());
    this.endTime = new Date(Date.now() + Game.states.lobby.duration);
    this.round++;
    this.minigame = Game.minigames[Math.floor(Math.random() * 4)];
    this.mode = Game.modes[Math.floor(Math.random() * 2)];
    
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

    // start the countdown to the minigame state
    setTimeout(() => { this.setMinigameState(); }, Game.states.lobby.duration);
  }

  setMinigameState() {
    // set state
    this.state = Game.states.minigame.name;
    this.startTime = new Date(Date.now());
    this.endTime = new Date(Date.now() + Game.states.minigame.duration);
    
    // set private game state
    if(this.minigame === Game.minigames[0]) {
        this.currentMinigame = new FastestFinger(this.currentMode, this.scoreboard);
    }
    else if(this.minigame === Game.minigames[1]) {
        this.currentMinigame = new WhackABlock(this.currentMode, this.scoreboard);
    }
    else if(this.minigame === Game.minigames[2]) {
      this.currentMinigame = new FlappyFlock(this.currentMode, this.scoreboard);
    }
    else if(this.minigame === Game.minigames[3]) {
      this.currentMinigame = new NomNom(this.currentMode, this.scoreboard);
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

    // start the countdown to the results state
    setTimeout(() => { this.setResultsState(); }, Game.states.minigame.duration);
  }

  setResultsState() {
    // set game state
    this.state = Game.states.results.name;
    this.startTime = new Date(Date.now());
    this.endTime = new Date(Date.now() + Game.states.results.duration);

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
    this.startTime = new Date(Date.now());
    this.endTime = new Date(Date.now() + Game.states.postgame.duration);

    this.logState();

    // send state to the database
    firebase.database().ref('game').update({ 
      state: this.state, 
      startTime: this.startTime,
      endTime: this.endTime });

    // start the countdown to the pregame
    setTimeout(() => { this.setPregameState(); }, Game.states.postgame.duration)
  }
}
Game.states = {
  pregame: {
    name: "pregame",
    duration: 10000
  },
  lobby: {
    name: "lobby",
    duration: 10000
  },
  minigame: {
    name: "minigame",
    duration: 30000
  },
  results: {
    name: "results",
    duration: 15000
  },
  postgame: {
    name: "postgame",
    duration: 10000
  }
};
Game.minigames = [
  {
    name: "Fastest Finger",
    instructions: "Click as fast as possible to score points. But watch out for the STOP sign, which will deduct points if you click while it's showing.",
  },
  {
    name: "Whack-a-Block",
    instructions: "whack dem blocks",
  },
  {
    name: "Flappy Flock",
    instructions: "tap to flap"
  },
  {
    name: "Nom nom",
    instructions: "You're a sphere. Eat smaller ones. Avoid bigger ones."
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
    instructions: "It’s every player for themself. Medals are rewarded based on your performance compared to other competitors. Score as many points as you can.",
  },
  {
    name: "Red Vs Blue",
    instructions: "It's red against blue.",
  },
  {
    name: "One Vs One Million",
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