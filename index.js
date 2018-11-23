const socketManager = require('./SocketManager');
const webAppManager = require('./WebAppManager');
const GameManager = require('./SimpleGameManager');
const ScoreboardManager = require('./ScoreboardManager');

webAppManager.initialize();
socketManager.initialize(webAppManager);

let scoreboardManager = new ScoreboardManager();
let gameManager = new GameManager(scoreboardManager);

webAppManager.setupRoutes(gameManager, scoreboardManager);