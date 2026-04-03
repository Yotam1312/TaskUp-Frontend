import { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

export default function TaskCardSkeleton({ darkMode }) {
  const pulse = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.4, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // צבעים מותאמים בדיוק לכרטיס המקורי
  const shimmerLight = darkMode ? '#1e293b' : '#f1f5f9';
  const shimmerDark = darkMode ? '#334155' : '#e2e8f0';
  const cardBg = darkMode ? 'rgba(23, 37, 70, 0.58)' : 'rgba(255, 255, 255, 0.52)';
  const cardBorder = darkMode ? '#1e293b' : '#e2e8f0';

  return (
    <Animated.View style={{
      opacity: pulse,
      backgroundColor: cardBg,
      borderWidth: 1,
      borderColor: cardBorder,
      borderRadius: 16,
      padding: 16,
      flexDirection: 'row', // נשאר 'row' כי המערכת הופכת אותו ב-RTL
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      minHeight: 128,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 4,
      elevation: 2,
    }}>
      
      {/* 1. אזור הכפתורים - ב-RTL יופיע בימין המסך */}
      <View style={{ gap: 10, width: 100, marginTop: 8, alignItems: 'center' }}>
        <View style={{ width: '100%', height: 32, backgroundColor: shimmerDark, borderRadius: 8 }} />
        <View style={{ width: '100%', height: 32, backgroundColor: shimmerDark, borderRadius: 8 }} />
        {/* דמה ל-Sticky Note */}
        <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: shimmerLight, marginTop: 4 }} />
      </View>

      {/* 2. אזור התוכן - ב-RTL יופיע בשמאל המסך וטקסט מיושר לימין */}
      <View style={{ flex: 1, paddingLeft: 4, paddingRight: 4, alignItems: 'flex-end' }}>
        
        {/* שורת כותרת ונקודה */}
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          gap: 8, 
          marginBottom: 4, 
          width: '100%', 
          justifyContent: 'flex-end' 
        }}>
          <View style={{ width: '70%', height: 16, backgroundColor: shimmerDark, borderRadius: 6 }} />
          <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: shimmerDark }} />
        </View>

        {/* שם קורס - עם ה-marginRight של 20 מהמקור */}
        <View style={{ 
          width: '50%', 
          height: 12, 
          backgroundColor: shimmerLight, 
          borderRadius: 4, 
          marginBottom: 14, 
          marginRight: 20 
        }} />

        {/* קופסת תאריך/טיימר */}
        <View style={{ marginRight: 20, width: 130 }}>
          <View style={{ 
            height: 44, 
            borderWidth: 1, 
            borderColor: shimmerDark, 
            borderRadius: 8, 
            backgroundColor: shimmerLight 
          }} />
          
          {/* דמה לנקודות הגלילה */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 4, marginTop: 4 }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: shimmerDark }} />
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: shimmerLight }} />
          </View>
        </View>
      </View>

    </Animated.View>
  );
}