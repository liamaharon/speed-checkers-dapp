pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

/** @title Variation on the classic checkers game 
  * https://github.com/liamaharon/speed-checkers-dapp
  */
contract SpeedCheckers is Ownable {
    using SafeMath for uint;

    enum PlayerColor { Red, Black }

    enum GameState {
        WaitingForPlayer,
        Underway,
        PendingWithdrawal,
        Finished
    }

    enum SquareState {
        Empty,
        Black,
        Red
    }

    struct Game {
        PlayerColor turn;
        address winner;
        GameState state;
        address black;
        address red;
        uint wager;
        SquareState[8][8] board;
        bool blackWithdrawnDuringEmergency;
        bool redWithdrawnDuringEmergency;
    }
    
    address public owner;
    bool emergencyStop;
    Game[] public gameList;

    // Modifers for possible game states
    modifier isWaitingForPlayer(uint gameIndex) {
        require(gameList[gameIndex].state == GameState.WaitingForPlayer, "Game must be in state WaitingForPlayer");
        _;
    }

    modifier isUnderway(uint gameIndex) {
        require(gameList[gameIndex].state == GameState.Underway, "Game must be in state Underway");
        _;
    }

    modifier isPendingWithdrawal(uint gameIndex) {
        require(gameList[gameIndex].state == GameState.PendingWithdrawal, "Game must be in state PendingWithdrawal");
        _;
    }

    modifier isntFinished(uint gameIndex) {
        require(gameList[gameIndex].state != GameState.Finished, "Game isn't finished");
        _;
    }

    // Modifer to check if the sender was the winner of the specified game
    modifier isWinner(uint gameIndex) {
        require(gameList[gameIndex].winner == msg.sender, "This address didn't win, therefore cannot claim any funds");
        _;
    }

    // Modifer to check if the sender is in the game
    modifier isNotInGame(uint gameIndex) {
        Game storage game = gameList[gameIndex];
        require((game.red != msg.sender && game.black != msg.sender), "You're already playing in this game");
        _;
    }

    // Modifier to check that there hasn't been an emergency stop
    modifier isNoEmergency() {
        require(emergencyStop == false, "There has been an emergency stop");
        _;
    }

    // Modifier to check that there has been an emergency stop
    modifier isEmergency() {
        require(emergencyStop, "There is no emergency stop");
        _;
    }

    // Modifier to check if msg.sender is allowed to make a move in the specified game
    modifier allowedToMove(uint gameIndex) {
        Game storage game = gameList[gameIndex];
        // Check msg.sender is currently allowed to make a move in the game specified
        require(game.state == GameState.Underway, "Game isn't underway");
        if (msg.sender == game.red) {
            require(game.turn == PlayerColor.Red, "It's not your turn");
        } else if (msg.sender == game.black) {
            require(game.turn == PlayerColor.Black, "It's not your turn");
        } else {
            revert("You're not a player in this game");
        }
        _;
    }

    /** @dev Creates a new game of FastCheckers, appends it to gameList
      */
    function newGame() 
        public 
        payable 
        isNoEmergency
    {
        Game memory game = Game({
            turn: PlayerColor.Black,
            winner: 0,
            state: GameState.WaitingForPlayer,
            black: msg.sender,
            red: 0,
            wager: msg.value,
            board: newBoard(),
            blackWithdrawnDuringEmergency: false,
            redWithdrawnDuringEmergency: false
        });
        gameList.push(game);
    }

    /** @dev Allows users to join a game, sets the game's status to underway
      * @param gameIndex gameList[gameIndex] is the game the user wishes to join 
      */
    function joinGame(uint gameIndex) 
        public
        payable
        isNoEmergency
        isNotInGame(gameIndex)
        isWaitingForPlayer(gameIndex)
    {
        Game storage game = gameList[gameIndex];
        require(msg.value == game.wager, "Eth sent must match wager exactly");
        game.red = msg.sender;
        game.state = GameState.Underway;
    }

    /** @dev Makes a move in a game, kills 
      * @param gameIndex gameList[gameIndex] is the game the user wishes to make a move in 
      * @param pieceX X coordinate of the piece to move 
      * @param pieceY Y coordinate of the piece to move
      * @param destX X coordinate of the piece's desired destination 
      * @param destY Y coordinate of the piece's desired destination
      */
    function makeMove(uint gameIndex, uint8 pieceX, uint8 pieceY, uint8 destX, uint8 destY) 
        public
        isNoEmergency
        isUnderway(gameIndex)
        allowedToMove(gameIndex)
    {
        PlayerColor playerColor = gameList[gameIndex].red == msg.sender ? PlayerColor.Red : PlayerColor.Black;
        Game storage game = gameList[gameIndex];
        uint deadPieceTileX;
        uint deadPieceTileY;
        (deadPieceTileX, deadPieceTileY) = isValidMove(playerColor, game.board, pieceX, pieceY, destX, destY);

        // Move confirmed valid, kill piece if required and update state
        if (deadPieceTileX != 0 || deadPieceTileY != 0) {
            game.board[deadPieceTileY][deadPieceTileX] = SquareState.Empty;
        }
        game.board[pieceY][pieceX] = SquareState.Empty;
        game.board[destY][destX] = playerColor == PlayerColor.Red ? SquareState.Red : SquareState.Black;
        game.turn = playerColor == PlayerColor.Red ? PlayerColor.Black : PlayerColor.Red;

        // Check if player has won
        if (playerColor == PlayerColor.Red && destY == 0 || playerColor == PlayerColor.Black && destY == 7) {
            game.winner = msg.sender;
            game.state = GameState.PendingWithdrawal;
        }
    }

    /** @dev Pays out the winner of a game 
      * @param gameIndex Index of the game sender is attempting to claim winnings
      */
    function withdraw(uint gameIndex)
        public
        payable
        isNoEmergency
        isPendingWithdrawal(gameIndex) 
        isWinner(gameIndex)
    {
        gameList[gameIndex].state = GameState.Finished;
        msg.sender.transfer(gameList[gameIndex].wager.mul(2));
    }


    /** @dev Activates an emergency stop of all contract logic except emergencyWithdrawal 
      */
    function activateEmergencyStop()
        public
        onlyOwner
    {
        emergencyStop = true;
    }

    /** @dev Allows users to recover funds in event of an emergency stop
      * @param gameIndex Index of the game sender is attempting to claim emergency withdrawal
      */
    function emergencyWithdrawal(uint gameIndex)
        public
        isntFinished(gameIndex)
        isEmergency
    {
        Game storage game = gameList[gameIndex];
        if (msg.sender == game.red) {
            if (game.redWithdrawnDuringEmergency) {
                revert("You have already withdrawn");
            }
            game.redWithdrawnDuringEmergency = true;
            msg.sender.transfer(game.wager);
        } else if (msg.sender == game.black) {
            if (game.blackWithdrawnDuringEmergency) {
                revert("You have already withdrawn");
            }
            game.blackWithdrawnDuringEmergency = true;
            msg.sender.transfer(game.wager);
        } else {
            revert("You were not part of this game");
        }
    }

    /** @dev Enforces that a move is valid, and finds a dead piece if any
      * @param color The player's color, either Red or Black 
      * @param board The current game board  
      * @param pieceX X coordinate of the piece to move 
      * @param pieceY Y coordinate of the piece to move
      * @param destX X coordinate of the piece's desired destination 
      * @param destY Y coordinate of the piece's desired destination
      * @return deadPieceTileX 0 or the X coordiante of a dead piece
      * @return deadPieceTileY 0 or the Y coordiante of a dead piece
      */
    function isValidMove(PlayerColor color, SquareState[8][8] board, uint8 pieceX, uint8 pieceY, uint8 destX, uint8 destY) 
        internal 
        pure 
        returns(uint8 enemyTileX, uint8 enemyTileY) 
    {
        // Destination cannot be occupied
        require(board[destY][destX] == SquareState.Empty, "Invalid move");

        // Find if the player is trying to jump over another piece
        bool jumping;
        if 
        (
            (color == PlayerColor.Black && destY == pieceY + 2 ||
            color == PlayerColor.Red && destY == pieceY - 2) &&
            destX == pieceX + 2 || destX == pieceX - 2
        ) 
        {
            jumping = true;
        } else {
            jumping = false;
        }

        if (!jumping) {
            // A valid non-jumping move will always have X varying by a single unit
            require((destX == pieceX + 1 || destX == pieceX - 1), "Invalid move");

            // If black player isn't jumping Y must increase by 1 
            // If red player isn't jumping Y must decrease by 1 
            if (color == PlayerColor.Black) {
                require(destY == pieceY + 1, "Invalid move");
            } else {
                require(destY == pieceY - 1, "Invalid move");
            }
        }

        // If jumping there must be an enemy piece in the intermediate square
        if (jumping) {
            enemyTileX = destX < pieceX ? pieceX - 1 : pieceX + 1;
            enemyTileY = color == PlayerColor.Red ? pieceY - 1 : pieceY + 1;
            SquareState enemyTileState = color == PlayerColor.Red ? SquareState.Black : SquareState.Red;
            require(board[enemyTileY][enemyTileX] == enemyTileState, "Invalid move");
        }

        return(enemyTileX, enemyTileY);
    }

    /** @dev Initialises a new game board 
      * @return The initialised board
      */
    function newBoard() 
        internal 
        pure 
        returns(SquareState[8][8] board) 
    {
        board[0][1] = SquareState.Black;
        board[0][3] = SquareState.Black;
        board[0][5] = SquareState.Black;
        board[0][7] = SquareState.Black;
        board[1][0] = SquareState.Black;
        board[1][2] = SquareState.Black;
        board[1][4] = SquareState.Black;
        board[1][6] = SquareState.Black;
        board[2][1] = SquareState.Black;
        board[2][3] = SquareState.Black;
        board[2][5] = SquareState.Black;
        board[2][7] = SquareState.Black;
        board[5][0] = SquareState.Red;
        board[5][2] = SquareState.Red;
        board[5][4] = SquareState.Red;
        board[5][6] = SquareState.Red;
        board[6][1] = SquareState.Red;
        board[6][3] = SquareState.Red;
        board[6][5] = SquareState.Red;
        board[6][7] = SquareState.Red;
        board[7][0] = SquareState.Red;
        board[7][2] = SquareState.Red;
        board[7][4] = SquareState.Red;
        board[7][6] = SquareState.Red;
        return board;
    }

    /** @dev Returns the length of gameList 
      * @return The length of gameList
      */
    function gameListLen() public view returns(uint) {
        return gameList.length;        
    }

    /** @dev Returns the length of gameList 
      * @return The length of gameList
      */
    function getGameBoard(uint gameIndex) public view returns(SquareState[64]) {
        SquareState[8][8] storage board = gameList[gameIndex].board;
        SquareState[64] memory returnBoard;
        uint curIndex = 0;
        for (uint i = 0; i<8; i++) {
            for (uint j = 0; j<8; j++) {
                returnBoard[curIndex] = board[i][j];
                curIndex += 1;
            }
        }
        return returnBoard;
    }
}
