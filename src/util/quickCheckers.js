export const gameStateMapping = (input) => {
  if (input === '0') return 'WaitingForPlayer';
  if (input === '1') return 'Underway';
  if (input === '2') return 'PendingWithdrawal';
  if (input === '3') return 'Finished';
  return 'Unknown';
};

export const squareStateMapping = (input) => {
  if (input === '0') return 'Empty';
  if (input === '1') return 'Black';
  if (input === '2') return 'Red';
  return 'Unknown';
};

export const playerColorMapping = (input) => {
  if (input === '0') return 'Red';
  if (input === '1') return 'Black';
  return 'Unknown';
};

export const parseBoard = (board) => {
  // initialise a 2D array
  const parsedBoard = new Array(8);
  for (let i = 0; i < 8; i += 1) {
    parsedBoard[i] = new Array(8);
  }

  // convert the flattened array into a 2D array
  for (let i = 0; i < 64; i += 1) {
    const row = parseInt(i / 8, 10);
    const col = i % 8;
    parsedBoard[row][col] = squareStateMapping(board[i]);
  }
  return parsedBoard;
};

export const parseGame = (game, board, index) => {
  const parsedGame = { ...game };
  delete parsedGame['0'];
  delete parsedGame['1'];
  delete parsedGame['2'];
  delete parsedGame['3'];
  delete parsedGame['4'];
  delete parsedGame['5'];
  delete parsedGame['6'];
  delete parsedGame['7'];
  parsedGame.state = gameStateMapping(game.state);
  parsedGame.turn = playerColorMapping(game.turn);
  parsedGame.board = parseBoard(board);
  parsedGame.index = index;
  return parsedGame;
};
