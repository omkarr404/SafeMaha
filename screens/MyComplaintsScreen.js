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
  StatusBar
} from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { useComplaints } from '../context/ComplaintContext';
import CustomButton from '../components/CustomButton';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as authService from '../services/authService';

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
  const [selectedFilter, setSelectedFilter] = useState('All'); // 'All', 'Submitted', 'Investigation', 'Closed'

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
        // Fallback to check legacy saved mobile if not fully logged in
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
        locale === 'mr' ? 'ओटीपी पाठवला' : 'OTP Sent',
        locale === 'mr' ? 'तुमच्या मोबाईलवर ६ अंकी ओटीपी पाठवला आहे. (चाचणीसाठी १२३४५६ वापरा)' : 'A 6-digit code has been sent to your phone. (Use 123456 for testing)'
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
      
      // Save legacy key for backward compatibility
      await AsyncStorage.setItem(SAVED_MOBILE_KEY, phoneFormatted);
      
      setIsMobileSaved(true);
      setOtpSent(false);
      setOtpCode('');
      await refreshComplaints();
    } catch (e) {
      console.log('Error verifying OTP:', e);
      Alert.alert(t('common.error'), e.message || 'Invalid verification OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogOut = async () => {
    Alert.alert(
      locale === 'mr' ? 'बाहेर पडा?' : 'Logout Account?',
      locale === 'mr' ? 'तुम्ही खात्रीने बाहेर पडू इच्छिता?' : 'Are you sure you want to log out of this device?',
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
              setMobileNumber('');
              setIsMobileSaved(false);
              setUserComplaints([]);
            } catch (e) {
              console.log('Error clearing session:', e);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const filterUserComplaints = () => {
    // Filter by user mobile
    const filteredByMobile = allComplaints.filter(
      (c) => c.mobile && c.mobile.trim() === mobileNumber.trim()
    );

    // Filter by tab
    if (selectedFilter === 'All') {
      setUserComplaints(filteredByMobile);
    } else if (selectedFilter === 'Submitted') {
      setUserComplaints(
        filteredByMobile.filter((c) => c.status === 'Submitted' || c.status === 'Assigned')
      );
    } else if (selectedFilter === 'Investigation') {
      setUserComplaints(
        filteredByMobile.filter((c) => c.status === 'Investigation' || c.status === 'Action Taken')
      );
    } else if (selectedFilter === 'Closed') {
      setUserComplaints(filteredByMobile.filter((c) => c.status === 'Closed'));
    }
  };

  // Status badging styles
  const getStatusColor = (status) => {
    switch (status) {
      case 'Submitted': return '#3C6382';
      case 'Assigned': return '#0A3D62';
      case 'Investigation': return '#E58E26';
      case 'Action Taken': return '#38ADA9';
      case 'Closed': return '#888888';
      default: return '#0A3D62';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'Submitted': return t('status.timeline.submitted');
      case 'Assigned': return t('status.timeline.assigned');
      case 'Investigation': return t('status.timeline.investigation');
      case 'Action Taken': return t('status.timeline.actionTaken');
      case 'Closed': return t('status.timeline.closed');
      default: return status;
    }
  };

  const getCategoryLabel = (cat) => {
    switch (cat) {
      case 'food': return t('form.categories.food');
      case 'drug': return t('form.categories.drug');
      case 'cosmetic': return t('form.categories.cosmetic');
      case 'other': return t('form.categories.other');
      default: return cat;
    }
  };

  const renderComplaintItem = ({ item }) => {
    const formattedDate = new Date(item.createdAt).toLocaleDateString(
      locale === 'mr' ? 'mr-IN' : 'en-US',
      { year: 'numeric', month: 'short', day: 'numeric' }
    );

    return (
      <TouchableOpacity 
        style={styles.card} 
        activeOpacity={0.9}
        onPress={() => navigation.navigate('ComplaintStatus', { complaintId: item.id })}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardId}>{item.id}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
            <Text style={[styles.statusBadgeText, { color: getStatusColor(item.status) }]}>
              {getStatusLabel(item.status)}
            </Text>
          </View>
        </View>
        
        <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
        
        <View style={styles.cardMeta}>
          <Text style={styles.categoryText}>{getCategoryLabel(item.category)}</Text>
          <Text style={styles.dateText}>{formattedDate}</Text>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.viewDetailsText}>{t('track.viewDetails')} →</Text>
        </View>
      </TouchableOpacity>
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

  // Render Mobile Number Input Prompt
  if (!isMobileSaved) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.promptContainer}>
          <View style={styles.promptHeader}>
            <View style={styles.promptIconWrapper}>
              <Ionicons name="folder-open" size={40} color="#0A3D62" />
            </View>
            <Text style={styles.promptTitle}>{t('myComplaints.mobilePromptTitle')}</Text>
            <Text style={styles.promptDesc}>{t('myComplaints.mobilePromptDesc')}</Text>
          </View>

          <View style={styles.promptForm}>
            {!otpSent ? (
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

  // Render Complaints History List
  const filtersList = [
    { key: 'All', label: t('myComplaints.filters.all') },
    { key: 'Submitted', label: t('myComplaints.filters.submitted') },
    { key: 'Investigation', label: t('myComplaints.filters.investigation') },
    { key: 'Closed', label: t('myComplaints.filters.closed') }
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.container}>
        
        {/* User Mobile Banner */}
        <View style={styles.mobileBanner}>
          <View style={styles.mobileBannerLeft}>
            <Ionicons name="person-circle" size={24} color="#0A3D62" />
            <Text style={styles.mobileBannerText}>+91 {mobileNumber}</Text>
          </View>
          <TouchableOpacity onPress={handleLogOut} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={16} color="#EF4444" />
            <Text style={styles.logoutText}>{t('myComplaints.changeNumber')}</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Filters */}
        <View style={styles.tabContainer}>
          {filtersList.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.tabButton,
                selectedFilter === filter.key && styles.tabButtonActive
              ]}
              onPress={() => setSelectedFilter(filter.key)}
            >
              <Text style={[
                styles.tabText,
                selectedFilter === filter.key && styles.tabTextActive
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Complaints List */}
        <View style={styles.listContainer}>
          {userComplaints.length > 0 ? (
            <FlatList
              data={userComplaints}
              keyExtractor={(item) => item.id}
              renderItem={renderComplaintItem}
              contentContainerStyle={styles.listScroll}
              showsVerticalScrollIndicator={false}
              refreshing={loading}
              onRefresh={refreshComplaints}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={60} color="#CBD5E1" />
              <Text style={styles.emptyText}>{t('myComplaints.emptyState')}</Text>
              <CustomButton
                title={locale === 'mr' ? 'तक्रार दाखल करा' : 'File a New Complaint'}
                onPress={() => navigation.navigate('ComplaintForm')}
                variant="outline"
                style={styles.emptyBtn}
              />
            </View>
          )}
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 20,
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
  promptBtn: {
    height: 48,
  },
  mobileBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
  },
  mobileBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mobileBannerText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0A3D62',
    marginLeft: 6,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    backgroundColor: '#FEF2F2',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  logoutText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EF4444',
    marginLeft: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 2,
  },
  tabButtonActive: {
    backgroundColor: '#0A3D62',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  listScroll: {
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0A3D62',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardId: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0A3D62',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  cardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3C6382',
  },
  dateText: {
    fontSize: 12,
    color: '#64748B',
  },
  cardFooter: {
    alignItems: 'flex-start',
  },
  viewDetailsText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#38ADA9',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    marginTop: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
    marginBottom: 20,
  },
  emptyBtn: {
    width: 200,
  },
});
