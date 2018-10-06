const firebase = require('./Firebase');

class PlayerManager {
    initialize() {
        this._players = [];

        firebase.database.ref('players').on('child_added', snapshot => {
            this._players[snapshot.key] = snapshot.val();
        });

        firebase.database.ref('players').on('child_removed', snapshot => {
            this._players[snapshot.key] = null;
        });

        firebase.database.ref('players').on('child_changed', snapshot => {
            this._players[snapshot.key].socketId = snapshot.val().socketId;
        });
    }

    writeState() {
        firebase.database.ref('players').update(this._players);
    }

    getPlayerBySocketId(socketId) {
        const player = this._players.find(player => player.socketId === socketId);
        return player;
    }

    getPlayerIdBySocketId(socketId) {
        const playerId = this._players.findIndex(player => player.socketId === socketId);
        return playerId;
    }
}

playerManager = new PlayerManager();

module.exports = playerManager;