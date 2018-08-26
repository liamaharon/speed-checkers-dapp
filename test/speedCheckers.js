const BigNumber = require('bignumber.js');

// helper function to assert that a SC call threw
const expectThrow = async (promise) => {
  try {
    await promise;
  } catch (error) {
    assert(
      error,
      `Expected throw, got '${error}' instead`,
    );
    return;
  }
  assert.fail('Expected throw not received');
};

const SpeedCheckers = artifacts.require('./contracts/SpeedCheckers.sol');

/* Testing the core logic of the dapp:
    - newGame
    - joinGame
    - makeMove
    - withdraw
 */
contract('SpeedCheckers', (accounts) => {
  let speedCheckers;
  beforeEach('setup contract for each test', async () => {
    speedCheckers = await SpeedCheckers.new();
  });

  describe('newGame', () => {
    it('creates a new game correctly', async () => {
      await speedCheckers.newGame({ value: '123111' });
      const game0 = await speedCheckers.gameList(0);
      assert.equal(game0[2], 0, 'game not starting in correct state');
      assert.equal(game0[3], accounts[0], 'black player set correctly');
      assert.equal(new BigNumber(game0[5]).toString(), '123111', 'game wager not set correctly');
    });

    it('increments gameListLen correctly', async () => {
      await speedCheckers.newGame();
      await speedCheckers.newGame();
      await speedCheckers.newGame();
      const gameListLen = await speedCheckers.gameListLen();
      assert.equal(new BigNumber(gameListLen).toString(), '3', 'gameListLen not incrementing correctly');
    });
  });

  describe('joinGame', () => {
    it('allows somebody to join a game', async () => {
      await speedCheckers.newGame({ value: '123123' });
      await speedCheckers.joinGame(0, { from: accounts[1], value: '123123' });
      const game = await speedCheckers.gameList(0);
      assert.equal(game[4], accounts[1], 'red player not set correctly');
    });

    it('updates the game state', async () => {
      await speedCheckers.newGame({ value: '123123' });
      await speedCheckers.joinGame(0, { from: accounts[1], value: '123123' });
      const game = await speedCheckers.gameList(0);
      assert.equal(game[2], 1, 'game state not updated correctly');
    });

    it('player joining must have correct wager', async () => {
      await speedCheckers.newGame({ value: '123123' });
      await expectThrow(speedCheckers.joinGame(0, { from: accounts[1], value: '1231' }));
    });

    it('player joining must not already have joined', async () => {
      await speedCheckers.newGame({ value: '123123' });
      await expectThrow(speedCheckers.joinGame(0, { value: '123123' }));
    });
  });

  describe('makeMove', async () => {
    it('players should be able to make valid moves and finish a game', async () => {
      await speedCheckers.newGame({ value: '123123' });
      await speedCheckers.joinGame(0, { from: accounts[1], value: '123123' });
      await speedCheckers.makeMove(0, 1, 2, 0, 3);
      await speedCheckers.makeMove(0, 2, 5, 1, 4, { from: accounts[1] });
      await speedCheckers.makeMove(0, 7, 2, 6, 3);
      await speedCheckers.makeMove(0, 3, 6, 2, 5, { from: accounts[1] });
      await speedCheckers.makeMove(0, 6, 3, 5, 4);
      await speedCheckers.makeMove(0, 2, 5, 3, 4, { from: accounts[1] });
      await speedCheckers.makeMove(0, 0, 3, 2, 5);
      await speedCheckers.makeMove(0, 4, 7, 3, 6, { from: accounts[1] });
      await speedCheckers.makeMove(0, 2, 5, 4, 7);
      const game = await speedCheckers.gameList(0);
      assert.equal(game[1], accounts[0], 'winner not set correctly');
      assert.equal(game[2], 2, 'game state not updated correctly');
    });

    it("shouldn't allow black to play out of turn", async () => {
      await speedCheckers.newGame({ value: '123123' });
      await speedCheckers.joinGame(0, { from: accounts[1], value: '123123' });
      await speedCheckers.makeMove(0, 1, 2, 0, 3);
      await expectThrow(speedCheckers.makeMove(0, 7, 2, 6, 3));
    });

    it("shouldn't allow red to play out of turn", async () => {
      await speedCheckers.newGame({ value: '123123' });
      await speedCheckers.joinGame(0, { from: accounts[1], value: '123123' });
      await expectThrow(speedCheckers.makeMove(0, 7, 2, 6, 3, { from: accounts[1] }));
    });

    it("shouldn't allow red to make illegal moves", async () => {
      await speedCheckers.newGame({ value: '123123' });
      await speedCheckers.joinGame(0, { from: accounts[1], value: '123123' });
      await expectThrow(speedCheckers.makeMove(0, 8, 2, 6, 3));
    });

    it("shouldn't allow black to make illegal moves", async () => {
      await speedCheckers.newGame({ value: '123123' });
      await speedCheckers.joinGame(0, { from: accounts[1], value: '123123' });
      await expectThrow(speedCheckers.makeMove(0, 7, 3, 6, 3));
    });
  });

  describe('withdraw', async () => {
    it('player should be able to successfully withdraw winnings', async () => {
      await speedCheckers.newGame({ value: '15' });
      await speedCheckers.joinGame(0, { from: accounts[1], value: '15' });
      await speedCheckers.makeMove(0, 1, 2, 0, 3);
      await speedCheckers.makeMove(0, 2, 5, 1, 4, { from: accounts[1] });
      await speedCheckers.makeMove(0, 7, 2, 6, 3);
      await speedCheckers.makeMove(0, 3, 6, 2, 5, { from: accounts[1] });
      await speedCheckers.makeMove(0, 6, 3, 5, 4);
      await speedCheckers.makeMove(0, 2, 5, 3, 4, { from: accounts[1] });
      await speedCheckers.makeMove(0, 0, 3, 2, 5);
      await speedCheckers.makeMove(0, 4, 7, 3, 6, { from: accounts[1] });
      await speedCheckers.makeMove(0, 2, 5, 4, 7);
      assert(await speedCheckers.withdraw(0), 'error withdrawing');
    });

    it('player should only be able to withdraw once', async () => {
      await speedCheckers.newGame({ value: '15' });
      await speedCheckers.joinGame(0, { from: accounts[1], value: '15' });
      await speedCheckers.makeMove(0, 1, 2, 0, 3);
      await speedCheckers.makeMove(0, 2, 5, 1, 4, { from: accounts[1] });
      await speedCheckers.makeMove(0, 7, 2, 6, 3);
      await speedCheckers.makeMove(0, 3, 6, 2, 5, { from: accounts[1] });
      await speedCheckers.makeMove(0, 6, 3, 5, 4);
      await speedCheckers.makeMove(0, 2, 5, 3, 4, { from: accounts[1] });
      await speedCheckers.makeMove(0, 0, 3, 2, 5);
      await speedCheckers.makeMove(0, 4, 7, 3, 6, { from: accounts[1] });
      await speedCheckers.makeMove(0, 2, 5, 4, 7);
      await speedCheckers.withdraw(0);
      await expectThrow(speedCheckers.withdraw(0));
    });

    it('only winner should be allowed to withdraw', async () => {
      await speedCheckers.newGame({ value: '15' });
      await speedCheckers.joinGame(0, { from: accounts[1], value: '15' });
      await speedCheckers.makeMove(0, 1, 2, 0, 3);
      await speedCheckers.makeMove(0, 2, 5, 1, 4, { from: accounts[1] });
      await speedCheckers.makeMove(0, 7, 2, 6, 3);
      await speedCheckers.makeMove(0, 3, 6, 2, 5, { from: accounts[1] });
      await speedCheckers.makeMove(0, 6, 3, 5, 4);
      await speedCheckers.makeMove(0, 2, 5, 3, 4, { from: accounts[1] });
      await speedCheckers.makeMove(0, 0, 3, 2, 5);
      await speedCheckers.makeMove(0, 4, 7, 3, 6, { from: accounts[1] });
      await speedCheckers.makeMove(0, 2, 5, 4, 7);
      await expectThrow(speedCheckers.withdraw(0, { from: accounts[1] }));
    });

    it('game state should be correctly updated', async () => {
      await speedCheckers.newGame({ value: '15' });
      await speedCheckers.joinGame(0, { from: accounts[1], value: '15' });
      await speedCheckers.makeMove(0, 1, 2, 0, 3);
      await speedCheckers.makeMove(0, 2, 5, 1, 4, { from: accounts[1] });
      await speedCheckers.makeMove(0, 7, 2, 6, 3);
      await speedCheckers.makeMove(0, 3, 6, 2, 5, { from: accounts[1] });
      await speedCheckers.makeMove(0, 6, 3, 5, 4);
      await speedCheckers.makeMove(0, 2, 5, 3, 4, { from: accounts[1] });
      await speedCheckers.makeMove(0, 0, 3, 2, 5);
      await speedCheckers.makeMove(0, 4, 7, 3, 6, { from: accounts[1] });
      await speedCheckers.makeMove(0, 2, 5, 4, 7);
      await speedCheckers.withdraw(0);
      const game = await speedCheckers.gameList(0);
      assert.equal(game[2], 3, 'game state not updated correctly');
    });
  });
});
