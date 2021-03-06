import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { createStore, applyMiddleware, compose } from 'redux'
import { Provider } from 'react-redux'
import { connect } from 'react-redux'
import createSagaMiddleware from 'redux-saga'
import setupSocket from './sockets'
import username from './username'
import handleInput from './saga'
import {onChange, onBeforeChange, localChange} from './actions'
import {localInsertionReducer, localDeletionReducer, remoteInsertionReducer, remoteDeletionReducer} from './reducers'
import  {structToText} from  './util.js'


const sagaMiddleware = createSagaMiddleware()

const createReducer = (
  initialState,
  handlers
) => (state = initialState, action) =>
  handlers.hasOwnProperty(action.type)
    ? handlers[action.type](state, action)
    : state

const editor = createReducer(
  {
    struct: []
  },
  {
    'LOCAL_INSERTION': localInsertionReducer,
    'LOCAL_DELETION': localDeletionReducer,
    'BROADCAST_INSERT': remoteInsertionReducer,
    'BROADCAST_DELETE': remoteDeletionReducer,
  }
)

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(editor, composeEnhancers(applyMiddleware(sagaMiddleware)))

const mapStateToProps = (state) => {
  console.log('struct')
  console.log(state.struct)
  return {value: structToText(state.struct)}
}

const mapDispatchToProps = {
  onChange,
  onBeforeChange,
  localChange
}

const AppContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(App)

const socket = setupSocket(store.dispatch, username)
sagaMiddleware.run(handleInput, { socket, username })

ReactDOM.render(
  <Provider store={store}>
    <AppContainer />
  </Provider>,
  document.getElementById('root')
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
