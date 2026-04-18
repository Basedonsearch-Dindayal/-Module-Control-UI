import {
    GoogleSignin,
    isSuccessResponse,
} from '@react-native-google-signin/google-signin';
import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function LoginScreen({ navigation }: any) {

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '180915839120-9emrb3b1bsr8io5bpu27h9ge6ck1n016.apps.googleusercontent.com',
    });
  }, []);

  const handleGoogleLogin = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();

      console.log('FULL:', userInfo);

      if (isSuccessResponse(userInfo)) {
        console.log('USER ONLY:', userInfo.data.user);
        navigation.navigate('Home', {
          user: userInfo.data.user,
        });
      }
    } catch (error) {
      console.log('ERROR:', error);
    }
  };

  return (
    <View style={styles.container}>
      
      <Text style={styles.title}>Welcome 👋</Text>
      <Text style={styles.subtitle}>Login to continue</Text>

      <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
        <Text style={styles.googleText}>Continue with Google</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  googleButton: {
    backgroundColor: '#4285F4',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  googleText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});