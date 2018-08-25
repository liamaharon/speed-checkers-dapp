import { drizzleConnect } from 'drizzle-react';
import Home from './Home';

// May still need this even with data function to refresh component on updates for this contract.
const mapStateToProps = state => ({
  accounts: state.accounts,
  accountBalances: state.accountBalances,
  SimpleStorage: state.contracts.SimpleStorage,
  TutorialToken: state.contracts.TutorialToken,
  drizzleStatus: state.drizzleStatus,
});

const HomeContainer = drizzleConnect(Home, mapStateToProps);

export default HomeContainer;
