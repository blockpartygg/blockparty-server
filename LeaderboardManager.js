class LeaderboardManager {
  constructor() {
    this.leaderboard = {
      items: []
    }
  }

  clear() {
    this.leaderboard.items = [];
  }

  rewardPoints(scoreboardManager) {
    // Precondition: Assumes scoreboard is already sorted in descending order
    let points = scoreboardManager.scoreboard.items.length;
    for(let scoreboardIndex = 0; scoreboardIndex < scoreboardManager.scoreboard.items.length; scoreboardIndex++) {
      const leaderboardIndex = this.leaderboard.items.findIndex(item => item.id === scoreboardManager.scoreboard.items[scoreboardIndex].id);
      if(leaderboardIndex !== -1) {
        this.setScore(this.leaderboard.items[leaderboardIndex].id, this.leaderboard.items[leaderboardIndex].score + points--);
      }
      else {
        this.setScore(scoreboardManager.scoreboard.items[scoreboardIndex].id, points--);
      }
    }
    this.leaderboard.items.sort((a, b) => a.score - b.score);
    this.leaderboard.items.reverse();
  }

  setScore(id, score) {
    const index = this.leaderboard.items.findIndex(value => value.id === id);
    if(index !== -1) {
        this.leaderboard.items[index].score = score;
        console.log("Set leaderboard score:");
        console.log(this.leaderboard.items[index]);
    }
    else {
        const length = this.leaderboard.items.push({ id: id, score: score });
        console.log("Added leaderboard score:");
        console.log(this.leaderboard.items[length - 1]);
    }
  }
}

module.exports = LeaderboardManager;