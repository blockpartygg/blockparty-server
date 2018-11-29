const socketManager = require('./SocketManager');
const webAppManager = require('./WebAppManager');
const GameManager = require('./MultiRoundGameManager');
const ScoreboardManager = require('./ScoreboardManager');
const LeaderboardManager = require('./LeaderboardManager');

webAppManager.initialize();
socketManager.initialize(webAppManager);

let scoreboardManager = new ScoreboardManager();
let leaderboardManager = new LeaderboardManager();
let gameManager = new GameManager(scoreboardManager, leaderboardManager);

webAppManager.setupRoutes(gameManager, scoreboardManager, leaderboardManager);