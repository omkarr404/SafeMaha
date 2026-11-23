// FILE NAME: d:\Omkar\Water\FDA\screens\TrackComplaintScreen.js

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TextInput, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  StatusBar, 
  ActivityIndicator, 
  Platform 
} from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import CustomButton from '../components/CustomButton';
import { Ionicons } from '@expo/vector-icons';
import { getComplaintDetails } from '../services/complaintService';
import { colors, spacing, borderRadius, shadows } from '../constants/theme';

export default function TrackComplaintScreen({ navigation }) {
  const { t, locale } = useLanguage();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileQuery, setMobileQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    const id = searchQuery.trim();
    const mobile = mobileQuery.trim();

    if (!id) {
      Alert.alert(
        t('common.error'),
        locale === 'mr' ? 'कृपया तक्रार संदर्भ क्रमांक प्रविष्ट करा.' : 'Please enter the complaint reference number.'
      );
      return;
    }

    if (!mobile || mobile.length !== 10) {
      Alert.alert(
        t('common.error'),
        t('myComplaints.validationError')
      );
      return;
    }

    setLoading(true);
    setSearchResult(null);
    setHasSearched(false);

    try {
      const data = await getComplaintDetails(id);
      
      if (data) {
        const cleanMobileQuery = mobile.replace(/\D/g, '').slice(-10);
        const cleanComplaintMobile = (data.mobile || '').replace(/\D/g, '').slice(-10);

        if (cleanMobileQuery === cleanComplaintMobile) {
          setSearchResult(data);
        } else {
          Alert.alert(
            t('common.error'),
            locale === 'mr' 
              ? 'प्रविष्ट केलेला मोबाईल क्रमांक या तक्रारीशी जुळत नाही.' 
              : 'The mobile number entered does not match records for this complaint.'
          );
        }
      } else {
        Alert.alert(
          t('common.error'),
          locale === 'mr' 
            ? 'तक्रार आढळली नाही. कृपया संदर्भ क्रमांक तपासा.' 
            : 'Complaint not found. Please verify the Reference ID.'
        );
      }
    } catch (e) {
      console.log('Error searching for complaint:', e);
      Alert.alert(
        t('common.error'),
        locale === 'mr' 
          ? 'तक्रार शोधण्यात त्रुटी आली. कृपया नंतर प्रयत्न करा.' 
          : 'Error retrieving complaint status. Please try again.'
      );
    } finally {
      setLoading(false);
      setHasSearched(true);
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    setMobileQuery('');
    setSearchResult(null);
    setHasSearched(false);
  };

  const getPriorityBadge = (priority) => {
    const p = priority || 'Low';
    switch (p) {
      case 'Critical':
        return { color: colors.critical, bg: colors.criticalBg, label: locale === 'mr' ? 'अत्यंत गंभीर' : 'Critical' };
      case 'High':
        return { color: colors.warning, bg: colors.warningBg, label: locale === 'mr' ? 'उच्च प्राधान्य' : 'High' };
      case 'Medium':
        return { color: colors.info, bg: colors.infoBg, label: locale === 'mr' ? 'मध्यम' : 'Medium' };
      case 'Low':
      default:
        return { color: colors.success, bg: colors.successBg, label: locale === 'mr' ? 'सामान्य' : 'Low' };
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Submitted':
        return { color: '#475569', bg: '#F1F5F9', label: t('status.timeline.submitted') };
      case 'Assigned':
        return { color: colors.secondary, bg: colors.infoBg, label: t('status.timeline.assigned') };
      case 'Investigation':
        return { color: colors.warning, bg: colors.warningBg, label: t('status.timeline.investigation') };
      case 'Action Taken':
        return { color: '#0369A1', bg: '#E0F2FE', label: t('status.timeline.actionTaken') };
      case 'Closed':
        return { color: colors.success, bg: colors.successBg, label: t('status.timeline.closed') };
      default:
        return { color: colors.textSecondary, bg: '#F1F5F9', label: status || 'Submitted' };
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* Header Notice Card */}
        <View style={styles.headerCard}>
          <Text style={styles.headerTitle}>{t('track.headerTitle')}</Text>
          <Text style={styles.headerSub}>
            {locale === 'mr' 
              ? 'नोंदणीकृत संदर्भ क्रमांक व मोबाईल क्रमांकाद्वारे थेट तपासाची प्रगती पहा.'
              : 'Public verification portal: check real-time officer dispatch & inspection timeline.'}
          </Text>
        </View>

        {/* Search Query Form Card */}
        <View style={styles.formCard}>
          {/* Reference ID Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              {locale === 'mr' ? 'तक्रार संदर्भ क्रमांक (Reference ID)' : 'Complaint Reference ID'}
            </Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="document-text-outline" size={18} color={colors.textSecondary} style={{ marginRight: 8 }} />
              <TextInput
                style={styles.textInput}
                placeholder="e.g. MHFDA-2026-000101"
                placeholderTextColor={colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="characters"
              />
            </View>
          </View>

          {/* Mobile Number Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              {locale === 'mr' ? 'नोंदणीकृत १०-अंकी मोबाईल क्रमांक' : 'Registered 10-Digit Mobile'}
            </Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="call-outline" size={18} color={colors.textSecondary} style={{ marginRight: 8 }} />
              <TextInput
                style={styles.textInput}
                placeholder="Enter 10-digit mobile"
                placeholderTextColor={colors.textMuted}
                value={mobileQuery}
                onChangeText={(text) => setMobileQuery(text.replace(/[^0-9]/g, ''))}
                keyboardType="numeric"
                maxLength={10}
              />
            </View>
          </View>

          {/* Action Button Row */}
          <View style={styles.buttonRow}>
            <CustomButton
              title={locale === 'mr' ? 'तक्रार शोधा (Track)' : 'Search Grievance Record'}
              onPress={handleSearch}
              variant="primary"
              loading={loading}
              icon={<Ionicons name="search" size={16} color="#FFFFFF" />}
            />

            {(searchQuery.length > 0 || mobileQuery.length > 0) && (
              <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
                <Ionicons name="close-circle-outline" size={16} color={colors.textSecondary} />
                <Text style={styles.clearBtnText}>{locale === 'mr' ? 'माहिती साफ करा' : 'Clear Search'}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Search Result Showcase Card */}
        {searchResult && (
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <View>
                <Text style={styles.resultRefId}>{searchResult.id}</Text>
                <Text style={styles.resultCategory}>
                  Sector: {String(searchResult.category || 'General').toUpperCase()}
                </Text>
              </View>
              <View style={[styles.badge, { backgroundColor: getStatusBadge(searchResult.status).bg }]}>
                <Text style={[styles.badgeText, { color: getStatusBadge(searchResult.status).color }]}>
                  {getStatusBadge(searchResult.status).label}
                </Text>
              </View>
            </View>

            <Text style={styles.resultTitle}>{searchResult.title}</Text>

            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Priority</Text>
                <View style={[styles.priorityPill, { backgroundColor: getPriorityBadge(searchResult.priority).bg }]}>
                  <Text style={[styles.priorityText, { color: getPriorityBadge(searchResult.priority).color }]}>
                    {getPriorityBadge(searchResult.priority).label}
                  </Text>
                </View>
              </View>

              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Assigned Officer</Text>
                <Text style={styles.metaValue}>
                  {searchResult.assignedOfficer || (locale === 'mr' ? 'अन्वेषण अधिकारी लवकरच' : 'Awaiting Assignment')}
                </Text>
              </View>
            </View>

            <View style={styles.dateRow}>
              <Text style={styles.dateText}>
                Lodged: {formattedDate(searchResult.createdAt || searchResult.created_at)}
              </Text>
            </View>

            <View style={{ marginTop: spacing.md }}>
              <CustomButton
                title={locale === 'mr' ? 'संपूर्ण तपास प्रगती पहा →' : 'View Full Investigation Timeline →'}
                onPress={() => navigation.navigate('ComplaintStatus', { complaintId: searchResult.id })}
                variant="secondary"
              />
            </View>
          </View>
        )}

        {/* Empty Result Notification */}
        {hasSearched && !searchResult && !loading && (
          <View style={styles.notFoundCard}>
            <Ionicons name="alert-circle-outline" size={36} color={colors.warning} />
            <Text style={styles.notFoundTitle}>
              {locale === 'mr' ? 'तक्रार आढळली नाही' : 'No Matching Record Found'}
            </Text>
            <Text style={styles.notFoundSub}>
              {locale === 'mr' 
                ? 'कृपया संदर्भ क्रमांक आणि नोंदणीकृत १०-अंकी मोबाईल बरोबर असल्याची खात्री करा.'
                : 'Double-check the Reference ID and matching 10-digit mobile number, then search again.'}
            </Text>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: spacing.md,
  },
  headerCard: {
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  headerSub: {
    fontSize: 12.5,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
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
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    height: 44,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  buttonRow: {
    marginTop: spacing.xs,
    alignItems: 'center',
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    marginTop: 4,
  },
  clearBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  resultCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  resultRefId: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  resultCategory: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  metaItem: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 12.5,
    fontWeight: '600',
    color: colors.text,
  },
  priorityPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '700',
  },
  dateRow: {
    alignItems: 'flex-end',
  },
  dateText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  notFoundCard: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    textAlign: 'center',
  },
  notFoundTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#92400E',
    marginTop: 8,
    marginBottom: 4,
  },
  notFoundSub: {
    fontSize: 12,
    color: '#78350F',
    textAlign: 'center',
    lineHeight: 18,
  },
});
