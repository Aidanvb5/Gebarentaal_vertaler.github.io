import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import HandTracker from './pages/HandTracker';

const App = () => {
  const [page, setPage] = useState<'welcome' | 'login' | 'signup' | 'home' | 'handtracker'>('welcome');

  const onLoginSuccess = () => {
    setPage('home');
  };

  const onSignUpSuccess = () => {
    setPage('login');
  };

  if (page === 'welcome') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Welcome</Text>
        <View style={styles.buttonContainer}>
          <Button title="Log In" onPress={() => setPage('login')} />
          <Button title="Sign Up" onPress={() => setPage('signup')} />
          <Button title="Hand Tracker" onPress={() => setPage('handtracker')} />
        </View>
      </View>
    );
  }

  if (page === 'login') {
    return <Login onLoginSuccess={onLoginSuccess} />;
  }

  if (page === 'signup') {
    return <SignUp onSignUpSuccess={onSignUpSuccess} />;
  }

  if (page === 'home') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Home Screen</Text>
        <Text>You are logged in!</Text>
        <View style={styles.buttonContainer}>
          <Button title="Log Out" onPress={() => setPage('welcome')} />
          <Button title="Hand Tracker" onPress={() => setPage('handtracker')} />
        </View>
      </View>
    );
  }

  if (page === 'handtracker') {
    return <HandTracker onBack={() => setPage('welcome')} />;
  }

  return null;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#f2f2f2',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});

export default App;
