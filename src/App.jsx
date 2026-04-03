import React, { useState, useEffect } from 'react';
import { View, Platform, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { MotiView } from 'moti';
import { useColorScheme } from 'nativewind';

// --- התוספות עבור ההתראות ---
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
// ----------------------------

import LoginPage from './pages/LoginPage';
import Dashboard from './pages/DashBoard';
import { translations } from './translations';
import '../global.css';

const Stack = createNativeStackNavigator();


// הגדרת התנהגות ההתראות כשהאפליקציה פתוחה (Foreground)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [accessToken, setAccessToken] = useState(null);
  const { colorScheme, setColorScheme } = useColorScheme();
  const darkMode = colorScheme === 'dark';
  const [language, setLanguage] = useState('he');
  const [expoPushToken, setExpoPushToken] = useState(''); // שמירת הטוקן בסטייט

  const [notificationsSettings, setNotificationsSettings] = useState({
    daysBefore: ["1d"],
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
    setColorScheme('light');
    registerForPushNotificationsAsync().then(token => setExpoPushToken(token));
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1, backgroundColor: darkMode ? '#020617' : '#f8fafc' }}>

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

        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Login"
            screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}
          >
            <Stack.Screen name="Login">
              {(props) => (
                <LoginPage
                  {...props}
                  language={language}
                  setLanguage={setLanguage}
                  setAccessToken={setAccessToken} // <--- הנה זה!
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
                  accessToken={accessToken} // <--- מעביר ל-Dashboard את הערך עצמו
                  t={t}
                />
              )}
            </Stack.Screen>
          </Stack.Navigator>
        </NavigationContainer>

      </View>
    </GestureHandlerRootView>
  );
}