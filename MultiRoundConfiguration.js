Configuration = {
    states: {
      pregame: {
        id: "pregame",
        duration: 180000
        // duration: 3000
      },
      roundSetup: {
        id: "roundSetup",
        duration: 10000
        // duration: 3000
      },
      preMinigame: {
        id: "preMinigame",
        duration: 3000
      },
      inMinigame: {
        id: "inMinigame",
        duration: 120000,
        // duration: 3000
      },
      postMinigame: {
        id: "postMinigame",
        duration: 3000
      },
      roundResults: {
        id: "roundResults",
        duration: 10000
        // duration: 3000
      },
      scoreboard: {
        id: "scoreboard",
        duration: 10000
        // duration: 3000
      },
      postgame: {
        id: "postgame",
        duration: 10000
        // duration: 3000
      }
    },
    modes: {
      timeAttack: "timeAttack",
      survival: "survival",
    },
    roundCount: 5,
  }

  module.exports = Configuration;