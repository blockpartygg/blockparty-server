const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const Config = require('./MultiRoundConfiguration');

class WebAppManager {
    initialize() {
        this.app = express();
        this.app.use(cors());
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use(bodyParser.json());
    }

    setupRoutes(gameManager, scoreboardManager, leaderboardManager) {
        this.app.get('/config', function(request, response) {
            response.send(Config);
        });

        this.app.get('/game', function(request, response) {
            response.send(gameManager.game);
        });

        this.app.post('/score', function(request, response) {
            scoreboardManager.addScore(request.body.id, parseInt(request.body.score));
            response.json({ message: "Score created" });
        });

        this.app.get('/scoreboard', function(request, response) {
            response.send(scoreboardManager.scoreboard);
        });

        this.app.get('/leaderboard', function(request, response) {
            response.send(leaderboardManager.leaderboard);
        });

        this.app.get('/ping', function(request, response) {
            response.send("pong");
        });
    }
}

webAppManager = new WebAppManager();

module.exports = webAppManager;