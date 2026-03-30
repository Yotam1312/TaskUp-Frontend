import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView, StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MotiView, AnimatePresence } from 'moti';
import { loginUser } from '../api';
import { User, Lock, ArrowLeft, ArrowRight, Layers, GraduationCap, Sparkles, Eye, EyeOff, Globe } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';


export default function LoginPage({ language, setLanguage, t, darkMode }) {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const isRTL = language === 'he';

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) return;
    setLoading(true);
    setLoginError('');
    try {
      const { name, access_token, refresh_token } = await loginUser(username.trim(), password);
      navigation.navigate('Dashboard', {
        username: name,
        access_token,
        refresh_token,
      });
    } catch {
      setLoginError(language === 'he' ? 'שם משתמש או סיסמה שגויים' : 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };


  const handleMoodleLogin = handleLogin;

  const iconColor = darkMode ? '#94a3b8' : '#64748b';
  const focusedIconColor = '#4f46e5';
  const textColor = darkMode ? '#f1f5f9' : '#1e293b';
  const placeholderColor = '#94a3b8aa';
  const cardBg = darkMode ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.55)';
  const cardBorder = darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.65)';
  const inputBg = darkMode ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.65)';
  const inputBorderNormal = darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.55)';

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 48 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >

        {/* Language toggle */}
        <TouchableOpacity
          onPress={() => setLanguage(language === 'he' ? 'en' : 'he')}
          style={{
            position: 'absolute', top: 52, left: 24, zIndex: 50,
            flexDirection: 'row', alignItems: 'center', gap: 6,
            paddingHorizontal: 12, paddingVertical: 6,
            backgroundColor: darkMode ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.35)',
            borderRadius: 100, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
          }}
          activeOpacity={0.8}
        >
          <Globe size={16} color={darkMode ? '#e2e8f0' : '#334155'} />
          <Text style={{ fontSize: 11, fontWeight: '700', color: darkMode ? '#e2e8f0' : '#334155' }}>
            {language === 'he' ? 'English' : 'עברית'}
          </Text>
        </TouchableOpacity>

        {/* Card */}
        <MotiView
          from={{ opacity: 0, scale: 0.95, translateY: 20 }}
          animate={{ opacity: 1, scale: 1, translateY: 0 }}
          transition={{ type: 'spring', damping: 14, stiffness: 100 }}
          style={{ width: '100%', maxWidth: 380 }}
        >
          <View style={{
            backgroundColor: cardBg,
            borderRadius: 40,
            borderWidth: 1,
            borderColor: cardBorder,
            padding: 32,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.15,
            shadowRadius: 24,
            elevation: 10,
          }}>

            {/* Logo with float animation */}
            {/* Logo */}
            <View style={{ alignItems: 'center', justifyContent: 'center', width: 120, height: 120, marginBottom: 10 }}>
              
              {/* הילה אחורית עדינה */}
              <View style={{ 
                position: 'absolute', 
                width: 100, 
                height: 100, 
                borderRadius: 50, 
                backgroundColor: '#4f46e5', 
                opacity: 0.1, 
                zIndex: -1 
              }} />

              {/* הטבעת הכחולה (Indigo) */}
              <View style={{
                position: 'absolute',
                width: 100, height: 100,
                borderRadius: 50,
                borderWidth: 10,
                borderColor: '#4f46e5',
                borderTopColor: 'transparent',
                borderRightColor: 'transparent',
                transform: [{ rotate: '-15deg' }]
              }} />

              {/* ראש החץ (משולש Indigo) */}
              <View style={{
                position: 'absolute',
                top: 20,
                right: 83,
                width: 0, height: 0,
                borderLeftWidth: 12,
                borderRightWidth: 12,
                borderBottomWidth: 20,
                borderLeftColor: 'transparent',
                borderRightColor: 'transparent',
                borderBottomColor: '#4f46e5',
                transform: [{ rotate: '30deg' }]
              }} />

              {/* סימן הווי (Violet) */}
              <View style={{
                position: 'absolute',
                width: 25, height: 50,
                borderBottomWidth: 10,
                borderRightWidth: 10,
                borderRadius: 3,
                borderColor: '#30b21a',
                transform: [{ rotate: '40deg' }],
                top: 30,
                left: 50
              }} />
              
            </View>
            {/* Title */}
            {/* Title Section */}
            <View style={{ alignItems: 'center', marginBottom: 32 }}>
              <Text style={{
                fontSize: 50,
                fontWeight: '900',
                letterSpacing: -1,
                marginBottom: 6,
              }}>
                {/* צבע סגול מותגי */}
                <Text style={{ color: '#4f46e5' }}>My</Text>
                <Text style={{ color: darkMode ? '#f8fafc' : '#1e293b' }}>Tasks</Text>
              </Text>

              {/* הסלוגן המתורגם */}
              <Text style={{
                color: darkMode ? '#cbd5e1' : '#475569',
                fontSize: 12,
                fontWeight: '500',
                letterSpacing: 2.5,
                textTransform: 'uppercase',
                textAlign: 'center',
              }}>
                {t.login.slogan}
              </Text>
            </View>

            {/* ID Field */}
            <MotiView
              animate={{ scale: focusedField === 'id' ? 1.01 : 1 }}
              transition={{ type: 'spring', damping: 20, stiffness: 200 }}
              style={{ width: '100%', marginBottom: 12 }}
            >
              <View style={[styles.inputRow, {
                backgroundColor: inputBg,
                borderColor: focusedField === 'id' ? '#818cf8' : inputBorderNormal,
                flexDirection: isRTL ? 'row-reverse' : 'row',
              }]}>
                <View style={[styles.iconWrap, isRTL ? { marginRight: 4 } : { marginLeft: 4 }]}>
                  <User size={20} color={focusedField === 'id' ? focusedIconColor : iconColor} />
                </View>
                <TextInput
                  placeholder={t.login.idPlaceholder}
                  placeholderTextColor={placeholderColor}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={[styles.input, { color: textColor, textAlign: isRTL ? 'right' : 'left' }]}
                  onFocus={() => setFocusedField('id')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </MotiView>

            {/* Password Field */}
            <MotiView
              animate={{ scale: focusedField === 'pass' ? 1.01 : 1 }}
              transition={{ type: 'spring', damping: 20, stiffness: 200 }}
              style={{ width: '100%' }}
            >
              <View style={[styles.inputRow, {
                backgroundColor: inputBg,
                borderColor: focusedField === 'pass' ? '#818cf8' : inputBorderNormal,
                flexDirection: isRTL ? 'row-reverse' : 'row',
              }]}>
                <View style={[styles.iconWrap, isRTL ? { marginRight: 4 } : { marginLeft: 4 }]}>
                  <Lock size={20} color={focusedField === 'pass' ? focusedIconColor : iconColor} />
                </View>
                <TextInput
                  placeholder={t.login.passwordPlaceholder}
                  placeholderTextColor={placeholderColor}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={[styles.input, {
                    color: textColor,
                    textAlign: isRTL ? 'right' : 'left',
                    paddingRight: isRTL ? 44 : 8,
                    paddingLeft: isRTL ? 8 : 44,
                  }]}
                  onFocus={() => setFocusedField('pass')}
                  onBlur={() => setFocusedField(null)}
                />
                {/* Eye button - hold to reveal */}
                <TouchableOpacity
                  onPressIn={() => setShowPassword(true)}
                  onPressOut={() => setShowPassword(false)}
                  style={[styles.eyeBtn, isRTL ? { left: 8 } : { right: 8 }]}
                  activeOpacity={1}
                >
                  <AnimatePresence>
                    {showPassword ? (
                      <MotiView key="eye-open" from={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ type: 'timing', duration: 150 }}>
                        <Eye size={20} color={iconColor} />
                      </MotiView>
                    ) : (
                      <MotiView key="eye-closed" from={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ type: 'timing', duration: 150 }}>
                        <EyeOff size={20} color={iconColor} />
                      </MotiView>
                    )}
                  </AnimatePresence>
                </TouchableOpacity>
              </View>
            </MotiView>

            {/* Login Button */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.9}
              style={{ width: '100%', marginTop: 24, marginBottom: 32 }}
            >
              <LinearGradient
                colors={['#4f46e5', '#7c3aed', '#4f46e5']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  height: 56, borderRadius: 16,
                  alignItems: 'center', justifyContent: 'center',
                  flexDirection: 'row', gap: 10,
                  shadowColor: '#4f46e5',
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.4,
                  shadowRadius: 14,
                  elevation: 8,
                }}
              >
                {loading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <>
                    <Text style={{ color: 'white', fontSize: 17, fontWeight: '600', letterSpacing: 0.5 }}>
                      {t.login.submitButton}
                    </Text>
                    {isRTL
                      ? <ArrowLeft size={20} color="white" strokeWidth={2.5} />
                      : <ArrowRight size={20} color="white" strokeWidth={2.5} />
                    }
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Login error */}
            {loginError ? (
              <Text style={{
                color: '#ef4444', fontSize: 13, fontWeight: '600',
                textAlign: 'center', marginTop: -20, marginBottom: 12,
              }}>
                {loginError}
              </Text>
            ) : null}



          </View>
        </MotiView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 4,
  },
  iconWrap: {
    width: 48, height: 48,
    alignItems: 'center', justifyContent: 'center',
    borderRadius: 12,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 15,
    fontWeight: '500',
  },
  eyeBtn: {
    position: 'absolute',
    top: '50%',
    marginTop: -16,
    padding: 8,
  },
});
