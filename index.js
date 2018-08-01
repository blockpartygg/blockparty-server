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
    postminigame: 5000,
    postgame: 5000
};

var minigames = [
    "fastestFinger"
];

var gameModes = [
    "freeForAll",
    "redVsBlue"
];

var currentGameMode = 0;

var game = {
    state: gameStates.pregame,
    stateEndTime: null,
    round: 0,
    minigame: "",
    mode: "",
    leaderboard: [],
    scoreboard: [],
    clicks: [],
    penalty: false
};

var teams = [];

var updateTimer;
var stopTime = Date.now();
var goTime = Date.now();

// logging helpers

var logGameState = () => {
    console.log('game: { state:', game.state, 
        ', stateEndTime:', game.stateEndTime, 
        ', round:', game.round, 
        ', minigame:', game.minigame,
        ', mode:', game.mode,
        '}'
    );
};

firebase.database().ref('game/clicks').on('child_added', snapshot => {
    if(game.state === gameStates.minigame) {
        let playerId = snapshot.val();
        let scoreId;
        if(game.mode === 'redVsBlue') {
            if(teams["redTeamId"].players.includes(playerId.toString())) {
                scoreId = "redTeamId";
            } else if(teams["blueTeamId"].players.includes(playerId.toString())) {
                scoreId = "blueTeamId";
            }
        }
        else {
            scoreId = playerId;
        }
        
        if(!game.scoreboard[scoreId]) {
            game.scoreboard[scoreId] = 0;
        }
        if(!game.penalty) {
            game.scoreboard[scoreId] += 1000;
        }
        else {
            game.scoreboard[scoreId] -= 3000;
        }
        firebase.database().ref('game/scoreboard').child(scoreId).set(game.scoreboard[scoreId]);
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
    game.minigame = minigames[Math.floor(Math.random() * minigames.length)];
    //game.mode = gameModes[Math.floor(Math.random() * gameModes.length)];
    game.mode = gameModes[currentGameMode];
    currentGameMode = (currentGameMode + 1) % gameModes.length;
    game.scoreboard = [];
    game.clicks = [];
    game.penalty = false;

    if(game.mode === "redVsBlue") {
        teams = [];
        firebase.database().ref('game/teams').remove();
        firebase.database().ref('players').once('value', snapshot => {
            let isOnRedTeam = true;
            teams["redTeamId"] = {
                players: []
            };
            teams["blueTeamId"] = {
                players: []
            };
            // todo: actually shuffle the list
            snapshot.forEach(player => {
                if(player.key === "redTeamId" || player.key === "blueTeamId") {
                    return;
                }
                let team = isOnRedTeam ? "redTeamId" : "blueTeamId";
                isOnRedTeam = !isOnRedTeam;
                teams[team].players.push(player.key);
            });
            firebase.database().ref('game/teams').set(teams);
        });
    }

    // log state to the console
    logGameState();

    // send state to the database
    firebase.database().ref('game').update({ state: game.state, stateEndTime: game.stateEndTime, round: game.round, minigame: game.minigame, mode: game.mode, scoreboard: game.scoreboard, clicks: game.clicks, penalty: game.penalty });

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
    if(game.mode === 'freeForAll') {
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
    }
    else if(game.mode === 'redVsBlue') {
        firebase.database().ref('game/scoreboard').orderByValue().limitToLast(1).once('value', snapshot => {
            let winningTeamId;
            if(snapshot.val().redTeamId) {
                winningTeamId = "redTeamId";
            } else {
                winningTeamId = "blueTeamId";
            }
            let playerCount = teams["redTeamId"].players.length + teams["blueTeamId"].players.length;
            let totalPoints = playerCount * (playerCount + 1) / 2;
            let pointsToSplit = Math.floor(totalPoints / teams[winningTeamId].players.length);
            teams[winningTeamId].players.forEach(player => {
                if(player === "redTeamId" || player === "blueTeamId") {
                    return;
                }
                if(!game.leaderboard[player]) {
                    game.leaderboard[player] = 0;
                } 
                game.leaderboard[player] += pointsToSplit;
            });
            firebase.database().ref('game/leaderboard').set(game.leaderboard);
        });
    }

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