import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, Animated, Easing,
  StyleSheet, Pressable, Platform, Alert, Modal, ActivityIndicator, Linking
} from 'react-native';
import { X, CheckCircle, Clock, Archive, LogOut, Settings, CircleCheckBig, Folder, ChevronDown, ChevronUp, HelpCircle, ArrowRight, ArrowLeft, Bell, Filter } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import TaskCard from '../components/TaskCard';
import TaskCardSkeleton from '../components/TaskCardSkeleton';
import SettingsPage from './SettingsPage';
import * as Notifications from 'expo-notifications';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  fetchAllTasks,
  markSubmitted,
  markArchived,
  registerDeviceToken,
  unmarkSubmitted,
  unmarkArchived,
  fetchNotificationSettings,
  syncAssignments,
  updateAssignmentNote,
  updateNotificationSettings
} from '../api';
// import { fetchNotificationHistory, clearNotificationHistory, markNotificationsAsRead } from '../api';



Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});


const NineDotsIcon = ({ color, size = 26 }) => {
  const dotSize = size * 0.26;
  return (
    <View style={{ width: size, height: size, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignContent: 'space-between' }}>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
        <View key={i} style={{ width: dotSize, height: dotSize, borderRadius: dotSize, backgroundColor: color }} />
      ))}
    </View>
  );
};

