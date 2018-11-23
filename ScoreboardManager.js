class ScoreboardManager {
    constructor() {
        this.scoreboard = {
            items: []
        };
    }

    clear() {
        this.scoreboard.items = [];
        this.addScore("Brodsky", Math.floor(Math.random() * 10000));
        this.addScore("Kennychuck", Math.floor(Math.random() * 10000));
        this.addScore("RonSolo", Math.floor(Math.random() * 10000));
        this.addScore("Cginntonic", Math.floor(Math.random() * 10000));
        this.addScore("UnicornDisaster", Math.floor(Math.random() * 10000));
        this.addScore("CMoneyTruDat", Math.floor(Math.random() * 10000));
        this.addScore("Doc4bz", Math.floor(Math.random() * 10000));
        this.addScore("IMightBeMatt", Math.floor(Math.random() * 10000));
        this.addScore("Gltovar", Math.floor(Math.random() * 10000));
        this.addScore("Ryze", Math.floor(Math.random() * 10000));
        this.addScore("Tryndamere", Math.floor(Math.random() * 10000));
        this.addScore("Greekinese", Math.floor(Math.random() * 10000));
        this.addScore("dGon", Math.floor(Math.random() * 10000));
        this.addScore("MikeBauer", Math.floor(Math.random() * 10000));
        this.addScore("MetalWren", Math.floor(Math.random() * 10000));
        this.addScore("SolidSnake", Math.floor(Math.random() * 10000));
        this.addScore("MamaG", Math.floor(Math.random() * 10000));
        this.addScore("BoxedWine", Math.floor(Math.random() * 10000));
        this.addScore("JamaicanMeCrazy", Math.floor(Math.random() * 10000));
        this.addScore("TheOnlyTenISee", Math.floor(Math.random() * 10000));
        this.addScore("YourFaceIsABlockParty", Math.floor(Math.random() * 10000));
        this.addScore("LifeIsAParty", Math.floor(Math.random() * 10000));
        this.addScore("ImRonBurgandy", Math.floor(Math.random() * 10000));
        this.addScore("JaneDoh!", Math.floor(Math.random() * 10000));
        this.addScore("LadyLisaOfKang", Math.floor(Math.random() * 10000));
        this.addScore("Bearcat", Math.floor(Math.random() * 10000));
        this.addScore("Nomez", Math.floor(Math.random() * 10000));
        this.addScore("Soozalooze", Math.floor(Math.random() * 10000));
        this.addScore("DeNice", Math.floor(Math.random() * 10000));
        this.addScore("Ahleeseah", Math.floor(Math.random() * 10000));
        this.addScore("JMGoins", Math.floor(Math.random() * 10000));
        this.addScore("TheExecutive", Math.floor(Math.random() * 10000));
        this.addScore("BlackFriday", Math.floor(Math.random() * 10000));
        this.addScore("Artemis", Math.floor(Math.random() * 10000));
        this.addScore("Parzival", Math.floor(Math.random() * 10000));
    }

    addScore(id, score) {
        const length = this.scoreboard.items.push({ id: id, score: score });
        console.log("Added score:");
        console.log(this.scoreboard.items[length - 1]);
    }
}

module.exports = ScoreboardManager;