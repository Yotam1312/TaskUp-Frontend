import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, Animated, Easing,
  StyleSheet, Pressable,
} from 'react-native';
import { Menu, X, CheckCircle, Clock, Archive, LogOut, Settings, List } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import TaskCard from '../components/TaskCard';
import TaskCardSkeleton from '../components/TaskCardSkeleton';
import SettingsPage from './SettingsPage';
import { Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import { 
  fetchAllTasks, 
  markSubmitted, 
  markArchived, 
  registerDeviceToken, 
  unmarkSubmitted,
  unmarkArchived
} from '../api';
import {FlatList, ActivityIndicator, RefreshControl } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function transformTask(apiTask) {
  const date = new Date(apiTask.due_date);  // עכשיו ISO string מהDB
  const pad = (n) => n.toString().padStart(2, '0');
  const dueDateDisplay = `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
  const dueTimeDisplay = `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  return {
    id: apiTask.id,
    title: apiTask.title,
    course: apiTask.course,
    dueDateDisplay,
    dueTimeDisplay,
    dueDateIso: date.toISOString(),
    status: apiTask.computed_status,
    link: apiTask.link || '',
    submittedLate: false,
  };
}

export default function Dashboard({
  route, language, setLanguage, darkMode, toggleDarkMode,
  notificationsSettings, setNotificationsSettings,expoPushToken, t,accessToken,
}) {
  const { username = '', access_token = '', refresh_token = '' } = route?.params || {};
  const navigation = useNavigation();
  const [greeting, setGreeting] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tabBarWidth, setTabBarWidth] = useState(0);
  const isRTL = true
  const [scrollPadding, setScrollPadding] = useState(20);
  const [tasks, setTasks] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);



  // Tab indicator animation (0 = pending, 1 = completed)
  const indicatorAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(indicatorAnim, {
      toValue: activeTab === 'pending' ? 0 : 1,
      useNativeDriver: false,
      damping: 20,
      stiffness: 200,
    }).start();
  }, [activeTab]);

  // Pulse animation for pending count
  const pulseAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (pendingCount > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation(() => pulseAnim.setValue(1));
    }
  }, [pendingCount]);

  // Floating blob animations
  const blob1Anim = useRef(new Animated.Value(0)).current;
  const blob2Anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(blob1Anim, { toValue: 1, duration: 4000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(blob1Anim, { toValue: 0, duration: 4000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(blob2Anim, { toValue: 1, duration: 5500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(blob2Anim, { toValue: 0, duration: 5500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, []);



  // Drawer slide-in animation
  const drawerAnim = useRef(new Animated.Value(-300)).current;

  useEffect(() => {
    Animated.spring(drawerAnim, {
      toValue: isMenuOpen ? 0 : -300,
      useNativeDriver: true,
      damping: 20,
      stiffness: 200,
    }).start();
  }, [isMenuOpen]);

  useEffect(() => {
  if (expoPushToken && accessToken) {
    registerDeviceToken(accessToken, expoPushToken)
      .then(() => console.log("Device registered in DB!"))
      .catch(err => console.error("Registration failed:", err));
  }
}, [expoPushToken, accessToken]);

  

  const scrollViewRef = useRef(null);
  const cardPositions = useRef({});

const scrollToCard = (taskId) => {
  setScrollPadding(400); // מוסיף את המרווח
  setTimeout(() => {
    const y = cardPositions.current[taskId];
    if (y !== undefined && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y, animated: true });
    }
  }, 100); // מחכה שהמרווח יתרנדר ואז גולל
};

const loadData = async () => {
  if (!access_token) return;
  setIsLoading(true);
  try {
    const data = await fetchAllTasks(access_token);
    setTasks(data.map(transformTask));
    setPendingCount(data.filter(t => t.computed_status === 'pending').length);
  } catch (error) {
    setTasks([]);
  } finally {
    setIsLoading(false);
  }
};

useEffect(() => {
  loadData();
}, []);

useEffect(() => {
  const subscription = Notifications.addNotificationReceivedListener(notification => {
    loadData(); 
  });
  return () => subscription.remove();
}, [access_token]);


  useEffect(() => {
    const hour = new Date().getHours();
    const user = username || 'משתמש';
    let timeGreeting = '';
    if (hour >= 5 && hour < 12) timeGreeting = t.greeting.morning;
    else if (hour >= 12 && hour < 18) timeGreeting = t.greeting.afternoon;
    else if (hour >= 18 && hour < 22) timeGreeting = t.greeting.evening;
    else timeGreeting = t.greeting.night;
    setGreeting(`${timeGreeting}, ${user}`);
  }, [language, t]);

  useEffect(() => {
  // בדיקה ששני הנתונים קיימים
  if (accessToken && expoPushToken) {
    console.log(" Sending token to backend");
    
    registerDeviceToken(accessToken, expoPushToken)
      .then(() => console.log(" Device registered in DB!"))
      .catch(err => console.error(" Registration failed:", err));
  }
}, [accessToken, expoPushToken]); // ירוץ רק כשאחד מהם משתנה

const handleTaskAction = async (action, taskId) => {
  // 1. שמירת המצב הנוכחי למקרה של שגיאה
  const previousTasks = [...tasks];

  // 2. עדכון אופטימי - הסרת המטלה מהמסך מיד
  setTasks(prevTasks => prevTasks.filter(t => t.id !== taskId));

  try {
    // 3. שליחה לשרת ב-Background
    if (action === 'markAsSubmitted') await markSubmitted(access_token, taskId);
    else if (action === 'undoSubmit') await unmarkSubmitted(access_token, taskId);
    else if (action === 'moveToArchive') await markArchived(access_token, taskId);
    else if (action === 'unarchive') await unmarkArchived(access_token, taskId);
    
    // רענון נתונים שקט כדי לוודא סנכרון
    loadData(); 
  } catch (error) {
    // 4. אם נכשל - מחזירים את המצב לקדמותו
    setTasks(previousTasks);
    Alert.alert("אופס", "העדכון נכשל, מנסה לסנכרן מחדש...");
  }
};

  const filteredTasks = tasks.filter(task => task.status === activeTab);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setIsMenuOpen(false);
  };



const handleLogoutPress = () => {
  Alert.alert(
    t.menu.logout, 
    t.menu.logoutConfirm, // שימוש במילון במקום במלל קבוע
    [
      {
        text: language === 'he' ? "ביטול" : "Cancel",
        style: "cancel",
      },
      {
        text: t.menu.logout,
        style: "destructive",
        onPress: () => {
          setIsMenuOpen(false);
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        },
      },
    ]
  );
};

  const iconColor = darkMode ? '#94a3b8' : '#334155';
  const menuBg = darkMode ? 'rgba(15,23,42,0.97)' : 'rgba(255,255,255,0.97)';
  const menuTextColor = darkMode ? '#cbd5e1' : '#475569';
  const activeMenuBg = darkMode ? 'rgba(79,70,229,0.2)' : '#eef2ff';

  // Sliding tab indicator: positioned with 'right' in RTL, 'left' in LTR
  const half = tabBarWidth / 2;
  const indicatorPositionStyle = tabBarWidth > 0 ? {
    position: 'absolute',
    top: 4, bottom: 4,
    width: half - 4,
    backgroundColor: darkMode ? '#334155' : 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    [isRTL ? 'right' : 'left']: indicatorAnim.interpolate({
      inputRange: [0, 1],
      // RTL: pending(0)=right side => right: half+2; completed(1)=left side => right: 2
      // LTR: pending(0)=left side => left: 2; completed(1)=right side => left: half+2
      outputRange: [2, half + 2],
    }),
  } : null;

  return (
    <View style={{ flex: 1 }}>
      {/* Floating background blobs */}
      <Animated.View pointerEvents="none" style={{
        position: 'absolute', width: 220, height: 220, borderRadius: 110,
        backgroundColor: darkMode ? 'rgba(79,70,229,0.07)' : 'rgba(79,70,229,0.06)',
        top: -40, right: -60,
        transform: [{ translateY: blob1Anim.interpolate({ inputRange: [0, 1], outputRange: [0, 18] }) }],
      }} />
      <Animated.View pointerEvents="none" style={{
        position: 'absolute', width: 160, height: 160, borderRadius: 80,
        backgroundColor: darkMode ? 'rgba(124,58,237,0.06)' : 'rgba(124,58,237,0.05)',
        bottom: 80, left: -50,
        transform: [{ translateY: blob2Anim.interpolate({ inputRange: [0, 1], outputRange: [0, -14] }) }],
      }} />

      {/* Header */}
      <View style={{
        paddingHorizontal: 24, paddingTop: 56, paddingBottom: 16, marginTop: 10,
        flexDirection: isRTL ? 'row-reverse' : 'row',
        justifyContent: 'space-between', alignItems: 'center',
      }}>
        <View style={{ alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
          {activeTab === 'settings' ? (
            <Text style={{ fontSize: 24, fontWeight: '700', color: darkMode ? 'white' : '#1e293b' }}>
              {t.settings.title}
            </Text>
          ) : (
            <>
              <Text style={{ fontSize: 23, fontWeight: '700', color: darkMode ? 'white' : '#1e293b' }}>
                {greeting}
              </Text>
              <Animated.Text style={{ fontSize: 14, fontWeight: '600', color: darkMode ? '#94a3b8' : '#475569', transform: [{ scale: pulseAnim }] }}>
                {language === 'he'
                  ? `יש לך ${pendingCount} ${t.tasks.pendingCount}`
                  : `You have ${pendingCount} ${t.tasks.pendingCount}`}
              </Animated.Text>
            </>
          )}
        </View>

        <TouchableOpacity
          onPress={() => setIsMenuOpen(true)}
          style={{
            padding: 8,
            backgroundColor: darkMode ? 'rgba(30,41,59,0.5)' : 'rgba(255,255,255,0.5)',
            borderRadius: 100,
          }}
          activeOpacity={0.7}
        >
          <Menu size={26} color={iconColor} />
        </TouchableOpacity>
      </View>

      {/* Pending / Completed Tabs */}

      {(activeTab === 'pending' || activeTab === 'completed') && (
        <>
          <View
            onLayout={(e) => setTabBarWidth(e.nativeEvent.layout.width)}
            style={{
              marginHorizontal: 24, marginTop: 8, height: 56,
              backgroundColor: darkMode ? 'rgba(30,41,59,0.6)' : 'rgba(226,232,240,0.6)',
              borderRadius: 16, padding: 4,
              flexDirection: isRTL ? 'row-reverse' : 'row',
              overflow: 'hidden',
            }}
          >
            {indicatorPositionStyle && <Animated.View style={indicatorPositionStyle} />}

            <TouchableOpacity
              onPress={() => setActiveTab('pending')}
              style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, zIndex: 10 }}
              activeOpacity={0.8}
            >
              <Clock size={16} color={activeTab === 'pending' ? (darkMode ? '#a5b4fc' : '#4f46e5') : '#94a3b8'} />
              <Text style={{ fontSize: 13, fontWeight: '700', color: activeTab === 'pending' ? (darkMode ? '#a5b4fc' : '#4f46e5') : '#94a3b8' }}>
                {t.tabs.pending}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab('completed')}
              style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, zIndex: 10 }}
              activeOpacity={0.8}
            >
              <CheckCircle size={16} color={activeTab === 'completed' ? (darkMode ? '#6ee7b7' : '#059669') : '#94a3b8'} />
              <Text style={{ fontSize: 13, fontWeight: '700', color: activeTab === 'completed' ? (darkMode ? '#6ee7b7' : '#059669') : '#94a3b8' }}>
                {t.tabs.completed}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            ref={scrollViewRef}
            style={{
              flex: 1,
              borderTopLeftRadius: 32,
              borderTopRightRadius: 32,
              borderBottomLeftRadius: 32,
              borderBottomRightRadius: 32,
              marginTop: 12,
              marginBottom: 10,
              marginHorizontal: 10,
              borderWidth: 1,
              borderColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
              overflow: 'hidden',
            }}
            contentContainerStyle={{ paddingBottom: scrollPadding }}
            showsVerticalScrollIndicator={true}
          >
            <View style={{ paddingHorizontal: 16, paddingTop: 16, gap: 12 }}>
              {isLoading ? (
                <>
                  <TaskCardSkeleton darkMode={darkMode} />
                  <TaskCardSkeleton darkMode={darkMode} />
                  <TaskCardSkeleton darkMode={darkMode} />
                </>
              ) : (
                <>
                  {filteredTasks.map((task, index) => (
                    <View
                      key={task.id}
                      onLayout={(e) => cardPositions.current[task.id] = e.nativeEvent.layout.y}
                    >
                      <TaskCard
                        task={task}
                        type={activeTab}
                        onAction={handleTaskAction}
                        t={t}
                        darkMode={darkMode}
                        index={index}
                        onNoteOpen={() => scrollToCard(task.id)}
                        onNoteClose={() => setScrollPadding(20)}
                      />
                    </View>
                  ))}
                  {filteredTasks.length === 0 && (
                    <View style={{ paddingVertical: 48, alignItems: 'center' }}>
                      <Text style={{ color: darkMode ? '#475569' : '#94a3b8', fontSize: 15 }}>
                        {t.tasks.noTasks}
                      </Text>
                    </View>
                  )}
                </>
              )}
            </View>
          </ScrollView>
        </>
      )
      }


{/* Archive */}
      {
        activeTab === 'archive' && (
          <>
            <View style={{
              marginHorizontal: 24, marginTop: 16, marginBottom: 16,
              flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 8,
            }}>
              <Archive size={20} color={darkMode ? '#94a3b8' : '#475569'} />
              <Text style={{ fontSize: 20, fontWeight: '700', color: darkMode ? '#94a3b8' : '#475569' }}>
                {t.tabs.archive}
              </Text>
            </View>

            <ScrollView
              style={{
                flex: 1,
                borderTopLeftRadius: 32,
                borderTopRightRadius: 32,
                borderBottomLeftRadius: 32,
                borderBottomRightRadius: 32,
                marginBottom: 10,
                marginHorizontal: 10,
                borderWidth: 1,
                borderColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                overflow: 'hidden',
              }}
              contentContainerStyle={{ paddingBottom: scrollPadding }}
              showsVerticalScrollIndicator={true}
            >
              <View style={{ paddingHorizontal: 16, paddingTop: 16, gap: 12 }}>
                {isLoading ? (
                  <><TaskCardSkeleton darkMode={darkMode} /><TaskCardSkeleton darkMode={darkMode} /></>
                ) : (
                  <>
                    {filteredTasks.map((task, index) => (
                      <TaskCard key={task.id} task={task} type={activeTab} onAction={handleTaskAction} t={t} darkMode={darkMode} index={index} />
                    ))}
                    {filteredTasks.length === 0 && (
                      <View style={{ paddingVertical: 48, alignItems: 'center' }}>
                        <Text style={{ color: darkMode ? '#475569' : '#94a3b8', fontSize: 15 }}>
                          {t.tasks.noTasks}
                        </Text>
                      </View>
                    )}
                  </>
                )}
              </View>
            </ScrollView>
          </>
        )
      }

      {/* Settings */}
      {
        activeTab === 'settings' && (
          <View style={{ paddingHorizontal: 8 }}>
            <SettingsPage
              customBackAction={() => setActiveTab('pending')}
              accessToken={accessToken}
              t={t}
              language={language}
              setLanguage={setLanguage}
              darkMode={darkMode}
              toggleDarkMode={toggleDarkMode}
              notificationsSettings={notificationsSettings}
              setNotificationsSettings={setNotificationsSettings}
            />
          </View>
        )
      }


      {/* Drawer backdrop */}
      {
        isMenuOpen && (
          <Pressable
            style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 40 }]}
            onPress={() => setIsMenuOpen(false)}
          />
        )
      }

      {/* Slide-in drawer */}
      <Animated.View style={{
        position: 'absolute', top: 0, bottom: 0, left: 0,
        width: '62%', maxWidth: 280,
        backgroundColor: menuBg,
        borderTopRightRadius: 45, borderBottomRightRadius: 45,
        paddingHorizontal: 24, paddingVertical: 24,
        zIndex: 50,
        shadowColor: '#000', shadowOffset: { width: 4, height: 0 },
        shadowOpacity: 0.2, shadowRadius: 16, elevation: 20,
        transform: [{ translateX: drawerAnim }],
      }}>
        <View style={{ alignItems: 'flex-end', marginBottom: 24, marginTop: 48 }}>
          <TouchableOpacity
            onPress={() => setIsMenuOpen(false)}
            style={{ padding: 8, backgroundColor: darkMode ? '#1e293b' : '#f1f5f9', borderRadius: 100 }}
            activeOpacity={0.7}
          >
            <X size={24} color={menuTextColor} />
          </TouchableOpacity>
        </View>

        <View style={{ gap: 8 }}>
          {[
            { tab: 'pending', icon: List, label: t.menu.tasks, isActive: activeTab === 'pending' || activeTab === 'completed' },
            { tab: 'archive', icon: Archive, label: t.menu.archive, isActive: activeTab === 'archive' },
            { tab: 'settings', icon: Settings, label: t.menu.settings, isActive: activeTab === 'settings' },
          ].map(({ tab, icon: Icon, label, isActive }) => (
            <TouchableOpacity
              key={tab}
              onPress={() => handleTabChange(tab)}
              style={[styles.menuItem, {
                backgroundColor: isActive ? activeMenuBg : 'transparent',
                flexDirection: isRTL ? 'row-reverse' : 'row',
              }]}
              activeOpacity={0.7}
            >
              <Icon size={20} color={isActive ? '#4f46e5' : menuTextColor} />
              <Text style={[styles.menuText, { color: isActive ? '#4f46e5' : menuTextColor }]}>{label}</Text>
            </TouchableOpacity>
          ))}

          <View style={{ height: 1, backgroundColor: darkMode ? '#1e293b' : '#f1f5f9', marginVertical: 8 }} />

          <TouchableOpacity
            onPress={() => handleLogoutPress()}
            style={[styles.menuItem, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
            activeOpacity={0.7}
          >
            <LogOut size={20} color="#ef4444" />
            <Text style={[styles.menuText, { color: '#ef4444' }]}>{t.menu.logout}</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View >
  );
}

const styles = StyleSheet.create({
  menuItem: {
    alignItems: 'center', gap: 16,
    paddingHorizontal: 12, paddingVertical: 12,
    borderRadius: 12,
  },
  menuText: {
    fontSize: 16, fontWeight: '500',
  },
});
