class ResultsManager {
    constructor(leaderboardsManager) {
        this.results = {
            items: []
        };
        this.leaderboardsManager = leaderboardsManager;
    }

    clear() {
        this.results.items = [];
        //this.addBotResults();
    }

    addResults(mode, id, score) {
        const length = this.results.items.push({ id: id, score: score });

        // Submit results to the leaderboard
        this.leaderboardsManager.submitResults(mode, id, score);
        
        console.log("Added results item:");
        console.log(this.results.items[length - 1]);
        this.results.items.sort((a, b) => a.score - b.score);
        this.results.items.reverse();
    }

    addBotResults() {
        this.addResults("timeAttack", "Brodsky", Math.floor(Math.random() * 10000));
        this.addResults("timeAttack", "Kennychuck", Math.floor(Math.random() * 10000));
        this.addResults("timeAttack", "PrincessLeigha", Math.floor(Math.random() * 10000));
        this.addResults("timeAttack", "Cginntonic", Math.floor(Math.random() * 10000));
        this.addResults("timeAttack", "UnicornDisaster", Math.floor(Math.random() * 10000));
        this.addResults("timeAttack", "CMoneyTruDat", Math.floor(Math.random() * 10000));
        this.addResults("timeAttack", "Doc4bz", Math.floor(Math.random() * 10000));
        this.addResults("timeAttack", "IMightBeMatt", Math.floor(Math.random() * 10000));
        this.addResults("timeAttack", "Gltovar", Math.floor(Math.random() * 10000));
        this.addResults("timeAttack", "Ryze", Math.floor(Math.random() * 10000));
        this.addResults("timeAttack", "Tryndamere", Math.floor(Math.random() * 10000));
        this.addResults("timeAttack", "Greekinese", Math.floor(Math.random() * 10000));
        this.addResults("timeAttack", "dGon", Math.floor(Math.random() * 10000));
        this.addResults("timeAttack", "MikeBauer", Math.floor(Math.random() * 10000));
        this.addResults("timeAttack", "MetalWren", Math.floor(Math.random() * 10000));
        this.addResults("timeAttack", "SolidSnake", Math.floor(Math.random() * 10000));
        this.addResults("timeAttack", "MamaG", Math.floor(Math.random() * 10000));
        this.addResults("timeAttack", "BoxedWine", Math.floor(Math.random() * 10000));
        this.addResults("timeAttack", "JamaicanMeCrazy", Math.floor(Math.random() * 10000));
        this.addResults("timeAttack", "TheOnlyTenISee", Math.floor(Math.random() * 10000));
        this.addResults("timeAttack", "YourFaceIsABlockParty", Math.floor(Math.random() * 10000));
        this.addResults("timeAttack", "LifeIsAParty", Math.floor(Math.random() * 10000));
        this.addResults("timeAttack", "ImRonBurgandy", Math.floor(Math.random() * 10000));
        this.addResults("timeAttack", "JaneDoh!", Math.floor(Math.random() * 10000));
        this.addResults("timeAttack", "LadyLisaOfKang", Math.floor(Math.random() * 10000));
        this.addResults("timeAttack", "Bearcat", Math.floor(Math.random() * 10000));
        this.addResults("timeAttack", "Nomez", Math.floor(Math.random() * 10000));
        this.addResults("timeAttack", "Soozalooze", Math.floor(Math.random() * 10000));
        this.addResults("timeAttack", "DeNice", Math.floor(Math.random() * 10000));
        this.addResults("timeAttack", "Ahleeseah", Math.floor(Math.random() * 10000));
        this.addResults("timeAttack", "JMGoins", Math.floor(Math.random() * 10000));
        this.addResults("timeAttack", "TheExecutive", Math.floor(Math.random() * 10000));
        this.addResults("timeAttack", "BlackFriday", Math.floor(Math.random() * 10000));
        this.addResults("timeAttack", "Artemis", Math.floor(Math.random() * 10000));
        this.addResults("timeAttack", "Parzival", Math.floor(Math.random() * 10000));
        this.addResults("timeAttack", "FightClubAlum", Math.floor(Math.random() * 10000));
        this.addResults("timeAttack", "LeeroyJenkins", Math.floor(Math.random() * 10000));
        this.addResults("timeAttack", "Anorak", Math.floor(Math.random() * 10000));
        this.addResults("timeAttack", "Aech", Math.floor(Math.random() * 10000));
        this.addResults("timeAttack", "Og", Math.floor(Math.random() * 10000));
        this.addResults("timeAttack", "Daito", Math.floor(Math.random() * 10000));
        this.addResults("timeAttack", "Shoto", Math.floor(Math.random() * 10000));
        this.addResults("timeAttack", "Crono", Math.floor(Math.random() * 10000));
        this.addResults("timeAttack", "Cloud", Math.floor(Math.random() * 10000));
        this.addResults("timeAttack", "Faker", Math.floor(Math.random() * 10000));
    }
}

module.exports = ResultsManager;