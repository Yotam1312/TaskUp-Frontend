import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, Animated, Easing,
  StyleSheet, Pressable, Platform, Alert
} from 'react-native';
import { Menu, X, CheckCircle, Clock, Archive, LogOut, Settings, ClipboardList, Folder, ChevronDown, ChevronUp, HelpCircle, ArrowRight, ArrowLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import TaskCard from '../components/TaskCard';
import TaskCardSkeleton from '../components/TaskCardSkeleton';
import SettingsPage from './SettingsPage';
import * as Notifications from 'expo-notifications';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BackHandler } from 'react-native';
import { 
  fetchAllTasks, 
  markSubmitted, 
  markArchived, 
  registerDeviceToken, 
  unmarkSubmitted,
  unmarkArchived,
  fetchNotificationSettings,
  syncAssignments,
  updateAssignmentNote
} from '../api';
import { sleep } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function transformTask(apiTask) {
  const date = new Date(apiTask.due_date);
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
    status: apiTask.computed_status || (apiTask.is_submitted ? 'completed' : 'pending'),
    link: apiTask.link || '',
    note: apiTask.note || '',
    isSubmittedLate: apiTask.is_submitted_late || false,
    isCourseExpired: apiTask.is_course_expired || false,
  };
}

export default function Dashboard({
  route, language, setLanguage, darkMode, toggleDarkMode,
  notificationsSettings, setNotificationsSettings,expoPushToken, t,accessToken, setAccessToken, username, setUsername,
}) {
  const { access_token = '', refresh_token = '' } = route?.params || {};
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [greeting, setGreeting] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tabBarWidth, setTabBarWidth] = useState(0);
  const isRTL = true;
  const [scrollPadding, setScrollPadding] = useState(20);
  const [tasks, setTasks] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [expandedCourses, setExpandedCourses] = useState({});
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const debounceTimerRef = useRef(null);
  const latestPayloadRef = useRef(null);
  const requestIdRef = useRef(0);

  const indicatorAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(indicatorAnim, {
      toValue: activeTab === 'pending' ? 0 : 1,
      useNativeDriver: false,
      damping: 20,
      stiffness: 200,
    }).start();
  }, [activeTab]);

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
    if (expoPushToken && sessionAccessToken) {
      registerDeviceToken(sessionAccessToken, expoPushToken, language)
        .catch(err => console.error("Registration failed:", err));
    }
  }, [expoPushToken, sessionAccessToken, language]);

  const scrollViewRef = useRef(null);
  const cardPositions = useRef({});
  const noteSaveTimers = useRef({});
  const sessionAccessToken = accessToken || access_token;
  const tokenForNotes = sessionAccessToken;

  const saveNoteNow = async (assignmentId, note) => {
    if (!tokenForNotes) return;
    await updateAssignmentNote(tokenForNotes, assignmentId, note);
  };

  const scheduleNoteSave = (assignmentId, note) => {
    const prev = noteSaveTimers.current[assignmentId];
    if (prev) clearTimeout(prev);

    noteSaveTimers.current[assignmentId] = setTimeout(async () => {
      try {
        await saveNoteNow(assignmentId, note);
      } catch (e) {
        console.error('Autosave failed', e);
      }
    }, 700);
  };

  useEffect(() => {
    return () => {
      Object.values(noteSaveTimers.current).forEach((timer) => clearTimeout(timer));
    };
  }, []);

  const scrollToCard = (taskId) => {
    setScrollPadding(400); 
    setTimeout(() => {
      const y = cardPositions.current[taskId];
      if (y !== undefined && scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y, animated: true });
      }
    }, 100); 
  };

  const refreshLocalData = async () => {
    if (!sessionAccessToken) return;
    try {
      const data = await fetchAllTasks(sessionAccessToken);
      setTasks(data.map(transformTask));
      setPendingCount(data.filter(t => t.computed_status === 'pending').length);
    } catch (error) {}
  };

  const loadData = async () => {
    if (!sessionAccessToken) return;
    setIsLoading(true); 
    try {
      const localData = await fetchAllTasks(sessionAccessToken);
      if (localData.length > 0) {
        setTasks(localData.map(transformTask));
        setPendingCount(localData.filter(t => t.computed_status === 'pending').length);
        setIsLoading(false); 
      }
      await syncAssignments(sessionAccessToken); 
      await refreshLocalData(); 
    } catch (error) {
    } finally {
      setIsLoading(false); 
    }
  };

  useEffect(() => {
    loadData();
  }, [sessionAccessToken]);

  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(() => {
      refreshLocalData();
    });
    return () => subscription.remove();
  }, [sessionAccessToken]);

  const mapHoursToUI = (hoursArray) => {
    if (!Array.isArray(hoursArray)) return [];

    const reverseMapping = {
      168: "7d",
      72: "3d",
      48: "2d",
      24: "1d",
      12: "12h",
      8: "8h",
      5: "5h",
      1: "1h",
    };

    return hoursArray
      .map((h) => reverseMapping[h])
      .filter(Boolean);
  };

  useEffect(() => {
    const loadSettings = async () => {
      if (!accessToken) return;
      try {
        const settings = await fetchNotificationSettings(accessToken);
        if (settings) {
          const mappedDays = mapHoursToUI(settings.hours_before);
          setNotificationsSettings({
            daysBefore: mappedDays,
            newAssignment: settings.notify_on_new_assignment,
            dateChange: settings.notify_on_due_date_change,
          });
        }
      } catch (error) {}
    };
    loadSettings();
  }, [accessToken]);

  useEffect(() => {
    const hour = new Date().getHours();
    const user = username || (language === 'he' ? 'משתמש' : 'User');
    let timeGreeting = '';
    if (hour >= 5 && hour < 12) timeGreeting = t.greeting.morning;
    else if (hour >= 12 && hour < 18) timeGreeting = t.greeting.afternoon;
    else if (hour >= 18 && hour < 22) timeGreeting = t.greeting.evening;
    else timeGreeting = t.greeting.night;
    setGreeting(`${timeGreeting}, ${user}`);
  }, [language, t]);

  const handleTaskAction = async (action, taskId, payload) => {
    if (action === 'updateNote') {
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === taskId ? { ...task, note: payload } : task))
      );
      scheduleNoteSave(taskId, payload);
      return;
    }

    if (action === 'saveNoteOnClose') {
      const prev = noteSaveTimers.current[taskId];
      if (prev) clearTimeout(prev);
      try {
        await saveNoteNow(taskId, payload);
        await refreshLocalData();
      } catch (e) {}
      return;
    }

    const previousTasks = [...tasks];
    setTasks(prevTasks => prevTasks.filter(t => t.id !== taskId));

    try {
      if (action === 'markAsSubmitted') await markSubmitted(sessionAccessToken, taskId);
      else if (action === 'undoSubmit') await unmarkSubmitted(sessionAccessToken, taskId);
      else if (action === 'moveToArchive') await markArchived(sessionAccessToken, taskId);
      else if (action === 'unarchive') await unmarkArchived(sessionAccessToken, taskId);
      refreshLocalData();
    } catch (error) {
      setTasks(previousTasks);
      Alert.alert("אופס", "העדכון נכשל, מנסה לסנכרן מחדש...");
    }
  };

  const filteredTasks = tasks.filter(task => task.status === activeTab);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setIsMenuOpen(false);
  };

  const handleArchiveBackPress = () => {
    // Archive is a tab inside Dashboard. If there is no navigation stack to pop,
    // we still return to the main dashboard content by switching to pending.
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    setActiveTab('pending');
  };

