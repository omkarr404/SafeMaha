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

const SAVED_MOBILE_KEY = '@safemaha_saved_mobile';

export default function CitizenProfileScreen({ navigation }) {
  const { t, locale } = useLanguage();
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [fullName, setFullName] = useState('');
  const [saving, setSaving] = useState(false);
  
  // OTP Auth States (if not authenticated)
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
        locale === 'mr' ? 'तुमच्या मोबाईलवर ६ अंकी ओटीपी पाठवला आहे. (चाचणीसाठी १२३४५६ वापरा)' : 'A 6-digit code has been sent to your phone. (Use 123456 for testing)'
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
      Alert.alert(
        t('common.error'),
        t('form.validation.fullNameRequired')
      );
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
      locale === 'mr' ? 'बाहेर पडा?' : 'Logout?',
      locale === 'mr' ? 'तुम्ही खात्रीने बाहेर पडू इच्छिता?' : 'Are you sure you want to log out from this device?',
      [
        { text: locale === 'mr' ? 'रद्द करा' : 'Cancel', style: 'cancel' },
        { 
          text: locale === 'mr' ? 'बाहेर पडा' : 'Logout', 
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
          <ActivityIndicator size="large" color="#0A3D62" />
        </View>
      </SafeAreaView>
    );
  }

  // OTP Login Screen
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.promptContainer}>
          <View style={styles.promptHeader}>
            <View style={styles.promptIconWrapper}>
              <Ionicons name="person" size={40} color="#0A3D62" />
            </View>
            <Text style={styles.promptTitle}>{t('profile.headerTitle')}</Text>
            <Text style={styles.promptDesc}>
              {locale === 'mr' 
                ? 'तुमचे प्रोफाईल पाहण्यासाठी आणि तक्रारींची आकडेवारी तपासण्यासाठी ओटीपी द्वारे लॉगिन करा.' 
                : 'Log in via OTP to access your citizen profile and review grievance summary.'}
            </Text>
          </View>

          <View style={styles.promptForm}>
            {authLoading ? (
              <ActivityIndicator size="large" color="#0A3D62" style={{ marginVertical: 20 }} />
            ) : !otpSent ? (
              <>
                <Text style={styles.promptInputLabel}>{t('form.mobileLabel')}</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="phone-portrait-outline" size={20} color="#64748B" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder={t('myComplaints.mobilePlaceholder')}
                    placeholderTextColor="#94A3B8"
                    keyboardType="phone-pad"
                    maxLength={10}
                    value={mobileNumber}
                    onChangeText={setMobileNumber}
                  />
                </View>
                <CustomButton
                  title={locale === 'mr' ? 'ओटीपी पाठवा' : 'Request OTP'}
                  onPress={handleSendOTP}
                  style={styles.promptBtn}
                />
              </>
            ) : (
              <>
                <Text style={styles.promptInputLabel}>{locale === 'mr' ? 'ओटीपी कोड' : 'Verification OTP Code'}</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="shield-checkmark-outline" size={20} color="#64748B" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 123456"
                    placeholderTextColor="#94A3B8"
                    keyboardType="number-pad"
                    maxLength={6}
                    value={otpCode}
                    onChangeText={setOtpCode}
                  />
                </View>
                <CustomButton
                  title={locale === 'mr' ? 'सत्यापित करा' : 'Verify & Login'}
                  onPress={handleVerifyOTP}
                  style={styles.promptBtn}
                />
                <TouchableOpacity 
                  onPress={() => {
                    setOtpSent(false);
                    setOtpCode('');
                  }}
                  style={{ marginTop: 15, alignItems: 'center' }}
                >
                  <Text style={{ color: '#0A3D62', fontSize: 14, fontWeight: '700' }}>
                    ← {locale === 'mr' ? 'मोबाईल नंबर बदला' : 'Change Phone Number'}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Profile Card Header */}
        <View style={styles.profileHeaderCard}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {fullName ? fullName.charAt(0).toUpperCase() : 'C'}
            </Text>
          </View>
          <Text style={styles.profileName}>{fullName || (locale === 'mr' ? 'ग्राहक' : 'Citizen')}</Text>
          <View style={styles.phoneBadge}>
            <Ionicons name="phone-portrait-outline" size={14} color="#0A3D62" />
            <Text style={styles.phoneText}>+91 {profileData?.phone_number}</Text>
          </View>
        </View>

        {/* Complaint Statistics Grid */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeading}>{t('profile.complaintStats')}</Text>
          
          <View style={styles.statsGrid}>
            <View style={[styles.statBox, { borderColor: '#E2E8F0' }]}>
              <Text style={styles.statCount}>{profileData?.complaints_count || 0}</Text>
              <Text style={styles.statLabel}>{t('profile.totalGrievances')}</Text>
            </View>
            
            <View style={[styles.statBox, { borderColor: '#FEE2E2', backgroundColor: '#FEF2F2' }]}>
              <Text style={[styles.statCount, { color: '#EF4444' }]}>{profileData?.open_complaints_count || 0}</Text>
              <Text style={[styles.statLabel, { color: '#991B1B' }]}>{t('profile.openGrievances')}</Text>
            </View>

            <View style={[styles.statBox, { borderColor: '#D1FAE5', backgroundColor: '#ECFDF5' }]}>
              <Text style={[styles.statCount, { color: '#10B981' }]}>{profileData?.closed_complaints_count || 0}</Text>
              <Text style={[styles.statLabel, { color: '#065F46' }]}>{t('profile.closedGrievances')}</Text>
            </View>
          </View>
        </View>

        {/* Update Profile Form */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeading}>{locale === 'mr' ? 'माहिती अद्ययावत करा' : 'Update Information'}</Text>
          
          <View style={styles.formCard}>
            <Text style={styles.label}>{t('profile.nameLabel')}</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={20} color="#64748B" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={t('profile.namePlaceholder')}
                placeholderTextColor="#94A3B8"
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

            <CustomButton
              title={t('profile.saveBtn')}
              onPress={handleSaveProfile}
              variant="primary"
              disabled={saving}
              icon={saving ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Ionicons name="save-outline" size={20} color="#FFFFFF" />}
              style={styles.saveBtn}
            />
          </View>
        </View>

        {/* Logout Section */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out" size={20} color="#EF4444" />
            <Text style={styles.logoutButtonText}>
              {locale === 'mr' ? 'माध्यमातून बाहेर पडा' : 'Logout from SafeMaha'}
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  profileHeaderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0A3D62',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  avatarContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#0A3D6215',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0A3D62',
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0A3D62',
    marginBottom: 6,
  },
  phoneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  phoneText: {
    fontSize: 13,
    color: '#0A3D62',
    fontWeight: '600',
    marginLeft: 6,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0A3D62',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.5,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#0A3D62',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  statCount: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0A3D62',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0A3D62',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#0F172A',
    height: '100%',
  },
  saveBtn: {
    height: 48,
  },
  logoutContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#FEE2E2',
    backgroundColor: '#FFFFFF',
    width: '100%',
  },
  logoutButtonText: {
    color: '#EF4444',
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 8,
  },
  
  // OTP Prompt screen styles
  promptContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  promptHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  promptIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0A3D6210',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  promptTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0A3D62',
    marginBottom: 10,
  },
  promptDesc: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  promptForm: {
    width: '100%',
  },
  promptInputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0A3D62',
    marginBottom: 8,
  },
  promptBtn: {
    height: 48,
  },
});
