import React from 'react';
import { render } from 'react-dom';
import Root from './components/Root';
import { createStore, applyMiddleware, compose } from 'redux';
import createLogger from 'redux-logger';
import combinedReducer from './reducers/combinedReducer';
import thunk from 'redux-thunk';

const reduxMiddleware = applyMiddleware(thunk, createLogger());

const store = createStore(
  combinedReducer,
  compose(
    reduxMiddleware));

render(
  <Root store={store} />,
  document.getElementById('app'));