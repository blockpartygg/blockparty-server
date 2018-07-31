const firebase = require('firebase-admin');
const firebaseServiceAccount = require('./firebaseServiceAccount.json');

// initialize firebase
firebase.initializeApp({
    credential: firebase.credential.cert(firebaseServiceAccount),
    databaseURL: "https://blockparty-production.firebaseio.com"
});

const gameStates = {
    pregame: "pregame",
    preminigame: "preminigame",
    minigame: "minigame",
    postminigame: "postminigame",
    postgame: "postgame"
};

const gameStateDurations = {
    pregame: 5000,
    preminigame: 5000,
    minigame: 5000,
    postminigame: 30000,
    postgame: 5000
};

var game = {
    state: gameStates.pregame,
    stateEndTime: null,
    round: 0,
    leaderboard: [],
    scoreboard: [],
    clicks: [],
    penalty: false
};

var updateTimer;
var stopTime = Date.now();
var goTime = Date.now();

// logging helpers

var logGameState = () => {
    console.log('game: { state: ', game.state, ', stateEndTime: ', game.stateEndTime, ', round: ', game.round, ', leaderboard: ', game.leaderboard, ', scoreboard: ', game.scoreboard, ', clicks: ', game.clicks, ', penalty: ', game.penalty, ' }');
};

firebase.database().ref('game/clicks').on('child_added', snapshot => {
    if(game.state === gameStates.minigame) {
        if(!game.scoreboard[snapshot.val()]) {
            game.scoreboard[snapshot.val()] = 0;
        }
        if(!game.penalty) {
            game.scoreboard[snapshot.val()] += 1000;
        }
        else {
            game.scoreboard[snapshot.val()] -= 3000;
        }
        firebase.database().ref('game/scoreboard').child(snapshot.val()).set(game.scoreboard[snapshot.val()]);
    }
});

var setPregameState = () => {
    // set game state
    game.state = gameStates.pregame;
    game.stateEndTime = new Date(Date.now() + gameStateDurations.pregame);
    game.round = 0;
    game.leaderboard = [];
    game.scoreboard = [];
    game.clicks = [];
    game.penalty = false;

    // log state to the console
    logGameState();

    // send state to the database
    firebase.database().ref('game').update({ state: game.state, stateEndTime: game.stateEndTime, round: game.round, leaderboard: game.leaderboard, scoreboard: game.scoreboard, clicks: game.clicks, penalty: game.penalty });

    // start the countdown to the preminigame
    setTimeout(() => { setPreminigameState(); }, gameStateDurations.pregame);
};

var setPreminigameState = () => {
    // set game state
    game.state = gameStates.preminigame;
    game.stateEndTime = new Date(Date.now() + gameStateDurations.preminigame);
    game.round++;
    game.scoreboard = [];
    game.clicks = [];
    game.penalty = false;

    // log state to the console
    logGameState();

    // send state to the database
    firebase.database().ref('game').update({ state: game.state, stateEndTime: game.stateEndTime, round: game.round, scoreboard: game.scoreboard, clicks: game.clicks, penalty: game.penalty });

    // start the countdown to the game
    setTimeout(() => { setMinigameState(); }, gameStateDurations.preminigame);
};

var setMinigameState = () => {
    // set game state
    game.state = gameStates.minigame;
    game.stateEndTime = new Date(Date.now() + gameStateDurations.minigame);
    
    // set private game state
    goTime = Date.now();
    stopTime = Date.now();

    // log state to the console
    logGameState();

    // send state to the database
    firebase.database().ref('game').update({ state: game.state, stateEndTime: game.stateEndTime });

    // start the countdown to the postgame
    setTimeout(() => { setPostminigameState(); }, gameStateDurations.minigame);

    // start the minigame update interval, updating once per second (tweak this as needed)
    updateTimer = setInterval(() => { updateMinigame(); }, 1000 / 1);
};

var updateMinigame = () => {
    if(game.penalty && Date.now() - goTime >= 3000 && Math.random() >= 0.8) {
        game.penalty = false;
        firebase.database().ref('game/penalty').set(game.penalty);
        stopTime = Date.now();
    }
    
    if(!game.penalty && Date.now() - stopTime >= 3000 && Math.random() >= 0.8) {
        game.penalty = true;
        firebase.database().ref('game/penalty').set(game.penalty);
        goTime = Date.now();
    }

    for(var i = 0; i < 10; i++) {
        if(Math.random() >= 0.5) {
            firebase.database().ref('game/clicks').push(Math.floor(Math.random() * 6));
        }
    }
};

var setPostminigameState = () => {
    // set game state
    game.state = gameStates.postminigame;
    game.stateEndTime = new Date(Date.now() + gameStateDurations.postminigame);

    // update the leaderboard
    firebase.database().ref('game/scoreboard').orderByValue().once('value', snapshot => {
        var points = 1;
        snapshot.forEach(score => {
            if(!game.leaderboard[score.key]) {
                game.leaderboard[score.key] = 0;
            }
            game.leaderboard[score.key] += points++;
        });
        firebase.database().ref('game/leaderboard').set(game.leaderboard);
    });

    // log state to the console
    logGameState();

    // send state to the database
    firebase.database().ref('game').update({ state: game.state, stateEndTime: game.stateEndTime });

    if(game.round < 5) {
        // start the countdown to the preminigame
        setTimeout(() => { setPreminigameState(); }, gameStateDurations.postminigame);
    }
    else {
        // start the countdown to the postgame
        setTimeout(() => { setPostgameState(); }, gameStateDurations.postminigame);
    }

    // stop the game update interval
    clearInterval(updateTimer);
};

var setPostgameState = () => {
    // set game state
    game.state = gameStates.postgame;
    game.stateEndTime = new Date(Date.now() + gameStateDurations.postgame);

    // send state to the database
    firebase.database().ref('game').update({ state: game.state, stateEndTime: game.stateEndTime });

    // start the countdown to the pregame
    setTimeout(() => { setPregameState(); }, gameStateDurations.postgame)
}

setPregameState();