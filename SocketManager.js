const http = require('http');
const socketIO = require('socket.io');

class SocketManager {
    initialize(expressManager, chatManager) {
        this._sockets = [];

        const httpServer = http.Server(expressManager.app);
        this._server = socketIO(httpServer);
        
        const port = process.env.PORT || 1337;
        httpServer.listen(port, () => {
            console.log('Listening on port ' + port);
        });

        setInterval(() => {
            http.get('http://blockparty-server.herokuapp.com/ping');
        }, 300000);
    }

    setupEventHandlers(chatManager) {
        this._server.on('connection', socket => {
            console.log("SocketManager: Event: 'connect': socket.id=" + socket.id);
            this._sockets[socket.id] = socket;

            socket.on('chat', (playerName, message) => { chatManager.addMessage(playerName, message); });

            socket.on('disconnect', () => {
                console.log("SocketManager: Event: 'disconnect': socket.id=" + socket.id);
            });
        });
    }

    get server() {
        return this._server;
    }

    get sockets() {
        return this._sockets;
    }
}

socketManager = new SocketManager();

module.exports = socketManager;