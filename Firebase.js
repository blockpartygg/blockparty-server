const firebase = require('firebase-admin');
const serviceAccountDevelopment = require('./firebaseServiceAccountDevelopment.json');
const serviceAccountProduction = require('./firebaseServiceAccountProduction.json');

class Firebase {
    constructor() {}

    initialize() {
        let serviceAccount;
        let databaseURL;
        if(process.env.NODE_ENV === 'production') {
            serviceAccount = serviceAccountProduction;
            databaseURL = "https://blockparty-production.firebaseio.com";
        }
        else {
            serviceAccount = serviceAccountDevelopment;
            databaseURL = "https://blockparty-development.firebaseio.com"
        }
        firebase.initializeApp({
            credential: firebase.credential.cert(serviceAccount),
            databaseURL: databaseURL
        });
    }

    // Database

    get database() {
        return firebase.database();
    }

    get timestamp() {
        return firebase.database.ServerValue.TIMESTAMP;
    }
}

fire = new Firebase();

module.exports = fire;