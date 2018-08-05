const firebase = require('firebase-admin');
const firebaseServiceAccountDevelopment = require('./firebaseServiceAccountDevelopment.json');
const firebaseServiceAccountProduction = require('./firebaseServiceAccountProduction.json');
const Game = require('./Game');

// initialize firebase
let serviceAccount;
let databaseURL;
if(process.env.NODE_ENV === 'production') {
  serviceAccount = firebaseServiceAccountProduction;
  databaseURL = "https://blockparty-production.firebaseio.com";
}
else {
  serviceAccount = firebaseServiceAccountDevelopment;
  databaseURL = "https://blockparty-development.firebaseio.com"
}
firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
    databaseURL: databaseURL
});

let game = new Game();
game.setPregameState();