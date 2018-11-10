const socketManager = require('./SocketManager');

module.exports = class BlockChase {
    constructor(gameManager) {
        this.gameManager = gameManager;

        this.setupPlayers();
        this.setupBlocks();
        this.setupPlayerListeners();
        this.setupPlayerEmitter();
        this.elapsed = 0;
    }

    setupPlayers() {
        this.players = {}; // I think this is an empty object vs array because of some Unity SocketIO client weirdness w/ sparse arrays
        this.botCount = 10;
        for(let botId = 0; botId < this.botCount; botId++) {
            this.spawnPlayer("bot" + botId);
        }
    }

    spawnPlayer(playerId) {
        this.players[playerId] = {
            id: playerId,
            active: true,
            position: { 
                x: Math.random() * 64 - 32,
                z: Math.random() * 64 - 32,
            },
            velocity: {
                x: 0,
                z: 0,
            },
            speed: 5,
            targetBlockId: -1
        }
    }

    setupBlocks() {
        this.blocks = [];
        this.nextBlockId = 0;
        this.maxBlockCount = 100;
    }

    setupPlayerListeners() {
        const socketIds = Object.keys(socketManager.sockets);
        socketIds.forEach(socketId => {
            const socket = socketManager.sockets[socketId];
            socket.on('blockChase/joinGame', playerId => {
                this.spawnPlayer(playerId);
            });
            socket.on('blockChase/playerState', (playerId, player) => {
                const playerObject = JSON.parse(player);
                if(this.players[playerId]) {
                    this.players[playerId].position = playerObject.position;
                }
            });
        });
    }

    setupPlayerEmitter() {
        this.sendStateInterval = setInterval(() => { this.sendState(); }, 1000 / 1);
    }

    sendState() {
        socketManager.server.emit('blockChase/state', { players: this.players, blocks: Object.assign({}, this.blocks) });
    }

    update(delta) {
        this.updateBots(delta);
        this.updateBlocks();
        this.updatePlayerBlockCollisions();
    }

    updateBots(delta) {
        delta /= 1000;

        for(let botPlayerId = 0; botPlayerId < this.botCount; botPlayerId++) {
            if(this.players["bot" + botPlayerId].targetBlockId === -1) {
                let closestDistanceSquared = 4096;
                let closestBlockId = -1;
                const blockIds = Object.keys(this.blocks);
                blockIds.forEach(blockId => {
                    const block = this.blocks[blockId];
                    if(block) {
                        const distanceSquared = this.distanceSquared(this.players["bot" + botPlayerId].position.x, this.players["bot" + botPlayerId].position.z, block.position.x, block.position.z);
                        if(distanceSquared < closestDistanceSquared) {
                            closestBlockId = blockId;
                            closestDistanceSquared = distanceSquared;
                        }
                    }
                });
                this.players["bot" + botPlayerId].targetBlockId = closestBlockId;
            }

            if(this.players["bot" + botPlayerId].targetBlockId !== -1) {
                const block = this.blocks[this.players["bot" + botPlayerId].targetBlockId];
                const normalizedDeltaX = (block.position.x - this.players["bot" + botPlayerId].position.x) / Math.sqrt(this.distanceSquared(block.position.x, block.position.z, this.players["bot" + botPlayerId].position.x, this.players["bot" + botPlayerId].position.z));
                const normalizedDeltaZ = (block.position.z - this.players["bot" + botPlayerId].position.z) / Math.sqrt(this.distanceSquared(block.position.x, block.position.z, this.players["bot" + botPlayerId].position.x, this.players["bot" + botPlayerId].position.z));
                this.players["bot" + botPlayerId].velocity.x += normalizedDeltaX * this.players["bot" + botPlayerId].speed * delta;
                this.players["bot" + botPlayerId].velocity.z += normalizedDeltaZ * this.players["bot" + botPlayerId].speed * delta;
                this.players["bot" + botPlayerId].targetBlockId = -1;
            }

            this.players["bot" + botPlayerId].velocity.x *= 0.95;
            this.players["bot" + botPlayerId].velocity.z *= 0.95;
            this.players["bot" + botPlayerId].position.x += this.players["bot" + botPlayerId].velocity.x * delta;
            this.players["bot" + botPlayerId].position.z += this.players["bot" + botPlayerId].velocity.z * delta;
        }
    }

    updateBlocks() {
        let blockCount = this.blocks.reduce(count => count + 1, 0);
        while(blockCount < this.maxBlockCount) {
            const block = {
                active: true,
                position: {
                    x: Math.random() * 64 - 32,
                    z: Math.random() * 64 - 32,
                }
            };
            const blockId = this.nextBlockId++;
            this.blocks[blockId] = block;
            blockCount = this.blocks.reduce(count => count + 1, 0);
        }
    }

    updatePlayerBlockCollisions() {
        const playerIds = Object.keys(this.players);
        playerIds.forEach(playerId => {
            const player = this.players[playerId];
            if(player) {
                const blockIds = Object.keys(this.blocks);
                blockIds.forEach(blockId => {
                    const block = this.blocks[blockId];
                    if(block && block.active) {
                        const distanceSquared = this.distanceSquared(player.position.x, player.position.z, block.position.x, block.position.z);
                        if(distanceSquared < 1) {
                            this.blocks[blockId].active = false;
                            this.blocks = this.blocks.filter(block => block !== this.blocks[blockId]);
                            this.gameManager.mode.incrementScore(this.gameManager.game.scoreboard, playerId, 1);
                        }
                    }
                });
            }
        });
    }

    distanceSquared(x1, y1, x2, y2) {
        const distanceSquared = Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2);
        return distanceSquared;
    }

    shutdown() {
        clearInterval(this.sendStateInterval);
    }
}