var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var util = require('util'); // this is useful for console.logging deep objects

var players = {};
var games = {};

io.sockets.on('connection', function(socket) {
  console.log('connected' + socket.id);

  // ack the connection, send the player ID back
  socket.emit('connect ack', socket.id);

  // create the player
  players[socket.id] = {
    inGame: false
  };
  console.log(players);

  // set the player's nick
  socket.on('nick', function(nick) {
    players[socket.id].nick = nick;
    console.log(players);
  });

  socket.on('new game', function(player) {
    if (players[player] === undefined) {
      socket.emit('game denied', 'that player doesn\'t exist!');
    } else {
      if (players[player].inGame) {
        console.log('player is already in a game');
        socket.emit('game denied', 'player is already in a game');
      } else {
        gameId = Math.random().toString(36).substring(4);
        
        games[gameId] = {
          playerOne: socket.id,
          playerTwo: player,
          topRow: [],
          middleRow: [],
          bottomRow: []
        };

        players[socket.id].inGame = true;
        players[socket.id].game = gameId;
        players[socket.id].piece = 'X';
        players[player].inGame = true;
        players[player].game = gameId;
        players[player].piece = 'O';

        // send the game setup data back to the challenger
        socket.emit('game started', {
          game: gameId,
          playerId: player,
          playerNick: players[player].nick || '',
          theirPiece: players[player].piece,
          ourPiece: players[socket.id].piece,
          ourTurn: true
        });

        // send the game setup data to the other player
        socket.to(player).emit('game started', {
          game: gameId,
          playerId: socket.id,
          playerNick: players[socket.id].nick || '',
          theirPiece: players[socket.id].piece,
          ourPiece: players[player].piece,
          ourTurn: false
        });
      }

      console.log('games: ' + util.inspect(games));
      console.log('players: ' + util.inspect(players));

    }
  });


  socket.on('move', function(data) {
    // console.log(data);
    // move.piece = players[socket.id].piece;
    socket.to(data.to).emit('move', {col: data.col, row: data.row});

    switch (data.row) {
      case 0:
        games[data.gameID].topRow[data.col] = socket.id;
        break;
      case 1:
        games[data.gameID].middleRow[data.col] = socket.id;
        break;
      case 2:
        games[data.gameID].bottomRow[data.col] = socket.id;
        break;
    }
    if (checkForWinner(games[data.gameID])) {
      socket.emit('game over', socket.id);
      socket.to(data.to).emit('game over', socket.id);
      players[socket.id].inGame = false;
      players[data.to].inGame = false;
    }
  });

  socket.on('disconnect', function() {
    delete players[socket.id];
  });
});

function checkForWinner(gameData) {
  topRow = gameData.topRow;
  middleRow = gameData.middleRow;
  bottomRow = gameData.bottomRow;

  console.log('checking.... ' + util.inspect(gameData));

  if 
    (topRow.length == 3 &&
    (topRow[0] == topRow[1]) &&
    (topRow[0] == topRow[2]) &&
    (topRow[1] == topRow[2])) {
      return true;
  } else if
    (middleRow.length == 3 &&
    (middleRow[0] == middleRow[1]) &&
    (middleRow[0] == middleRow[2]) &&
    (middleRow[1] == middleRow[2])) {
      return true;
  } else if
    (bottomRow.length == 3 &&
    (bottomRow[0] == bottomRow[1]) &&
    (bottomRow[0] == bottomRow[2]) &&
    (bottomRow[1] == bottomRow[2])) {
      return true;
  } else if
    ((topRow[0] !== undefined && middleRow[0] !== undefined && bottomRow[0] !== undefined) &&
    (topRow[0] == middleRow[0]) &&
    (topRow[0] == bottomRow[0]) &&
    (middleRow[0] == bottomRow[0])) {
      return true;
  } else if
    ((topRow[1] !== undefined && middleRow[1] !== undefined && bottomRow[1] !== undefined) &&
    (topRow[1] == middleRow[1]) &&
    (topRow[1] == bottomRow[1]) &&
    (middleRow[1] == bottomRow[1])) {
      return true;
  } else if
    ((topRow[2] !== undefined && middleRow[2] !== undefined && bottomRow[2] !== undefined) &&
    (topRow[2] == middleRow[2]) &&
    (topRow[2] == bottomRow[2]) &&
    (middleRow[2] == bottomRow[2])) {
      return true;
  } else if
    ((topRow[0] !== undefined && middleRow[1] !== undefined && bottomRow[2] !== undefined) &&
    (topRow[0] == middleRow[1]) &&
    (topRow[0] == bottomRow[2]) &&
    (middleRow[1] == bottomRow[2])) {
      return true;
  } else if
    ((topRow[2] !== undefined && middleRow[1] !== undefined && bottomRow[0] !== undefined) &&
    (topRow[2] == middleRow[1]) &&
    (topRow[2] == bottomRow[0]) &&
    (middleRow[1] == bottomRow[0])) {
      return true;
  } else {
    return false;
  }
}

http.listen(3000, function() {
  console.log('listening on *:3000');
});