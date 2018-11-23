Configuration = {
    states: {
      pregame: {
        id: "pregame",
        duration: 3000
      },
      inGame: {
        id: "inGame",
        duration: 120000,
        // duration: 10000,
      },
      postgame: {
        id: "postgame",
        duration: 3000
      },
      scoreboard: {
        id: "scoreboard",
        duration: 15000
      }
    },
    modes: {
      timeAttack: "timeAttack",
      survival: "survival",
    }
  }

  module.exports = Configuration;