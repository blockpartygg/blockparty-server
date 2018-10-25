const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

class SocketManager {
    initialize() {
        this._sockets = [];

        const expressApp = express();
        const httpServer = http.Server(expressApp);
        this._server = socketIO(httpServer);
        
        const port = process.env.PORT || 1337;
        httpServer.listen(port, () => {
            console.log('Listening on port ' + port);
        });

        this._server.on('connection', socket => {
            console.log("SocketManager: Event: 'connect': socket.id=" + socket.id);
            this._sockets[socket.id] = socket;
        });

        setInterval(() => {
            http.get('http://blockparty-server.herokuapp.com');
        }, 300000);
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