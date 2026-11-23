// FILE NAME: d:\Omkar\Water\FDA\screens\EvidenceUploadScreen.js

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Alert, 
  StatusBar 
} from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { useComplaints } from '../context/ComplaintContext';
import CustomButton from '../components/CustomButton';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing, borderRadius, shadows } from '../constants/theme';

export default function EvidenceUploadScreen({ navigation }) {
  const { t, locale } = useLanguage();
  const { draftComplaint, updateDraft } = useComplaints();
  
  const [evidence, setEvidence] = useState(draftComplaint.evidence || []);

  useEffect(() => {
    setEvidence(draftComplaint.evidence || []);
  }, [draftComplaint.evidence]);

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        t('common.error'),
        locale === 'mr' 
          ? 'कॅमेरा वापरण्याची परवानगी नाकारली आहे. कृपया ती सेटिंग्जमधून सुरु करा.' 
          : 'Camera permissions are required to capture evidence photos.'
      );
      return false;
    }
    return true;
  };

  const requestGalleryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        t('common.error'),
        locale === 'mr' 
          ? 'गॅलरी वापरण्याची परवानगी नाकारली आहे. कृपया ती सेटिंग्जमधून सुरु करा.' 
          : 'Media gallery permissions are required to select photos.'
      );
      return false;
    }
    return true;
  };

  const handleTakePhoto = async () => {
    if (evidence.length >= 5) {
      Alert.alert(t('common.error'), t('evidence.warning'));
      return;
    }

    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.75,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newUri = result.assets[0].uri;
        const updated = [...evidence, newUri];
        setEvidence(updated);
        updateDraft({ evidence: updated });
      }
    } catch (e) {
      console.log('Error opening camera:', e);
      Alert.alert(t('common.error'), locale === 'mr' ? 'कॅमेरा उघडण्यात त्रुटी आली.' : 'Failed to launch camera.');
    }
  };

  const handleChooseGallery = async () => {
    if (evidence.length >= 5) {
      Alert.alert(t('common.error'), t('evidence.warning'));
      return;
    }

    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        selectionLimit: 5 - evidence.length,
        quality: 0.75,
      });

      if (!result.canceled && result.assets) {
        const selectedUris = result.assets.map((asset) => asset.uri);
        const updated = [...evidence, ...selectedUris].slice(0, 5);
        setEvidence(updated);
        updateDraft({ evidence: updated });
      }
    } catch (e) {
      console.log('Error opening gallery:', e);
      Alert.alert(t('common.error'), locale === 'mr' ? 'गॅलरी उघडण्यात त्रुटी आली.' : 'Failed to launch image library.');
    }
  };

  const handleRemovePhoto = (index) => {
    const updated = evidence.filter((_, i) => i !== index);
    setEvidence(updated);
    updateDraft({ evidence: updated });
  };

  const handleNext = () => {
    if (evidence.length === 0) {
      Alert.alert(
        locale === 'mr' ? 'पुरावा आवश्यक' : 'Evidence Required',
        t('evidence.noImages'),
        [{ text: t('common.ok'), style: 'default' }]
      );
      return;
    }
    navigation.navigate('LocationCapture');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      {/* Wizard Progress Bar */}
      <View style={styles.progressBarWrap}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressStepText}>STEP 2 OF 4</Text>
          <Text style={styles.progressStepName}>
            {locale === 'mr' ? 'फोटो पुरावा' : 'Photographic Proof'}
          </Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: '50%' }]} />
        </View>
      </View>

      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          
          {/* Instructions Notice Card */}
          <View style={styles.guidanceCard}>
            <Ionicons name="information-circle-outline" size={20} color={colors.secondary} style={{ marginRight: 8, marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.guidanceTitle}>
                {locale === 'mr' ? 'कायदेशीर पुरावा मार्गदर्शक' : 'Evidence Submission Guidelines'}
              </Text>
              <Text style={styles.guidanceText}>
                {locale === 'mr' 
                  ? 'उत्पादनाचे वेष्टन (लेबल), उत्पादन/कालबाह्यता तारीख, बॅच क्रमांक, व खरेदी पावतीचे स्पष्ट फोटो जोडा (जास्तीत जास्त ५ फोटो).'
                  : 'Attach clear photos of product labels, batch number, expiry date, cash receipt, or packaging defect (up to 5 photos).'}
              </Text>
            </View>
          </View>

          {/* Action Trigger Buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity 
              style={styles.mediaButton} 
              onPress={handleTakePhoto}
              activeOpacity={0.8}
            >
              <View style={styles.mediaIconWrap}>
                <Ionicons name="camera" size={24} color={colors.primary} />
              </View>
              <Text style={styles.mediaButtonTitle}>{t('evidence.takePhoto')}</Text>
              <Text style={styles.mediaButtonSub}>{locale === 'mr' ? 'कॅमेरा उघडा' : 'Use camera'}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.mediaButton} 
              onPress={handleChooseGallery}
              activeOpacity={0.8}
            >
              <View style={[styles.mediaIconWrap, { backgroundColor: colors.infoBg }]}>
                <Ionicons name="images" size={24} color={colors.secondary} />
              </View>
              <Text style={styles.mediaButtonTitle}>{t('evidence.chooseGallery')}</Text>
              <Text style={styles.mediaButtonSub}>{locale === 'mr' ? 'गॅलरीतून निवडा' : 'Browse gallery'}</Text>
            </TouchableOpacity>
          </View>

          {/* Uploaded Evidence Gallery */}
          <View style={styles.galleryCard}>
            <View style={styles.galleryHeader}>
              <Text style={styles.galleryTitle}>
                {locale === 'mr' ? 'जोडलेले फोटो' : 'Attached Evidence'}
              </Text>
              <View style={styles.counterBadge}>
                <Text style={styles.counterText}>{evidence.length} / 5</Text>
              </View>
            </View>

            {evidence.length > 0 ? (
              <View style={styles.photosGrid}>
                {evidence.map((uri, index) => (
                  <View key={index} style={styles.photoWrapper}>
                    <Image source={{ uri }} style={styles.thumbnail} />
                    <TouchableOpacity
                      style={styles.deleteBadge}
                      onPress={() => handleRemovePhoto(index)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="close" size={14} color="#FFFFFF" />
                    </TouchableOpacity>
                    <View style={styles.photoIndexBadge}>
                      <Text style={styles.photoIndexText}>#{index + 1}</Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyGallery}>
                <Ionicons name="cloud-upload-outline" size={40} color={colors.textMuted} />
                <Text style={styles.emptyText}>{t('evidence.noImages')}</Text>
                <Text style={styles.emptySub}>
                  {locale === 'mr' ? 'किमान १ फोटो पुरावा जोडणे आवश्यक आहे' : 'At least one photo is required to substantiate complaint'}
                </Text>
              </View>
            )}
          </View>

          {/* Navigation Button */}
          <View style={styles.btnWrap}>
            <CustomButton
              title={locale === 'mr' ? 'घटनास्थळ निश्चित करा (पुढील पायरी)' : 'Proceed to Incident Location →'}
              onPress={handleNext}
              variant="primary"
            />
          </View>
        </ScrollView>
      </View>
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
  guidanceCard: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  guidanceTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 2,
  },
  guidanceText: {
    fontSize: 11.5,
    color: colors.text,
    lineHeight: 16,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  mediaButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  mediaIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  mediaButtonTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  mediaButtonSub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  galleryCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  galleryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  galleryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  counterBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  counterText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  photoWrapper: {
    width: 90,
    height: 90,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: colors.border,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  deleteBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.critical,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoIndexBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: 'rgba(20, 43, 74, 0.75)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
  },
  photoIndexText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  emptyGallery: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginTop: 8,
  },
  emptySub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  btnWrap: {
    marginTop: spacing.xs,
  },
});
