const Config = require('./MultiRoundConfiguration');

class PersistentLeaderboardsManager {
    constructor() {
        this.leaderboard = {
            timeAttackItems: [],
            survivalItems: []
        }
    }

    submitScore(mode, id, score) {
        const items = mode === Config.modes.timeAttack ? this.leaderboard.timeAttackItems : this.leaderboard.survivalItems;
        const index = items.findIndex(value => value.id === id);
        if(index !== -1) {
            if(score > items[index].score) {
                items[index].score = score;
                console.log('Updated persistent leaderboard score:');
                console.log(items[index]);
            }
        }
        else {
            const length = items.push({ id: id, score: score});
            console.log('Added new persistent leaderboard score:');
            console.log(items[length - 1]);
        }

        // Sort the leaderboard in descending order
        items.sort((a, b) => a.score - b.score);
        items.reverse();
    }
}

module.exports = PersistentLeaderboardsManager;