const handleLogoutPress = () => {
    Alert.alert(
      t.menu.logout, 
      t.menu.logoutConfirm, 
      [
        {
          text: language === 'he' ? "ביטול" : "Cancel",
          style: "cancel",
        },
        {
          text: t.menu.logout,
          style: "destructive",
          onPress: async () => {
            setIsMenuOpen(false);
            await SecureStore.deleteItemAsync('access_token');
            await SecureStore.deleteItemAsync('refresh_token');
            await AsyncStorage.removeItem('taskup.pref.username');
            setAccessToken(null);
            setUsername('');
            
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
    elevation: Platform.OS === 'android' ? 0 : 3, // ביטול elevation באנדרואיד כדי לא להסתיר את הטקסט
    [isRTL ? 'right' : 'left']: indicatorAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [2, half + 2],
    }),
  } : null;

  const syncWithBackend = (updatedSettings) => {
    latestPayloadRef.current = updatedSettings;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      const requestId = ++requestIdRef.current;
      const payload = latestPayloadRef.current;

      setSaveStatus("saving");

      if (!accessToken) {
        console.error("No Access Token found");
        if (requestId === requestIdRef.current) setSaveStatus("error");
        return;
      }

      try {
        await updateNotificationSettings(accessToken, {
          hours_before: mapOptionsToHours(payload.daysBefore || []),
          notify_on_new: payload.newAssignment,
          notify_on_change: payload.dateChange,
        });

        if (requestId === requestIdRef.current) {
          setSaveStatus("saved");
          setTimeout(() => {
            if (requestId === requestIdRef.current) setSaveStatus("idle");
          }, 1200);
        }
      } catch (err) {
        console.error("Sync error:", err);
        if (requestId === requestIdRef.current) setSaveStatus("error");
      }
    }, 300);
  };

  return (
    <View style={{ flex: 1 }}>
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

      <View style={{
        paddingHorizontal: 24, 
        paddingTop: Math.max(insets.top + 16, 40), 
        paddingBottom: 16,
        flexDirection: isRTL ? 'row-reverse' : 'row',
        justifyContent: 'space-between', alignItems: 'flex-start',
      }}>
        <View style={{ alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
          {activeTab === 'settings' ? (
            <Text style={{ fontSize: 24, fontWeight: '700', color: darkMode ? 'white' : '#1e293b' }}>
              {t.settings.title}
            </Text>
          ) : activeTab === 'archive' ? (
            <>
              <Text style={{ fontSize: 24, fontWeight: '700', color: darkMode ? 'white' : '#1e293b' }}>
                {t.tabs.archive}
              </Text>
            </>
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
            marginTop: activeTab === 'archive' ? 8 : 0,
          }}
          activeOpacity={0.7}
        >
          <Menu size={26} color={iconColor} />
        </TouchableOpacity>
      </View>

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
              borderTopLeftRadius: 32, borderTopRightRadius: 32,
              borderBottomLeftRadius: 32, borderBottomRightRadius: 32,
              marginTop: 12, marginBottom: 10, marginHorizontal: 10,
              borderWidth: 1, borderColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
              overflow: 'hidden',
            }}
            contentContainerStyle={{ paddingBottom: scrollPadding + insets.bottom }}
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
      )}

      {activeTab === 'archive' && (
        <>
          <View style={{
            marginHorizontal: 24,
            marginTop: 16,
            marginBottom: 24,
            flexDirection: isRTL ? 'row-reverse' : 'row',
            alignItems: 'center',
            gap: 16,
          }}>
            <TouchableOpacity
              onPress={handleArchiveBackPress}
              style={{
                padding: 12,
                backgroundColor: darkMode ? 'rgba(30,41,59,0.5)' : 'rgba(255,255,255,0.5)',
                borderRadius: 100,
              }}
              activeOpacity={0.7}
            >
              {isRTL
                ? <ArrowRight size={20} color={darkMode ? '#e2e8f0' : '#334155'} />
                : <ArrowLeft size={20} color={darkMode ? '#e2e8f0' : '#334155'} />
              }
            </TouchableOpacity>

            <TouchableOpacity onPress={handleArchiveBackPress} activeOpacity={0.7}>
              <Text style={{ fontSize: 14, color: darkMode ? '#94a3b8' : '#475569' }}>
                {t.settings.back}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={{
              flex: 1, borderTopLeftRadius: 32, borderTopRightRadius: 32,
              borderBottomLeftRadius: 32, borderBottomRightRadius: 32,
              marginBottom: 10, marginHorizontal: 10, borderWidth: 1,
              borderColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', overflow: 'hidden',
            }}
            contentContainerStyle={{ paddingBottom: scrollPadding + insets.bottom }}
            showsVerticalScrollIndicator={true}
          >
            <View style={{ paddingHorizontal: 16, paddingTop: 16, gap: 12 }}>
              {isLoading ? (
                <><TaskCardSkeleton darkMode={darkMode} /><TaskCardSkeleton darkMode={darkMode} /></>
              ) : (
                <>
                  {Object.entries(
                    filteredTasks.reduce((acc, task) => {
                      const courseName = task.course || 'קורס כללי';
                      if (!acc[courseName]) acc[courseName] = [];
                      acc[courseName].push(task);
                      return acc;
                    }, {})
                  ).map(([courseName, courseTasks]) => {
                    const isExpanded = expandedCourses[courseName];
                    return (
                      <View key={courseName} style={{ marginBottom: 8 }}>
                        <TouchableOpacity
                          onPress={() => setExpandedCourses(prev => ({ ...prev, [courseName]: !prev[courseName] }))}
                          style={{
                            flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', justifyContent: 'space-between',
                            backgroundColor: darkMode ? 'rgba(30,41,59,0.8)' : '#f1f5f9',
                            padding: 16, borderRadius: 16, borderWidth: 1,
                            borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                          }}
                          activeOpacity={0.7}
                        >
                          <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 12, flexShrink: 1 }}>
                            <Folder size={20} color={darkMode ? '#94a3b8' : '#475569'} />
                            <Text 
                              style={{ fontSize: 16, fontWeight: '600', color: darkMode ? '#e2e8f0' : '#1e293b', flexShrink: 1 }} 
                              numberOfLines={1}
                            >
                              {courseName.length > 26 ? courseName.substring(0, 26) + '...' : courseName}
                            </Text>
                          </View>
                          <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 5, marginLeft: 0 }}>
                            <View style={{ backgroundColor: darkMode ? '#334155' : '#e2e8f0', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 }}>
                              <Text style={{ fontSize: 12, color: darkMode ? '#cbd5e1' : '#475569', fontWeight: 'bold' }}>
                                {courseTasks.length}
                              </Text>
                            </View>
                            {isExpanded ? <ChevronUp size={20} color={darkMode ? '#94a3b8' : '#475569'} /> : <ChevronDown size={20} color={darkMode ? '#94a3b8' : '#475569'} />}
                          </View>
                        </TouchableOpacity>
                        {isExpanded && (
                          <View style={{ marginTop: 12, gap: 12, paddingHorizontal: 4 }}>
                            {courseTasks.map((task, index) => (
                              <TaskCard key={task.id} task={task} type={activeTab} onAction={handleTaskAction} t={t} darkMode={darkMode} index={index} />
                            ))}
                          </View>
                        )}
                      </View>
                    );
                  })}
                  {filteredTasks.length === 0 && (
                    <View style={{ paddingVertical: 48, alignItems: 'center' }}>
                      <Text style={{ color: darkMode ? '#475569' : '#94a3b8', fontSize: 15 }}>{t.tasks.noTasks}</Text>
                    </View>
                  )}
                </>
              )}
            </View>
          </ScrollView>
        </>
      )}

      {activeTab === 'settings' && (
        <View style={{ paddingHorizontal: 8, paddingBottom: insets.bottom }}>
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
      )}

      {isMenuOpen && (
        <Pressable
          style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 40 }]}
          onPress={() => setIsMenuOpen(false)}
        />
      )}

      <Animated.View style={{
        position: 'absolute', top: 0, bottom: 0, left: 0,
        width: '62%', maxWidth: 280,
        backgroundColor: menuBg,
        borderTopRightRadius: 45, borderBottomRightRadius: 45,
        paddingHorizontal: 24, paddingTop: Math.max(insets.top + 24, 48), paddingBottom: insets.bottom + 24,
        zIndex: 50,
        shadowColor: '#000', shadowOffset: { width: 4, height: 0 },
        shadowOpacity: 0.2, shadowRadius: 16, elevation: 20,
        transform: [{ translateX: drawerAnim }],
      }}>
        <View style={{ alignItems: 'flex-end', marginBottom: 24 }}>
          <TouchableOpacity
            onPress={() => setIsMenuOpen(false)}
            style={{ padding: 8, backgroundColor: darkMode ? '#1e293b' : '#f1f5f9', borderRadius: 100 }}
            activeOpacity={0.7}
          >
            <X size={24} color={menuTextColor} />
          </TouchableOpacity>
        </View>

        <View style={{ flex: 1 }}>
          <View style={{ gap: 8 }}>
            {[
              { tab: 'pending', icon: ClipboardList, label: t.menu.tasks, isActive: activeTab === 'pending' || activeTab === 'completed' },
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

          <View style={{ marginTop: 'auto', paddingTop: 14, borderTopWidth: 1, borderTopColor: darkMode ? '#1e293b' : '#f1f5f9' }}>
            <TouchableOpacity
              onPress={() => {
                setIsMenuOpen(false);
                setTimeout(() => setIsHelpModalOpen(true), 180);
              }}
              style={[
                styles.menuItem,
                { alignSelf: 'center', justifyContent: 'center', paddingHorizontal: 10, paddingVertical: 10 },
              ]}
              activeOpacity={0.7}
            >
              <HelpCircle size={22} color={menuTextColor} />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      {isHelpModalOpen && (
        <>
          <Pressable
            style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 60 }]}
            onPress={() => setIsHelpModalOpen(false)}
          />

          <View
            style={{
              position: 'absolute',
              top: '20%',
              left: 24,
              right: 24,
              maxHeight: '60%',
              backgroundColor: darkMode ? '#1e293b' : '#ffffff',
              borderRadius: 24,
              padding: 24,
              zIndex: 61,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.15,
              shadowRadius: 20,
              elevation: 10,
              borderWidth: 1,
              borderColor: darkMode ? '#334155' : '#f1f5f9',
            }}
          >
            <Text
              style={{
                color: darkMode ? '#f8fafc' : '#0f172a',
                fontSize: 22,
                fontWeight: '800',
                marginBottom: 20,
                textAlign: 'center',
              }}
            >
              {t.helpModal.title}
            </Text>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 8 }}>
              {t.helpModal.body.split('\n').map((line, idx) => {
                if (!line.trim()) return null;
                const isHeader = /^.+:\s*$/.test(line.trim());

                return (
                  <View key={idx} style={{
                    marginBottom: 16,
                    flexDirection: isRTL ? 'row-reverse' : 'row',
                    alignItems: 'flex-start'
                  }}>
                    <View style={{
                      width: 6, height: 6, borderRadius: 3,
                      backgroundColor: '#4f46e5', marginTop: 8, marginHorizontal: 10,
                    }} />

                    <Text
                      style={{
                        color: darkMode ? '#cbd5e1' : '#475569',
                        fontSize: 15, lineHeight: 22, flex: 1,
                        textAlign: isRTL ? 'right' : 'left',
                        fontWeight: isHeader ? '700' : '400',
                      }}
                    >
                      {line}
                    </Text>
                  </View>
                );
              })}
            </ScrollView>

            <TouchableOpacity
              onPress={() => setIsHelpModalOpen(false)}
              style={{
                marginTop: 20, backgroundColor: '#4f46e5',
                paddingVertical: 14, borderRadius: 16, alignItems: 'center',
                shadowColor: '#4f46e5', shadowOpacity: 0.3, shadowRadius: 8,
                shadowOffset: { width: 0, height: 4 },
              }}
              activeOpacity={0.8}
            >
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '700' }}>
                {t.helpModal.close}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
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