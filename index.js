const socketManager = require('./SocketManager');
const webAppManager = require('./WebAppManager');
const GameManager = require('./MultiRoundGameManager');
const ResultsManager = require('./ResultsManager');
const ScoreboardManager = require('./ScoreboardManager');
const LeaderboardsManager = require('./LeaderboardsManager');
const ChatManager = require('./ChatManager');

webAppManager.initialize();
socketManager.initialize(webAppManager);

let leaderboardsManager = new LeaderboardsManager();
let resultsManager = new ResultsManager(leaderboardsManager);
let scoreboardManager = new ScoreboardManager();
let gameManager = new GameManager(resultsManager, scoreboardManager);
let chatManager = new ChatManager(socketManager);

webAppManager.setupRoutes(gameManager, resultsManager, scoreboardManager, leaderboardsManager);
socketManager.setupEventHandlers(chatManager);