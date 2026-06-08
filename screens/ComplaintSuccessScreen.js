// FILE NAME: d:\Omkar\Water\FDA\screens\ComplaintSuccessScreen.js

import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  BackHandler, 
  StatusBar,
  Share 
} from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import CustomButton from '../components/CustomButton';
import { Ionicons } from '@expo/vector-icons';

export default function ComplaintSuccessScreen({ route, navigation }) {
  const { t, locale } = useLanguage();
  const { complaintId } = route.params || { complaintId: 'MHFDA-2026-XXXXXX' };

  // Intercept and override back button press (Android/iOS gestures)
  useEffect(() => {
    const handleBackButton = () => {
      // Send user back to Home Dashboard instead of form steps
      navigation.popToTop();
      return true; // Prevents default back nav action
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackButton);

    return () => backHandler.remove();
  }, [navigation]);

  const handleShare = async () => {
    try {
      await Share.share({
        message: locale === 'mr'
          ? `माझी तक्रार सेफमहा (SafeMaha) वर यशस्वीरित्या दाखल झाली आहे. तक्रार संदर्भ क्र: ${complaintId}`
          : `My consumer safety complaint has been logged successfully on SafeMaha. Reference ID: ${complaintId}`,
      });
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  const handleTrack = () => {
    // Navigate to Status Tracking Screen for this specific ID
    navigation.navigate('ComplaintStatus', { complaintId });
  };

  const handleReturnHome = () => {
    navigation.popToTop();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.container}>
        
        {/* Success Header Illustration */}
        <View style={styles.content}>
          <View style={styles.iconCircle}>
            <Ionicons name="checkmark" size={60} color="#FFFFFF" />
          </View>
          
          <Text style={styles.successTitle}>{t('success.headerTitle')}</Text>
          <Text style={styles.successSub}>{t('success.successMsg')}</Text>

          {/* Reference ID Card Container */}
          <View style={styles.idCard}>
            <Text style={styles.idLabel}>{t('success.idLabel')}</Text>
            <Text style={styles.idText}>{complaintId}</Text>
            
            <TouchableOpacity 
              style={styles.shareBtn} 
              activeOpacity={0.7}
              onPress={handleShare}
            >
              <Ionicons name="share-social-outline" size={16} color="#3C6382" />
              <Text style={styles.shareText}>
                {locale === 'mr' ? 'शेअर करा' : 'Share ID'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.footer}>
          <CustomButton
            title={t('success.trackBtn')}
            onPress={handleTrack}
            variant="accent" // Teal accent for tracking
            icon={<Ionicons name="analytics" size={20} color="#FFFFFF" />}
          />
          
          <CustomButton
            title={t('success.homeBtn')}
            onPress={handleReturnHome}
            variant="outline" // Clean outline style for home
            icon={<Ionicons name="home-outline" size={18} color="#0A3D62" />}
          />
        </View>

      </View>
    </SafeAreaView>
  );
}

// Simple inline Touchable for Share to avoid building complex sub-component
import { TouchableOpacity } from 'react-native';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#38ADA9', // Accent Teal
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#38ADA9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  successTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0A3D62',
    textAlign: 'center',
    marginBottom: 10,
  },
  successSub: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
    marginBottom: 30,
  },
  idCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 20,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  idLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  idText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0A3D62',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E2E8F0',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  shareText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3C6382',
    marginLeft: 6,
  },
  footer: {
    width: '100%',
    marginBottom: 10,
  },
});
