const socketManager = require('./SocketManager');
const webAppManager = require('./WebAppManager');
const GameManager = require('./MultiRoundGameManager');
const ScoreboardManager = require('./ScoreboardManager');
const LeaderboardManager = require('./LeaderboardManager');
const DailyLeaderboardManager = require('./DailyLeaderboardManager');
const ChatManager = require('./ChatManager');

webAppManager.initialize();
socketManager.initialize(webAppManager);

let dailyLeaderboardManager = new DailyLeaderboardManager();
let scoreboardManager = new ScoreboardManager(dailyLeaderboardManager);
let leaderboardManager = new LeaderboardManager();
let gameManager = new GameManager(scoreboardManager, leaderboardManager);
let chatManager = new ChatManager(socketManager);

webAppManager.setupRoutes(gameManager, scoreboardManager, leaderboardManager, dailyLeaderboardManager);
socketManager.setupEventHandlers(chatManager);