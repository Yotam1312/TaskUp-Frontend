import React, { useState, useEffect } from 'react';
import { View, Platform, Alert, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { MotiView } from 'moti';
import { useColorScheme } from 'nativewind';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { I18nManager } from 'react-native';

// --- התוספות עבור ההתראות ---
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
// ----------------------------

import LoginPage from './pages/LoginPage';
import Dashboard from './pages/DashBoard';
import { translations } from './translations';
import '../global.css';

I18nManager.allowRTL(false);
I18nManager.forceRTL(false);

const Stack = createNativeStackNavigator();
//הגדרת משתנים לשמירה של מצב יום/לילה וגם של שפה
const PREF_LANGUAGE_KEY = 'taskup.pref.language';
const PREF_THEME_KEY = 'taskup.pref.theme';
const PREF_USERNAME_KEY = 'taskup.pref.username';

// הגדרת התנהגות ההתראות כשהאפליקציה פתוחה (Foreground)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// פותר את בעיית הרקע הלבן בבילד של אנדרואיד
const transparentTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: 'transparent',
  },
};

export default function App() {
  const [accessToken, setAccessToken] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [hasStoredToken, setHasStoredToken] = useState(false);
  const { colorScheme, setColorScheme } = useColorScheme();
  const darkMode = colorScheme === 'dark';
  const [language, setLanguage] = useState('he');
  const [username, setUsername] = useState('');
  const [expoPushToken, setExpoPushToken] = useState(''); // שמירת הטוקן בסטייט
  const [prefsHydrated, setPrefsHydrated] = useState(false);//מונע שמירה דיפולטיבית של ערכים לפני שסיימנו לטעון את כל מה שיש בזכרון

  const [notificationsSettings, setNotificationsSettings] = useState({
    daysBefore: [],
    newAssignment: true,
    dateChange: true,
  });

  const toggleDarkMode = () => setColorScheme(darkMode ? 'light' : 'dark');
  const t = translations[language];

  // פונקציית הרישום
  async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        Alert.alert('שגיאה', 'לא התקבל אישור לשליחת התראות');
        return;
      }

      // שליפת הטוקן מהשרתים של Expo
      try {
        const projectId = Constants.expoConfig?.extra?.eas?.projectId;
        if (!projectId) throw new Error('Project ID not found');

        token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
        console.log("Your Expo Push Token:", token); // כאן תראה את הטוקן בטרמינל
      } catch (e) {
        console.log("Error getting token:", e);
      }
    } else {
      console.log('Must use physical device for Push Notifications');
    }

    return token;
  }

  useEffect(() => {
    let isMounted = true;
    //פונקציה שבעת העלאה של האפליקציה זה טוען מהזכרון את ההגדרות
    const hydratePreferences = async () => {
      try {
        const [storedLanguage, storedTheme, storedUsername] = await Promise.all([
          AsyncStorage.getItem(PREF_LANGUAGE_KEY),
          AsyncStorage.getItem(PREF_THEME_KEY),
          AsyncStorage.getItem(PREF_USERNAME_KEY),
        ]);

        if (!isMounted) return;

        if (storedLanguage === 'he' || storedLanguage === 'en') {
          setLanguage(storedLanguage);
        }

        if (storedTheme === 'dark' || storedTheme === 'light') {
          setColorScheme(storedTheme);
        } else {
          setColorScheme('light');
        }

        if (storedUsername) {
          setUsername(storedUsername);
        }
      } catch (error) {
        console.log('Failed to hydrate preferences:', error);
        if (isMounted) setColorScheme('light');
      } finally {
        if (isMounted) setPrefsHydrated(true);
      }
    };

    const hydrateAuthToken = async () => {
      try {
        const storedAccessToken = await SecureStore.getItemAsync('access_token');
        if (!isMounted) return;

        if (storedAccessToken) {
          setAccessToken(storedAccessToken);
          setHasStoredToken(true);
        } else {
          setAccessToken(null);
          setHasStoredToken(false);
        }
      } catch (error) {
        console.log('Failed to hydrate auth token:', error);
        if (isMounted) {
          setAccessToken(null);
          setHasStoredToken(false);
        }
      } finally {
        if (isMounted) setAuthChecked(true);
      }
    };

    hydratePreferences();
    hydrateAuthToken();
    registerForPushNotificationsAsync().then(token => setExpoPushToken(token));

    return () => {
      isMounted = false;
    };
  }, []);

  //שמירה של שפה בצורה אוטומטית
  useEffect(() => {
    if (!prefsHydrated) return;
    AsyncStorage.setItem(PREF_LANGUAGE_KEY, language).catch((error) => {
      console.log('Failed to save language preference:', error);
    });
  }, [language, prefsHydrated]);

  //שמירה של צבע בצורה אוטומטית
  useEffect(() => {
    if (!prefsHydrated) return;
    const themeValue = darkMode ? 'dark' : 'light';
    AsyncStorage.setItem(PREF_THEME_KEY, themeValue).catch((error) => {
      console.log('Failed to save theme preference:', error);
    });
  }, [darkMode, prefsHydrated]);

  if (!authChecked) {
    return (
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: darkMode ? '#020617' : '#f8fafc',
            }}
          >
            <Image
              source={require('./assets/splash.png')}
              style={{ width: '100%', height: '100%' }}
              resizeMode="contain"
            />
          </View>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={{ flex: 1, backgroundColor: darkMode ? '#020617' : '#f8fafc' }}>
          <StatusBar style={darkMode ? 'light' : 'dark'} translucent={true} />

          {/* Aurora blobs */}
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' }} pointerEvents="none">
            <MotiView
              from={{ scale: 1, opacity: 0.25 }}
              animate={{ scale: 1.15, opacity: 0.4 }}
              transition={{ type: 'timing', duration: 8000, loop: true, repeatReverse: true }}
              style={{ position: 'absolute', top: '-5%', left: '-10%', width: 400, height: 400, borderRadius: 200, backgroundColor: darkMode ? '#4c1d95' : '#ede9fe' }}
            />
            <MotiView
              from={{ scale: 1, opacity: 0.25 }}
              animate={{ scale: 1.15, opacity: 0.4 }}
              transition={{ type: 'timing', duration: 8000, loop: true, repeatReverse: true, delay: 2000 }}
              style={{ position: 'absolute', top: '20%', right: '-15%', width: 350, height: 350, borderRadius: 175, backgroundColor: darkMode ? '#1e1b4b' : '#e0e7ff' }}
            />
            <MotiView
              from={{ scale: 1, opacity: 0.25 }}
              animate={{ scale: 1.15, opacity: 0.4 }}
              transition={{ type: 'timing', duration: 8000, loop: true, repeatReverse: true, delay: 4000 }}
              style={{ position: 'absolute', bottom: '-5%', left: '20%', width: 500, height: 500, borderRadius: 250, backgroundColor: darkMode ? '#1e3a5f' : '#dbeafe' }}
            />
          </View>

          <NavigationContainer theme={transparentTheme}>
            <Stack.Navigator
              initialRouteName={hasStoredToken ? 'Dashboard' : 'Login'}
              screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}
            >
              <Stack.Screen name="Login">
                {(props) => (
                  <LoginPage
                    {...props}
                    language={language}
                    setLanguage={setLanguage}
                    setAccessToken={setAccessToken}
                    setUsername={setUsername}
                    t={t}
                    darkMode={darkMode}
                  />
                )}
              </Stack.Screen>

              <Stack.Screen name="Dashboard" options={{ gestureEnabled: false, headerShown: false }}>
                {(props) => (
                  <Dashboard
                    {...props}
                    language={language}
                    setLanguage={setLanguage}
                    darkMode={darkMode}
                    toggleDarkMode={toggleDarkMode}
                    notificationsSettings={notificationsSettings}
                    setNotificationsSettings={setNotificationsSettings}
                    expoPushToken={expoPushToken}
                    accessToken={accessToken}
                    setAccessToken={setAccessToken}
                    username={username}
                    setUsername={setUsername}
                    t={t}
                  />
                )}
              </Stack.Screen>
            </Stack.Navigator>
          </NavigationContainer>

        </View>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}