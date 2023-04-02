import { StatusBar } from 'expo-status-bar';
import { useEffect, useState, useCallback } from 'react';
import { Alert, Button, Linking, StyleSheet, View, Text } from 'react-native';
// import './App.css';
import axios from 'axios';

import WebPlayback from './components/WebPlayback';
// import Login from './components/Login';

const OpenURLButton = ({ url, children }) => {
  const handlePress = useCallback(async () => {
    // Checking if the link is supported for links with custom URL scheme.
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      // Opening the link with some app, if the URL scheme is "http" the web link should be opened
      // by some browser in the mobile
      await Linking.openURL(url);
    } else {
      Alert.alert(`Don't know how to open this URL: ${url}`);
    }
  }, [url]);

  return <Button title={children} onPress={handlePress} />;
};

export default function App() {
  const [token, setToken] = useState('');

  useEffect(() => {
    async function getToken() {
      const response = await axios('http://localhost:5000/auth/token');
      const token = response.data.token;
      if (localStorage.getItem('token')) {
        localStorage.setItem('token', token);
      }

      if (token) {
        setToken(token);
      }
    }

    getToken();
  }, []);

  return (
    <View style={styles.container}>
      {token ? (
        <OpenURLButton
          url='http://localhost:5000/auth/login'
          children='Login with Spotify'
        />
      ) : (
        <WebPlayback token={token} />
      )}
      <StatusBar style='auto' />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
