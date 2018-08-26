import React from 'react';
import 'babel-polyfill';
import ReactDOM from 'react-dom';
import { Router, Route } from 'react-router';
import { Provider } from 'react-redux';
import { DrizzleProvider } from 'drizzle-react';
import CssBaseline from '@material-ui/core/CssBaseline';

// Layouts
import { LoadingContainer } from 'drizzle-react-components';
import App from './App';

import './globalStyles';

import { history, store } from './store';
import drizzleOptions from './drizzleOptions';

ReactDOM.render(
  <React.Fragment>
    <CssBaseline />
    <DrizzleProvider options={drizzleOptions}>
      <Provider store={store}>
        <LoadingContainer>
          <Router history={history} store={store}>
            <Route exact path="/" component={App} />
          </Router>
        </LoadingContainer>
      </Provider>
    </DrizzleProvider>
  </React.Fragment>,
  document.getElementById('root'), // eslint-disable-line no-undef
);
