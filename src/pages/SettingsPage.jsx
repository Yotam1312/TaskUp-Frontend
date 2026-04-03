import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Animated, Easing } from 'react-native';
import {
  ArrowRight, ArrowLeft, Moon, Globe, Bell,
  Check, RefreshCw, AlertCircle
} from 'lucide-react-native';
import { updateNotificationSettings } from '../api';

const SaveStatus = ({ status, darkMode }) => {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (status === 'saving') {
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1, duration: 1000, easing: Easing.linear, useNativeDriver: true,
        })
      ).start();
    } else {
      spinValue.setValue(0);
    }
  }, [status]);

  const spin = spinValue.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      {status === 'saving' ? (
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <RefreshCw size={14} color="#4f46e5" />
        </Animated.View>
      ) : status === 'error' ? (
        <AlertCircle size={14} color="#ef4444" />
      ) : (
        <Check size={16} color={darkMode ? '#10b981' : '#059669'} />
      )}

      <Text style={{
        fontSize: 10,
        fontWeight: '600',
        color: status === 'error' ? '#ef4444' : (darkMode ? '#94a3b8' : '#64748b')
      }}>
        {status === 'saving' ? 'שומר...' : status === 'error' ? 'שגיאה' : ''}
      </Text>
    </View>
  );
};

