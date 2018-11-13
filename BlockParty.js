const socketManager = require('./SocketManager');

module.exports = class BlockParty {
    constructor(gameManager) {
        this.gameManager = gameManager;

        this.setupPlayers();
        this.setupPlayerListeners();
    }

    setupPlayers() {
        this.players = {};
    }

    setupPlayerListeners() {
        const socketIds = Object.keys(socketManager.sockets);
        socketIds.forEach(socketId => {
            const socket = socketManager.sockets[socketId];
            socket.on('blockParty/scorePoints', (playerId, points) => {
                this.gameManager.mode.incrementScore(this.gameManager.game.scoreboard, playerId, points);
            });
            socket.on('blockParty/receiveChain', (playerId, chainStructure) => {
                const payload = this.calculatePayload(chainStructure);
                socket.emit('blockParty/sendGarbage', payload);
                console.log('sent garbage');
            });
        });
    }

    calculatePayload(chainStructure) {
        return 6;
    }

    update() {
        
    }

    shutdown() {
        
    }
}