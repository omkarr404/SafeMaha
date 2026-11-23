// FILE NAME: d:\Omkar\Water\FDA\screens\MyComplaintsScreen.js

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TextInput, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert, 
  StatusBar, 
  Platform 
} from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { useComplaints } from '../context/ComplaintContext';
import CustomButton from '../components/CustomButton';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as authService from '../services/authService';
import { colors, spacing, borderRadius, shadows } from '../constants/theme';

const SAVED_MOBILE_KEY = '@safemaha_saved_mobile';

export default function MyComplaintsScreen({ navigation }) {
  const { t, locale } = useLanguage();
  const { allComplaints, refreshComplaints } = useComplaints();
  
  const [mobileNumber, setMobileNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isMobileSaved, setIsMobileSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userComplaints, setUserComplaints] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('All');

  useEffect(() => {
    checkSavedMobile();
  }, []);

  useEffect(() => {
    if (isMobileSaved) {
      filterUserComplaints();
    }
  }, [allComplaints, isMobileSaved, mobileNumber, selectedFilter]);

  const checkSavedMobile = async () => {
    setLoading(true);
    try {
      const isAuth = await authService.isAuthenticated();
      const savedMobile = await authService.getCurrentUserPhone();
      if (isAuth && savedMobile) {
        setMobileNumber(savedMobile);
        setIsMobileSaved(true);
        await refreshComplaints();
      } else {
        const legacyMobile = await AsyncStorage.getItem(SAVED_MOBILE_KEY);
        if (legacyMobile) {
          setMobileNumber(legacyMobile);
          setIsMobileSaved(true);
          await refreshComplaints();
        }
      }
    } catch (e) {
      console.log('Error checking saved mobile:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async () => {
    const formatted = mobileNumber.trim();
    if (!/^\d{10}$/.test(formatted)) {
      Alert.alert(t('common.error'), t('myComplaints.validationError'));
      return;
    }
    
    setLoading(true);
    try {
      await authService.requestOTP(formatted);
      setOtpSent(true);
      Alert.alert(
        locale === 'mr' ? 'ओटीपी पाठवला' : 'OTP Dispatched',
        locale === 'mr' 
          ? 'तुमच्या मोबाईलवर ६ अंकी ओटीपी पाठवला आहे. (चाचणीसाठी 123456 वापरा)' 
          : 'A 6-digit code has been sent to your phone. (Use 123456 for testing)'
      );
    } catch (e) {
      console.log('Error sending OTP:', e);
      Alert.alert(t('common.error'), e.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
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
    
    setLoading(true);
    try {
      const phoneFormatted = mobileNumber.trim();
      await authService.verifyOTP(phoneFormatted, codeFormatted);
      await AsyncStorage.setItem(SAVED_MOBILE_KEY, phoneFormatted);
      
      setIsMobileSaved(true);
      setOtpSent(false);
      setOtpCode('');
      await refreshComplaints();
    } catch (e) {
      console.log('Error verifying OTP:', e);
      Alert.alert(t('common.error'), e.message || 'Invalid verification OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    await AsyncStorage.removeItem(SAVED_MOBILE_KEY);
    setIsMobileSaved(false);
    setMobileNumber('');
    setUserComplaints([]);
  };

  const filterUserComplaints = () => {
    const cleanCurrent = mobileNumber.replace(/\D/g, '').slice(-10);
    const mine = (allComplaints || []).filter((c) => {
      const cMobile = (c.mobile || '').replace(/\D/g, '').slice(-10);
      return cMobile === cleanCurrent;
    });

    if (selectedFilter === 'Active') {
      setUserComplaints(mine.filter((c) => c.status !== 'Closed'));
    } else if (selectedFilter === 'Resolved') {
      setUserComplaints(mine.filter((c) => c.status === 'Closed'));
    } else {
      setUserComplaints(mine);
    }
  };

  const formattedDate = (dateVal) => {
    if (!dateVal) return '—';
    try {
      const d = new Date(dateVal);
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return String(dateVal);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical': return colors.critical;
      case 'High': return colors.warning;
      case 'Medium': return colors.info;
      case 'Low': default: return colors.success;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      {/* View 1: OTP Login / Authentication Required */}
      {!isMobileSaved ? (
        <View style={styles.authContainer}>
          <View style={styles.authCard}>
            <View style={styles.authIconWrap}>
              <Ionicons name="shield-checkmark" size={32} color={colors.primary} />
            </View>
            <Text style={styles.authTitle}>
              {locale === 'mr' ? 'नागरिक ओळख पडताळणी' : 'Citizen Verification'}
            </Text>
            <Text style={styles.authSub}>
              {locale === 'mr'
                ? 'आपल्या नोंदणीकृत तक्रारी पाहण्यासाठी मोबाईल क्रमांक प्रमाणित करा.'
                : 'Enter your registered mobile number to view personal grievance history.'}
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('form.mobileLabel')}</Text>
              <View style={styles.phoneInputWrap}>
                <View style={styles.prefixBox}><Text style={styles.prefixText}>+91</Text></View>
                <TextInput
                  style={styles.phoneInput}
                  placeholder="10-digit mobile number"
                  placeholderTextColor={colors.textMuted}
                  value={mobileNumber}
                  onChangeText={(t) => setMobileNumber(t.replace(/[^0-9]/g, ''))}
                  keyboardType="numeric"
                  maxLength={10}
                  editable={!otpSent}
                />
              </View>
            </View>

            {otpSent && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  {locale === 'mr' ? '६-अंकी ओटीपी प्रविष्ट करा' : '6-Digit OTP Code'}
                </Text>
                <TextInput
                  style={styles.otpInput}
                  placeholder="Enter 6-digit code"
                  placeholderTextColor={colors.textMuted}
                  value={otpCode}
                  onChangeText={setOtpCode}
                  keyboardType="numeric"
                  maxLength={6}
                />
              </View>
            )}

            <View style={{ marginTop: spacing.sm }}>
              {!otpSent ? (
                <CustomButton
                  title={locale === 'mr' ? 'ओटीपी मिळवा' : 'Request OTP Code'}
                  onPress={handleSendOTP}
                  variant="primary"
                  loading={loading}
                  icon={<Ionicons name="chatbubble-ellipses-outline" size={16} color="#FFFFFF" />}
                />
              ) : (
                <CustomButton
                  title={locale === 'mr' ? 'प्रमाणित करा व प्रवेश करा' : 'Verify & View History'}
                  onPress={handleVerifyOTP}
                  variant="primary"
                  loading={loading}
                  icon={<Ionicons name="lock-open-outline" size={16} color="#FFFFFF" />}
                />
              )}
            </View>
          </View>
        </View>
      ) : (
        /* View 2: Authenticated Citizen Grievance History */
        <View style={styles.container}>
          
          {/* Top User Bar */}
          <View style={styles.userBar}>
            <View>
              <Text style={styles.userBarPhone}>Registered: +91 {mobileNumber}</Text>
              <Text style={styles.userBarSub}>{userComplaints.length} registered grievance(s)</Text>
            </View>
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={14} color={colors.critical} />
              <Text style={styles.logoutBtnText}>{locale === 'mr' ? 'बाहेर पडा' : 'Switch'}</Text>
            </TouchableOpacity>
          </View>

          {/* Filter Pills */}
          <View style={styles.filterBar}>
            {['All', 'Active', 'Resolved'].map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterPill,
                  selectedFilter === filter && styles.filterPillActive,
                ]}
                onPress={() => setSelectedFilter(filter)}
              >
                <Text style={[
                  styles.filterPillText,
                  selectedFilter === filter && styles.filterPillTextActive,
                ]}>
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Grievances List */}
          <FlatList
            data={userComplaints}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.complaintCard}
                onPress={() => navigation.navigate('ComplaintStatus', { complaintId: item.id })}
                activeOpacity={0.85}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.cardRefId}>{item.id}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: item.status === 'Closed' ? colors.successBg : colors.infoBg }]}>
                    <Text style={[styles.statusBadgeText, { color: item.status === 'Closed' ? colors.success : colors.secondary }]}>
                      {item.status}
                    </Text>
                  </View>
                </View>

                <Text style={styles.cardTitle}>{item.title}</Text>
                
                <View style={styles.cardFooter}>
                  <View style={styles.priorityIndicator}>
                    <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(item.priority) }]} />
                    <Text style={styles.priorityText}>{item.priority || 'Low'} Priority</Text>
                  </View>
                  <Text style={styles.cardDateText}>{formattedDate(item.createdAt || item.created_at)}</Text>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="folder-open-outline" size={44} color={colors.textMuted} />
                <Text style={styles.emptyTitle}>
                  {locale === 'mr' ? 'कोणतीही तक्रार आढळली नाही' : 'No Grievances Found'}
                </Text>
                <Text style={styles.emptySub}>
                  {locale === 'mr' 
                    ? 'या मोबाईल क्रमांकावर सध्या कोणतीही तक्रार नोंदवलेली नाही.' 
                    : 'You have not registered any grievances under this mobile number yet.'}
                </Text>
                <CustomButton
                  title={locale === 'mr' ? 'नवीन तक्रार नोंदवा' : 'File a New Complaint'}
                  onPress={() => navigation.navigate('ComplaintForm')}
                  variant="primary"
                  style={{ width: 220, marginTop: 16 }}
                />
              </View>
            }
          />

        </View>
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  authContainer: {
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
  authIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.infoBg,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  authTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  authSub: {
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
  userBar: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  userBarPhone: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  userBarSub: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: borderRadius.sm,
    backgroundColor: '#FEF2F2',
  },
  logoutBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.critical,
  },
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: 8,
    backgroundColor: colors.background,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },
  listContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: spacing.md,
  },
  complaintCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardRefId: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  statusBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  cardTitle: {
    fontSize: 13.5,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
  },
  priorityIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  cardDateText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginTop: 10,
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 17,
  },
});
