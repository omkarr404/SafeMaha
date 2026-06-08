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

export default function EvidenceUploadScreen({ navigation }) {
  const { t, locale } = useLanguage();
  const { draftComplaint, updateDraft } = useComplaints();
  
  // Local state for image list synced with draft context
  const [evidence, setEvidence] = useState(draftComplaint.evidence || []);

  useEffect(() => {
    setEvidence(draftComplaint.evidence || []);
  }, [draftComplaint.evidence]);

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        t('common.error'),
        locale === 'mr' ? 'कॅमेरा वापरण्याची परवानगी नाकारली आहे. कृपया ती सेटिंग्जमधून सुरु करा.' : 'Camera permissions are required to take photos.'
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
        locale === 'mr' ? 'गॅलरी वापरण्याची परवानगी नाकारली आहे. कृपया ती सेटिंग्जमधून सुरु करा.' : 'Media library permissions are required to select photos.'
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
        const updated = [...evidence, ...selectedUris].slice(0, 5); // Hard cap to 5 images
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
    // Requirements: For Week 2 production validation, let's make sure they upload at least one image or allow continuing. 
    // Usually food/drug safety complaints require evidence, but to be user-friendly, let's suggest it.
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
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.container}>
        
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* Header instructions */}
          <View style={styles.header}>
            <Text style={styles.title}>{t('evidence.headerTitle')}</Text>
            <Text style={styles.guidelines}>{t('evidence.guidelines')}</Text>
            <Text style={styles.warning}>{t('evidence.warning')}</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.uploadOptions}>
            <TouchableOpacity 
              style={styles.optionButton} 
              activeOpacity={0.8}
              onPress={handleTakePhoto}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#38ADA915' }]}>
                <Ionicons name="camera" size={32} color="#38ADA9" />
              </View>
              <Text style={styles.optionText}>{t('evidence.takePhoto')}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.optionButton} 
              activeOpacity={0.85}
              onPress={handleChooseGallery}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#0A3D6215' }]}>
                <Ionicons name="images" size={32} color="#0A3D62" />
              </View>
              <Text style={styles.optionText}>{t('evidence.chooseGallery')}</Text>
            </TouchableOpacity>
          </View>

          {/* Photos list count */}
          <View style={styles.countContainer}>
            <Text style={styles.countTitle}>{t('evidence.photosSelected')}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{evidence.length} / 5</Text>
            </View>
          </View>

          {/* Thumbnails preview list */}
          {evidence.length > 0 ? (
            <View style={styles.previewGrid}>
              {evidence.map((uri, index) => (
                <View key={index} style={styles.thumbnailWrapper}>
                  <Image source={{ uri }} style={styles.thumbnail} />
                  <TouchableOpacity 
                    style={styles.removeBtn} 
                    activeOpacity={0.8}
                    onPress={() => handleRemovePhoto(index)}
                  >
                    <Ionicons name="close" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.placeholderContainer}>
              <Ionicons name="cloud-upload" size={48} color="#94A3B8" />
              <Text style={styles.placeholderText}>
                {locale === 'mr' ? 'अपलोड केलेले फोटो येथे दिसतील.' : 'No photos selected yet.'}
              </Text>
            </View>
          )}

        </ScrollView>

        {/* Continue Footer */}
        <View style={styles.footer}>
          <CustomButton 
            title={t('evidence.nextBtn')}
            onPress={handleNext}
            variant="primary"
            icon={<Ionicons name="map-outline" size={20} color="#FFFFFF" />}
          />
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  scrollContainer: {
    padding: 24,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0A3D62',
    marginBottom: 8,
  },
  guidelines: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 22,
    marginBottom: 8,
  },
  warning: {
    fontSize: 12,
    color: '#E58E26',
    fontWeight: '600',
  },
  uploadOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  optionButton: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0A3D62',
    textAlign: 'center',
  },
  countContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1.5,
    borderColor: '#F1F5F9',
    paddingBottom: 10,
  },
  countTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0A3D62',
  },
  badge: {
    backgroundColor: '#0A3D62',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  previewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  thumbnailWrapper: {
    position: 'relative',
    margin: 6,
    width: '30%', // Grid spacing for 3 items per row
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(239, 68, 68, 0.85)', // Red delete button with transparency
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  placeholderContainer: {
    height: 150,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  placeholderText: {
    marginTop: 10,
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '500',
    textAlign: 'center',
  },
  footer: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
});
