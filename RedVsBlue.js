const firebase = require('firebase-admin');

module.exports = class RedVsBlue {
  constructor(game) {
    this.game = game;

    this.setupTeams();
  }

  setupTeams(teams) {
    let players = [];
    let isOnRedTeam = true;
    this.teams = [];
    this.teams["redTeamId"] = [];
    this.teams["blueTeamId"] = [];
    this.scores = [];
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
        this.teams[team][player] = true;
      });
      this.game.teams = this.teams;
    });
  }

  setScore(scoreboard, playerId, score) {
    if(!scoreboard[playerId]) {
      scoreboard[playerId] = 0;
    }
    scoreboard[playerId] = score;

    let teamId;
    if(this.teams["redTeamId"][playerId]) {
        teamId = "redTeamId";
    } else if(this.teams["blueTeamId"][playerId]) {
        teamId = "blueTeamId";
    }

    let teamScore = 0;
    const playerIds = Object.keys(this.teams[teamId]);
    playerIds.forEach(playerId => {
      if(scoreboard[playerId]) {
        teamScore += scoreboard[playerId];
      }
    });
    scoreboard[teamId] = teamScore;
    
    firebase.database().ref('game/scoreboard/' + teamId).set(teamScore);
  }

  incrementScore(scoreboard, playerId, score) {
    let teamId;
    if(this.teams["redTeamId"][playerId]) {
        teamId = "redTeamId";
    } else if(this.teams["blueTeamId"][playerId]) {
        teamId = "blueTeamId";
    }

    if(!scoreboard[teamId]) {
      scoreboard[teamId] = 0;
    }
    scoreboard[teamId] += score;
    firebase.database().ref('game/scoreboard/' + teamId).set(this.scoreboard[teamId]);
  }

  updateLeaderboard(leaderboard) {
    firebase.database().ref('game/scoreboard').orderByValue().limitToLast(1).once('value', snapshot => {
      let winningTeamId;
      if(snapshot.val() && snapshot.val().redTeamId) {
        winningTeamId = "redTeamId";
      } else {
        winningTeamId = "blueTeamId";
      }
      const redTeamCount = Object.keys(this.teams["redTeamId"]).length;
      const blueTeamCount = Object.keys(this.teams["blueTeamId"]).length
      const playerCount = redTeamCount + blueTeamCount;
      let totalPoints = playerCount * (playerCount + 1) / 2;
      let pointsToSplit = Math.floor(totalPoints / (winningTeamId === "redTeamId" ? redTeamCount : blueTeamCount));
      const playerIds = Object.keys(this.teams[winningTeamId]);
      playerIds.forEach(playerId => {
        if(playerId === "redTeamId" || playerId === "blueTeamId") {
            return;
        }
        if(!leaderboard[playerId]) {
            leaderboard[playerId] = 0;
        } 
        leaderboard[playerId] += pointsToSplit;
      });
      firebase.database().ref('game/leaderboard').set(leaderboard);
    });
  }
}