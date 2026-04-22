import { GoogleSignin } from '@react-native-google-signin/google-signin';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// import BleScanner from '../components/BleScanner';
import BleScanner from '../components/BleScannerLogOnly';

export default function HomeScreen({ route, navigation }: any) {
  const user = route?.params?.user;
  const avatarUri = user?.photo;
  const initial = user?.name ? String(user.name).trim().charAt(0).toUpperCase() : 'U';

  if (!user) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.emptyStateCard}>
          <Text style={styles.emptyStateTitle}>No user data found</Text>
          <Text style={styles.emptyStateText}>Please sign in again to continue.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleLogout = async () => {
    await GoogleSignin.signOut();
    navigation.replace('Login');
    console.log('USER LOGOUT AND BACK TO ONBOARDIG SCREEN');
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.backgroundBlobTop} />
      <View style={styles.backgroundBlobBottom} />

      <View style={styles.content}>
        <Text style={styles.pageTitle}>Module Control</Text>
        <Text style={styles.pageSubtitle}>Welcome back</Text>

        <View style={styles.profileCard}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.image} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarFallbackText}>{initial}</Text>
            </View>
          )}

          <View style={styles.profileInfo}>
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.email}>{user.email}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={styles.scannerCard}>
          <BleScanner/>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F3F7F4',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
  },
  backgroundBlobTop: {
    // position: 'absolute',
    // width: 220,
    // height: 220,
    // borderRadius: 110,
    // backgroundColor: '#D9EED9',
    // top: -80,
    // right: -70,
  },
  backgroundBlobBottom: {
    // position: 'absolute',
    // width: 260,
    // height: 260,
    // borderRadius: 130,
    // backgroundColor: '#E6DFF7',
    // bottom: -120,
    // left: -100,
  },
  pageTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#173320',
  },
  pageSubtitle: {
    marginTop: 4,
    marginBottom: 20,
    fontSize: 16,
    color: '#4B6554',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4ECE7',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  image: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  avatarFallback: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#1F7A4C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFallbackText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 14,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#172B1E',
  },
  email: {
    marginTop: 4,
    fontSize: 14,
    color: '#557163',
  },
  logoutBtn: {
    marginTop: 16,
    marginBottom: 16,
    backgroundColor: '#1F7A4C',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.3,
  },
  scannerCard: {
    flex: 1,
    padding: 16,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4ECE7',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#183324',
  },
  sectionHint: {
    marginTop: 6,
    marginBottom: 12,
    fontSize: 13,
    color: '#5A7667',
  },
  emptyStateCard: {
    margin: 20,
    padding: 20,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4ECE7',
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#173320',
  },
  emptyStateText: {
    marginTop: 6,
    color: '#557163',
  },
});