const Config = require('./MultiRoundConfiguration');

class LeaderboardsManager {
    constructor() {
        this.leaderboards = {
            timeAttackItems: [],
            survivalItems: []
        }
    }

    submitResults(mode, id, score) {
        const items = mode === Config.modes.timeAttack ? this.leaderboards.timeAttackItems : this.leaderboards.survivalItems;
        const index = items.findIndex(value => value.id === id);
        if(index !== -1) {
            if(score > items[index].score) {
                items[index].score = score;
                console.log('Updated leaderboard item:');
                console.log(items[index]);
            }
        }
        else {
            const length = items.push({ id: id, score: score});
            console.log('Added leaderboard item:');
            console.log(items[length - 1]);
        }

        // Sort the leaderboard in descending order
        items.sort((a, b) => a.score - b.score);
        items.reverse();
    }
}

module.exports = LeaderboardsManager;