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

    setupRoutes(gameManager, resultsManager, scoreboardManager, leaderboardsManager) {
        this.app.get('/config', function(request, response) {
            response.send(Config);
        });

        this.app.get('/game', function(request, response) {
            response.send(gameManager.game);
        });

        this.app.post('/results', function(request, response) {
            resultsManager.addResults(gameManager.game.mode, request.body.id, parseInt(request.body.score));
            response.json({ message: "Results created" });
        });

        this.app.get('/results', function(request, response) {
            response.send(resultsManager.results);
        });

        this.app.get('/scoreboard', function(request, response) {
            response.send(scoreboardManager.scoreboard);
        });

        this.app.get('/leaderboards', function(request, response) {
            response.send(leaderboardsManager.leaderboards);
        });

        this.app.get('/ping', function(request, response) {
            response.send("pong");
        });
    }
}

webAppManager = new WebAppManager();

module.exports = webAppManager;