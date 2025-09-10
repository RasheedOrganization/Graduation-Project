import React from 'react';
import {WebView} from 'react-native-webview';
import {WEB_URL} from './src/config';

export default function App(): React.JSX.Element {
  return <WebView source={{uri: WEB_URL}} style={{flex: 1}} />;
}
