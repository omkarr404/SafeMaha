// FILE NAME: d:\Omkar\Water\FDA\screens\LanguageSelectionScreen.js

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import CustomButton from '../components/CustomButton';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows } from '../constants/theme';

export default function LanguageSelectionScreen({ navigation }) {
  const { locale, setLocale, t } = useLanguage();
  const [selectedLang, setSelectedLang] = useState(locale);

  const handleLanguageSelect = (langCode) => {
    setSelectedLang(langCode);
  };

  const handleContinue = () => {
    setLocale(selectedLang);
    navigation.replace('Home');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <View style={styles.container}>
        
        {/* Official Header */}
        <View style={styles.headerContainer}>
          <View style={styles.govPill}>
            <Text style={styles.govPillText}>GOVERNMENT OF MAHARASHTRA • FDA</Text>
          </View>
          <Text style={styles.title}>Select Your Language</Text>
          <Text style={styles.titleMarathi}>आपली भाषा निवडा</Text>
          <Text style={styles.subtitle}>
            Choose your preferred language for accessing consumer safety services.
          </Text>
          <View style={styles.accentDivider} />
        </View>

        {/* Selection Cards */}
        <View style={styles.cardsContainer}>
          
          {/* Marathi Selection Card */}
          <TouchableOpacity
            style={[
              styles.card,
              selectedLang === 'mr' && styles.selectedCard,
            ]}
            onPress={() => handleLanguageSelect('mr')}
            activeOpacity={0.85}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.letterBadge, selectedLang === 'mr' && styles.selectedLetterBadge]}>
                <Text style={[styles.letterText, selectedLang === 'mr' && styles.selectedLetterText]}>म</Text>
              </View>
              {selectedLang === 'mr' ? (
                <View style={styles.radioSelected}>
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                </View>
              ) : (
                <View style={styles.radioUnselected} />
              )}
            </View>
            <Text style={styles.langName}>मराठी</Text>
            <Text style={styles.langSub}>महाराष्ट्र राज्य अधिकृत भाषा</Text>
            <Text style={styles.langDesc}>अन्न, औषध व सौंदर्यप्रसाधने तक्रार नोंदणी मराठीत करा.</Text>
          </TouchableOpacity>

          {/* English Selection Card */}
          <TouchableOpacity
            style={[
              styles.card,
              selectedLang === 'en' && styles.selectedCard,
            ]}
            onPress={() => handleLanguageSelect('en')}
            activeOpacity={0.85}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.letterBadge, selectedLang === 'en' && styles.selectedLetterBadge]}>
                <Text style={[styles.letterText, selectedLang === 'en' && styles.selectedLetterText]}>EN</Text>
              </View>
              {selectedLang === 'en' ? (
                <View style={styles.radioSelected}>
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                </View>
              ) : (
                <View style={styles.radioUnselected} />
              )}
            </View>
            <Text style={styles.langName}>English</Text>
            <Text style={styles.langSub}>Official Administrative Language</Text>
            <Text style={styles.langDesc}>Report public safety hazards and track complaints in English.</Text>
          </TouchableOpacity>
        </View>

        {/* Footer Proceed Button */}
        <View style={styles.footer}>
          <CustomButton
            title={selectedLang === 'mr' ? 'पुढे सुरू ठेवा (Continue)' : 'Continue to Dashboard'}
            onPress={handleContinue}
            variant="primary"
            icon={<Ionicons name="arrow-forward" size={18} color="#FFFFFF" />}
          />
          <Text style={styles.footerNote}>
            {selectedLang === 'mr' ? 'तुम्ही नंतर सेटिंग्जमधून भाषा बदलू शकता.' : 'You can switch languages anytime from the app menu.'}
          </Text>
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
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    justifyContent: 'space-between',
  },
  headerContainer: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  govPill: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    marginBottom: spacing.md,
  },
  govPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  titleMarathi: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.secondary,
    textAlign: 'center',
    marginTop: 2,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.md,
    lineHeight: 18,
  },
  accentDivider: {
    width: 44,
    height: 3,
    backgroundColor: colors.secondary,
    borderRadius: 2,
    marginTop: spacing.md,
  },
  cardsContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.md,
    marginVertical: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    ...shadows.sm,
  },
  selectedCard: {
    borderColor: colors.secondary,
    backgroundColor: '#FAFBFD',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  letterBadge: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedLetterBadge: {
    backgroundColor: colors.secondary,
  },
  letterText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  selectedLetterText: {
    color: '#FFFFFF',
  },
  radioSelected: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioUnselected: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CBD5E1',
  },
  langName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginTop: 2,
  },
  langSub: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.secondary,
    marginTop: 2,
  },
  langDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    lineHeight: 18,
  },
  footer: {
    alignItems: 'center',
    width: '100%',
    paddingBottom: spacing.sm,
  },
  footerNote: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});
