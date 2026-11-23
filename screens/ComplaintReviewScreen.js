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
  StatusBar 
} from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { useComplaints } from '../context/ComplaintContext';
import CustomButton from '../components/CustomButton';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows } from '../constants/theme';

export default function ComplaintReviewScreen({ navigation }) {
  const { t, locale } = useLanguage();
  const { draftComplaint, submitComplaint } = useComplaints();
  const [submitting, setSubmitting] = useState(false);
  const [declared, setDeclared] = useState(true);

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
    if (!declared) {
      Alert.alert(
        t('common.error'),
        locale === 'mr' ? 'कृपया घोषणापत्रास सहमती दर्शवा.' : 'Please agree to the truthfulness declaration before submitting.'
      );
      return;
    }

    setSubmitting(true);
    try {
      const generatedId = await submitComplaint();
      navigation.replace('ComplaintSuccess', { complaintId: generatedId });
    } catch (e) {
      console.log('Error submitting complaint on review screen:', e);
      Alert.alert(
        t('common.error'),
        locale === 'mr' ? 'तक्रार दाखल करण्यात त्रुटी आली. कृपया पुन्हा प्रयत्न करा.' : 'Failed to submit complaint. Please check connection and try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      {/* Wizard Progress Bar */}
      <View style={styles.progressBarWrap}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressStepText}>STEP 4 OF 4</Text>
          <Text style={styles.progressStepName}>
            {locale === 'mr' ? 'पडताळणी व सादर करणे' : 'Review & Submission'}
          </Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: '100%' }]} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* Verification Intro Header */}
        <View style={styles.introHeader}>
          <Text style={styles.introTitle}>{t('review.headerTitle')}</Text>
          <Text style={styles.introSub}>
            {locale === 'mr' 
              ? 'कृपया तक्रार अंतिमरीत्या दाखल करण्यापूर्वी सर्व तपशील तपासून घ्या.' 
              : 'Carefully verify all statements before transmitting to Maharashtra FDA.'}
          </Text>
        </View>

        {/* Card 1: Complainant Details */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Ionicons name="person-circle-outline" size={18} color={colors.primary} />
              <Text style={styles.cardHeaderTitle}>{t('review.personalCard')}</Text>
            </View>
            <TouchableOpacity 
              style={styles.editBtn} 
              onPress={() => navigation.navigate('ComplaintForm')}
            >
              <Ionicons name="create-outline" size={14} color={colors.secondary} />
              <Text style={styles.editBtnText}>{t('review.editBtn')}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.cardBody}>
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>{t('form.fullNameLabel')}:</Text>
              <Text style={styles.dataValue}>{draftComplaint.name || 'Anonymous'}</Text>
            </View>
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>{t('form.mobileLabel')}:</Text>
              <Text style={styles.dataValue}>+91 {draftComplaint.mobile}</Text>
            </View>
          </View>
        </View>

        {/* Card 2: Incident Grievance Details */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Ionicons name="document-text-outline" size={18} color={colors.primary} />
              <Text style={styles.cardHeaderTitle}>{t('review.grievanceCard')}</Text>
            </View>
            <TouchableOpacity 
              style={styles.editBtn} 
              onPress={() => navigation.navigate('ComplaintForm')}
            >
              <Ionicons name="create-outline" size={14} color={colors.secondary} />
              <Text style={styles.editBtnText}>{t('review.editBtn')}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.cardBody}>
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>{t('form.categoryLabel')}:</Text>
              <View style={styles.catBadge}>
                <Text style={styles.catBadgeText}>{getCategoryName(draftComplaint.category)}</Text>
              </View>
            </View>
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>{t('form.titleLabel')}:</Text>
              <Text style={[styles.dataValue, { fontWeight: '700', color: colors.primary }]}>
                {draftComplaint.title}
              </Text>
            </View>
            <View style={styles.descBlock}>
              <Text style={styles.dataLabel}>{t('form.descLabel')}:</Text>
              <View style={styles.descBox}>
                <Text style={styles.descText}>{draftComplaint.description}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Card 3: Location Details */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Ionicons name="location-outline" size={18} color={colors.primary} />
              <Text style={styles.cardHeaderTitle}>{t('location.headerTitle')}</Text>
            </View>
            <TouchableOpacity 
              style={styles.editBtn} 
              onPress={() => navigation.navigate('LocationCapture')}
            >
              <Ionicons name="create-outline" size={14} color={colors.secondary} />
              <Text style={styles.editBtnText}>{t('review.editBtn')}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.cardBody}>
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>District / Taluka:</Text>
              <Text style={styles.dataValue}>
                {draftComplaint.district_name || 'Maharashtra'} 
                {draftComplaint.taluka_name ? ` • ${draftComplaint.taluka_name}` : ''}
              </Text>
            </View>
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Address:</Text>
              <Text style={styles.dataValue}>
                {draftComplaint.location?.address || 'Provided in complaint'}
              </Text>
            </View>
            {draftComplaint.location?.latitude && (
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>GPS Coordinates:</Text>
                <Text style={[styles.dataValue, { fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', fontSize: 11 }]}>
                  {Number(draftComplaint.location.latitude).toFixed(5)}, {Number(draftComplaint.location.longitude).toFixed(5)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Card 4: Uploaded Evidence Preview */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Ionicons name="images-outline" size={18} color={colors.primary} />
              <Text style={styles.cardHeaderTitle}>{t('review.evidenceCard')}</Text>
            </View>
            <TouchableOpacity 
              style={styles.editBtn} 
              onPress={() => navigation.navigate('EvidenceUpload')}
            >
              <Ionicons name="create-outline" size={14} color={colors.secondary} />
              <Text style={styles.editBtnText}>{t('review.editBtn')}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.cardBody}>
            {draftComplaint.evidence && draftComplaint.evidence.length > 0 ? (
              <View style={styles.evidenceThumbRow}>
                {draftComplaint.evidence.map((uri, idx) => (
                  <Image key={idx} source={{ uri }} style={styles.thumbImage} />
                ))}
              </View>
            ) : (
              <Text style={styles.noEvidenceText}>No photographic attachments uploaded.</Text>
            )}
          </View>
        </View>

        {/* Legal Declaration Checkbox */}
        <TouchableOpacity 
          style={styles.declarationWrap}
          onPress={() => setDeclared(!declared)}
          activeOpacity={0.8}
        >
          <View style={[styles.checkbox, declared && styles.checkboxActive]}>
            {declared && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
          </View>
          <Text style={styles.declarationText}>
            {locale === 'mr' 
              ? 'मी याद्वारे घोषित करतो/करते की वरील दिलेली माहिती माझ्या सर्वोत्तम माहितीनुसार खरी व बिनचूक आहे.'
              : 'I solemnly declare that all details provided herein are accurate and submitted in good faith for public health action.'}
          </Text>
        </TouchableOpacity>

        {/* Submit Grievance Action */}
        <View style={styles.btnWrap}>
          <CustomButton
            title={locale === 'mr' ? 'एफडीएकडे तक्रार दाखल करा' : 'Submit Grievance to FDA'}
            onPress={handleSubmit}
            variant="primary"
            loading={submitting}
            icon={<Ionicons name="checkmark-done" size={18} color="#FFFFFF" />}
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
  progressBarWrap: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressStepText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.secondary,
    letterSpacing: 0.8,
  },
  progressStepName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  progressTrack: {
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.secondary,
    borderRadius: 2,
  },
  scrollContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: spacing.md,
  },
  introHeader: {
    marginBottom: 2,
  },
  introTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  introSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  card: {
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
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 10,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardHeaderTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.text,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.secondary,
  },
  cardBody: {
    gap: 8,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dataLabel: {
    fontSize: 12.5,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  dataValue: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '600',
    maxWidth: '65%',
    textAlign: 'right',
  },
  catBadge: {
    backgroundColor: colors.infoBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  catBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.secondary,
  },
  descBlock: {
    marginTop: 4,
  },
  descBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 4,
  },
  descText: {
    fontSize: 12.5,
    color: colors.text,
    lineHeight: 18,
  },
  evidenceThumbRow: {
    flexDirection: 'row',
    gap: 8,
  },
  thumbImage: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  noEvidenceText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  declarationWrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingHorizontal: spacing.xs,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxActive: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  declarationText: {
    flex: 1,
    fontSize: 11.5,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  btnWrap: {
    marginTop: spacing.sm,
  },
});
