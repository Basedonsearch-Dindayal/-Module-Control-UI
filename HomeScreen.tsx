import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
export default function HomeScreen({ route }: any) {
  console.log('ROUTE:', route?.params);
  const user = route?.params?.user;

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>No user data</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image source={{ uri: user.photo }} style={styles.image} />
      <Text style={styles.name}>{user.name}</Text>
      <Text style={styles.email}>{user.email}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
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
});