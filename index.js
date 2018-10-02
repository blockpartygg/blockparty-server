const firebase = require('./Firebase');
const socketManager = require('./SocketManager');
const playerManager = require('./PlayerManager');
const GameManager = require('./GameManager');

firebase.initialize();
socketManager.initialize();
playerManager.initialize();

let game = new GameManager();