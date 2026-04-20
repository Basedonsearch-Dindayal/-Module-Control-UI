import { GoogleSignin } from '@react-native-google-signin/google-signin';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen({ route, navigation }: any) {
  const user = route?.params?.user;

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>No user data</Text>
      </View>
    );
  }

  const handleLogout = async () => {
  await GoogleSignin.signOut();
  navigation.replace('Login');
};

  return (
    <>
      <View style={styles.container}>
        <Image source={{ uri: user.photo }} style={styles.image} />
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>

        <TouchableOpacity onPress={handleLogout}>
          <Text>Switch Account</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.container}>
        <Text style={styles.name}>Device Nearby:</Text>
        <Text style={styles.email}>Sample 123</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 16,
    color: '#666',
  },
  logoutBtn: {
    marginTop: 20,
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 8,
  },
});