const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const THREE = require('three');
const firebase = require('firebase-admin');
const firebaseServiceAccountDevelopment = require('./firebaseServiceAccountDevelopment.json');
const firebaseServiceAccountProduction = require('./firebaseServiceAccountProduction.json');
const Game = require('./Game');

const expressApp = express();
const httpServer = http.Server(expressApp);
const socketIOServer = socketIO(httpServer);

var players = [];

socketIOServer.on('connection', socket => {
  let player = {
    id: socket.id,
    socket: socket,
    position: {
      x: 0,
      y: 0
    },
    direction: {
      x: 0,
      y: 0
    },
  };
  players.push(player);
  console.log(`Player ${player.id} connected`);

  socket.on('join game', () => {
    socket.emit('spawn player', player);
  });

  socket.on('player input', direction => {
    players[players.findIndex(p => p.id === player.id)].direction = direction;
  });

  socket.on('disconnect', () => {
    players.splice(players.findIndex(p => p.id === player.id), 1);
    console.log(`Player ${player.id} disconnected`);
  });
});

expressApp.get('/', (request, response) => {
  response.sendFile(__dirname + '/index.html');
});

httpServer.listen(1337, () => {
  console.log('Listening on *:1337');
});

function update() {
  players.forEach(player => {
    updatePlayer(player);
  });
}

function updatePlayer(player) {
  
}

function sendPlayerState() {
  players.forEach(player => {
    player.socket.emit('players', players);
  })
}

setInterval(update, 1000 / 60);
setInterval(sendPlayerState, 1000);



// initialize firebase
let serviceAccount;
let databaseURL;
if(process.env.NODE_ENV === 'production') {
  serviceAccount = firebaseServiceAccountProduction;
  databaseURL = "https://blockparty-production.firebaseio.com";
}
else {
  serviceAccount = firebaseServiceAccountDevelopment;
  databaseURL = "https://blockparty-development.firebaseio.com"
}
firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
    databaseURL: databaseURL
});

let game = new Game();
game.setPregameCountdownState();