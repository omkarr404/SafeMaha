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


export default function LocationScreen({ navigation }) {
  const { t, locale } = useLanguage();
  const { draftComplaint, updateDraft } = useComplaints();

  // Local state for address and coordinates
  const [manualAddress, setManualAddress] = useState('');
  const [coords, setCoords] = useState(null); // { latitude, longitude }
  const [loadingGps, setLoadingGps] = useState(false);
  const [gpsCaptured, setGpsCaptured] = useState(false);

  const [districts, setDistricts] = useState([]);
  const [talukas, setTalukas] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedTaluka, setSelectedTaluka] = useState(null);
  const [showDistrictModal, setShowDistrictModal] = useState(false);
  const [showTalukaModal, setShowTalukaModal] = useState(false);

  // Sync state with draft context on load (for back navigation prefill)
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
              longitude: draftComplaint.location.longitude
            });
            setGpsCaptured(true);
          }
        }

        if (draftComplaint.district_id) {
          const matchedD = list.find(d => d.id === draftComplaint.district_id);
          if (matchedD) {
            setSelectedDistrict(matchedD);
            const tList = await getTalukas(matchedD.id);
            setTalukas(tList);
            if (draftComplaint.taluka_id) {
              const matchedT = tList.find(t => t.id === draftComplaint.taluka_id);
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
  };

  const handleGetGpsLocation = async () => {
    setLoadingGps(true);
    setCoords(null);
    setGpsCaptured(false);

    try {
      // 1. Request Foreground Permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          t('common.error'),
          t('location.gpsFailed')
        );
        setLoadingGps(false);
        return;
      }

      // 2. Fetch Position
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = position.coords;
      setCoords({ latitude, longitude });
      setGpsCaptured(true);

      // 3. Reverse Geocode Coordinates
      const geocodeList = await Location.reverseGeocodeAsync({ latitude, longitude });
      
      if (geocodeList && geocodeList.length > 0) {
        const addr = geocodeList[0];
        
        // Build address string (e.g. "Flat No, Street, Landmark, District, City, Region, Pincode")
        const addressPieces = [
          addr.name,
          addr.street,
          addr.district,
          addr.city,
          addr.subregion,
          addr.region,
          addr.postalCode
        ].filter(Boolean); // Filters out null or undefined values

        const joinedAddress = addressPieces.join(', ');
        setManualAddress(joinedAddress);

        // Attempt to auto-match district and taluka from GPS address
        const gpsDistrictName = addr.district || '';
        const gpsCityName = addr.city || addr.subregion || '';
        
        const matchedDist = districts.find(d => 
          d.name.toLowerCase().includes(gpsDistrictName.toLowerCase()) || 
          gpsDistrictName.toLowerCase().includes(d.name.toLowerCase())
        );
        
        if (matchedDist) {
          setSelectedDistrict(matchedDist);
          const tList = await getTalukas(matchedDist.id);
          setTalukas(tList);
          
          const matchedTal = tList.find(t => 
            t.name.toLowerCase().includes(gpsCityName.toLowerCase()) || 
            gpsCityName.toLowerCase().includes(t.name.toLowerCase())
          );
          if (matchedTal) {
            setSelectedTaluka(matchedTal);
          }
        }
        
        Alert.alert(
          t('common.success'),
          t('location.gpsSuccess'),
          [{ text: t('common.ok') }]
        );
      } else {
        Alert.alert(
          t('common.success'),
          locale === 'mr' ? 'अक्षांश व रेखांश मिळवले. कृपया पत्ता स्वहस्ते प्रविष्ट करा.' : 'GPS location captured. Please enter address manually.',
          [{ text: t('common.ok') }]
        );
      }
    } catch (e) {
      console.log('Error fetching GPS coordinates:', e);
      Alert.alert(
        t('common.error'),
        t('location.gpsFailed')
      );
    } finally {
      setLoadingGps(false);
    }
  };

  const handleNext = () => {
    const trimmedAddress = manualAddress.trim();
    
    if (!trimmedAddress) {
      Alert.alert(
        t('common.error'),
        t('location.addressRequired'),
        [{ text: t('common.ok'), style: 'cancel' }]
      );
      return;
    }

    if (!selectedDistrict) {
      Alert.alert(
        t('common.error'),
        locale === 'mr' ? 'कृपया जिल्हा निवडा.' : 'Please select a district.',
        [{ text: t('common.ok'), style: 'cancel' }]
      );
      return;
    }

    if (!selectedTaluka) {
      Alert.alert(
        t('common.error'),
        locale === 'mr' ? 'कृपया तालुका निवडा.' : 'Please select a taluka.',
        [{ text: t('common.ok'), style: 'cancel' }]
      );
      return;
    }

    // Save location details to global draft complaint context
    updateDraft({
      location: {
        latitude: coords ? coords.latitude : null,
        longitude: coords ? coords.longitude : null,
        address: trimmedAddress
      },
      district_id: selectedDistrict.id,
      taluka_id: selectedTaluka.id,
      district_name: selectedDistrict.name,
      taluka_name: selectedTaluka.name
    });

    // Navigate to Complaint Review Screen
    navigation.navigate('ComplaintReview');
  };


  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.container}>
        
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* Header instructions */}
          <View style={styles.header}>
            <Text style={styles.title}>{t('location.headerTitle')}</Text>
            <Text style={styles.headerDesc}>
              {locale === 'mr' 
                ? 'तक्रार दाखल करण्यासाठी अचूक स्थान महत्त्वाचे आहे. आपण GPS द्वारे किंवा स्वहस्ते पत्ता नोंदवू शकता.' 
                : 'Accurate location is essential for investigation. Capture via GPS or enter manual address.'}
            </Text>
          </View>

          {/* GPS Capture Button Option */}
          <View style={styles.gpsSection}>
            <CustomButton
              title={loadingGps ? t('location.fetching') : t('location.useCurrent')}
              onPress={handleGetGpsLocation}
              variant={gpsCaptured ? 'accent' : 'outline'}
              disabled={loadingGps}
              icon={
                loadingGps ? (
                  <ActivityIndicator size="small" color="#0A3D62" />
                ) : (
                  <Ionicons name="location-sharp" size={20} color={gpsCaptured ? '#FFFFFF' : '#0A3D62'} />
                )
              }
            />

            {/* GPS Metadata pill */}
            {coords && (
              <View style={styles.gpsMetaPill}>
                <Ionicons name="compass-outline" size={14} color="#38ADA9" />
                <Text style={styles.gpsMetaText}>
                  {t('location.latitude')}: {coords.latitude.toFixed(5)} • {t('location.longitude')}: {coords.longitude.toFixed(5)}
                </Text>
              </View>
            )}
          </View>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.horizontalLine} />
            <Text style={styles.dividerText}>{t('location.orManual')}</Text>
            <View style={styles.horizontalLine} />
          </View>

          {/* Manual Address Input Box */}
          <View style={styles.addressBoxContainer}>
            <Text style={styles.label}>
              {t('location.addressLabel')} <Text style={styles.asterisk}>*</Text>
            </Text>
            <TextInput
              style={styles.addressInput}
              placeholder={t('location.addressPlaceholder')}
              placeholderTextColor="#94A3B8"
              value={manualAddress}
              multiline={true}
              numberOfLines={4}
              textAlignVertical="top"
              onChangeText={setManualAddress}
            />
          </View>

          {/* District Selector */}
          <View style={styles.dropdownContainer}>
            <Text style={styles.label}>
              {locale === 'mr' ? 'जिल्हा' : 'District'} <Text style={styles.asterisk}>*</Text>
            </Text>
            <TouchableOpacity 
              style={styles.dropdownButton} 
              onPress={() => setShowDistrictModal(true)}
            >
              <Text style={selectedDistrict ? styles.dropdownSelectedText : styles.dropdownPlaceholderText}>
                {selectedDistrict ? selectedDistrict.name : t('location.selectDistrict')}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Taluka Selector */}
          <View style={styles.dropdownContainer}>
            <Text style={styles.label}>
              {locale === 'mr' ? 'तालुका' : 'Taluka'} <Text style={styles.asterisk}>*</Text>
            </Text>
            <TouchableOpacity 
              style={[styles.dropdownButton, !selectedDistrict && styles.dropdownDisabledButton]} 
              onPress={() => {
                if (!selectedDistrict) {
                  Alert.alert(
                    t('common.error'),
                    locale === 'mr' ? 'कृपया प्रथम जिल्हा निवडा.' : 'Please select a district first.'
                  );
                  return;
                }
                setShowTalukaModal(true);
              }}
              disabled={!selectedDistrict}
            >
              <Text style={selectedTaluka ? styles.dropdownSelectedText : styles.dropdownPlaceholderText}>
                {selectedTaluka ? selectedTaluka.name : (selectedDistrict ? t('location.selectTaluka') : (locale === 'mr' ? 'प्रथम जिल्हा निवडा' : 'Select District First'))}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

        </ScrollView>

        {/* Footer continue button */}
        <View style={styles.footer}>
          <CustomButton
            title={t('location.nextBtn')}
            onPress={handleNext}
            variant="primary"
            icon={<Ionicons name="checkbox-outline" size={20} color="#FFFFFF" />}
          />
        </View>

      </View>

      {/* District Selection Modal */}
      <Modal
        visible={showDistrictModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDistrictModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('location.selectDistrict')}</Text>
              <TouchableOpacity onPress={() => setShowDistrictModal(false)}>
                <Ionicons name="close" size={24} color="#0A3D62" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={districts}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    selectedDistrict && selectedDistrict.id === item.id && styles.modalItemSelected
                  ]}
                  onPress={() => handleSelectDistrict(item)}
                >
                  <Text style={[
                    styles.modalItemText,
                    selectedDistrict && selectedDistrict.id === item.id && styles.modalItemTextSelected
                  ]}>
                    {item.name}
                  </Text>
                  {selectedDistrict && selectedDistrict.id === item.id && (
                    <Ionicons name="checkmark" size={20} color="#0A3D62" />
                  )}
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.modalSeparator} />}
              contentContainerStyle={styles.modalList}
            />
          </View>
        </View>
      </Modal>

      {/* Taluka Selection Modal */}
      <Modal
        visible={showTalukaModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTalukaModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('location.selectTaluka')}</Text>
              <TouchableOpacity onPress={() => setShowTalukaModal(false)}>
                <Ionicons name="close" size={24} color="#0A3D62" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={talukas}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    selectedTaluka && selectedTaluka.id === item.id && styles.modalItemSelected
                  ]}
                  onPress={() => handleSelectTaluka(item)}
                >
                  <Text style={[
                    styles.modalItemText,
                    selectedTaluka && selectedTaluka.id === item.id && styles.modalItemTextSelected
                  ]}>
                    {item.name}
                  </Text>
                  {selectedTaluka && selectedTaluka.id === item.id && (
                    <Ionicons name="checkmark" size={20} color="#0A3D62" />
                  )}
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.modalSeparator} />}
              contentContainerStyle={styles.modalList}
            />
          </View>
        </View>
      </Modal>
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
  headerDesc: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 22,
  },
  gpsSection: {
    marginBottom: 24,
    alignItems: 'center',
    width: '100%',
  },
  gpsMetaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#CCFBF1',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginTop: 10,
  },
  gpsMetaText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0D9488',
    marginLeft: 6,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  horizontalLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    paddingHorizontal: 12,
    textTransform: 'uppercase',
  },
  addressBoxContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0A3D62',
    marginBottom: 8,
  },
  asterisk: {
    color: '#EF4444',
  },
  addressInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0F172A',
    height: 110,
  },
  footer: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  dropdownContainer: {
    marginBottom: 20,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dropdownDisabledButton: {
    backgroundColor: '#E2E8F0',
    borderColor: '#CBD5E1',
    opacity: 0.7,
  },
  dropdownPlaceholderText: {
    fontSize: 15,
    color: '#94A3B8',
  },
  dropdownSelectedText: {
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 61, 98, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '60%',
    paddingTop: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0A3D62',
  },
  modalList: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  modalItemSelected: {
    backgroundColor: '#F0F9FF',
    marginHorizontal: -24,
    paddingHorizontal: 24,
  },
  modalItemText: {
    fontSize: 16,
    color: '#334155',
  },
  modalItemTextSelected: {
    color: '#0A3D62',
    fontWeight: '700',
  },
  modalSeparator: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
});
