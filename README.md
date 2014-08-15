tic-tac-api
===========

This is a node.js backend for my [tic-tac-toe](https://github.com/vitosamson/tic-tac-toe-angular-websocket).

The game and API communicate over websockets.

The following socket events are utilized:
  - game -> api
    - connect
    - set nickname
    - new game
    - send move
  - api -> game
    - connect ack (sends back player ID)
    - ack nick (nickname uniqueness validation)
    - game started (sends game ID, piece data, opponent data)
    - move (move data from opponent)
    - game over (who won)
    - game denied (probably can be removed, along with allowing the user to manually enter a player ID)
    - player list (player IDs, nicks and availability)
