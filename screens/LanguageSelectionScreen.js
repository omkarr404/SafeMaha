// FILE NAME: d:\Omkar\Water\FDA\screens\LanguageSelectionScreen.js

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import CustomButton from '../components/CustomButton';
import { Ionicons } from '@expo/vector-icons';

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
      <StatusBar barStyle="dark-content" backgroundColor="#F5F6FA" />
      <View style={styles.container}>
        
        {/* Header Block */}
        <View style={styles.headerContainer}>
          <Text style={styles.title}>{t('language.selectTitle')}</Text>
          <Text style={styles.subtitle}>{t('language.selectSubtitle')}</Text>
          <View style={styles.divider} />
        </View>

        {/* Selection Cards */}
        <View style={styles.cardsContainer}>
          
          {/* Marathi Card */}
          <TouchableOpacity
            style={[
              styles.card,
              selectedLang === 'mr' && styles.selectedCard,
            ]}
            onPress={() => handleLanguageSelect('mr')}
            activeOpacity={0.85}
          >
            <View style={styles.cardHeader}>
              <View style={styles.flagSymbolContainer}>
                <Text style={styles.flagText}>म</Text>
              </View>
              {selectedLang === 'mr' ? (
                <Ionicons name="checkmark-circle" size={26} color="#0A3D62" />
              ) : (
                <View style={styles.radioUnselected} />
              )}
            </View>
            <Text style={styles.langName}>मराठी</Text>
            <Text style={styles.langDesc}>महाराष्ट्र ग्राहक सुरक्षा मंच मराठीत वापरा</Text>
          </TouchableOpacity>

          {/* English Card */}
          <TouchableOpacity
            style={[
              styles.card,
              selectedLang === 'en' && styles.selectedCard,
            ]}
            onPress={() => handleLanguageSelect('en')}
            activeOpacity={0.85}
          >
            <View style={styles.cardHeader}>
              <View style={styles.flagSymbolContainer}>
                <Text style={styles.flagText}>A</Text>
              </View>
              {selectedLang === 'en' ? (
                <Ionicons name="checkmark-circle" size={26} color="#0A3D62" />
              ) : (
                <View style={styles.radioUnselected} />
              )}
            </View>
            <Text style={styles.langName}>English</Text>
            <Text style={styles.langDesc}>Use platform in English language</Text>
          </TouchableOpacity>
        </View>

        {/* Footer Continue Button */}
        <View style={styles.footer}>
          <CustomButton
            title={selectedLang === 'mr' ? 'पुढे जा' : 'Continue'}
            onPress={handleContinue}
            variant="primary"
            icon={<Ionicons name="arrow-forward" size={18} color="#FFFFFF" />}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
    justifyContent: 'space-between',
  },
  headerContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0A3D62',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#3C6382',
    textAlign: 'center',
  },
  divider: {
    width: 60,
    height: 4,
    backgroundColor: '#38ADA9',
    borderRadius: 2,
    marginTop: 16,
  },
  cardsContainer: {
    flex: 1,
    justifyContent: 'center',
    marginVertical: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 20,
    marginVertical: 10,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    shadowColor: '#0A3D62',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  selectedCard: {
    borderColor: '#0A3D62',
    backgroundColor: '#F0F4F8',
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  flagSymbolContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  flagText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0A3D62',
  },
  radioUnselected: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  langName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0A3D62',
    marginBottom: 6,
  },
  langDesc: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  footer: {
    marginBottom: 20,
    width: '100%',
  },
});
