import React, { Component } from 'react';
import PropTypes from 'prop-types';
import uuid from 'uuid/v4';
// import { ContractData } from 'drizzle-react-components';
import Typography from '@material-ui/core/Typography';
import {
  Button, FormControl, InputLabel, Input,
} from '@material-ui/core';
import { weiToEther, etherToWei } from '../../util/ethereum';

import {
  OuterWrapper, Header, AccWrapper, Balance, Body, BodyCol, Row,
} from './style';
import { parseGame } from '../../util/quickCheckers';
import Game from '../../components/Game';

class Home extends Component { // eslint-disable-line react/prefer-stateless-function
  constructor(props, context) {
    super(props);
    this.state = { games: [], wagerInput: 0 };
    this.QuickCheckers = context.drizzle.contracts.QuickCheckers;
    this.gameListLenKey = this.QuickCheckers.methods.gameListLen.cacheCall();
    this.newGame = this.newGame.bind(this);
    this.joinGame = this.joinGame.bind(this);
    this.stop = this.stop.bind(this);
    this.changeWager = this.changeWager.bind(this);
  }

  componentWillUpdate(nextProps) {
    const { QuickCheckers } = this.props;
    // as soon as we get the game list length, request the game and board info
    // save keys to access this info from props in state
    // console.log(QuickCheckers);
    if
    (
      (!QuickCheckers.gameListLen[this.gameListLenKey]
      && nextProps.QuickCheckers.gameListLen[this.gameListLenKey])
      || (QuickCheckers.gameListLen[this.gameListLenKey]
      && (QuickCheckers.gameListLen[this.gameListLenKey].value
        !== nextProps.QuickCheckers.gameListLen[this.gameListLenKey].value))
    ) {
      const gameListLen = parseInt(
        nextProps.QuickCheckers.gameListLen[this.gameListLenKey].value,
        10,
      );
      const newGames = [];
      for (let i = 0; i < gameListLen; i += 1) {
        const curGameKey = this.QuickCheckers.methods.gameList.cacheCall(i);
        const curBoardKey = this.QuickCheckers.methods.getGameBoard.cacheCall(i);
        newGames.push({ gameKey: curGameKey, boardKey: curBoardKey });
      }
      this.setState({ games: newGames.reverse() }); // eslint-disable-line
    }
  }

  newGame() {
    const { wagerInput } = this.state;
    this.QuickCheckers.methods.newGame.cacheSend({ value: etherToWei(wagerInput) });
  }

  joinGame(i) {
    this.QuickCheckers.methods.joinGame(i).send();
  }

  stop() {
    this.QuickCheckers.methods.activateEmergencyStop().send();
  }

  changeWager(e) {
    this.setState({ wagerInput: e.target.value });
  }

  render() {
    const { games, wagerInput } = this.state;
    const { accounts, accountBalances, QuickCheckers } = this.props;
    const balance = weiToEther(accountBalances[accounts[0]]);
    if (!QuickCheckers.gameListLen[this.gameListLenKey]) {
      return <Typography variant="display4">Syncing...</Typography>;
    }

    const waitingForPlayers = [];
    const yourGames = [];
    games.forEach((game) => {
      const { gameKey, boardKey } = game;
      if (!QuickCheckers.gameList[gameKey] || !QuickCheckers.getGameBoard[boardKey]) return;
      const gameVal = QuickCheckers.gameList[gameKey].value;
      const boardVal = QuickCheckers.getGameBoard[boardKey].value;
      const parsedGame = parseGame(gameVal, boardVal);
      if (parsedGame.state === 'WaitingForPlayers') {
        waitingForPlayers.push(parsedGame);
      }
      if (parsedGame.red === accounts[0] || parsedGame.black === accounts[0]) {
        yourGames.push(parsedGame);
      }
    });
    return (
      <OuterWrapper>
        <Header>
          <Typography variant="display3">
            Quick Checkers
          </Typography>
          <AccWrapper>
            <Typography variant="display1">
              Active acc
            </Typography>
            <Typography variant="headline">
              {accounts[0]}
            </Typography>
            <Balance>
              <Typography variant="title">
                {`Balance: ${balance.toFixed(6)} ETH`}
              </Typography>
            </Balance>
          </AccWrapper>
        </Header>
        <Body>
          <BodyCol>
            <Typography variant="display1">
              Your games
            </Typography>
            {
              yourGames.map(game => <Game key={uuid()} {...game} playerAddress={accounts[0]} />)
            }
          </BodyCol>
          <BodyCol>
            <Typography variant="display1">
              Games awaiting players
            </Typography>
            <Row style={{ marginTop: '1rem' }}>
              <FormControl>
                <InputLabel htmlFor="wager">Wager (Ether)</InputLabel>
                <Input
                  type="number"
                  id="wager"
                  value={wagerInput}
                  onChange={this.changeWager}
                />
              </FormControl>
              <Button
                variant="contained"
                color="primary"
                onClick={this.newGame}
              >
              + Create game
              </Button>
            </Row>
          </BodyCol>
        </Body>
      </OuterWrapper>
    );
  }
}

export default Home;

Home.propTypes = {
  accounts: PropTypes.objectOf(PropTypes.string).isRequired,
  accountBalances: PropTypes.objectOf(PropTypes.string).isRequired,
  QuickCheckers: PropTypes.any.isRequired, // eslint-disable-line
};

Home.contextTypes = {
  drizzle: PropTypes.object, // eslint-disable-line
};
