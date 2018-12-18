class ScoreboardManager {
  constructor() {
    this.scoreboard = {
      items: []
    }
  }

  clear() {
    this.scoreboard.items = [];
  }

  rewardPoints(resultsManager) {
    // Precondition: Assumes results are already sorted in descending order
    let points = resultsManager.results.items.length;
    for(let resultsIndex = 0; resultsIndex < resultsManager.results.items.length; resultsIndex++) {
      const scoreboardIndex = this.scoreboard.items.findIndex(item => item.id === resultsManager.results.items[resultsIndex].id);
      if(scoreboardIndex !== -1) {
        this.setItem(this.scoreboard.items[scoreboardIndex].id, this.scoreboard.items[scoreboardIndex].score + points--);
      }
      else {
        this.setItem(resultsManager.results.items[resultsIndex].id, points--);
      }
    }
    this.scoreboard.items.sort((a, b) => a.score - b.score);
    this.scoreboard.items.reverse();
  }

  setItem(id, score) {
    const index = this.scoreboard.items.findIndex(value => value.id === id);
    if(index !== -1) {
        this.scoreboard.items[index].score = score;
        console.log("Updated scoreboard item:");
        console.log(this.scoreboard.items[index]);
    }
    else {
        const length = this.scoreboard.items.push({ id: id, score: score });
        console.log("Added scoreboard item:");
        console.log(this.scoreboard.items[length - 1]);
    }
  }
}

module.exports = ScoreboardManager;