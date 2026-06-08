// FILE NAME: d:\Omkar\Water\FDA\screens\ComplaintReviewScreen.js

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  Alert, 
  StatusBar, 
  ActivityIndicator 
} from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { useComplaints } from '../context/ComplaintContext';
import CustomButton from '../components/CustomButton';
import { Ionicons } from '@expo/vector-icons';

export default function ComplaintReviewScreen({ navigation }) {
  const { t, locale } = useLanguage();
  const { draftComplaint, submitComplaint } = useComplaints();
  const [submitting, setSubmitting] = useState(false);

  // Map category code to translation
  const getCategoryName = (cat) => {
    switch (cat) {
      case 'food': return t('form.categories.food');
      case 'drug': return t('form.categories.drug');
      case 'cosmetic': return t('form.categories.cosmetic');
      case 'other': return t('form.categories.other');
      default: return cat;
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const generatedId = await submitComplaint();
      // Navigate to success screen replacing review stack to prevent back-nav
      navigation.replace('ComplaintSuccess', { complaintId: generatedId });
    } catch (e) {
      console.log('Error submitting complaint on review screen:', e);
      Alert.alert(
        t('common.error'),
        locale === 'mr' ? 'तक्रार दाखल करण्यात त्रुटी आली. कृपया पुन्हा प्रयत्न करा.' : 'Failed to submit complaint. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.container}>
        
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          
          <View style={styles.header}>
            <Text style={styles.title}>{t('review.headerTitle')}</Text>
            <Text style={styles.subtitle}>
              {locale === 'mr' ? 'कृपया दाखल करण्यापूर्वी सर्व माहितीची पडताळणी करा.' : 'Please verify all details before submitting your grievance.'}
            </Text>
          </View>

          {/* Card 1: Reporter Info */}
          <View style={styles.summaryCard}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderTitleRow}>
                <Ionicons name="person-outline" size={18} color="#0A3D62" />
                <Text style={styles.cardHeaderTitle}>{t('review.personalCard')}</Text>
              </View>
              <TouchableOpacity 
                style={styles.editBtn} 
                onPress={() => navigation.navigate('ComplaintForm')}
              >
                <Ionicons name="create-outline" size={16} color="#38ADA9" />
                <Text style={styles.editBtnText}>{t('review.editBtn')}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.cardBody}>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>{t('form.fullNameLabel')}:</Text>
                <Text style={styles.dataValue}>{draftComplaint.name}</Text>
              </View>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>{t('form.mobileLabel')}:</Text>
                <Text style={styles.dataValue}>{draftComplaint.mobile}</Text>
              </View>
            </View>
          </View>

          {/* Card 2: Grievance details */}
          <View style={styles.summaryCard}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderTitleRow}>
                <Ionicons name="document-text-outline" size={18} color="#0A3D62" />
                <Text style={styles.cardHeaderTitle}>{t('review.grievanceCard')}</Text>
              </View>
              <TouchableOpacity 
                style={styles.editBtn} 
                onPress={() => navigation.navigate('ComplaintForm')}
              >
                <Ionicons name="create-outline" size={16} color="#38ADA9" />
                <Text style={styles.editBtnText}>{t('review.editBtn')}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.cardBody}>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>{t('form.categoryLabel')}:</Text>
                <Text style={styles.categoryBadge}>{getCategoryName(draftComplaint.category)}</Text>
              </View>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>{t('form.titleLabel')}:</Text>
                <Text style={styles.dataValue}>{draftComplaint.title}</Text>
              </View>
              <View style={styles.descBlock}>
                <Text style={styles.dataLabel}>{t('form.descLabel')}:</Text>
                <Text style={styles.descText}>{draftComplaint.description}</Text>
              </View>
            </View>
          </View>

          {/* Card 3: Uploaded Evidence */}
          <View style={styles.summaryCard}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderTitleRow}>
                <Ionicons name="images-outline" size={18} color="#0A3D62" />
                <Text style={styles.cardHeaderTitle}>{t('review.evidenceCard')}</Text>
              </View>
              <TouchableOpacity 
                style={styles.editBtn} 
                onPress={() => navigation.navigate('EvidenceUpload')}
              >
                <Ionicons name="create-outline" size={16} color="#38ADA9" />
                <Text style={styles.editBtnText}>{t('review.editBtn')}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.cardBody}>
              {draftComplaint.evidence && draftComplaint.evidence.length > 0 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.evidenceRow}>
                  {draftComplaint.evidence.map((uri, index) => (
                    <Image key={index} source={{ uri }} style={styles.evidenceThumbnail} />
                  ))}
                </ScrollView>
              ) : (
                <Text style={styles.placeholderText}>{t('review.noEvidence')}</Text>
              )}
            </View>
          </View>

          {/* Card 4: Location details */}
          <View style={styles.summaryCard}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderTitleRow}>
                <Ionicons name="map-outline" size={18} color="#0A3D62" />
                <Text style={styles.cardHeaderTitle}>{t('review.locationCard')}</Text>
              </View>
              <TouchableOpacity 
                style={styles.editBtn} 
                onPress={() => navigation.navigate('LocationCapture')}
              >
                <Ionicons name="create-outline" size={16} color="#38ADA9" />
                <Text style={styles.editBtnText}>{t('review.editBtn')}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.cardBody}>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>{t('location.addressLabel')}:</Text>
                <Text style={styles.addressText}>{draftComplaint.location?.address || t('review.noLocation')}</Text>
              </View>
              {draftComplaint.location?.latitude && (
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>GPS Coordinates:</Text>
                  <Text style={styles.gpsCoordsText}>
                    {draftComplaint.location.latitude.toFixed(5)}, {draftComplaint.location.longitude.toFixed(5)}
                  </Text>
                </View>
              )}
            </View>
          </View>

        </ScrollView>

        {/* Footer Submit Button */}
        <View style={styles.footer}>
          <CustomButton
            title={t('review.submitGrievance')}
            onPress={handleSubmit}
            variant="accent" // Teal accent for grievance submission
            loading={submitting}
            icon={<Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />}
          />
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F6FA', // Page background color
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 30,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0A3D62',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#0A3D62',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1.5,
    borderColor: '#F1F5F9',
    paddingBottom: 10,
    marginBottom: 12,
  },
  cardHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0A3D62',
    marginLeft: 8,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDFA',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  editBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0D9488',
    marginLeft: 4,
  },
  cardBody: {
    width: '100%',
  },
  dataRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  dataLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    width: 110,
  },
  dataValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  categoryBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    backgroundColor: '#3C6382',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    overflow: 'hidden',
  },
  descBlock: {
    marginTop: 4,
  },
  descText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 22,
    marginTop: 6,
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  placeholderText: {
    fontSize: 13,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  evidenceRow: {
    flexDirection: 'row',
  },
  evidenceThumbnail: {
    width: 70,
    height: 70,
    borderRadius: 6,
    marginRight: 8,
    resizeMode: 'cover',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  addressText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
    lineHeight: 20,
  },
  gpsCoordsText: {
    fontSize: 12,
    color: '#38ADA9',
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
});
