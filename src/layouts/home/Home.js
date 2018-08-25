import React, { Component } from 'react';
import PropTypes from 'prop-types';
// import { AccountData, ContractData, ContractForm } from 'drizzle-react-components';
import Typography from '@material-ui/core/Typography';
import { parseEthBalance } from '../../util/ethereum';

import {
  OuterWrapper, Header, AccWrapper, Balance,
} from './style';

class Home extends Component { // eslint-disable-line react/prefer-stateless-function
  render() {
    const { accounts, accountBalances } = this.props;
    const balance = parseEthBalance(accountBalances[accounts[0]]);
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
              {accounts[0]}
            </Typography>
            <Balance>
              <Typography variant="title">
                {`Balance: ${balance.toFixed(6)} ETH`}
              </Typography>
            </Balance>
          </AccWrapper>
        </Header>
      </OuterWrapper>
    );
  }
}

export default Home;

Home.propTypes = {
  accounts: PropTypes.objectOf(PropTypes.string).isRequired,
  accountBalances: PropTypes.objectOf(PropTypes.string).isRequired,
};
