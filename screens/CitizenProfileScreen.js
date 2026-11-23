// FILE NAME: d:\Omkar\Water\FDA\screens\CitizenProfileScreen.js

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TextInput, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert, 
  StatusBar 
} from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import CustomButton from '../components/CustomButton';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as authService from '../services/authService';
import { colors, spacing, borderRadius, shadows } from '../constants/theme';

const SAVED_MOBILE_KEY = '@safemaha_saved_mobile';

export default function CitizenProfileScreen({ navigation }) {
  const { t, locale, setLocale } = useLanguage();
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [fullName, setFullName] = useState('');
  const [saving, setSaving] = useState(false);
  
  // OTP Auth States
  const [mobileNumber, setMobileNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    setLoading(true);
    try {
      const isAuth = await authService.isAuthenticated();
      const savedMobile = await authService.getCurrentUserPhone();
      if (isAuth && savedMobile) {
        setIsAuthenticated(true);
        await fetchProfile();
      } else {
        setIsAuthenticated(false);
      }
    } catch (e) {
      console.log('Error checking authentication status:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const data = await authService.getUserProfile();
      setProfileData(data);
      setFullName(data.name || '');
    } catch (e) {
      console.log('Error fetching user profile:', e);
    }
  };

  const handleSendOTP = async () => {
    const formatted = mobileNumber.trim();
    if (!/^\d{10}$/.test(formatted)) {
      Alert.alert(t('common.error'), t('myComplaints.validationError'));
      return;
    }
    
    setAuthLoading(true);
    try {
      await authService.requestOTP(formatted);
      setOtpSent(true);
      Alert.alert(
        locale === 'mr' ? 'ओटीपी पाठवला' : 'OTP Sent',
        locale === 'mr' 
          ? 'तुमच्या मोबाईलवर ६ अंकी ओटीपी पाठवला आहे. (चाचणीसाठी 123456 वापरा)' 
          : 'A 6-digit code has been sent to your phone. (Use 123456 for testing)'
      );
    } catch (e) {
      console.log('Error sending OTP:', e);
      Alert.alert(t('common.error'), e.message || 'Failed to send OTP.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    const codeFormatted = otpCode.trim();
    if (codeFormatted.length !== 6) {
      Alert.alert(
        t('common.error'),
        locale === 'mr' ? 'कृपया ६-अंकी ओटीपी प्रविष्ट करा.' : 'Please enter a valid 6-digit OTP code.'
      );
      return;
    }
    
    setAuthLoading(true);
    try {
      const phoneFormatted = mobileNumber.trim();
      await authService.verifyOTP(phoneFormatted, codeFormatted);
      await AsyncStorage.setItem(SAVED_MOBILE_KEY, phoneFormatted);
      
      setOtpSent(false);
      setOtpCode('');
      setIsAuthenticated(true);
      await fetchProfile();
    } catch (e) {
      console.log('Error verifying OTP:', e);
      Alert.alert(t('common.error'), e.message || 'Invalid verification OTP.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    const nameFormatted = fullName.trim();
    if (!nameFormatted) {
      Alert.alert(t('common.error'), t('form.validation.fullNameRequired'));
      return;
    }

    setSaving(true);
    try {
      const updated = await authService.updateUserProfile(nameFormatted);
      setProfileData(updated);
      Alert.alert(t('common.success'), t('profile.saveSuccess'));
    } catch (e) {
      console.log('Error updating profile:', e);
      Alert.alert(t('common.error'), t('profile.updateFail'));
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      locale === 'mr' ? 'बाहेर पडा?' : 'Sign Out?',
      locale === 'mr' ? 'तुम्ही खात्रीने बाहेर पडू इच्छिता?' : 'Are you sure you want to sign out from SafeMaha?',
      [
        { text: locale === 'mr' ? 'रद्द करा' : 'Cancel', style: 'cancel' },
        { 
          text: locale === 'mr' ? 'बाहेर पडा' : 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await authService.logout();
              await AsyncStorage.removeItem(SAVED_MOBILE_KEY);
              setIsAuthenticated(false);
              setProfileData(null);
              setMobileNumber('');
              setFullName('');
            } catch (e) {
              console.log('Logout error:', e);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  // View 1: Unauthenticated OTP Login
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
        <View style={styles.promptContainer}>
          <View style={styles.authCard}>
            <View style={styles.promptIconWrapper}>
              <Ionicons name="person" size={32} color={colors.primary} />
            </View>
            <Text style={styles.promptTitle}>{t('profile.headerTitle')}</Text>
            <Text style={styles.promptDesc}>
              {locale === 'mr' 
                ? 'तुमचे प्रोफाईल पाहण्यासाठी आणि तक्रारींची आकडेवारी तपासण्यासाठी ओटीपी द्वारे लॉगिन करा.' 
                : 'Authenticate via SMS OTP to access your personal citizen dashboard and grievance statistics.'}
            </Text>

            {authLoading ? (
              <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 20 }} />
            ) : !otpSent ? (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>{t('form.mobileLabel')}</Text>
                  <View style={styles.phoneInputWrap}>
                    <View style={styles.prefixBox}><Text style={styles.prefixText}>+91</Text></View>
                    <TextInput
                      style={styles.phoneInput}
                      placeholder="10-digit mobile number"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="numeric"
                      maxLength={10}
                      value={mobileNumber}
                      onChangeText={(t) => setMobileNumber(t.replace(/[^0-9]/g, ''))}
                    />
                  </View>
                </View>
                <CustomButton
                  title={locale === 'mr' ? 'ओटीपी मिळवा' : 'Request OTP Code'}
                  onPress={handleSendOTP}
                  variant="primary"
                />
              </>
            ) : (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    {locale === 'mr' ? 'ओटीपी कोड' : 'Verification OTP Code'}
                  </Text>
                  <TextInput
                    style={styles.otpInput}
                    placeholder="e.g. 123456"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                    maxLength={6}
                    value={otpCode}
                    onChangeText={setOtpCode}
                  />
                </View>
                <CustomButton
                  title={locale === 'mr' ? 'प्रमाणित करा व प्रवेश करा' : 'Verify & Enter'}
                  onPress={handleVerifyOTP}
                  variant="primary"
                />
                <TouchableOpacity 
                  onPress={() => {
                    setOtpSent(false);
                    setOtpCode('');
                  }}
                  style={{ marginTop: 12, alignItems: 'center' }}
                >
                  <Text style={styles.backPhoneText}>
                    ← {locale === 'mr' ? 'मोबाईल क्रमांक बदला' : 'Change Mobile Number'}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // View 2: Authenticated Citizen Profile
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Profile Identity Card */}
        <View style={styles.profileHeaderCard}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {fullName ? fullName.charAt(0).toUpperCase() : 'C'}
            </Text>
          </View>
          <Text style={styles.profileName}>{fullName || (locale === 'mr' ? 'नागरिक' : 'Citizen')}</Text>
          <View style={styles.phoneBadge}>
            <Ionicons name="call" size={12} color={colors.secondary} />
            <Text style={styles.phoneText}>+91 {profileData?.phone_number}</Text>
          </View>
        </View>

        {/* Complaint Statistics Metrics */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>{t('profile.complaintStats')}</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statCount}>{profileData?.complaints_count || 0}</Text>
              <Text style={styles.statLabel}>{t('profile.totalGrievances')}</Text>
            </View>
            
            <View style={[styles.statBox, { borderColor: '#FECACA', backgroundColor: '#FEF2F2' }]}>
              <Text style={[styles.statCount, { color: colors.critical }]}>
                {profileData?.open_complaints_count || 0}
              </Text>
              <Text style={[styles.statLabel, { color: '#991B1B' }]}>{t('profile.openGrievances')}</Text>
            </View>

            <View style={[styles.statBox, { borderColor: '#BBF7D0', backgroundColor: '#F0FDF4' }]}>
              <Text style={[styles.statCount, { color: colors.success }]}>
                {profileData?.closed_complaints_count || 0}
              </Text>
              <Text style={[styles.statLabel, { color: '#166534' }]}>{t('profile.closedGrievances')}</Text>
            </View>
          </View>
        </View>

        {/* Edit Profile Info Form */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>
            {locale === 'mr' ? 'वैयक्तिक माहिती अद्ययावत करा' : 'Update Profile Name'}
          </Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t('profile.nameLabel')}</Text>
            <TextInput
              style={styles.textInput}
              placeholder={t('profile.namePlaceholder')}
              placeholderTextColor={colors.textMuted}
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          <CustomButton
            title={t('profile.saveBtn')}
            onPress={handleSaveProfile}
            variant="primary"
            loading={saving}
            icon={<Ionicons name="save-outline" size={16} color="#FFFFFF" />}
          />
        </View>

        {/* Language Selection Quick Switcher */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>
            {locale === 'mr' ? 'अ‍ॅप भाषा निवडा' : 'App Language'}
          </Text>
          <View style={styles.langToggleRow}>
            <TouchableOpacity
              style={[styles.langToggleBtn, locale === 'mr' && styles.langToggleBtnActive]}
              onPress={() => setLocale('mr')}
            >
              <Text style={[styles.langToggleText, locale === 'mr' && styles.langToggleTextActive]}>
                मराठी (Marathi)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.langToggleBtn, locale === 'en' && styles.langToggleBtnActive]}
              onPress={() => setLocale('en')}
            >
              <Text style={[styles.langToggleText, locale === 'en' && styles.langToggleTextActive]}>
                English
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout Button */}
        <View style={{ marginTop: spacing.md }}>
          <CustomButton
            title={locale === 'mr' ? 'बाहेर पडा (Sign Out)' : 'Sign Out from SafeMaha'}
            onPress={handleLogout}
            variant="destructive"
            icon={<Ionicons name="log-out-outline" size={16} color="#FFFFFF" />}
          />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: spacing.md,
  },
  promptContainer: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'center',
  },
  authCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  promptIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.infoBg,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  promptTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  promptDesc: {
    fontSize: 12.5,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 18,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  phoneInputWrap: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    height: 44,
    overflow: 'hidden',
  },
  prefixBox: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  prefixText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: spacing.md,
    fontSize: 14,
    color: colors.text,
  },
  otpInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    height: 44,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    textAlign: 'center',
    letterSpacing: 4,
    color: colors.primary,
    fontWeight: '700',
  },
  backPhoneText: {
    color: colors.secondary,
    fontSize: 13,
    fontWeight: '700',
  },
  profileHeaderCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.infoBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  avatarText: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.primary,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  phoneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: borderRadius.full,
  },
  phoneText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  statBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  statCount: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  textInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    height: 44,
    paddingHorizontal: spacing.md,
    fontSize: 14,
    color: colors.text,
  },
  langToggleRow: {
    flexDirection: 'row',
    gap: 10,
  },
  langToggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: '#F8FAFC',
  },
  langToggleBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  langToggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  langToggleTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
