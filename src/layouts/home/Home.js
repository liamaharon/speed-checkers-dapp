import React, { Component } from 'react';
import PropTypes from 'prop-types';
// import { ContractData } from 'drizzle-react-components';
import Typography from '@material-ui/core/Typography';
import { Button } from '@material-ui/core';
// import { parseEthBalance } from '../../util/ethereum';

import {
  OuterWrapper, Header, AccWrapper, Balance,
} from './style';

class Home extends Component { // eslint-disable-line react/prefer-stateless-function
  constructor(props, context) {
    super(props);
    this.QuickCheckers = context.drizzle.contracts.QuickCheckers;
    this.newGame = this.newGame.bind(this);
    this.stop = this.stop.bind(this);
  }

  newGame() {
    this.QuickCheckers.methods.newGame().send();
  }

  stop() {
    this.QuickCheckers.methods.activateEmergencyStop.send();
  }

  render() {
    // if (!this.props.drizzleStatus.initialized) {
    //   return (
    //     <Typography variant="display4">
    //     Loading contract data...
    //     </Typography>
    //   );
    // }
    // const { accounts, accountBalances } = this.props;
    // const balance = parseEthBalance(accountBalances[accounts[0]]);
    // console.log(this.QuickCheckers.methods);
    // console.log(this.props.QuickCheckers);
    return (
      <OuterWrapper>
        <Header>
          <Typography variant="display3">
            Eth Checkers
          </Typography>
          <AccWrapper>
            <Typography variant="display1">
              Active acc
            </Typography>
            <Typography variant="headline">
              {/* {accounts[0]} */}
            </Typography>
            <Balance>
              <Typography variant="title">
                {/* {`Balance: ${balance.toFixed(6)} ETH`} */}
              </Typography>
            </Balance>
          </AccWrapper>
        </Header>
        <Button variant="contained" onClick={this.newGame}>New game</Button>
        <Button variant="contained" onClick={this.stop}>Stop</Button>
      </OuterWrapper>
    );
  }
}

export default Home;

Home.propTypes = {
  // accounts: PropTypes.objectOf(PropTypes.string).isRequired,
  // accountBalances: PropTypes.objectOf(PropTypes.string).isRequired,
  QuickCheckers: PropTypes.any.isRequired, // eslint-disable-line
};

Home.contextTypes = {
  drizzle: PropTypes.object, // eslint-disable-line
};
