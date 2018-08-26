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

const CustomTableCell = withStyles(() => ({
  head: {
    padding: 0,
    width: '2rem',
    textAlign: 'center',
  },
  body: {
    fontSize: 14,
    padding: 0,
    textAlign: 'center',
  },
}))(TableCell);

const Game = (props) => {
  const {
    state, turn, wager, playerAddress, red, board, joinGame, black,
  } = props;
  if (state === 'WaitingForPlayer') {
    const gameInitiator = playerAddress === red || playerAddress === black;
    return (
      <OuterMargin>
        <Paper>
          <Wrapper>
            <Row>
              <Typography variant="title">{`State: ${state}`}</Typography>
            </Row>
            <Row>
              <Typography variant="subheading">{`Wager: ${weiToEther(wager)} ETH`}</Typography>
            </Row>
            <Button
              variant="contained"
              disabled={gameInitiator}
              color="secondary"
              onClick={joinGame}
            >
              Join Game
            </Button>
            {
              gameInitiator
              && <Typography variant="caption">{"You can't join your own game"}</Typography> // eslint-disable-line react/jsx-curly-brace-presence
            }
          </Wrapper>
        </Paper>
      </OuterMargin>
    );
  }

  const playerColor = playerAddress === red ? 'Red' : 'Black';
  // console.log(props);
  return (
    <OuterMargin>
      <Paper>
        <Wrapper>
          <Row>
            <Typography variant="title">{`State: ${state}`}</Typography>
          </Row>
          <Row>
            <Typography variant="subheading">{`Turn: ${turn} (You are ${playerColor})`}</Typography>
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
                      row.map((cell) => {
                        let color = '';
                        if (cell === 'Red') color = 'R';
                        else if (cell === 'Black') color = 'B';
                        return <CustomTableCell key={uuid()}>{color}</CustomTableCell>;
                      })
                    }
                  </TableRow>
                )))
              }
            </TableBody>
          </Table>
        </Wrapper>
      </Paper>
    </OuterMargin>
  );
};

Game.defaultProps = {
  joinGame: () => {},
};

Game.propTypes = {
  turn: PropTypes.string.isRequired,
  // winner: PropTypes.string.isRequired,
  red: PropTypes.string.isRequired,
  black: PropTypes.string.isRequired,
  state: PropTypes.string.isRequired,
  wager: PropTypes.string.isRequired,
  playerAddress: PropTypes.string.isRequired,
  board: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)).isRequired,
  joinGame: PropTypes.func,
};

export default Game;
