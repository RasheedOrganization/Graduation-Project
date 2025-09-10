import React, {useEffect, useRef} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {View, Text, StyleSheet, Animated, Easing} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AsyncButton from './src/components/AsyncButton';
import BACKEND_URL from './src/config';

const Stack = createNativeStackNavigator();

function HomeScreen(): React.JSX.Element {
  const saveTime = async () => {
    await AsyncStorage.setItem('lastPress', new Date().toISOString());
  };

  const bounce = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, {
          toValue: -20,
          duration: 1000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(bounce, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [bounce]);

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require('./src/assets/logo.png')}
        style={[styles.logo, {transform: [{translateY: bounce}]}]}
      />
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
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    marginBottom: 16,
    fontSize: 18,
  },
});
