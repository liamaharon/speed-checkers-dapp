import React from 'react';
import PropTypes from 'prop-types';
import uuid from 'uuid/v4';
import {
  Paper, Typography, Table, TableRow, TableCell, TableBody, TableHead, Button,
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import {
  OuterMargin, Wrapper,
} from './style';
import { weiToEther } from '../../util/ethereum';
import Row from '../Row';
import Col from '../Col';

const CustomTableCell = withStyles(() => ({
  head: {
    padding: 0,
    color: 'rgba(0, 0, 0, 0.87)',
    fontSize: 14,
    width: '2rem',
    textAlign: 'center',
  },
  body: {
    fontSize: 14,
    padding: 0,
    textAlign: 'center',
  },
}))(TableCell);

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fromX: 0,
      fromY: 0,
      destX: 0,
      destY: 0,
      pickingFrom: true,
      pickingDest: false,
    };
    this.clickSquare = this.clickSquare.bind(this);
    this.resetFields = this.resetFields.bind(this);
    this.makeMove = this.makeMove.bind(this);
  }

  resetFields() {
    this.setState({
      pickingFrom: true,
      pickingDest: false,
      fromX: 0,
      fromY: 0,
    });
  }

  clickSquare(x, y) {
    const { pickingFrom, pickingDest } = this.state;
    if (pickingFrom) {
      this.setState({
        pickingFrom: false,
        pickingDest: true,
        fromX: x,
        fromY: y,
      });
    }
    if (pickingDest) {
      this.setState({
        pickingDest: false,
        destX: x,
        destY: y,
      });
    }
  }

  makeMove() {
    const {
      fromX,
      fromY,
      destX,
      destY,
    } = this.state;
    const { makeMove } = this.props;
    this.resetFields();
    makeMove(fromX, fromY, destX, destY);
  }

  render() {
    const {
      pickingFrom,
      pickingDest,
      fromX,
      fromY,
      destX,
      destY,
    } = this.state;
    const {
      state,
      turn,
      wager,
      winner,
      playerAddress,
      red,
      board,
      joinGame,
      black,
      index,
      withdraw,
    } = this.props;
    if (state === 'WaitingForPlayer') {
      const gameInitiator = playerAddress === red || playerAddress === black;
      return (
        <OuterMargin>
          <Paper>
            <Wrapper>
              <Row>
                <Typography variant="title">{`Game ID: ${index}`}</Typography>
              </Row>
              <Row>
                <Typography variant="title">{`Status: ${state}`}</Typography>
              </Row>
              <Row>
                <Typography variant="subheading">{`Creator: ${black}`}</Typography>
              </Row>
              <Row>
                <Typography variant="subheading">{`Wager: ${weiToEther(wager)} ETH`}</Typography>
              </Row>
              <Button
                variant="contained"
                disabled={gameInitiator}
                onClick={joinGame}
              >
              Join Game
              </Button>
              {
              gameInitiator
              && <Typography variant="caption">{"You can't join your own game"}</Typography>
            }
            </Wrapper>
          </Paper>
        </OuterMargin>
      );
    }

    const playerColor = playerAddress === red ? 'Red' : 'Black';
    return (
      <OuterMargin>
        <Paper>
          <Wrapper>
            <Row>
              <Typography variant="title">{`Game #${index}`}</Typography>
            </Row>
            <Row>
              <Typography style={{ marginRight: '0.5rem' }} variant="title">{'Status: '}</Typography>
              {
                state === 'Underway' && (turn === playerColor
                  ? <Typography style={{ color: 'green' }} variant="title">Your move</Typography>
                  : <Typography style={{ color: 'orange' }} variant="title">{'Opponent\'s move'}</Typography>)
              }
              {
                state !== 'Underway' && (winner === playerAddress
                  ? <Typography style={{ color: 'green' }} variant="title">You won!</Typography>
                  : <Typography style={{ color: 'orange' }} variant="title">You lost</Typography>)
              }
            </Row>
            <Row>
              <Typography variant="title">{`You are ${playerColor.toLowerCase()}`}</Typography>
            </Row>
            <Row>
              <Typography variant="subheading">{`Opponent: ${playerColor === 'Red' ? black : red}`}</Typography>
            </Row>
            <Row>
              <Typography variant="subheading">{`Wager: ${weiToEther(wager)} ETH`}</Typography>
            </Row>
            <Table>
              <TableHead>
                <TableRow>
                  <CustomTableCell />
                  <CustomTableCell>0</CustomTableCell>
                  <CustomTableCell>1</CustomTableCell>
                  <CustomTableCell>2</CustomTableCell>
                  <CustomTableCell>3</CustomTableCell>
                  <CustomTableCell>4</CustomTableCell>
                  <CustomTableCell>5</CustomTableCell>
                  <CustomTableCell>6</CustomTableCell>
                  <CustomTableCell>7</CustomTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {
                board.map(((row, i) => (
                  <TableRow key={uuid()}>
                    <CustomTableCell varient="head">{i}</CustomTableCell>
                    {
                      row.map((cell, j) => {
                        let color = '';
                        if (cell === 'Red') color = 'R';
                        else if (cell === 'Black') color = 'B';
                        return (
                          <CustomTableCell
                            onClick={() => this.clickSquare(j, i)}
                            key={uuid()}
                          >
                            {color}

                          </CustomTableCell>
                        );
                      })
                    }
                  </TableRow>
                )))
              }
              </TableBody>
            </Table>
            <Row>
              {
                state === 'Underway'
              && (
              <Col style={{ marginTop: '1rem', flex: '1' }}>
                <Typography variant="headline">
                  Make a move
                </Typography>
                {
                    pickingFrom
                    && (
                    <Typography variant="subheading">
                      Click a piece to move
                    </Typography>
                    )
                  }
                {
                    pickingDest
                    && (
                    <Typography variant="subheading">
                      Click where to move to piece
                    </Typography>
                    )
                  }
                {
                    !pickingDest && !pickingFrom
                    && (
                    <Col>
                      <Typography variant="subheading">
                        {`From: ${fromX}, ${fromY}`}
                      </Typography>
                      <Typography variant="subheading">
                        {`To: ${destX}, ${destY}`}
                      </Typography>
                    </Col>
                    )
                  }
                <Row>
                  <Button
                    onClick={this.makeMove}
                    variant="contained"
                    disabled={pickingFrom || pickingDest || turn !== playerColor}
                  >
                    Make move
                  </Button>
                  <Button
                    onClick={this.resetFields}
                    disabled={pickingFrom}
                  >
                    Reset
                  </Button>
                </Row>
              </Col>
              )}
              <Col style={{ marginLeft: 'auto', flex: '1', marginTop: '1rem' }}>
                <Typography variant="headline">
                  Claim winnings
                </Typography>
                <Button
                  onClick={withdraw}
                  variant="contained"
                  style={{ flex: '1' }}
                  color="secondary"
                  disabled={winner !== playerAddress || state !== 'PendingWithdrawal'}
                >
                    $$$$$$
                </Button>
              </Col>
            </Row>
          </Wrapper>
        </Paper>
      </OuterMargin>
    );
  }
}

Game.defaultProps = {
  joinGame: () => {},
  makeMove: () => {},
  withdraw: () => {},
};

Game.propTypes = {
  turn: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  winner: PropTypes.string.isRequired,
  red: PropTypes.string.isRequired,
  black: PropTypes.string.isRequired,
  state: PropTypes.string.isRequired,
  wager: PropTypes.string.isRequired,
  playerAddress: PropTypes.string.isRequired,
  board: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)).isRequired,
  joinGame: PropTypes.func,
  makeMove: PropTypes.func,
  withdraw: PropTypes.func,
};

export default Game;
