// FILE NAME: d:\Omkar\Water\FDA\screens\ComplaintStatusScreen.js

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  Image, 
  StatusBar, 
  ActivityIndicator, 
  TouchableOpacity 
} from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import * as storageService from '../services/storageService';
import { Ionicons } from '@expo/vector-icons';
import CustomButton from '../components/CustomButton';
import { colors, spacing, borderRadius, shadows } from '../constants/theme';

export default function ComplaintStatusScreen({ route, navigation }) {
  const { t, locale } = useLanguage();
  const { complaintId } = route.params || { complaintId: null };

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadDetails() {
      if (!complaintId) return;
      setLoading(true);
      try {
        const data = await storageService.getComplaint(complaintId);
        if (active) {
          setComplaint(data);
        }
      } catch (e) {
        console.log('Error loading status details:', e);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadDetails();
    return () => { active = false; };
  }, [complaintId]);

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'Critical':
        return { color: colors.critical, bg: colors.criticalBg, label: locale === 'mr' ? 'अत्यंत गंभीर' : 'Critical' };
      case 'High':
        return { color: colors.warning, bg: colors.warningBg, label: locale === 'mr' ? 'उच्च' : 'High' };
      case 'Medium':
        return { color: colors.info, bg: colors.infoBg, label: locale === 'mr' ? 'मध्यम' : 'Medium' };
      case 'Low':
      default:
        return { color: colors.success, bg: colors.successBg, label: locale === 'mr' ? 'कमी' : 'Low' };
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
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return String(dateVal);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>
          {locale === 'mr' ? 'तक्रार तपशील लोड होत आहेत...' : 'Retrieving official investigation records...'}
        </Text>
      </View>
    );
  }

  if (!complaint) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="close-circle-outline" size={56} color={colors.critical} />
        <Text style={styles.errorText}>
          {locale === 'mr' ? 'तक्रार सापडली नाही!' : 'Grievance Record Unavailable'}
        </Text>
        <Text style={styles.errorSub}>
          {locale === 'mr' ? 'कृपया संदर्भ क्रमांक तपासून पुन्हा प्रयत्न करा.' : 'The requested Reference ID does not exist in the active registry.'}
        </Text>
        <CustomButton
          title={locale === 'mr' ? 'मागे जा' : 'Go Back'}
          onPress={() => navigation.goBack()}
          variant="outline"
          style={{ width: 160, marginTop: 16 }}
        />
      </View>
    );
  }

  const timelineSteps = [
    { 
      key: 'Submitted', 
      label: t('status.timeline.submitted'), 
      desc: locale === 'mr' ? 'तक्रार प्रणालीमध्ये नोंदवली गेली आहे.' : 'Grievance registered and reference number generated.' 
    },
    { 
      key: 'Assigned', 
      label: t('status.timeline.assigned'), 
      desc: complaint.assignedOfficer 
        ? (locale === 'mr' 
            ? `अन्वेषण अधिकाऱ्याकडे सोपवली: ${complaint.assignedOfficer}` 
            : `Assigned to Designated Inspector: ${complaint.assignedOfficer}`)
        : (locale === 'mr' ? 'संबंधित अन्न व औषध निरीक्षकाची नियुक्ती प्रक्रिया सुरू.' : 'Inspector appointment in progress under regional zone.')
    },
    { 
      key: 'Investigation', 
      label: t('status.timeline.investigation'), 
      desc: locale === 'mr' ? 'घटनास्थळाची प्रत्यक्ष तपासणी, पुरावे व नमुने संकलन सुरू.' : 'On-site raid, forensic analysis, and batch testing under process.' 
    },
    { 
      key: 'Action Taken', 
      label: t('status.timeline.actionTaken'), 
      desc: locale === 'mr' ? 'दोषींवर कायदेशीर नोटीस, माल जप्ती अथवा दंड प्रक्रिया सुरू.' : 'Enforcement action: notice issued, seizures, or recall notices.' 
    },
    { 
      key: 'Closed', 
      label: t('status.timeline.closed'), 
      desc: locale === 'mr' ? 'अंतिम अहवाल तयार करून तक्रार निकाली काढण्यात आली.' : 'Resolution report archived and citizen notified.' 
    }
  ];

  const activeIndex = timelineSteps.findIndex((step) => step.key === complaint.status);
  const priorityBadge = getPriorityBadge(complaint.priority);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* Case Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.headerTopRow}>
            <View>
              <Text style={styles.caseIdText}>{complaint.id}</Text>
              <Text style={styles.caseDateText}>Lodged on {formattedDate(complaint.createdAt || complaint.created_at)}</Text>
            </View>
            <View style={[styles.priorityPill, { backgroundColor: priorityBadge.bg }]}>
              <Text style={[styles.priorityPillText, { color: priorityBadge.color }]}>
                {priorityBadge.label} Priority
              </Text>
            </View>
          </View>
          
          <Text style={styles.caseTitleText}>{complaint.title}</Text>
        </View>

        {/* Assigned Officer Card */}
        <View style={styles.officerCard}>
          <View style={styles.officerIconWrap}>
            <Ionicons name="shield-checkmark" size={24} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.officerLabel}>
              {locale === 'mr' ? 'अन्वेषण अधिकारी' : 'Designated FDA Inspector'}
            </Text>
            <Text style={styles.officerName}>
              {complaint.assignedOfficer || (locale === 'mr' ? 'नियुक्ती प्रक्रियेत आहे...' : 'Appointment in Progress...')}
            </Text>
            <Text style={styles.officerSub}>
              {complaint.district_name || 'Maharashtra State Jurisdiction'}
            </Text>
          </View>
        </View>

        {/* 5-Stage Stepper Timeline */}
        <View style={styles.timelineCard}>
          <Text style={styles.timelineCardTitle}>
            {locale === 'mr' ? 'तपास प्रगती स्थिती' : 'Investigation Progression'}
          </Text>

          <View style={styles.stepperContainer}>
            {timelineSteps.map((step, index) => {
              const isCompleted = index < activeIndex;
              const isActive = index === activeIndex;

              return (
                <View key={step.key} style={styles.stepItem}>
                  <View style={styles.stepLeftColumn}>
                    <View style={[
                      styles.stepDot,
                      isCompleted && styles.stepDotCompleted,
                      isActive && styles.stepDotActive,
                    ]}>
                      {isCompleted ? (
                        <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                      ) : (
                        <Text style={[styles.stepDotNumber, isActive && styles.stepDotNumberActive]}>
                          {index + 1}
                        </Text>
                      )}
                    </View>
                    {index < timelineSteps.length - 1 && (
                      <View style={[
                        styles.stepLine,
                        isCompleted && styles.stepLineCompleted,
                      ]} />
                    )}
                  </View>

                  <View style={styles.stepContent}>
                    <Text style={[styles.stepTitle, isActive && styles.stepTitleActive]}>
                      {step.label}
                    </Text>
                    <Text style={styles.stepDesc}>{step.desc}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Official Officer Inspection Notes */}
        {complaint.notes && complaint.notes.length > 0 && (
          <View style={styles.notesCard}>
            <Text style={styles.timelineCardTitle}>
              {locale === 'mr' ? 'अन्वेषण नोंदी व टिप्पणी' : 'Official Inspection Remarks'}
            </Text>

            <View style={styles.notesList}>
              {complaint.notes.map((note) => (
                <View key={note.id} style={styles.noteItem}>
                  <View style={styles.noteHeader}>
                    <Text style={styles.noteAuthor}>{note.author}</Text>
                    <Text style={styles.noteTime}>{formattedDate(note.timestamp)}</Text>
                  </View>
                  <Text style={styles.noteComment}>{note.comment}</Text>
                </View>
              ))}
            </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  loadingText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  errorText: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.md,
  },
  errorSub: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  headerCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  caseIdText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
  },
  caseDateText: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  priorityPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  priorityPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  caseTitleText: {
    fontSize: 14.5,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.sm,
  },
  officerCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    ...shadows.sm,
  },
  officerIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.infoBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  officerLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  officerName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginTop: 1,
  },
  officerSub: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  timelineCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  timelineCardTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  stepperContainer: {
    paddingLeft: 4,
  },
  stepItem: {
    flexDirection: 'row',
    gap: 14,
  },
  stepLeftColumn: {
    alignItems: 'center',
    width: 26,
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  stepDotCompleted: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  stepDotActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  stepDotNumber: {
    fontSize: 10.5,
    fontWeight: '700',
    color: colors.textMuted,
  },
  stepDotNumberActive: {
    color: '#FFFFFF',
  },
  stepLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E2E8F0',
    minHeight: 28,
  },
  stepLineCompleted: {
    backgroundColor: colors.success,
  },
  stepContent: {
    flex: 1,
    paddingBottom: spacing.lg,
  },
  stepTitle: {
    fontSize: 13.5,
    fontWeight: '600',
    color: colors.text,
  },
  stepTitleActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  stepDesc: {
    fontSize: 11.5,
    color: colors.textSecondary,
    lineHeight: 16,
    marginTop: 2,
  },
  notesCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  notesList: {
    gap: 10,
  },
  noteItem: {
    backgroundColor: '#F8FAFC',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  noteAuthor: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  noteTime: {
    fontSize: 10.5,
    color: colors.textMuted,
  },
  noteComment: {
    fontSize: 12,
    color: colors.text,
    lineHeight: 17,
  },
});
