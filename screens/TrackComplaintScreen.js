import React, { useState, useEffect } from 'react';
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
  ActivityIndicator
} from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import CustomButton from '../components/CustomButton';
import { Ionicons } from '@expo/vector-icons';
import { getComplaintDetails } from '../services/complaintService';

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
        // Match mobile numbers (last 10 digits to be safe with country codes)
        const cleanMobileQuery = mobile.replace(/\D/g, '').slice(-10);
        const cleanComplaintMobile = (data.mobile || '').replace(/\D/g, '').slice(-10);

        if (cleanMobileQuery === cleanComplaintMobile) {
          setSearchResult(data);
        } else {
          Alert.alert(
            t('common.error'),
            locale === 'mr' ? 'प्रविष्ट केलेला मोबाईल क्रमांक या तक्रारीशी जुळत नाही.' : 'The mobile number entered does not match the records for this complaint.'
          );
        }
      } else {
        Alert.alert(
          t('common.error'),
          locale === 'mr' ? 'तक्रार आढळली नाही. कृपया संदर्भ क्रमांक तपासा.' : 'Complaint not found. Please verify the Reference Number.'
        );
      }
    } catch (e) {
      console.log('Error searching for complaint:', e);
      Alert.alert(
        t('common.error'),
        locale === 'mr' ? 'तक्रार शोधण्यात त्रुटी आली. कृपया नंतर प्रयत्न करा.' : 'Error retrieving complaint. Please try again.'
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

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString(
        locale === 'mr' ? 'mr-IN' : 'en-US',
        { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
      );
    } catch (e) {
      return dateStr;
    }
  };

  // Timeline list for visualization
  const timelineSteps = ['Submitted', 'Assigned', 'Investigation', 'Action Taken', 'Closed'];
  const activeIndex = searchResult ? timelineSteps.indexOf(searchResult.status) : 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        
        {/* Search Input Box */}
        <View style={styles.searchBox}>
          <Text style={styles.searchLabel}>
            {locale === 'mr' ? 'तक्रार संदर्भ क्रमांक' : 'Complaint Reference Number'} <Text style={styles.asterisk}>*</Text>
          </Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="document-text-outline" size={20} color="#64748B" style={styles.searchIcon} />
            <TextInput
              style={styles.input}
              placeholder="e.g. MHFDA-2026-000001"
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="characters"
            />
          </View>

          <Text style={[styles.searchLabel, { marginTop: 16 }]}>
            {t('form.mobileLabel')} <Text style={styles.asterisk}>*</Text>
          </Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="phone-portrait-outline" size={20} color="#64748B" style={styles.searchIcon} />
            <TextInput
              style={styles.input}
              placeholder={t('form.mobilePlaceholder')}
              placeholderTextColor="#94A3B8"
              keyboardType="phone-pad"
              maxLength={10}
              value={mobileQuery}
              onChangeText={setMobileQuery}
            />
          </View>

          <View style={styles.btnRow}>
            {hasSearched && (
              <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
                <Text style={styles.clearBtnText}>{locale === 'mr' ? 'साफ करा' : 'Clear'}</Text>
              </TouchableOpacity>
            )}
            <CustomButton 
              title={t('track.searchBtn')}
              onPress={handleSearch}
              variant="primary"
              disabled={loading}
              icon={loading ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Ionicons name="search" size={20} color="#FFFFFF" />}
              style={[styles.searchBtn, hasSearched ? { flex: 1, marginLeft: 12 } : { width: '100%' }]}
            />
          </View>
        </View>

        {/* Results view */}
        <View style={styles.resultsContainer}>
          {loading ? (
            <ActivityIndicator size="large" color="#0A3D62" style={{ marginTop: 40 }} />
          ) : hasSearched && searchResult ? (
            <View style={styles.resultCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardId}>{searchResult.id}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(searchResult.status) + '15' }]}>
                  <Text style={[styles.statusBadgeText, { color: getStatusColor(searchResult.status) }]}>
                    {getStatusLabel(searchResult.status)}
                  </Text>
                </View>
              </View>

              <Text style={styles.cardTitle}>{searchResult.title}</Text>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{locale === 'mr' ? 'तक्रार वर्ग:' : 'Category:'}</Text>
                <Text style={styles.infoValue}>{getCategoryLabel(searchResult.category)}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{locale === 'mr' ? 'तपास अधिकारी:' : 'Assigned Officer:'}</Text>
                <Text style={styles.infoValue}>
                  {searchResult.assignedOfficer || searchResult.assigned_officer || (locale === 'mr' ? 'अद्याप नियुक्त नाही' : 'Not Assigned Yet')}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{locale === 'mr' ? 'शेवटचे अद्यतन:' : 'Last Updated On:'}</Text>
                <Text style={styles.infoValue}>{formatDateTime(searchResult.updated_at)}</Text>
              </View>

              {/* Progress Timeline Stepper */}
              <View style={styles.timelineContainer}>
                <Text style={styles.timelineHeading}>{locale === 'mr' ? 'तक्रार प्रगती' : 'Grievance Progress Timeline'}</Text>
                
                {timelineSteps.map((step, idx) => {
                  const isDone = idx <= activeIndex;
                  const isCurr = idx === activeIndex;
                  
                  return (
                    <View key={step} style={styles.timelineRow}>
                      <View style={styles.timelineLineWrapper}>
                        <View style={[
                          styles.timelineCircle, 
                          isDone ? styles.circleDone : styles.circlePending,
                          isCurr && styles.circleActive
                        ]}>
                          {isDone ? (
                            <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                          ) : (
                            <View style={styles.smallPendingDot} />
                          )}
                        </View>
                        {idx !== timelineSteps.length - 1 && (
                          <View style={[styles.timelineLine, idx < activeIndex ? styles.lineDone : styles.linePending]} />
                        )}
                      </View>
                      
                      <View style={styles.timelineContent}>
                        <Text style={[
                          styles.timelineLabel, 
                          isDone ? styles.labelDone : styles.labelPending,
                          isCurr && styles.labelActive
                        ]}>
                          {getStatusLabel(step)}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          ) : hasSearched ? (
            <View style={styles.noResultsBox}>
              <Ionicons name="alert-circle-outline" size={48} color="#94A3B8" />
              <Text style={styles.noResultsText}>{t('track.noResults')}</Text>
            </View>
          ) : (
            // Pre-search welcome guide
            <View style={styles.guideBox}>
              <Ionicons name="information-circle-outline" size={32} color="#0A3D62" />
              <Text style={styles.guideText}>
                {locale === 'mr' 
                  ? 'आपल्या तक्रारीची सद्यस्थिती तपासण्यासाठी संदर्भ क्रमांक (उदा. MHFDA-2026-XXXXXX) आणि नोंदणीकृत मोबाईल क्रमांक प्रविष्ट करा.' 
                  : 'Enter your complaint Reference Number (e.g. MHFDA-2026-XXXXXX) along with your registered mobile number to retrieve status updates.'}
              </Text>
            </View>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  scrollContainer: {
    paddingBottom: 30,
  },
  searchBox: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 3,
  },
  searchLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0A3D62',
    marginBottom: 8,
  },
  asterisk: {
    color: '#EF4444',
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
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
    height: '100%',
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  clearBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    height: 46,
    justifyContent: 'center',
  },
  clearBtnText: {
    color: '#64748B',
    fontSize: 15,
    fontWeight: '700',
  },
  searchBtn: {
    height: 46,
  },
  resultsContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0A3D62',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
    paddingBottom: 10,
  },
  cardId: {
    fontSize: 16,
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
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
    width: 130,
  },
  infoValue: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '700',
    flex: 1,
  },
  timelineContainer: {
    marginTop: 20,
    borderTopWidth: 1,
    borderColor: '#F1F5F9',
    paddingTop: 16,
  },
  timelineHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0A3D62',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timelineRow: {
    flexDirection: 'row',
    minHeight: 46,
  },
  timelineLineWrapper: {
    alignItems: 'center',
    marginRight: 12,
  },
  timelineCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  circleDone: {
    backgroundColor: '#38ADA9',
  },
  circlePending: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
  circleActive: {
    borderColor: '#0A3D62',
    borderWidth: 1.5,
    backgroundColor: '#0A3D62',
  },
  smallPendingDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
  },
  timelineLine: {
    width: 1.5,
    flex: 1,
    marginVertical: 2,
  },
  lineDone: {
    backgroundColor: '#38ADA9',
  },
  linePending: {
    backgroundColor: '#E2E8F0',
  },
  timelineContent: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 10,
  },
  timelineLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  labelDone: {
    color: '#38ADA9',
  },
  labelPending: {
    color: '#94A3B8',
  },
  labelActive: {
    color: '#0A3D62',
    fontSize: 14,
  },
  noResultsBox: {
    alignItems: 'center',
    padding: 30,
    marginTop: 20,
  },
  noResultsText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '500',
  },
  guideBox: {
    backgroundColor: '#EBF3F9',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#D0E2EF',
  },
  guideText: {
    flex: 1,
    fontSize: 13,
    color: '#0A3D62',
    marginLeft: 10,
    lineHeight: 18,
    fontWeight: '600',
  },
});
