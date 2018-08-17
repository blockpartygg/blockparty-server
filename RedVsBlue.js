const firebase = require('firebase-admin');

module.exports = class RedVsBlue {
  constructor() {
    this.teams = [];
  }

  setupTeams(teams) {
    let players = [];
    let isOnRedTeam = true;
    this.teams = [];
    this.teams["redTeamId"] = [];
    this.teams["blueTeamId"] = [];
    firebase.database().ref('game/teams').remove();
    firebase.database().ref('players').once('value', snapshot => {      
      snapshot.forEach(player => {
        if(!player.val().playing || player.key === "redTeamId" || player.key === "blueTeamId") {
          return;
        }
        players.push(player.key);
      });

      let index = 0;
      let indexToSwap = 0;
      let temp = null;

      for(index = players.length - 1; index > 0; index--) {
        indexToSwap = Math.floor(Math.random() * (index + 1));
        temp = players[index];
        players[index] = players[indexToSwap];
        players[indexToSwap] = temp;
      }

      players.forEach(player => {
        let team = isOnRedTeam ? "redTeamId" : "blueTeamId";
        isOnRedTeam = !isOnRedTeam;
        this.teams[team].push(player);
      });
      console.log(this.teams);
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