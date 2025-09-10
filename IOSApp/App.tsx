import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {View, Text, StyleSheet} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AsyncButton from './src/components/AsyncButton';
import BACKEND_URL from './src/config';

const Stack = createNativeStackNavigator();

function HomeScreen(): React.JSX.Element {
  const saveTime = async () => {
    await AsyncStorage.setItem('lastPress', new Date().toISOString());
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Backend: {BACKEND_URL}</Text>
      <AsyncButton onPress={saveTime}>Save Timestamp</AsyncButton>
    </View>
  );
}

export default function App(): React.JSX.Element {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginBottom: 16,
    fontSize: 18,
  },
});
