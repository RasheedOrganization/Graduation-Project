/**
 * @format
 */

import 'react-native';
import React from 'react';
import renderer from 'react-test-renderer';

jest.mock('react-native-webview', () => {
  const {View} = require('react-native');
  return {WebView: View};
});

const App = require('../App').default;

it('renders correctly', () => {
  renderer.create(<App />);
});
