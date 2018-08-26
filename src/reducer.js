import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import { reducer as formReducer } from 'redux-form';
import { drizzleReducers } from 'drizzle';

const reducer = combineReducers({
  routing: routerReducer,
  form: formReducer,
  ...drizzleReducers,
});

export default reducer;
