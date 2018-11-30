const socketManager = require('./SocketManager');
const webAppManager = require('./WebAppManager');
const GameManager = require('./MultiRoundGameManager');
const ScoreboardManager = require('./ScoreboardManager');
const LeaderboardManager = require('./LeaderboardManager');
const ChatManager = require('./ChatManager');



webAppManager.initialize();
socketManager.initialize(webAppManager);

let scoreboardManager = new ScoreboardManager();
let leaderboardManager = new LeaderboardManager();
let gameManager = new GameManager(scoreboardManager, leaderboardManager);
let chatManager = new ChatManager(socketManager);

webAppManager.setupRoutes(gameManager, scoreboardManager, leaderboardManager);
socketManager.setupEventHandlers(chatManager);