import React, { useState } from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { MotiView } from 'moti';
import { useColorScheme } from 'nativewind';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/DashBoard';
import { translations } from './translations';
import '../global.css';

const Stack = createNativeStackNavigator();

export default function App() {
  const { colorScheme, setColorScheme } = useColorScheme();
  const darkMode = colorScheme === 'dark';
  const [language, setLanguage] = useState('he');
  const [notificationsSettings, setNotificationsSettings] = useState({
    daysBefore: ["1d"],
    newAssignment: true,
    dateChange: true,
  });

  const toggleDarkMode = () => setColorScheme(darkMode ? 'light' : 'dark');
  const t = translations[language];

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1, backgroundColor: darkMode ? '#020617' : '#f8fafc' }}>

        {/* Aurora blobs - colored circles that simulate the soft background effect */}
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
                  t={t}
                  darkMode={darkMode}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="Dashboard">
              {(props) => (
                <Dashboard
                  {...props}
                  language={language}
                  setLanguage={setLanguage}
                  darkMode={darkMode}
                  toggleDarkMode={toggleDarkMode}
                  notificationsSettings={notificationsSettings}
                  setNotificationsSettings={setNotificationsSettings}
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
