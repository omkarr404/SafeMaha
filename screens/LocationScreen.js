// FILE NAME: d:\Omkar\Water\FDA\screens\LocationScreen.js

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TextInput, 
  ActivityIndicator, 
  Alert, 
  StatusBar, 
  Modal, 
  FlatList, 
  TouchableOpacity 
} from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { useComplaints } from '../context/ComplaintContext';
import CustomButton from '../components/CustomButton';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { getDistricts, getTalukas } from '../services/complaintService';
import { colors, spacing, borderRadius, shadows } from '../constants/theme';

export default function LocationScreen({ navigation }) {
  const { t, locale } = useLanguage();
  const { draftComplaint, updateDraft } = useComplaints();

  // Local state for address and coordinates
  const [manualAddress, setManualAddress] = useState('');
  const [coords, setCoords] = useState(null);
  const [loadingGps, setLoadingGps] = useState(false);
  const [gpsCaptured, setGpsCaptured] = useState(false);

  const [districts, setDistricts] = useState([]);
  const [talukas, setTalukas] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedTaluka, setSelectedTaluka] = useState(null);
  const [showDistrictModal, setShowDistrictModal] = useState(false);
  const [showTalukaModal, setShowTalukaModal] = useState(false);
  const [districtSearch, setDistrictSearch] = useState('');
  const [talukaSearch, setTalukaSearch] = useState('');

  useEffect(() => {
    async function initLocationData() {
      try {
        const list = await getDistricts();
        setDistricts(list);

        if (draftComplaint.location) {
          setManualAddress(draftComplaint.location.address || '');
          if (draftComplaint.location.latitude && draftComplaint.location.longitude) {
            setCoords({
              latitude: draftComplaint.location.latitude,
              longitude: draftComplaint.location.longitude,
            });
            setGpsCaptured(true);
          }
        }

        if (draftComplaint.district_id) {
          const matchedD = list.find((d) => d.id === draftComplaint.district_id);
          if (matchedD) {
            setSelectedDistrict(matchedD);
            const tList = await getTalukas(matchedD.id);
            setTalukas(tList);
            if (draftComplaint.taluka_id) {
              const matchedT = tList.find((t) => t.id === draftComplaint.taluka_id);
              if (matchedT) {
                setSelectedTaluka(matchedT);
              }
            }
          }
        }
      } catch (err) {
        console.log('Error initializing Location Screen:', err);
      }
    }
    initLocationData();
  }, []);

  const handleSelectDistrict = async (district) => {
    setSelectedDistrict(district);
    setSelectedTaluka(null);
    setShowDistrictModal(false);
    setDistrictSearch('');
    try {
      const list = await getTalukas(district.id);
      setTalukas(list);
    } catch (err) {
      console.log('Error fetching talukas:', err);
    }
  };

  const handleSelectTaluka = (taluka) => {
    setSelectedTaluka(taluka);
    setShowTalukaModal(false);
    setTalukaSearch('');
  };

  const handleGetGpsLocation = async () => {
    setLoadingGps(true);
    setCoords(null);
    setGpsCaptured(false);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('common.error'), t('location.gpsFailed'));
        setLoadingGps(false);
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = position.coords;
      setCoords({ latitude, longitude });
      setGpsCaptured(true);

      const geocodeList = await Location.reverseGeocodeAsync({ latitude, longitude });
      
      if (geocodeList && geocodeList.length > 0) {
        const addr = geocodeList[0];
        const addressPieces = [
          addr.name,
          addr.street,
          addr.subregion,
          addr.district,
          addr.city,
          addr.postalCode,
        ].filter(Boolean);

        const joinedAddress = addressPieces.join(', ');
        if (!manualAddress) {
          setManualAddress(joinedAddress);
        }

        // Try to match district
        if (districts.length > 0 && addr.district) {
          const matchedD = districts.find(
            (d) =>
              d.name.toLowerCase() === addr.district.toLowerCase() ||
              addr.district.toLowerCase().includes(d.name.toLowerCase()) ||
              d.name.toLowerCase().includes(addr.district.toLowerCase())
          );
          if (matchedD) {
            setSelectedDistrict(matchedD);
            const tList = await getTalukas(matchedD.id);
            setTalukas(tList);
          }
        }
      }
    } catch (e) {
      console.log('Error fetching GPS position:', e);
      Alert.alert(t('common.error'), t('location.gpsFailed'));
    } finally {
      setLoadingGps(false);
    }
  };

  const handleNext = () => {
    if (!manualAddress.trim()) {
      Alert.alert(
        t('common.error'),
        locale === 'mr' ? 'कृपया घटनेचा पत्ता प्रविष्ट करा.' : 'Please enter the incident or premises address.',
        [{ text: t('common.ok') }]
      );
      return;
    }

    updateDraft({
      district_id: selectedDistrict ? selectedDistrict.id : null,
      district_name: selectedDistrict ? selectedDistrict.name : null,
      taluka_id: selectedTaluka ? selectedTaluka.id : null,
      taluka_name: selectedTaluka ? selectedTaluka.name : null,
      location: {
        address: manualAddress.trim(),
        latitude: coords ? coords.latitude : null,
        longitude: coords ? coords.longitude : null,
      },
    });

    navigation.navigate('ComplaintReview');
  };

  const filteredDistricts = districts.filter((d) =>
    d.name.toLowerCase().includes(districtSearch.toLowerCase().trim())
  );

  const filteredTalukas = talukas.filter((t) =>
    t.name.toLowerCase().includes(talukaSearch.toLowerCase().trim())
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      {/* Wizard Progress Bar */}
      <View style={styles.progressBarWrap}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressStepText}>STEP 3 OF 4</Text>
          <Text style={styles.progressStepName}>
            {locale === 'mr' ? 'घटनास्थळ' : 'Incident Location'}
          </Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: '75%' }]} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* GPS Quick Capture Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="location" size={20} color={colors.secondary} />
            <Text style={styles.cardTitle}>{t('location.gpsTitle')}</Text>
          </View>
          <Text style={styles.cardDesc}>
            {locale === 'mr' 
              ? 'आपल्या सध्याच्या जीपीएस स्थानावरून घटनास्थळ आपोआप निश्चित करा.'
              : 'Auto-detect your coordinates to assist FDA officers in rapid dispatch.'}
          </Text>

          <TouchableOpacity
            style={[styles.gpsButton, gpsCaptured && styles.gpsButtonSuccess]}
            onPress={handleGetGpsLocation}
            disabled={loadingGps}
            activeOpacity={0.85}
          >
            {loadingGps ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons 
                  name={gpsCaptured ? 'checkmark-circle' : 'locate-outline'} 
                  size={18} 
                  color="#FFFFFF" 
                  style={{ marginRight: 6 }} 
                />
                <Text style={styles.gpsButtonText}>
                  {gpsCaptured 
                    ? (locale === 'mr' ? 'जीपीएस स्थान जोडले ✓' : 'GPS Coordinates Attached ✓')
                    : t('location.gpsBtn')}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {coords && (
            <View style={styles.coordBox}>
              <Text style={styles.coordText}>
                LAT: {coords.latitude.toFixed(6)} | LONG: {coords.longitude.toFixed(6)}
              </Text>
            </View>
          )}
        </View>

        {/* Administrative Jurisdiction Selector */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="business-outline" size={20} color={colors.primary} />
            <Text style={styles.cardTitle}>
              {locale === 'mr' ? 'प्रशासकीय अधिकारक्षेत्र' : 'Administrative Jurisdiction'}
            </Text>
          </View>
          <Text style={styles.cardDesc}>
            {locale === 'mr' 
              ? 'महाराष्ट्र जिल्ह्यातील योग्य तालुका व क्षेत्र निवडा.'
              : 'Select the respective Maharashtra district and taluka for jurisdiction.'}
          </Text>

          {/* District Picker Selector */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>
              {locale === 'mr' ? 'जिल्हा (District)' : 'Administrative District'}
            </Text>
            <TouchableOpacity 
              style={styles.dropdownSelector}
              onPress={() => setShowDistrictModal(true)}
              activeOpacity={0.8}
            >
              <Text style={selectedDistrict ? styles.dropdownSelectedText : styles.dropdownPlaceholder}>
                {selectedDistrict ? selectedDistrict.name : (locale === 'mr' ? 'जिल्हा निवडा (Select District)...' : 'Select District (36 available)...')}
              </Text>
              <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Taluka Picker Selector */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>
              {locale === 'mr' ? 'तालुका (Taluka)' : 'Sub-Division / Taluka'}
            </Text>
            <TouchableOpacity 
              style={[
                styles.dropdownSelector,
                !selectedDistrict && styles.dropdownDisabled,
              ]}
              onPress={() => selectedDistrict && setShowTalukaModal(true)}
              disabled={!selectedDistrict}
              activeOpacity={0.8}
            >
              <Text style={selectedTaluka ? styles.dropdownSelectedText : styles.dropdownPlaceholder}>
                {selectedTaluka 
                  ? selectedTaluka.name 
                  : (selectedDistrict ? 'Select Taluka...' : 'Select District First')}
              </Text>
              <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Premises Street Address Input */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="map-outline" size={20} color={colors.primary} />
            <Text style={styles.cardTitle}>{t('location.addressLabel')} *</Text>
          </View>

          <TextInput
            style={styles.addressInput}
            placeholder={t('location.addressPlaceholder')}
            placeholderTextColor={colors.textMuted}
            value={manualAddress}
            onChangeText={setManualAddress}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Proceed Button */}
        <View style={styles.btnWrap}>
          <CustomButton
            title={locale === 'mr' ? 'तक्रार पडताळणी (पुढील पायरी)' : 'Proceed to Review Summary →'}
            onPress={handleNext}
            variant="primary"
          />
        </View>

      </ScrollView>

      {/* District Selection Modal */}
      <Modal visible={showDistrictModal} animationType="slide" transparent>
        <SafeAreaView style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Maharashtra District</Text>
              <TouchableOpacity onPress={() => setShowDistrictModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalSearchWrap}>
              <Ionicons name="search" size={16} color={colors.textSecondary} style={{ marginRight: 8 }} />
              <TextInput
                style={styles.modalSearchInput}
                placeholder="Search district name..."
                placeholderTextColor={colors.textMuted}
                value={districtSearch}
                onChangeText={setDistrictSearch}
              />
            </View>

            <FlatList
              data={filteredDistricts}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleSelectDistrict(item)}
                >
                  <Text style={styles.modalItemText}>{item.name}</Text>
                  {selectedDistrict?.id === item.id && (
                    <Ionicons name="checkmark" size={18} color={colors.secondary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </SafeAreaView>
      </Modal>

      {/* Taluka Selection Modal */}
      <Modal visible={showTalukaModal} animationType="slide" transparent>
        <SafeAreaView style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Taluka ({selectedDistrict?.name})</Text>
              <TouchableOpacity onPress={() => setShowTalukaModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalSearchWrap}>
              <Ionicons name="search" size={16} color={colors.textSecondary} style={{ marginRight: 8 }} />
              <TextInput
                style={styles.modalSearchInput}
                placeholder="Search taluka..."
                placeholderTextColor={colors.textMuted}
                value={talukaSearch}
                onChangeText={setTalukaSearch}
              />
            </View>

            <FlatList
              data={filteredTalukas}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleSelectTaluka(item)}
                >
                  <Text style={styles.modalItemText}>{item.name}</Text>
                  {selectedTaluka?.id === item.id && (
                    <Ionicons name="checkmark" size={18} color={colors.secondary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </SafeAreaView>
      </Modal>

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
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: colors.text,
  },
  cardDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 16,
  },
  gpsButton: {
    backgroundColor: colors.secondary,
    height: 44,
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  gpsButtonSuccess: {
    backgroundColor: colors.success,
  },
  gpsButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  coordBox: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: '#F8FAFC',
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  coordText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  fieldGroup: {
    marginBottom: spacing.md,
  },
  fieldLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  dropdownSelector: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    height: 44,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownDisabled: {
    backgroundColor: '#F1F5F9',
  },
  dropdownSelectedText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  dropdownPlaceholder: {
    fontSize: 13.5,
    color: colors.textMuted,
  },
  addressInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    minHeight: 80,
    fontSize: 14,
    color: colors.text,
  },
  btnWrap: {
    marginTop: spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(14, 31, 53, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '80%',
    padding: spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  modalSearchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 40,
    marginBottom: spacing.md,
  },
  modalSearchInput: {
    flex: 1,
    fontSize: 13.5,
    color: colors.text,
  },
  modalItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalItemText: {
    fontSize: 14,
    color: colors.text,
  },
});
