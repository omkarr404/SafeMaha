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
  ActivityIndicator
} from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import * as storageService from '../services/storageService';
import { Ionicons } from '@expo/vector-icons';
import CustomButton from '../components/CustomButton';

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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical': return '#EF4444';
      case 'High': return '#F97316';
      case 'Medium': return '#EAB308';
      case 'Low': return '#22C55E';
      default: return '#64748B';
    }
  };

  const getPriorityBgColor = (priority) => {
    switch (priority) {
      case 'Critical': return '#FEF2F2';
      case 'High': return '#FFF7ED';
      case 'Medium': return '#FEFCE8';
      case 'Low': return '#F0FDF4';
      default: return '#F1F5F9';
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'Critical': return locale === 'mr' ? 'अत्यंत गंभीर' : 'Critical';
      case 'High': return locale === 'mr' ? 'उच्च' : 'High';
      case 'Medium': return locale === 'mr' ? 'मध्यम' : 'Medium';
      case 'Low': return locale === 'mr' ? 'कमी' : 'Low';
      default: return priority;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0A3D62" />
        <Text style={styles.loadingText}>
          {locale === 'mr' ? 'तपशील लोड होत आहेत...' : 'Loading complaint details...'}
        </Text>
      </View>
    );
  }

  if (!complaint) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="close-circle-outline" size={60} color="#EF4444" />
        <Text style={styles.errorText}>
          {locale === 'mr' ? 'तक्रार सापडली नाही!' : 'Complaint not found!'}
        </Text>
        <CustomButton
          title={locale === 'mr' ? 'मागे जा' : 'Go Back'}
          onPress={() => navigation.goBack()}
          variant="outline"
          style={styles.errorBtn}
        />
      </View>
    );
  }

  // Stepper timeline definition (post-complaint check so complaint object exists)
  const timelineSteps = [
    { 
      key: 'Submitted', 
      label: t('status.timeline.submitted'), 
      desc: locale === 'mr' ? 'तक्रार यशस्वीरित्या नोंदवली गेली आहे.' : 'Complaint registered successfully and Reference ID generated.' 
    },
    { 
      key: 'Assigned', 
      label: t('status.timeline.assigned'), 
      desc: complaint.assignedOfficer 
        ? (locale === 'mr' 
            ? `अन्वेषण अधिकाऱ्याकडे सोपवली: ${complaint.assignedOfficer}` 
            : `Assigned to Investigation Officer: ${complaint.assignedOfficer}`)
        : (locale === 'mr' 
            ? 'तक्रार निवारण अन्न व औषध सुरक्षा अधिकाऱ्याकडे सोपवली आहे.' 
            : 'FDA Officer has been assigned to inspect and review your grievance.') 
    },
    { 
      key: 'Investigation', 
      label: t('status.timeline.investigation'), 
      desc: locale === 'mr' ? 'पुराव्यांची तपासणी आणि घटनास्थळाची पाहणी सुरु आहे.' : 'Officer is validating product batch details and conducting spot investigations.' 
    },
    { 
      key: 'Action Taken', 
      label: t('status.timeline.actionTaken'), 
      desc: locale === 'mr' ? 'दोषींवर दंडात्मक कारवाई किंवा कायदेशीर नोटीस जारी केली आहे.' : 'Legal warnings issued, batch recalled, or compliance notices dispatched.' 
    },
    { 
      key: 'Closed', 
      label: t('status.timeline.closed'), 
      desc: locale === 'mr' ? 'तक्रारीचे निराकरण झाले असून प्रकरण बंद केले आहे.' : 'Resolution audit complete. Case closed successfully.' 
    }
  ];

  // Determine active index in timeline (initially Submitted is 0)
  const activeIndex = timelineSteps.findIndex((step) => step.key === complaint.status);
  
  const getCategoryName = (cat) => {
    switch (cat) {
      case 'food': return t('form.categories.food');
      case 'drug': return t('form.categories.drug');
      case 'cosmetic': return t('form.categories.cosmetic');
      case 'other': return t('form.categories.other');
      default: return cat;
    }
  };

  const formattedDate = new Date(complaint.createdAt).toLocaleDateString(
    locale === 'mr' ? 'mr-IN' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* Card 1: ID details */}
        <View style={styles.topInfoCard}>
          <Text style={styles.idLabel}>{t('status.idLabel')}</Text>
          <Text style={styles.complaintIdText}>{complaint.id}</Text>
          
          <View style={[styles.priorityBadge, { backgroundColor: getPriorityBgColor(complaint.priority) }]}>
            <Ionicons name="alert-circle-outline" size={14} color={getPriorityColor(complaint.priority)} />
            <Text style={[styles.priorityText, { color: getPriorityColor(complaint.priority) }]}>
              {locale === 'mr' ? 'प्राधान्य:' : 'Priority:'} {getPriorityLabel(complaint.priority)}
            </Text>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={14} color="#64748B" />
              <Text style={styles.metaText}>{formattedDate}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="pricetag-outline" size={14} color="#64748B" />
              <Text style={styles.metaText}>{getCategoryName(complaint.category)}</Text>
            </View>
          </View>
        </View>

        {/* Stepper Timeline Card */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>{t('status.statusLabel')}</Text>
          
          <View style={styles.timelineContainer}>
            {timelineSteps.map((step, index) => {
              const isCompleted = index <= activeIndex;
              const isActive = index === activeIndex;
              const isLast = index === timelineSteps.length - 1;

              return (
                <View key={step.key} style={styles.timelineRow}>
                  {/* Left Column: Circle & Line */}
                  <View style={styles.leftColumn}>
                    <View style={[
                      styles.stepCircle,
                      isCompleted ? styles.circleCompleted : styles.circlePending,
                      isActive && styles.circleActive
                    ]}>
                      {isCompleted ? (
                        <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                      ) : (
                        <View style={styles.pendingDot} />
                      )}
                    </View>
                    {!isLast && (
                      <View style={[
                        styles.connectorLine,
                        index < activeIndex ? styles.lineCompleted : styles.linePending
                      ]} />
                    )}
                  </View>

                  {/* Right Column: Status text details */}
                  <View style={styles.rightColumn}>
                    <Text style={[
                      styles.stepLabel,
                      isCompleted ? styles.labelCompleted : styles.labelPending,
                      isActive && styles.labelActive
                    ]}>
                      {step.label}
                    </Text>
                    <Text style={styles.stepDesc}>{step.desc}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Details Card */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>{locale === 'mr' ? 'तक्रारीचा तपशील' : 'Grievance Description'}</Text>
          <Text style={styles.complaintTitleText}>{complaint.title}</Text>
          <Text style={styles.complaintDescText}>{complaint.description}</Text>

          {/* Evidence Thumbnails */}
          {complaint.evidence && complaint.evidence.length > 0 && (
            <View style={styles.evidenceContainer}>
              <Text style={styles.subLabel}>{t('status.evidenceLabel')}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.evidenceRow}>
                {complaint.evidence.map((uri, index) => (
                  <Image key={index} source={{ uri }} style={styles.evidenceThumbnail} />
                ))}
              </ScrollView>
            </View>
          )}

          {/* Location details */}
          {complaint.location && (
            <View style={styles.locationContainer}>
              <Text style={styles.subLabel}>{t('status.locationLabel')}</Text>
              <View style={styles.locationContent}>
                <Ionicons name="pin" size={18} color="#EF4444" style={styles.pinIcon} />
                <Text style={styles.addressText}>{complaint.location.address}</Text>
              </View>
              {complaint.location.latitude && (
                <Text style={styles.gpsCoordsText}>
                  GPS: {complaint.location.latitude.toFixed(5)}, {complaint.location.longitude.toFixed(5)}
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Contact Strip */}
        <View style={styles.contactCard}>
          <Ionicons name="information-circle" size={22} color="#0A3D62" />
          <Text style={styles.contactText}>
            {locale === 'mr'
              ? 'पुढील चौकशीसाठी, कृपया आमच्या हेल्पलाईनशी किंवा अन्न व औषध प्रशासनाशी थेट संपर्क साधा.'
              : 'For further queries, please reach out to the Maharashtra FDA helpdesk.'}
          </Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 12,
    color: '#0A3D62',
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 16,
    marginBottom: 24,
  },
  errorBtn: {
    width: 150,
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 30,
  },
  topInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 2,
    alignItems: 'center',
  },
  idLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  complaintIdText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0A3D62',
    marginBottom: 14,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    borderTopWidth: 1.5,
    borderColor: '#F1F5F9',
    paddingTop: 12,
    width: '100%',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  metaText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginLeft: 6,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0A3D62',
    marginBottom: 16,
    borderBottomWidth: 1.5,
    borderColor: '#F1F5F9',
    paddingBottom: 8,
  },
  timelineContainer: {
    paddingLeft: 6,
  },
  timelineRow: {
    flexDirection: 'row',
    minHeight: 80,
  },
  leftColumn: {
    alignItems: 'center',
    marginRight: 16,
  },
  stepCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  circleCompleted: {
    backgroundColor: '#38ADA9', // Completed step Teal
  },
  circlePending: {
    backgroundColor: '#F1F5F9',
    borderWidth: 2,
    borderColor: '#CBD5E1',
  },
  circleActive: {
    borderColor: '#0A3D62',
    borderWidth: 2,
    backgroundColor: '#0A3D62',
    shadowColor: '#0A3D62',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  pendingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
  },
  connectorLine: {
    width: 2,
    flex: 1,
    marginVertical: 4,
  },
  lineCompleted: {
    backgroundColor: '#38ADA9',
  },
  linePending: {
    backgroundColor: '#E2E8F0',
  },
  rightColumn: {
    flex: 1,
    paddingBottom: 16,
  },
  stepLabel: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  labelCompleted: {
    color: '#38ADA9',
  },
  labelPending: {
    color: '#64748B',
  },
  labelActive: {
    color: '#0A3D62',
    fontSize: 16,
  },
  stepDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
  },
  complaintTitleText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  complaintDescText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
    marginBottom: 20,
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  subLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  evidenceContainer: {
    marginBottom: 20,
  },
  evidenceRow: {
    flexDirection: 'row',
  },
  evidenceThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
    resizeMode: 'cover',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  locationContainer: {
    marginTop: 4,
  },
  locationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  pinIcon: {
    marginRight: 6,
    marginTop: 1,
  },
  addressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    flex: 1,
    lineHeight: 20,
  },
  gpsCoordsText: {
    fontSize: 12,
    color: '#38ADA9',
    fontWeight: '600',
    marginLeft: 24,
  },
  contactCard: {
    flexDirection: 'row',
    backgroundColor: '#EBF3F9',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D0E2EF',
  },
  contactText: {
    flex: 1,
    fontSize: 13,
    color: '#0A3D62',
    marginLeft: 10,
    fontWeight: '600',
    lineHeight: 18,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 14,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
  },
});
