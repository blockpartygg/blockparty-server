const firebase = require('firebase-admin');
const firebaseServiceAccount = require('./firebaseServiceAccount.json');
const Game = require('./Game');

// initialize firebase
firebase.initializeApp({
    credential: firebase.credential.cert(firebaseServiceAccount),
    databaseURL: "https://blockparty-production.firebaseio.com"
});

var game = new Game();
game.setPregameState();