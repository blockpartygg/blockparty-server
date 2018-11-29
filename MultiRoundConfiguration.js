Configuration = {
    states: {
      pregame: {
        id: "pregame",
        duration: 180000
      },
      preRound: {
        id: "preRound",
        duration: 10000
      },
      preMinigame: {
        id: "preMinigame",
        duration: 3000
      },
      inMinigame: {
        id: "inMinigame",
        duration: 120000,
      },
      postMinigame: {
        id: "postMinigame",
        duration: 3000
      },
      scoreboard: {
        id: "scoreboard",
        duration: 10000
      },
      leaderboard: {
        id: "leaderboard",
        duration: 10000
      },
      postgame: {
        id: "postgame",
        duration: 10000
      }
    },
    modes: {
      timeAttack: "timeAttack",
      survival: "survival",
    },
    roundCount: 5,
  }

  module.exports = Configuration;