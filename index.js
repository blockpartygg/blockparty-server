const firebase = require('firebase-admin');
const firebaseServiceAccount = require('./firebaseServiceAccount.json');

// initialize firebase
firebase.initializeApp({
    credential: firebase.credential.cert(firebaseServiceAccount),
    databaseURL: "https://blockparty-production.firebaseio.com"
});

const clockStates = {
    pregame: "pregame",
    game: "game",
    postgame: "postgame"
};

const stateDurations = {
    pregame: 5000,
    game: 30000,
    postgame: 5000
};

var clock = {
    state: clockStates.pregame,
    startTime: null,
    endTime: null
};

var game = {
    clicks: [],
    scores: [],
    scoring: true
}

var updateTimer;
var stopTime = Date.now();
var goTime = Date.now();

// logging helpers

var logClockState = () => {
    console.log(`clock: [ state: ${clock.state}, startTime: ${clock.startTime}, endTime: ${clock.endTime} ]`);
};

var logGameState = () => {
    console.log(`game: [ clicks: ${game.clicks}, scores: ${game.scores}, scoring: ${game.scoring} ]`);
};

var logGameScoringState = () => {
    console.log(`game.scoring: ${game.scoring}`);
}

firebase.database().ref('game/clicks').on('child_added', snapshot => {
    if(!game.scores[snapshot.val()]) {
        game.scores[snapshot.val()] = 0;
    }
    if(scoring) {
        game.scores[snapshot.val()] += 1000;
    }
    else {
        game.scores[snapshot.val()] -= 3000;
    }
    firebase.database().ref('game/scores').child(snapshot.val()).set(scores[snapshot.val()]);
});

var setPregameState = () => {
    // set clock and game state
    clock.state = clockStates.pregame;
    clock.startTime = new Date(Date.now());
    clock.endTime = new Date(Date.now() + stateDurations.pregame);
    game.clicks = [];
    game.scores = [];
    game.scoring = true;

    // log state to the console
    logClockState();
    logGameState();

    // send state to the database
    firebase.database().ref('clock').update({ state: clock.state, startTime: clock.startTime, endTime: clock.endTime });
    firebase.database().ref('game').update({ clicks: game.clicks, scores: game.scores, scoring: game.scoring });

    // start the countdown to the game
    setTimeout(() => { setGameState(); }, stateDurations.pregame);
};

var setGameState = () => {
    // set clock state
    clock.state = clockStates.game;
    clock.startTime = new Date(Date.now());
    clock.endTime = new Date(Date.now() + stateDurations.game);

    // set private game state
    goTime = Date.now();
    stopTime = Date.now();

    // log state to the console
    logClockState();

    // send state to the database
    firebase.database().ref('clock').update({ state: clock.state, startTime: clock.startTime, endTime: clock.endTime });

    // start the countdown to the postgame
    setTimeout(() => { setPostgameState(); }, stateDurations.game);

    // start the game update interval, updating once per second (tweak this as needed)
    updateTimer = setInterval(() => { updateGame(); }, 1000 / 1);
};

var setPostgameState = () => {
    // set clock state
    clock.state = clockStates.postgame;
    clock.startTime = new Date(Date.now());
    clock.endTime = new Date(Date.now() + stateDurations.postgame);

    // log state to the console
    logClockState();

    // send state to the database
    firebase.database().ref('clock').update({ state: clock.state, startTime: clock.startTime, endTime: clock.endTime });

    // start the countdown to the pregame
    setTimeout(() => { setPregameState(); }, stateDurations.postgame);

    // stop the game update interval
    clearInterval(updateTimer);
};

var updateGame = () => {
    if(game.scoring && Date.now() - goTime >= 3000 && Math.random() >= 0.995) {
        game.scoring = false;
        logGameScoringState();
        firebase.database().ref('game/scoring').set(game.scoring);
        stopTime = Date.now();
    }
    
    if(!game.scoring && Date.now() - stopTime >= 3000 && Math.random() >= 0.99) {
        game.scoring = true;
        logGameScoringState();
        firebase.database().ref('game/scoring').set(game.scoring);
        goTime = Date.now();
    }
};

setPregameState();