const firebase = require('firebase-admin');

module.exports = class RedVsBlue {
  constructor() {
    this.teams = [];
  }

  setupTeams(teams) {
    this.teams = [];
    firebase.database().ref('game/teams').remove();
    firebase.database().ref('players').once('value', snapshot => {
      let isOnRedTeam = true;
      this.teams["redTeamId"] = [];
      this.teams["blueTeamId"] = [];
      // todo: actually shuffle the list
      snapshot.forEach(player => {
          if(player.key === "redTeamId" || player.key === "blueTeamId") {
              return;
          }
          let team = isOnRedTeam ? "redTeamId" : "blueTeamId";
          isOnRedTeam = !isOnRedTeam;
          this.teams[team].push(player.key);
      });
      firebase.database().ref('game/teams').set(this.teams);
    });
  }

  updateScoreboard(scoreboard, playerId, score) {
    let teamId;
    if(this.teams["redTeamId"].includes(playerId.toString())) {
        teamId = "redTeamId";
    } else if(this.teams["blueTeamId"].includes(playerId.toString())) {
        teamId = "blueTeamId";
    }

    if(!scoreboard[teamId]) {
      scoreboard[teamId] = 0;
    }
    scoreboard[teamId] += score;
    firebase.database().ref('game/scoreboard/' + teamId).set(scoreboard[teamId]);
  }

  updateLeaderboard(leaderboard) {
    firebase.database().ref('game/scoreboard').orderByValue().limitToLast(1).once('value', snapshot => {
      let winningTeamId;
      if(snapshot.val() && snapshot.val().redTeamId) {
          winningTeamId = "redTeamId";
      } else {
          winningTeamId = "blueTeamId";
      }
      let playerCount = this.teams["redTeamId"].length + this.teams["blueTeamId"].length;
      let totalPoints = playerCount * (playerCount + 1) / 2;
      let pointsToSplit = Math.floor(totalPoints / this.teams[winningTeamId].length);
      this.teams[winningTeamId].forEach(player => {
          if(player === "redTeamId" || player === "blueTeamId") {
              return;
          }
          if(!leaderboard[player]) {
              leaderboard[player] = 0;
          } 
          leaderboard[player] += pointsToSplit;
      });
      firebase.database().ref('game/leaderboard').set(leaderboard);
    });
  }
}