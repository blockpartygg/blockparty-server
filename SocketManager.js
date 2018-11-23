const http = require('http');
const socketIO = require('socket.io');

class SocketManager {
    initialize(expressManager) {
        this._sockets = [];

        const httpServer = http.Server(expressManager.app);
        this._server = socketIO(httpServer);
        
        const port = process.env.PORT || 1337;
        httpServer.listen(port, () => {
            console.log('Listening on port ' + port);
        });

        // this._server.on('connection', socket => {
        //     console.log("SocketManager: Event: 'connect': socket.id=" + socket.id);
        //     this._sockets[socket.id] = socket;
        // });

        // setInterval(() => {
        //     http.get('http://blockparty-server.herokuapp.com');
        // }, 300000);
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