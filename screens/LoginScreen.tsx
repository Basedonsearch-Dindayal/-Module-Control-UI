import { GoogleSignin } from '@react-native-google-signin/google-signin';
import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

const SPLASH_PAGES = [
  {
    title: 'Welcome to ModuleControl',
    subtitle: 'Control your modules quickly and stay connected to your account.',
  },
  {
    title: 'Track Everything',
    subtitle: 'View account data, switch users, and keep your workflow organized.',
  },
  {
    title: 'Ready to Continue?',
    subtitle: 'Sign in with Google to start using the app.',
  },
];

export default function LoginScreen({ navigation }: any) {
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const isSignedIn = await GoogleSignin.hasPreviousSignIn();

        if (isSignedIn) {
          const userInfo = await GoogleSignin.signInSilently();

          console.log('SILENT:', userInfo);

          const user = userInfo?.data?.user || userInfo?.data;

          if (user) {
            navigation.replace('Home', { user });
            return;
          }
        }
      } catch (error) {
        console.log('Auto login error:', error);
      }

      setLoading(false);
    };

    GoogleSignin.configure({
      webClientId:
        '180915839120-9emrb3b1bsr8io5bpu27h9ge6ck1n016.apps.googleusercontent.com',
      });
    checkUser();

  }, [navigation]);

  const handleGoogleLogin = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();

      console.log('LOGIN:', userInfo);

      const user = userInfo?.data?.user ?? userInfo?.data ?? null;

      if (user) {
        navigation.replace('Home', { user });
      }
    } catch (error) {
      console.log('Login error:', error);
    }
  };

  const goToPage = (pageIndex: number) => {
    scrollRef.current?.scrollTo({ x: pageIndex * width, animated: true });
    setCurrentPage(pageIndex);
  };

  const onScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const pageIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentPage(pageIndex);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Checking login...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
        contentContainerStyle={styles.scrollContent}
      >
        {SPLASH_PAGES.map((page, index) => (
          <View key={page.title} style={styles.page}>
            <Text style={styles.title}>{page.title}</Text>
            <Text style={styles.subtitle}>{page.subtitle}</Text>

            {index === 2 ? (
              <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
                <Text style={styles.googleText}>Continue with Google</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.dotsWrap}>
          {SPLASH_PAGES.map((page, index) => (
            <View
              key={page.title}
              style={[styles.dot, index === currentPage ? styles.dotActive : null]}
            />
          ))}
        </View>

        {currentPage < 2 ? (
          <TouchableOpacity style={styles.nextButton} onPress={() => goToPage(currentPage + 1)}>
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
  },
  page: {
    width,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 17,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  dotsWrap: {
    flexDirection: 'row',
    marginBottom: 18,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#D4D4D8',
    marginHorizontal: 4,
  },
  dotActive: {
    width: 24,
    backgroundColor: '#111827',
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
  nextButton: {
    backgroundColor: '#111827',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});