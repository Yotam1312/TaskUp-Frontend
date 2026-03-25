import { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';

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

  const shimmerLight = darkMode ? '#1e293b' : '#e2e8f0';
  const shimmerDark = darkMode ? '#334155' : '#cbd5e1';
  const cardBg = darkMode ? 'rgba(15,23,42,0.9)' : 'rgba(255,255,255,0.9)';
  const cardBorder = darkMode ? '#1e293b' : '#e2e8f0';

  return (
    <Animated.View style={{
      opacity: pulse,
      backgroundColor: cardBg,
      borderWidth: 1,
      borderColor: cardBorder,
      borderRadius: 16,
      padding: 16,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      minHeight: 110,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 4,
      elevation: 1,
    }}>
      {/* Left: content area */}
      <View style={{ flex: 1, paddingLeft: 16, alignItems: 'flex-end' }}>
        {/* Dot + title row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8, width: '100%', justifyContent: 'flex-end' }}>
          <View style={{ width: '55%', height: 20, backgroundColor: shimmerDark, borderRadius: 6 }} />
          <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: shimmerDark }} />
        </View>
        {/* Course name */}
        <View style={{ width: '35%', height: 12, backgroundColor: shimmerLight, borderRadius: 4, marginBottom: 16, marginRight: 20 }} />
        {/* Date box */}
        <View style={{ width: 130, height: 48, backgroundColor: shimmerLight, borderRadius: 8, marginRight: 20 }} />
      </View>

      {/* Right: buttons area */}
      <View style={{ gap: 8, width: 100, marginTop: 4 }}>
        <View style={{ height: 32, backgroundColor: shimmerDark, borderRadius: 8 }} />
        <View style={{ height: 32, backgroundColor: shimmerDark, borderRadius: 8 }} />
      </View>
    </Animated.View>
  );
}
