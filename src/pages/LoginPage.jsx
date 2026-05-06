import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView, StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MotiView } from 'moti';
import { loginUser } from '../api';
import { User, Lock, ArrowLeft, ArrowRight, Eye, EyeOff, Globe,ChevronDown } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TOSCheckbox from '../components/TOSCheckbox';
import Checkbox from 'expo-checkbox';

export default function LoginPage({ language, setLanguage, t, darkMode, setAccessToken, setUsername: setAppUsername }) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [rememberMe, setRememberMe] = useState(false); // זכור אותי בברירת מחדל
  const isRTL = language === 'he';

  const [institution, setInstitution] = useState(''); // 'ruppin' | 'bgu'
  const [showInstPicker, setShowInstPicker] = useState(false);

  const institutions = [
    { id: 'ruppin', he: 'המרכז האקדמי רופין', en: 'Ruppin Academic Center' },
    { id: 'bgu', he: 'אוניברסיטת בן-גוריון', en: 'Ben-Gurion University' }
  ];

const handleLogin = async () => {
    // הוספנו בדיקה שגם institution נבחר
    if (!usernameInput.trim() || !password.trim() || !institution) {
      setLoginError(language === 'he' ? 'נא למלא את כל השדות ולבחור מוסד לימודים' : 'Please fill all fields and select an institution');
      return;
    }
    setLoading(true);
    setLoginError('');
    try {
      // מעבירים ל-API גם את המוסד
      const { name, access_token, refresh_token } = await loginUser(usernameInput.trim(), password, institution);
      setAccessToken(access_token);
      setAppUsername(name || '');
      
      await SecureStore.setItemAsync('access_token', access_token);
      if (refresh_token) {
        await SecureStore.setItemAsync('refresh_token', refresh_token);
      }
      await AsyncStorage.setItem('taskup.pref.username', name || '');
      
      // שומרים האם המשתמש ביקש שניזכור אותו או לא + את המוסד!
      await AsyncStorage.setItem('taskup.pref.rememberMe', rememberMe ? 'true' : 'false');
      if (rememberMe) {
        await AsyncStorage.setItem('taskup.pref.institution', institution);
      } else {
        await AsyncStorage.removeItem('taskup.pref.institution');
      }
      
      navigation.replace('Dashboard', {
        username: name,
      });
    } catch {
      setLoginError(language === 'he' ? 'שם משתמש, סיסמה או מוסד שגויים' : 'Invalid credentials or institution');
    } finally {
      setLoading(false);
    }
  };

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
        contentContainerStyle={{ 
          flexGrow: 1, 
          justifyContent: 'center', 
          alignItems: 'center', 
          paddingHorizontal: 24, 
          
          
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >


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
            elevation: Platform.OS === 'android' ? 0 : 10, 
          }}>

            {/* Logo */}
            <View style={{ alignItems: 'center', justifyContent: 'center', width: 120, height: 120, marginTop: -15 }}>
              <View style={{ position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: '#4f46e5', opacity: 0.1, zIndex: -1 }} />
              <View style={{ position: 'absolute', width: 100, height: 100, borderRadius: 50, borderWidth: 10, borderColor: '#4f46e5', borderTopColor: 'transparent', borderRightColor: 'transparent', transform: [{ rotate: '-15deg' }] }} />
              <View style={{ position: 'absolute', top: 20, right: 83, width: 0, height: 0, borderLeftWidth: 12, borderRightWidth: 12, borderBottomWidth: 20, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: '#4f46e5', transform: [{ rotate: '30deg' }] }} />
              <View style={{ position: 'absolute', width: 25, height: 50, borderBottomWidth: 10, borderRightWidth: 10, borderRadius: 3, borderColor: '#2c9718', shadowColor: '#000000', shadowOffset: { width: 1, height: 2 }, shadowOpacity: 0.3, shadowRadius: 2, transform: [{ rotate: '40deg' }], top: 30, left: 50 }} />
            </View>

            {/* Title Section */}
            <View style={{ alignItems: 'center', marginBottom: 32 }}>
              <Text style={{ fontSize: 50, fontWeight: '900', letterSpacing: -1, marginBottom: 6 }}>
                <Text style={{ color: '#4f46e5' }}>Uni</Text>
                <Text style={{ color: darkMode ? '#f8fafc' : '#1e293b' }}>Task</Text>
              </Text>
              <Text style={{ color: darkMode ? '#cbd5e1' : '#475569', fontSize: 12, fontWeight: '500', letterSpacing: 2.5, textTransform: 'uppercase', textAlign: 'center' }}>
                {t.login.slogan}
              </Text>
            </View>

            {/* Institution Dropdown */}
            <View style={{ width: '85%', marginBottom: 12, zIndex: 50, alignSelf: 'center' }}>
              <TouchableOpacity
                onPress={() => {
                  setFocusedField('inst');
                  setShowInstPicker(!showInstPicker);
                }}
                activeOpacity={0.7}
                style={[styles.inputRow, { 
                  backgroundColor: inputBg, 
                  borderColor: focusedField === 'inst' || showInstPicker ? '#818cf8' : inputBorderNormal, 
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                  paddingHorizontal: 16,
                  height: 48,
                  justifyContent: 'space-between'
                }]}
              >
                <Text style={{ color: institution ? textColor : placeholderColor, fontSize: 15, fontWeight: '500' }}>
                  {institution 
                    ? institutions.find(i => i.id === institution)[language === 'he' ? 'he' : 'en'] 
                    : (language === 'he' ? 'בחר את מקום הלימודים..' : 'Select your institution..')}
                </Text>
                <MotiView animate={{ rotate: showInstPicker ? '180deg' : '0deg' }}>
                  <ChevronDown size={20} color={iconColor} />
                </MotiView>
              </TouchableOpacity>

              {/* התפריט שנפתח */}
              {showInstPicker && (
                <View style={{ 
                  position: 'absolute', 
                  top: 54, 
                  width: '100%', 
                  backgroundColor: darkMode ? '#1e293b' : '#ffffff', 
                  borderRadius: 16, 
                  borderWidth: 1, 
                  borderColor: inputBorderNormal, 
                  shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5,
                  overflow: 'hidden',
                  zIndex: 100
                }}>
                  {institutions.map((inst, index) => (
                    <TouchableOpacity
                      key={inst.id}
                      onPress={() => {
                        setInstitution(inst.id);
                        setShowInstPicker(false);
                        setFocusedField(null);
                      }}
                      style={{
                        paddingVertical: 14,
                        paddingHorizontal: 16,
                        borderBottomWidth: index === 0 ? 1 : 0,
                        borderBottomColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                        backgroundColor: institution === inst.id ? (darkMode ? 'rgba(79,70,229,0.2)' : '#eef2ff') : 'transparent'
                      }}
                    >
                      <Text style={{ 
                        color: textColor, 
                        textAlign: isRTL ? 'right' : 'left', 
                        fontWeight: institution === inst.id ? '700' : '500' 
                      }}>
                        {inst[language === 'he' ? 'he' : 'en']}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* ID Field */}
            <MotiView
              animate={{ scale: focusedField === 'id' ? 1.01 : 1 }}
              transition={{ type: 'spring', damping: 20, stiffness: 200 }}
              style={{ width: '100%', marginBottom: 12 }}
            >
              <View style={[styles.inputRow, { backgroundColor: inputBg, borderColor: focusedField === 'id' ? '#818cf8' : inputBorderNormal, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <View style={[styles.iconWrap, isRTL ? { marginRight: 4 } : { marginLeft: 4 }]}>
                  <User size={20} color={focusedField === 'id' ? focusedIconColor : iconColor} />
                </View>
                <TextInput
                  placeholder={t.login.idPlaceholder}
                  placeholderTextColor={placeholderColor}
                  value={usernameInput}
                  onChangeText={setUsernameInput}
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
              <View style={[styles.inputRow, { backgroundColor: inputBg, borderColor: focusedField === 'pass' ? '#818cf8' : inputBorderNormal, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
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
                  style={[styles.input, { color: textColor, textAlign: isRTL ? 'right' : 'left', paddingRight: isRTL ? 8 : 44, paddingLeft: isRTL ? 44 : 8 }]}
                  onFocus={() => setFocusedField('pass')}
                  onBlur={() => setFocusedField(null)}
                />
                
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={[styles.eyeBtn, isRTL ? { left: 8 } : { right: 8 }, { position: 'absolute', height: '100%', width: 40, justifyContent: 'center', alignItems: 'center', zIndex: 10 }]}
                  activeOpacity={0.7}
                >
                  <MotiView key={showPassword ? "eye-open" : "eye-closed"} from={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'timing', duration: 100 }}>
                    {showPassword ? <Eye size={20} color={focusedField === 'pass' ? focusedIconColor : iconColor} /> : <EyeOff size={20} color={focusedField === 'pass' ? focusedIconColor : iconColor} />}
                  </MotiView>
                </TouchableOpacity>
              </View>
            </MotiView>
            
            {/* Checkboxes Area */}
            <View style={{ width: '100%', marginTop: 12, marginBottom: 20, gap: 12 }}>
              
              {/* Remember Me Checkbox (New & Large Touch Target) */}
              <TouchableOpacity 
                style={{ flexDirection: language === 'he' ? 'row-reverse' : 'row', alignItems: 'center', gap: 12, paddingVertical: 8 }} 
                activeOpacity={0.7} 
                onPress={() => setRememberMe(!rememberMe)}
              >
                <Checkbox
                  value={rememberMe}
                  onValueChange={setRememberMe}
                  color={rememberMe ? '#4f46e5' : undefined}
                  style={styles.largeCheckbox}
                />
                <Text style={{ fontSize: 14, fontWeight: '500', color: darkMode ? '#e2e8f0' : '#334155' }}>
                  {language === 'he' ? 'זכור אותי ' : 'Remember me '}
                </Text>
              </TouchableOpacity>

              {/* TOS Checkbox */}
              <TOSCheckbox
                currentLanguage={language}
                isAccepted={isTermsAccepted}
                onAcceptChange={setIsTermsAccepted}
              />
            </View>

            {/* Login Button */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading || !isTermsAccepted}
              activeOpacity={0.9}
              style={{ width: '100%', marginTop: 8, marginBottom: 32, opacity: loading || !isTermsAccepted ? 0.6 : 1 }}
            >
              <LinearGradient
                colors={['#4f46e5', '#7c3aed', '#4f46e5']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 10, shadowColor: '#4f46e5', shadowOffset: { width: 0, height: 6 }, shadowOpacity: (loading || !isTermsAccepted) ? 0 : 0.4, shadowRadius: 14, elevation: (loading || !isTermsAccepted) ? 0 : 8 }}
              >
                {loading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <>
                    <Text style={{ color: 'white', fontSize: 17, fontWeight: '600', letterSpacing: 0.5 }}>
                      {t.login.submitButton}
                    </Text>
                    {isRTL ? <ArrowLeft size={20} color="white" strokeWidth={2.5} /> : <ArrowRight size={20} color="white" strokeWidth={2.5} />}
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Login error */}
            {loginError ? (
              <Text style={{ color: '#ef4444', fontSize: 13, fontWeight: '600', textAlign: 'center', marginTop: -20, marginBottom: 12 }}>
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
  largeCheckbox: {
    width: 22,
    height: 22,
  }
});