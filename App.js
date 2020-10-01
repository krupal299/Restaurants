import React, {Component} from 'react';
import Routers from './src';
import {Provider} from 'react-redux';
import store from './src/store';

export default class App extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Provider store={store}>
        <Routers />
      </Provider>
    );
  }
}
