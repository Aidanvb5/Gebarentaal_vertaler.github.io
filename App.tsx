import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import Login from './Login';
import SignUp from './SignUp';

const App = () => {
  const [page, setPage] = useState<'welcome' | 'login' | 'signup' | 'home'>('welcome');

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
        <Button title="Log Out" onPress={() => setPage('welcome')} />
      </View>
    );
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
