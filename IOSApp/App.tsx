import React, {useState} from 'react';
import {View, TouchableOpacity, Text, Modal, StyleSheet} from 'react-native';
import {WebView} from 'react-native-webview';
import {WEB_URL} from './src/config';

export default function App(): React.JSX.Element {
  const [menuVisible, setMenuVisible] = useState(false);
  const toggleMenu = () => setMenuVisible(prev => !prev);

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={toggleMenu} style={styles.menuButton}>
          <Text style={styles.menuText}>Menu</Text>
        </TouchableOpacity>
      </View>
      <WebView
        source={{uri: WEB_URL}}
        style={styles.webView}
        injectedJavaScript={
          "document.body.style.zoom='0.8';document.body.style.fontSize='80%';true;"
        }
      />
      <Modal
        visible={menuVisible}
        transparent
        animationType="slide"
        onRequestClose={toggleMenu}>
        <View style={styles.menuContainer}>
          <View style={styles.menuContent}>
            <TouchableOpacity onPress={toggleMenu} style={styles.menuItem}>
              <Text style={styles.menuItemText}>Close</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuItemText}>Problems</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuItemText}>Sections</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuItemText}>Resources</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  topBar: {
    height: '10%',
    backgroundColor: '#000',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  menuButton: {
    padding: 8,
  },
  menuText: {
    color: '#fff',
    fontSize: 14,
  },
  webView: {flex: 1},
  menuContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  menuContent: {
    width: 200,
    backgroundColor: '#fff',
    height: '100%',
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  menuItem: {
    paddingVertical: 10,
  },
  menuItemText: {
    fontSize: 16,
    color: '#000',
  },
});