const mapOptionsToHours = (options) => {
  const mapping = {
    "7d": 168, "3d": 72, "2d": 48, "1d": 24,
    "12h": 12, "8h": 8, "5h": 5, "1h": 1
  };
  return options.map(opt => mapping[opt]).filter(val => val !== undefined);
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export default function SettingsPage({
  accessToken,darkMode, toggleDarkMode, language, setLanguage,
  notificationsSettings, setNotificationsSettings, t, customBackAction,
}) {
  const isRTL = true;
  const notificationOptions = ["7d", "3d", "2d", "1d", "12h", "8h", "5h", "1h"];
  const [saveStatus, setSaveStatus] = useState('idle');
  const syncWithBackend = async (updatedSettings) => {
  setSaveStatus('saving'); 

  // יצירת השהיה רנדומלית בין 1000ms ל-2000ms
  const randomDelay = Math.floor(Math.random() * 1000) + 1000;
  await sleep(randomDelay);

  if (!accessToken) {
    console.error("No Access Token found");
    setSaveStatus('error');
    return; 
  }

  try {
    await updateNotificationSettings(accessToken, {
        hours_before: mapOptionsToHours(updatedSettings.daysBefore || []),
        notify_on_new: updatedSettings.newAssignment,
        notify_on_change: updatedSettings.dateChange
    });
    
    setSaveStatus('saved');
    
    // החזרה למצב idle (או השארת ה-V) אחרי 2 שניות
    setTimeout(() => setSaveStatus('idle'), 2000);
    
  } catch (err) {
    console.error("Sync error:", err);
    setSaveStatus('error');
  }
};
  const handleDayToggle = (option) => {
  if (!setNotificationsSettings) return;
  
  setNotificationsSettings(prev => {
    const cur = prev.daysBefore || [];
    const nextDays = cur.includes(option) 
      ? cur.filter(d => d !== option) 
      : [...cur, option];
    
    const next = { ...prev, daysBefore: nextDays };
    
    // הוסף את השורה הזו כאן!
    console.log("Calling sync for daysBefore:", nextDays);
    syncWithBackend(next); 
    
    return next;
  });
};

const handleToggleChange = (key, value) => {
  if (!setNotificationsSettings) return;
  
  setNotificationsSettings(prev => {
    const next = { ...prev, [key]: value };
    console.log("Calling sync for:", key, value);
    syncWithBackend(next); 
    
    return next;
  });
};

  const cardBg = darkMode ? 'rgba(15,23,42,0.6)' : 'rgba(255, 255, 255, 0.58)';
  const cardBorder = darkMode ? '#1e293b' : 'rgba(255,255,255,0.4)';
  const textPrimary = darkMode ? '#e2e8f0' : '#334155';
  const textSecondary = darkMode ? '#64748b' : '#94a3b8';
  const dividerColor = darkMode ? 'rgba(30,41,59,0.5)' : 'rgba(226,232,240,0.5)';

  // Custom toggle switch
  const ToggleSwitch = ({ checked, onChange }) => (
    <TouchableOpacity
      onPress={() => onChange(!checked)}
      activeOpacity={0.8}
      style={[styles.toggle, {
        backgroundColor: checked ? '#4f46e5' : (darkMode ? '#334155' : '#cbd5e1'),
        justifyContent: checked ? 'flex-end' : 'flex-start',
      }]}
    >
      <View style={styles.toggleThumb} />
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={{ flex: 0 }}
      contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Back button */}
      {customBackAction && (
        <View style={{
          flexDirection: isRTL ? 'row-reverse' : 'row',
          alignItems: 'center', gap: 16, marginBottom: 24,
        }}>
          <TouchableOpacity
            onPress={customBackAction}
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
          <Text style={{ fontSize: 14, color: darkMode ? '#94a3b8' : '#475569' }}>
            {t.settings.back}
          </Text>
        </View>
      )}

      <View style={{ gap: 24 }}>

        {/* General section */}
        <View style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <Text style={{ fontSize: 11, fontWeight: '700', color: textSecondary, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 16, textAlign: isRTL ? 'right' : 'left' }}>
            {t.settings.general}
          </Text>

          {/* Dark Mode */}
          <View style={{
            flexDirection: isRTL ? 'row-reverse' : 'row',
            alignItems: 'center', justifyContent: 'space-between',
            paddingBottom: 24, marginBottom: 24,
            borderBottomWidth: 1, borderBottomColor: dividerColor,
          }}>
            <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ padding: 10, backgroundColor: darkMode ? 'rgba(99,102,241,0.2)' : '#e0e7ff', borderRadius: 12 }}>
                <Moon size={20} color={darkMode ? '#a5b4fc' : '#4f46e5'} />
              </View>
              <Text style={{ fontWeight: '500', color: textPrimary, fontSize: 15 }}>
                {t.settings.darkMode}
              </Text>
            </View>

            {/* Custom toggle for dark mode */}
            <TouchableOpacity
              onPress={toggleDarkMode}
              activeOpacity={0.8}
              style={[styles.toggle, { backgroundColor: darkMode ? '#4f46e5' : '#cbd5e1', justifyContent: darkMode ? 'flex-end' : 'flex-start' }]}
            >
              <View style={styles.toggleThumb} />
            </TouchableOpacity>
          </View>

          {/* Language */}
          <View style={{
            flexDirection: isRTL ? 'row-reverse' : 'row',
            alignItems: 'center', justifyContent: 'space-between',
          }}>
            <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ padding: 10, backgroundColor: darkMode ? 'rgba(16,185,129,0.2)' : '#d1fae5', borderRadius: 12 }}>
                <Globe size={20} color={darkMode ? '#6ee7b7' : '#059669'} />
              </View>
              <Text style={{ fontWeight: '500', color: textPrimary, fontSize: 15 }}>
                {t.settings.language}
              </Text>
            </View>

            <View style={{
              flexDirection: 'row',
              backgroundColor: darkMode ? '#1e293b' : '#f1f5f9',
              borderRadius: 12, padding: 4,
            }}>
              {['he', 'en'].map((lang) => (
                <TouchableOpacity
                  key={lang}
                  onPress={() => setLanguage(lang)}
                  style={{
                    paddingHorizontal: 12, paddingVertical: 6,
                    borderRadius: 8,
                    backgroundColor: language === lang ? (darkMode ? '#475569' : 'white') : 'transparent',
                    shadowColor: language === lang ? '#000' : 'transparent',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.08,
                    shadowRadius: 2,
                    elevation: language === lang ? 1 : 0,
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={{
                    fontSize: 13, fontWeight: '500',
                    color: language === lang ? (darkMode ? 'white' : '#1e293b') : '#94a3b8',
                  }}>
                    {lang === 'he' ? 'IL' : 'US'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Notifications section */}
        <View style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <View style={{
            flexDirection: isRTL ? 'row-reverse' : 'row',
            alignItems: 'center',
            justifyContent: 'space-between', // דוחף את שני הצדדים לקצוות
            marginBottom: 16
          }}>
            {/* צד ימין (או שמאל ב-LTR): טקסט + פעמון */}
            <View style={{
              flexDirection: isRTL ? 'row-reverse' : 'row',
              alignItems: 'center',
              gap: 8
            }}>
              <Text style={{
                fontSize: 11, fontWeight: '700', color: textSecondary,
                textTransform: 'uppercase', letterSpacing: 1.2
              }}>
                {t.settings.notifications}
              </Text>
              <Bell size={14} color={textSecondary} />
            </View>

            {/* צד שמאל: סטטוס השמירה */}
            <View style={{ flex: 1, alignItems: isRTL ? 'flex-start' : 'flex-end' }}>
              <SaveStatus status={saveStatus} darkMode={darkMode} />
            </View>
          </View>
          <Text style={{ fontSize: 14, color: darkMode ? '#64748b' : '#64748b', marginBottom: 16, textAlign: isRTL ? 'right' : 'left' }}>
            {t.settings.notifyLabel}
          </Text>


          {/* Time chips grid */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
            {notificationOptions.map((option) => {
              const isSelected = notificationsSettings?.daysBefore?.includes(option);
              return (
                <TouchableOpacity
                  key={option}
                  onPress={() => handleDayToggle(option)}
                  activeOpacity={0.7}
                  style={{
                    width: '22%',
                    paddingVertical: 10,
                    borderRadius: 12,
                    alignItems: 'center',
                    backgroundColor: isSelected ? '#4f46e5' : (darkMode ? '#1e293b' : '#f1f5f9'),
                    shadowColor: isSelected ? '#4f46e5' : 'transparent',
                    shadowOffset: { width: 0, height: 3 },
                    shadowOpacity: 0.35,
                    shadowRadius: 6,
                    elevation: isSelected ? 4 : 0,
                    transform: [{ scale: isSelected ? 1.05 : 1 }],
                  }}
                >
                  <Text style={{
                    fontSize: 12, fontWeight: '700',
                    color: isSelected ? 'white' : (darkMode ? '#64748b' : '#475569'),
                  }}>
                    {option}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Toggle rows */}
          <View style={{ gap: 16, borderTopWidth: 1, borderTopColor: dividerColor, paddingTop: 16 }}>
            {[
              { key: 'newAssignment', label: t.settings.newAssignment },
              { key: 'dateChange', label: t.settings.dateChange },
            ].map(({ key, label }) => (
              <View key={key} style={{
                flexDirection: isRTL ? 'row-reverse' : 'row',
                alignItems: 'center', justifyContent: 'space-between',
              }}>
                <Text style={{ fontSize: 14, fontWeight: '500', color: textPrimary }}>
                  {label}
                </Text>
                <ToggleSwitch
                  checked={notificationsSettings?.[key] || false}
                  onChange={(val) => handleToggleChange(key, val)}
                />
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 15,
    borderRadius: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  toggle: {
    width: 52, height: 30,
    borderRadius: 15,
    padding: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleThumb: {
    width: 24, height: 24,
    borderRadius: 12,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
});

