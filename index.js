const socketManager = require('./SocketManager');
const webAppManager = require('./WebAppManager');
const GameManager = require('./MultiRoundGameManager');
const ScoreboardManager = require('./ScoreboardManager');
const LeaderboardManager = require('./LeaderboardManager');
const PersistentLeaderboardsManager = require('./PersistentLeaderboardsManager');
const ChatManager = require('./ChatManager');

webAppManager.initialize();
socketManager.initialize(webAppManager);

let persistentLeaderboardsManager = new PersistentLeaderboardsManager();
let scoreboardManager = new ScoreboardManager(persistentLeaderboardsManager);
let leaderboardManager = new LeaderboardManager();
let gameManager = new GameManager(scoreboardManager, leaderboardManager);
let chatManager = new ChatManager(socketManager);

webAppManager.setupRoutes(gameManager, scoreboardManager, leaderboardManager, persistentLeaderboardsManager);
socketManager.setupEventHandlers(chatManager);