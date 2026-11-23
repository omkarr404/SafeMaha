// FILE NAME: d:\Omkar\Water\FDA\screens\ComplaintSuccessScreen.js

import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  BackHandler, 
  StatusBar, 
  Share, 
  TouchableOpacity 
} from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import CustomButton from '../components/CustomButton';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows } from '../constants/theme';

export default function ComplaintSuccessScreen({ route, navigation }) {
  const { t, locale } = useLanguage();
  const { complaintId } = route.params || { complaintId: 'MHFDA-2026-XXXXXX' };
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleBackButton = () => {
      navigation.popToTop();
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackButton);
    return () => backHandler.remove();
  }, [navigation]);

  const handleShare = async () => {
    try {
      await Share.share({
        message: locale === 'mr'
          ? `माझी ग्राहक तक्रार सेफमहा (SafeMaha - Maharashtra FDA) वर यशस्वीरित्या दाखल झाली आहे. संदर्भ क्र: ${complaintId}`
          : `My consumer safety grievance has been registered on SafeMaha (Maharashtra FDA). Reference ID: ${complaintId}`,
      });
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  const handleTrack = () => {
    navigation.navigate('ComplaintStatus', { complaintId });
  };

  const handleReturnHome = () => {
    navigation.popToTop();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      {/* Top Banner Ribbon */}
      <View style={styles.topRibbon}>
        <Text style={styles.topRibbonText}>
          {locale === 'mr' 
            ? 'महाराष्ट्र शासन • अन्न व औषध प्रशासन पावती' 
            : 'GOVT. OF MAHARASHTRA • OFFICIAL ACKNOWLEDGMENT'}
        </Text>
      </View>

      <View style={styles.container}>
        
        {/* Success Icon Block */}
        <View style={styles.iconCircle}>
          <Ionicons name="checkmark-circle" size={64} color={colors.success} />
        </View>

        <Text style={styles.successHeading}>{t('success.title')}</Text>
        <Text style={styles.successSub}>
          {locale === 'mr' 
            ? 'आपली तक्रार एफडीए प्रणालीमध्ये यशस्वीरित्या नोंदवली गेली आहे.' 
            : 'Your consumer safety grievance has been officially transmitted to Maharashtra FDA.'}
        </Text>

        {/* Reference ID Showcase Card */}
        <View style={styles.referenceCard}>
          <Text style={styles.refCardLabel}>OFFICIAL COMPLAINT REFERENCE ID</Text>
          <Text style={styles.refCardId}>{complaintId}</Text>
          
          <TouchableOpacity 
            style={styles.shareRowBtn} 
            onPress={handleShare}
            activeOpacity={0.8}
          >
            <Ionicons name="share-social-outline" size={16} color={colors.secondary} />
            <Text style={styles.shareText}>
              {locale === 'mr' ? 'संदर्भ क्रमांक शेअर करा' : 'Share Reference Number'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Guidance Information */}
        <View style={styles.guidanceBox}>
          <Ionicons name="shield-checkmark" size={18} color={colors.primary} style={{ marginTop: 2, marginRight: 8 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.guidanceTitle}>
              {locale === 'mr' ? 'पुढील कारवाई' : 'What Happens Next?'}
            </Text>
            <Text style={styles.guidanceBody}>
              {locale === 'mr'
                ? 'संबंधित क्षेत्रातील अन्न व औषध निरीक्षकांना ही तक्रार सोपवण्यात आली असून आवश्यकतेनुसार तपास सुरू केला जाईल. आपण कधीही संदर्भ क्रमांकाने प्रगती तपासू शकता.'
                : 'Your complaint is routed to the designated regional inspector for evidence triage. You can track progress anytime without logging in using this Reference ID.'}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionBlock}>
          <CustomButton
            title={locale === 'mr' ? 'तक्रारीची स्थिती तपासा (Track Status)' : 'Track Investigation Status'}
            onPress={handleTrack}
            variant="primary"
            icon={<Ionicons name="time-outline" size={18} color="#FFFFFF" />}
          />

          <CustomButton
            title={locale === 'mr' ? 'मुख्य पृष्ठावर परत जा' : 'Return to Home Dashboard'}
            onPress={handleReturnHome}
            variant="outline"
          />
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topRibbon: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    alignItems: 'center',
    width: '100%',
  },
  topRibbonText: {
    color: '#CBD5E1',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    marginBottom: spacing.md,
  },
  successHeading: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  successSub: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
    lineHeight: 18,
    marginBottom: spacing.lg,
  },
  referenceCard: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    width: '100%',
    alignItems: 'center',
    ...shadows.sm,
    marginBottom: spacing.md,
  },
  refCardLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 1,
    marginBottom: 6,
  },
  refCardId: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  shareRowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.infoBg,
  },
  shareText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.secondary,
  },
  guidanceBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
    marginBottom: spacing.xl,
  },
  guidanceTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  guidanceBody: {
    fontSize: 11.5,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  actionBlock: {
    width: '100%',
    gap: 4,
  },
});