export default function Dashboard({
  route, language, setLanguage, darkMode, toggleDarkMode,
  notificationsSettings, setNotificationsSettings, expoPushToken, requestPushPermission, t, accessToken, setAccessToken, username, setUsername,
}) {
  const { access_token = '' } = route?.params || {};
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [greeting, setGreeting] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tabBarWidth, setTabBarWidth] = useState(0);
  const isRTLText = language === 'he';

  const [scrollPadding, setScrollPadding] = useState(20);
  const [tasks, setTasks] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [expandedCourses, setExpandedCourses] = useState({});


  const [sortOrder, setSortOrder] = useState('dateAsc');
  const [timeFilter, setTimeFilter] = useState('all');

  useEffect(() => {
    const checkFirstTimePush = async () => {
      if (!sessionAccessToken) return;
      const hasAsked = await AsyncStorage.getItem('taskup_push_asked');

      if (!hasAsked) {
        Alert.alert(
          language === 'he' ? "קבלת התראות" : "Push Notifications",
          language === 'he'
            ? "כדי שנוכל לעדכן אותך על מטלות חדשות ומועדי הגשה, מומלץ לאשר התראות."
            : "To keep you updated on assignments, please allow notifications.",
          [
            {
              text: language === 'he' ? "לא תודה" : "No thanks",
              style: "cancel",
              onPress: async () => await AsyncStorage.setItem('taskup_push_asked', 'true')
            },
            {
              text: language === 'he' ? "הפעל" : "Enable",
              onPress: async () => {
                await AsyncStorage.setItem('taskup_push_asked', 'true');
                if (requestPushPermission) {
                  const isGranted = await requestPushPermission();
                  if (isGranted) {
                    const newSettings = { daysBefore: ["1d"], newAssignment: true, dateChange: true };
                    setNotificationsSettings(newSettings);
                    updateNotificationSettings(sessionAccessToken, {
                      hours_before: [24],
                      notify_on_new: true,
                      notify_on_change: true
                    }).catch(() => { });
                  }
                }
              }
            }
          ]
        );
      }
    };
    checkFirstTimePush();
  }, [sessionAccessToken]);

  // --- אנימציות רקע (Blobs) ---
  const blob1Anim = useRef(new Animated.Value(0)).current;
  const blob2Anim = useRef(new Animated.Value(0)).current;
  const blob3Anim = useRef(new Animated.Value(0)).current;
  const blob4Anim = useRef(new Animated.Value(0)).current;

  // מחקנו את הפרמטר language מתוך הסוגריים!
  function transformTask(apiTask) {
    let dueDateDisplay = language === 'he' ? "אין מועד הגשה" : "No due date";
    let dueTimeDisplay = "";
    let dueDateIso = null;

    if (apiTask.due_date) {
      const date = new Date(apiTask.due_date + 'Z');
      const pad = (n) => n.toString().padStart(2, '0');
      dueDateDisplay = `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
      dueTimeDisplay = `${pad(date.getHours())}:${pad(date.getMinutes())}`;
      dueDateIso = date.toISOString();
    }

    return {
      id: apiTask.id,
      title: apiTask.title,
      course: apiTask.course,
      dueDateDisplay,
      dueTimeDisplay,
      dueDateIso,
      status: apiTask.computed_status || (apiTask.is_submitted ? 'completed' : 'pending'),
      link: apiTask.link || '',
      note: apiTask.note || '',
      isSubmittedLate: apiTask.is_submitted_late || false,
      isCourseExpired: apiTask.is_course_expired || false,
    };
  }

  useEffect(() => {
    // הפעלת האנימציות
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

    // עצירה מוחלטת אחרי 8 שניות
    const timer = setTimeout(() => {
      blob1Anim.stopAnimation();
      blob2Anim.stopAnimation();
    }, 8000);

    // ניקוי הטיימר במקרה שהקומפוננטה יוצאת מהמסך לפני שעברו 8 שניות
    return () => clearTimeout(timer);
  }, []);

  const indicatorAnim = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);
  const cardPositions = useRef({});
  const noteSaveTimers = useRef({});
  const sessionAccessToken = accessToken || access_token;

  const debounceTimerRef = useRef(null);
  const latestPayloadRef = useRef(null);
  const requestIdRef = useRef(0);
  const [saveStatus, setSaveStatus] = useState("idle");

  const scrollToCard = (taskId) => {
    setScrollPadding(400);
    setTimeout(() => {
      const y = cardPositions.current[taskId];
      if (y !== undefined && scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y, animated: true });
      }
    }, 100);
  };

  const mapHoursToUI = (hoursArray) => {
    if (!Array.isArray(hoursArray)) return [];
    const reverseMapping = {
      168: "7d", 72: "3d", 48: "2d", 24: "1d",
      12: "12h", 8: "8h", 5: "5h", 1: "1h",
    };
    return hoursArray.map((h) => reverseMapping[h]).filter(Boolean);
  };

  useEffect(() => {
    const loadSettings = async () => {
      if (!accessToken) return;
      try {
        const settings = await fetchNotificationSettings(accessToken);
        if (settings) {
          // בודקים הרשאת מערכת אמיתית כדי לא להציג כפתור דלוק סתם לבודק של אפל
          const { status } = await Notifications.getPermissionsAsync();
          const hasPermission = status === 'granted';

          const mappedDays = mapHoursToUI(settings.hours_before);
          setNotificationsSettings({
            daysBefore: hasPermission ? mappedDays : [],
            newAssignment: hasPermission ? settings.notify_on_new_assignment : false,
            dateChange: hasPermission ? settings.notify_on_due_date_change : false,
          });

          if (!hasPermission && (settings.notify_on_new_assignment || settings.notify_on_due_date_change || mappedDays.length > 0)) {
            updateNotificationSettings(accessToken, { hours_before: [], notify_on_new: false, notify_on_change: false }).catch(() => { });
          }
        }
      } catch (error) {
        console.error("Failed to load settings", error);
      }
    };
    loadSettings();
  }, [accessToken]);

  const mapOptionsToHours = (optionsArray) => {
    if (!Array.isArray(optionsArray)) return [];
    const mapping = {
      "7d": 168, "3d": 72, "2d": 48, "1d": 24,
      "12h": 12, "8h": 8, "5h": 5, "1h": 1,
    };
    return optionsArray.map(opt => mapping[opt]).filter(Boolean);
  };

  useEffect(() => {
    Animated.spring(indicatorAnim, {
      toValue: activeTab === 'pending' ? 0 : 1,
      useNativeDriver: false,
      damping: 20,
      stiffness: 200,
    }).start();
  }, [activeTab]);







  const refreshLocalData = async () => {
    if (!sessionAccessToken) return;
    try {
      const data = await fetchAllTasks(sessionAccessToken);
      setTasks(data.map(transformTask));
      setPendingCount(data.filter(t => t.computed_status === 'pending').length);
    } catch (error) { }
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
    } catch (error) { } finally { setIsLoading(false); }
  };

  useEffect(() => { loadData(); }, [sessionAccessToken]);

  useEffect(() => {
    if (sessionAccessToken && expoPushToken) {
      registerDeviceToken(sessionAccessToken, expoPushToken, language)
        .catch(err => console.error("Failed to save token to DB", err));
    }
  }, [sessionAccessToken, expoPushToken]);



  useEffect(() => {
    setTasks(prevTasks => prevTasks.map(task => {
      if (!task.dueDateIso) {
        return { ...task, dueDateDisplay: language === 'he' ? "אין מועד הגשה" : "No due date" };
      }
      return task;
    }));
  }, [language]);

  useEffect(() => {
    const hour = new Date().getHours();
    const firstName = username ? username.split(' ')[0] : (language === 'he' ? 'משתמש' : 'User');
    let timeGreeting = hour >= 5 && hour < 12 ? t.greeting.morning : hour >= 12 && hour < 18 ? t.greeting.afternoon : hour >= 18 && hour < 22 ? t.greeting.evening : t.greeting.night;
    setGreeting(`${timeGreeting}, ${firstName}`);
  }, [language, t, username]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setIsMenuOpen(false);
  };

  const handleTaskAction = async (action, taskId, payload) => {
    // טיפול בעדכון הערה - עוצר כאן ולא ממשיך למחיקה (filter)
    if (action === 'updateNote' || action === 'saveNoteOnClose') {
      setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, note: payload } : task)));

      if (action === 'updateNote') {
        const prevTimer = noteSaveTimers.current[taskId];
        if (prevTimer) clearTimeout(prevTimer);
        noteSaveTimers.current[taskId] = setTimeout(async () => {
          await updateAssignmentNote(sessionAccessToken, taskId, payload);
        }, 700);
      } else {
        // שמירה מיידית כשסוגרים את הפתק
        updateAssignmentNote(sessionAccessToken, taskId, payload);
      }
      return; // קריטי: עוצר את הפונקציה כדי שלא תגיע ל-filter למטה
    }

    const previousTasks = [...tasks];
    // כאן הקוד מגיע רק אם זו פעולת סטטוס (כמו markAsSubmitted) שבאמת דורשת להעביר מטלה טאב
    setTasks(prev => prev.filter(t => t.id !== taskId));
    try {
      if (action === 'markAsSubmitted') await markSubmitted(sessionAccessToken, taskId);
      else if (action === 'undoSubmit') await unmarkSubmitted(sessionAccessToken, taskId);
      else if (action === 'moveToArchive') await markArchived(sessionAccessToken, taskId);
      else if (action === 'unarchive') await unmarkArchived(sessionAccessToken, taskId);
      refreshLocalData();
    } catch (error) {
      setTasks(previousTasks);
      Alert.alert("אופס", "העדכון נכשל");
    }
  };

  const filteredTasks = [...tasks].filter(task => task.status === activeTab).filter(task => {
    if (timeFilter === 'all') return true;
    const diffDays = (new Date(task.dueDateIso) - new Date()) / (1000 * 60 * 60 * 24);
    if (timeFilter === 'next3Days') return diffDays >= 0 && diffDays <= 3;
    if (timeFilter === 'nextWeek') return diffDays >= 0 && diffDays <= 7;
    if (timeFilter === 'nextMonth') return diffDays >= 0 && diffDays <= 30;
    return true;
  }).sort((a, b) => {
    if (sortOrder === 'dateAsc') {
      if (!a.dueDateIso) return 1;
      if (!b.dueDateIso) return -1;
      return new Date(a.dueDateIso) - new Date(b.dueDateIso);
    }
    if (sortOrder === 'dateDesc') {
      if (!a.dueDateIso) return 1;
      if (!b.dueDateIso) return -1;
      return new Date(b.dueDateIso) - new Date(a.dueDateIso);
    }
    if (sortOrder === 'courseAsc') return a.course.localeCompare(b.course);
    if (sortOrder === 'courseDesc') return b.course.localeCompare(a.course);
    return 0;
  });

  const handleLogoutPress = () => {
    Alert.alert(t.menu.logout, t.menu.logoutConfirm, [
      { text: language === 'he' ? "ביטול" : "Cancel", style: "cancel" },
      {
        text: t.menu.logout, style: "destructive", onPress: async () => {
          setIsMenuOpen(false);
          await SecureStore.deleteItemAsync('access_token');
          await SecureStore.deleteItemAsync('refresh_token');
          await AsyncStorage.removeItem('taskup.pref.username');
          setAccessToken(null); setUsername('');
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        }
      }
    ]);
  };

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
        if (requestId === requestIdRef.current) setSaveStatus("error");
      }
    }, 300);
  };

  const renderFilterOption = (label, value, current, setter) => (
    <TouchableOpacity onPress={() => setter(value)} style={[styles.filterOpt, { backgroundColor: current === value ? '#4f46e5' : (darkMode ? '#553333' : '#f1f5f9') }]}>
      <Text style={{ color: current === value ? 'white' : (darkMode ? '#cbd5e1' : '#475569'), fontSize: 13, fontWeight: current === value ? '600' : '400' }}>{label}</Text>
    </TouchableOpacity>
  );

  const iconColor = darkMode ? '#94a3b8' : '#334155';
  const menuBg = darkMode ? '#1e293b' : '#ffffff';
  const menuTextColor = darkMode ? '#cbd5e1' : '#475569';
  const activeMenuBg = darkMode ? 'rgba(79,70,229,0.2)' : '#eef2ff';

  // --- רכיב הרקע האנימטיבי לשכפול בתוך החלונות ---
  const AnimatedBackground = () => (
    <View style={StyleSheet.absoluteFill}>
      {/* עיגול 1: אינדיגו גדול - פינה עליונה */}
      <Animated.View pointerEvents="none" style={[styles.blob, {
        width: 480, height: 480, borderRadius: 250,
        backgroundColor: darkMode ? 'rgba(79,70,229,0.08)' : 'rgba(78, 70, 229, 0.08)',
        top: 180, right: -190,
        transform: [{ translateY: blob1Anim.interpolate({ inputRange: [0, 1], outputRange: [0, 5] }) }]
      }]} />

      {/* עיגול 2: סגול עמוק - חופף לעיגול 1 ליצירת גוון חדש במפגש */}
      <Animated.View pointerEvents="none" style={[styles.blob, {
        width: 200, height: 200, borderRadius: 100,
        backgroundColor: darkMode ? 'rgba(124,58,237,0.1)' : 'rgba(124,58,237,0.06)',
        top: 60, right: -80,
        transform: [{ translateX: blob2Anim.interpolate({ inputRange: [0, 1], outputRange: [0, -2] }) }]
      }]} />

      {/* עיגול 3: כחול רך - פינה תחתונה */}
      <Animated.View pointerEvents="none" style={[styles.blob, {
        width: 250, height: 250, borderRadius: 125,
        backgroundColor: darkMode ? 'rgba(59,130,246,0.06)' : 'rgba(59,130,246,0.04)',
        bottom: -50, left: 60,
        transform: [{ translateY: blob3Anim.interpolate({ inputRange: [0, 1], outputRange: [0, -10] }) }]
      }]} />

      {/* עיגול 4: ורוד/סגול בהיר - חופף לעיגול 3 */}
      <Animated.View pointerEvents="none" style={[styles.blob, {
        width: 180, height: 180, borderRadius: 90,
        backgroundColor: darkMode ? 'rgba(168,85,247,0.08)' : 'rgba(168,85,247,0.05)',
        bottom: 80, left: 0,
        transform: [{ scale: blob4Anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.15] }) }]
      }]} />
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: darkMode ? '#0f172a' : '#e8f0f8' }}>

      <AnimatedBackground />



      {/* Header */}
      <View style={{ paddingHorizontal: 24, paddingTop: Math.max(insets.top + 16, 40), paddingBottom: 16, flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flex: 1, alignItems: 'flex-end', paddingLeft: 16 }}>
          {activeTab === 'settings' ? (
            <Text style={{ fontSize: 24, fontWeight: '900', color: darkMode ? 'white' : '#1e293b' }}>{t.settings.title}</Text>
          ) : activeTab === 'archive' ? (
            <Text style={{ fontSize: 24, fontWeight: '900', color: darkMode ? 'white' : '#1e293b' }}>{t.tabs.archive}</Text>
          ) : (
            <>
              <Text adjustsFontSizeToFit numberOfLines={1} style={{ fontSize: 23, fontWeight: '800', color: darkMode ? 'white' : '#1e293b' }}>{greeting}</Text>
              <Text style={{ fontSize: 14, fontWeight: '600', color: darkMode ? '#94a3b8' : '#475569' }}>
                {language === 'he' ? `יש לך ${pendingCount} ${t.tasks.pendingCount}` : `You have ${pendingCount} ${t.tasks.pendingCount}`}
              </Text>
            </>
          )}
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity onPress={() => setIsMenuOpen(true)} style={styles.headerIcon} activeOpacity={0.7}>
            <NineDotsIcon size={24} color={iconColor} />
          </TouchableOpacity>

          {(activeTab === 'pending' || activeTab === 'completed') && (
            <TouchableOpacity onPress={() => setIsFilterModalOpen(true)} style={styles.headerIcon} activeOpacity={0.7}>
              <Filter size={24} color={iconColor} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Tabs (Pending / Completed) */}
      {(activeTab === 'pending' || activeTab === 'completed') && (
        <>
          <View onLayout={(e) => setTabBarWidth(e.nativeEvent.layout.width)} style={styles.tabBar}>
            {tabBarWidth > 0 && (
              <Animated.View style={[styles.tabIndicator, { width: (tabBarWidth / 2) - 4, right: indicatorAnim.interpolate({ inputRange: [0, 1], outputRange: [2, (tabBarWidth / 2) + 2] }), backgroundColor: darkMode ? '#334155' : 'white' }]} />
            )}
            <TouchableOpacity onPress={() => setActiveTab('pending')} style={styles.tabBtn}><Clock size={16} color={activeTab === 'pending' ? (darkMode ? '#a5b4fc' : '#4f46e5') : '#94a3b8'} /><Text style={[styles.tabText, { color: activeTab === 'pending' ? (darkMode ? '#a5b4fc' : '#4f46e5') : '#94a3b8' }]}>{t.tabs.pending}</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => setActiveTab('completed')} style={styles.tabBtn}><CheckCircle size={16} color={activeTab === 'completed' ? (darkMode ? '#6ee7b7' : '#059669') : '#94a3b8'} /><Text style={[styles.tabText, { color: activeTab === 'completed' ? (darkMode ? '#6ee7b7' : '#059669') : '#94a3b8' }]}>{t.tabs.completed}</Text></TouchableOpacity>
          </View>

          <ScrollView ref={scrollViewRef} style={styles.mainScroll} contentContainerStyle={{ paddingBottom: scrollPadding + insets.bottom }}>
            <View style={{ paddingHorizontal: 16, paddingTop: 16, gap: 12 }}>
              {isLoading && tasks.length === 0 ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 }}>
                  <ActivityIndicator size="large" color={darkMode ? '#a5b4fc' : '#4f46e5'} />
                  <Text style={{ marginTop: 24, fontSize: 18, fontWeight: '800', color: darkMode ? 'white' : '#1e293b', textAlign: 'center' }}>
                    {language === 'he' ? "מסנכרן נתונים מהמודל..." : "Syncing data from Moodle..."}
                  </Text>
                  <Text style={{ marginTop: 12, fontSize: 14, color: darkMode ? '#94a3b8' : '#64748b', textAlign: 'center', paddingHorizontal: 30, lineHeight: 22 }}>
                    {language === 'he' ? "הסנכרון הראשוני אוסף את כל הקורסים והמטלות שלך.\nפעולה זו עשויה לקחת כדקה, תודה על הסבלנות!" : "Initial sync gathers all your courses and tasks.\nThis may take up to a minute, thank you for your patience!"}
                  </Text>
                </View>
              ) : isLoading ? (
                <>
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
                        onNoteClose={() => {
                          setTimeout(() => {
                            setScrollPadding(20);
                          }, 350);
                        }}
                      />
                    </View>
                  ))}
                  {filteredTasks.length === 0 && <Text style={styles.emptyText}>{t.tasks.noTasks}</Text>}
                </>
              )}
            </View>
          </ScrollView>
        </>
      )}

      {/* Archive Tab */}
      {activeTab === 'archive' && (
        <ScrollView showsVerticalScrollIndicator={false} style={styles.mainScroll} contentContainerStyle={{ paddingBottom: scrollPadding + insets.bottom }}>
          <View style={{ paddingHorizontal: 16, paddingTop: 16, gap: 12 }}>
            {isLoading ? (
              <><TaskCardSkeleton darkMode={darkMode} /><TaskCardSkeleton darkMode={darkMode} /></>
            ) : (
              <>
                {Object.entries(
                  tasks.filter(t => t.status === 'archive').reduce((acc, task) => {
                    const courseName = task.course || 'קורס כללי';
                    if (!acc[courseName]) acc[courseName] = [];
                    acc[courseName].push(task);
                    return acc;
                  }, {})
                ).map(([courseName, courseTasks]) => {
                  const isExpanded = expandedCourses[courseName];
                  return (
                    <View key={courseName} style={{ marginBottom: 8 }}>
                      <TouchableOpacity onPress={() => setExpandedCourses(prev => ({ ...prev, [courseName]: !prev[courseName] }))} style={{ flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', backgroundColor: darkMode ? 'rgba(30,41,59,0.8)' : '#f1f5f9', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }} activeOpacity={0.7}>
                        <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 12, flexShrink: 1 }}>
                          <Folder size={20} color={darkMode ? '#94a3b8' : '#475569'} />
                          <Text style={{ fontSize: 16, fontWeight: '600', color: darkMode ? '#e2e8f0' : '#1e293b', flexShrink: 1, textAlign: 'right' }} numberOfLines={1}>{courseName.length > 26 ? courseName.substring(0, 26) + '...' : courseName}</Text>
                        </View>
                        {isExpanded ? <ChevronUp size={20} color={darkMode ? '#94a3b8' : '#475569'} /> : <ChevronDown size={20} color={darkMode ? '#94a3b8' : '#475569'} />}
                      </TouchableOpacity>
                      {isExpanded && (
                        <View style={{ marginTop: 12, gap: 12, paddingHorizontal: 4 }}>
                          {courseTasks.map((task, index) => (
                            <TaskCard
                              key={task.id}
                              task={task}
                              type={activeTab}
                              onAction={handleTaskAction}
                              t={t}
                              darkMode={darkMode}
                              index={index}
                              onNoteOpen={() => {
                                const yPos = index * 130;
                                cardPositions.current[task.id] = yPos;
                                setScrollPadding(350);
                                setTimeout(() => {
                                  scrollViewRef.current?.scrollTo({ y: yPos, animated: true });
                                }, 150);
                              }}
                              onNoteClose={() => {
                                setTimeout(() => {
                                  setScrollPadding(20);
                                }, 350);
                              }}
                            />
                          ))}
                        </View>
                      )}
                    </View>
                  );
                })}
              </>
            )}
          </View>
        </ScrollView>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <View style={{ paddingHorizontal: 8, paddingBottom: insets.bottom, flex: 1 }}>
          <SettingsPage customBackAction={() => setActiveTab('pending')} accessToken={accessToken} t={t} language={language} setLanguage={setLanguage} darkMode={darkMode} toggleDarkMode={toggleDarkMode} notificationsSettings={notificationsSettings} setNotificationsSettings={setNotificationsSettings} requestPushPermission={requestPushPermission} expoPushToken={expoPushToken} />
        </View>
      )}

      {/* ---מודלים מעוצבים  י --- */}
      {/* תפריט ראשי */}
      <Modal visible={isMenuOpen} transparent animationType="fade" onRequestClose={() => setIsMenuOpen(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setIsMenuOpen(false)} />
        <View style={[styles.characterPanel, { backgroundColor: menuBg, left: 24, width: 280, borderColor: darkMode ? 'rgba(255,255,255,0.15)' : 'rgba(79,70,229,0.1)' }]}>
          <AnimatedBackground />
          <View style={{ flexDirection: 'row-reverse', flexWrap: 'wrap', justifyContent: 'center', gap: 16 }}>
            {[
              { tab: 'pending', icon: CircleCheckBig, label: t.menu.tasks, isActive: activeTab === 'pending' || activeTab === 'completed' },
              { tab: 'archive', icon: Archive, label: t.menu.archive, isActive: activeTab === 'archive' },
              { tab: 'settings', icon: Settings, label: t.menu.settings, isActive: activeTab === 'settings' },
              { tab: 'help', icon: HelpCircle, label: t.helpModal.title, isActive: false },
              { tab: 'logout', icon: LogOut, label: t.menu.logout, isActive: false, color: '#ef4444' },
            ].map(({ tab, icon: Icon, label, isActive, color }) => {

              // צבע ייעודי למצב פעיל - בהיר יותר ב-Dark Mode
              const activeColor = darkMode ? '#a5b4fc' : '#4f46e5';
              const activeBorder = darkMode ? 'rgba(165,180,252,0.4)' : 'rgba(79,70,229,0.3)';

              return (
                <TouchableOpacity key={tab} onPress={() => { if (tab === 'logout') handleLogoutPress(); else if (tab === 'help') { setIsMenuOpen(false); setTimeout(() => setIsHelpModalOpen(true), 200); } else handleTabChange(tab); }}
                  style={[styles.menuGridItem, {
                    backgroundColor: isActive ? activeMenuBg : (darkMode ? 'rgba(255,255,255,0.03)' : '#f8fafc'),
                    borderColor: isActive ? activeBorder : (darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)')
                  }]}>
                  <Icon size={28} color={color || (isActive ? activeColor : menuTextColor)} />
                  <Text style={[styles.menuGridText, { color: color || (isActive ? activeColor : menuTextColor) }]}>{label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </Modal>

      {/* פילטר */}
      <Modal visible={isFilterModalOpen} transparent animationType="fade" onRequestClose={() => setIsFilterModalOpen(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setIsFilterModalOpen(false)} />
        <View style={[styles.characterPanel, { backgroundColor: menuBg, left: 24, width: 250, padding: 20, borderColor: darkMode ? 'rgba(255,255,255,0.15)' : 'rgba(79,70,229,0.1)' }]}>
          <AnimatedBackground />
          <Text style={[styles.filterTitle, { color: darkMode ? 'white' : '#1e293b', textAlign: isRTLText ? 'right' : 'left' }]}>{t.filters?.title}</Text>
          <Text style={[styles.filterLabel, { textAlign: isRTLText ? 'right' : 'left' }]}>{t.filters?.sortBy}</Text>
          <View style={styles.filterGroup}>{renderFilterOption(t.filters?.dateDesc, 'dateDesc', sortOrder, setSortOrder)}{renderFilterOption(t.filters?.dateAsc, 'dateAsc', sortOrder, setSortOrder)}{renderFilterOption(t.filters?.courseAsc, 'courseAsc', sortOrder, setSortOrder)}{renderFilterOption(t.filters?.courseDesc, 'courseDesc', sortOrder, setSortOrder)}</View>
          <Text style={[styles.filterLabel, { textAlign: isRTLText ? 'right' : 'left' }]}>{t.filters?.dueIn}</Text>
          <View style={styles.filterGroup}>{renderFilterOption(t.filters?.all, 'all', timeFilter, setTimeFilter)}{renderFilterOption(t.filters?.next3Days, 'next3Days', timeFilter, setTimeFilter)}{renderFilterOption(t.filters?.nextWeek, 'nextWeek', timeFilter, setTimeFilter)}{renderFilterOption(t.filters?.nextMonth, 'nextMonth', timeFilter, setTimeFilter)}</View>
          <TouchableOpacity onPress={() => setIsFilterModalOpen(false)} style={styles.primaryBtn}><Text style={styles.primaryBtnText}>{t.filters?.close}</Text></TouchableOpacity>
        </View>
      </Modal>

      {/* עזרה */}
      <Modal visible={isHelpModalOpen} transparent animationType="fade" onRequestClose={() => setIsHelpModalOpen(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setIsHelpModalOpen(false)} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={[styles.helpCard, { backgroundColor: darkMode ? '#1e293b' : '#ffffff', borderColor: darkMode ? 'rgba(255,255,255,0.15)' : 'rgba(79,70,229,0.1)' }]}>

            <Text style={[styles.helpTitle, { color: darkMode ? '#f8fafc' : '#0f172a' }]}>{t.helpModal.title}</Text>
            <ScrollView showsVerticalScrollIndicator={false} style={{ flexGrow: 1 }}>
              {t.helpModal.body.split('\n').map((line, idx) => {
                if (!line.trim()) return null;
                const isHeader = /^.+:\s*$/.test(line.trim());

                // בדיקה אם השורה מכילה את האתר שלנו והפיכתו ללחיץ
                if (line.includes('unitask.net')) {
                  const parts = line.split('unitask.net');
                  return (
                    <View key={idx} style={[styles.helpLine, { flexDirection: isRTLText ? 'row-reverse' : 'row' }]}>
                      {!isHeader && <View style={styles.bullet} />}
                      <Text style={[styles.helpText, { color: darkMode ? '#cbd5e1' : '#475569', textAlign: isRTLText ? 'right' : 'left' }]}>
                        {parts[0]}
                        <Text style={{ color: '#4f46e5', textDecorationLine: 'underline' }} onPress={() => Linking.openURL('https://unitask.net')}>unitask.net</Text>
                        {parts[1]}
                      </Text>
                    </View>
                  );
                }

                return (
                  <View key={idx} style={[styles.helpLine, { flexDirection: isRTLText ? 'row-reverse' : 'row' }]}>
                    {!isHeader && <View style={styles.bullet} />}
                    <Text style={[styles.helpText, { color: darkMode ? '#cbd5e1' : '#475569', textAlign: isRTLText ? 'right' : 'left', fontWeight: isHeader ? '700' : '400' }]}>{line}</Text>
                  </View>
                );
              })}
            </ScrollView>
            <TouchableOpacity onPress={() => setIsHelpModalOpen(false)} style={styles.primaryBtn}><Text style={styles.primaryBtnText}>{t.helpModal.close}</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  blob: { position: 'absolute', borderRadius: 110 },
  blobTop: { width: 220, height: 220, top: -40, right: -60 },
  blobBottom: { width: 160, height: 160, bottom: 80, left: -50 },
  headerIcon: { padding: 8, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 12 },
  notifBadge: { position: 'absolute', top: 4, right: 4, backgroundColor: '#ef4444', width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: '#f8fafc' },
  tabBar: { marginHorizontal: 24, marginTop: 8, height: 56, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 16, padding: 4, flexDirection: 'row-reverse' },
  tabIndicator: { position: 'absolute', top: 4, bottom: 4, borderRadius: 12, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  tabBtn: { flex: 1, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 6, zIndex: 10, elevation: 3 },
  tabText: { fontSize: 13, fontWeight: '700' },
  mainScroll: { flex: 1, borderTopLeftRadius: 32, borderTopRightRadius: 32, marginTop: 12, marginHorizontal: 10, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  emptyText: { textAlign: 'center', color: '#94a3b8', marginTop: 48 },
  modalOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  characterPanel: { position: 'absolute', top: 90, borderRadius: 28, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 18, borderWidth: 1.5, overflow: 'hidden' },
  menuGridItem: { width: '38%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 20, padding: 8, borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 8 },
  menuGridText: { marginTop: 10, fontSize: 13, fontWeight: '700', textAlign: 'center' },
  modalHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', marginBottom: 16, alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: '900' },
  closeBtn: { padding: 6, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.05)' },
  notifItem: { padding: 14, borderRadius: 16, marginBottom: 8 },
  notifTitle: { fontWeight: 'bold', fontSize: 14, marginBottom: 4 },
  notifBody: { fontSize: 13, marginBottom: 6 },
  notifTime: { color: '#94a3b8', fontSize: 11 },
  fixedFooter: { marginTop: 8, alignItems: 'center' },
  divider: { width: '100%', height: 1, marginBottom: 8 },
  clearBtn: { paddingVertical: 8, paddingHorizontal: 20 },
  clearBtnText: { color: '#ef4444', fontWeight: '800', fontSize: 14 },
  filterTitle: { fontSize: 18, fontWeight: '900', marginBottom: 16 },
  filterLabel: { fontSize: 13, fontWeight: '700', color: '#64748b', marginBottom: 6 },
  filterGroup: { flexDirection: 'row-reverse', flexWrap: 'wrap', marginBottom: 16, justifyContent: 'flex-start' },
  filterOpt: { paddingVertical: 7, paddingHorizontal: 14, borderRadius: 20, margin: 4 },
  primaryBtn: { backgroundColor: '#4f46e5', padding: 10, borderRadius: 16, alignItems: 'center', marginTop: 2, shadowColor: '#4f46e5', shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  primaryBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  helpCard: { width: '100%', maxHeight: '80%', borderRadius: 32, padding: 24, shadowOpacity: 0.3, shadowRadius: 25, elevation: 20, borderWidth: 1.5, overflow: 'hidden' },
  helpTitle: { fontSize: 20, fontWeight: '900', marginBottom: 16, textAlign: 'center' },
  helpLine: { marginBottom: 16, alignItems: 'flex-start' },
  bullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4f46e5', marginTop: 8, marginHorizontal: 10 },
  helpText: { fontSize: 15, lineHeight: 22, flex: 1 }
});