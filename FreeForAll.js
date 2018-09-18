const firebase = require('firebase-admin');

module.exports = class FreeForAll {
  construtor() {
    this.teams = [];
  }

  setupTeams(teams) {
    this.teams = [];
  }

  setScore(scoreboard, playerId, score) {
    if(!scoreboard[playerId]) {
      scoreboard[playerId] = 0;
    }
    scoreboard[playerId] = score;
    firebase.database().ref('game/scoreboard/' + playerId).set(scoreboard[playerId]);
  }

  updateScoreboard(scoreboard, playerId, score) {
    if(!scoreboard[playerId]) {
        scoreboard[playerId] = 0;
    }
    scoreboard[playerId] += score;
    firebase.database().ref('game/scoreboard/' + playerId).set(scoreboard[playerId]);
  }

  updateLeaderboard(leaderboard) {
    firebase.database().ref('game/scoreboard').orderByValue().once('value', snapshot => {
        var points = 1;
        snapshot.forEach(score => {
            if(!leaderboard[score.key]) {
                leaderboard[score.key] = 0;
            }
            leaderboard[score.key] += points++;
        });
        firebase.database().ref('game/leaderboard').set(leaderboard);
    });
  }
}