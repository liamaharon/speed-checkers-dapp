import React from 'react';
import { Route } from 'react-router';
import HomeContainer from './layouts/home/HomeContainer';

const App = () => (
  <div className="App">
    <Route exact path="/" component={HomeContainer} />
  </div>
);

export default App;
