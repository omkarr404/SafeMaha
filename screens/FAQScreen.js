// FILE NAME: d:\Omkar\Resume-Projects\FDA\screens\FAQScreen.js

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TextInput, 
  ScrollView, 
  TouchableOpacity, 
  StatusBar 
} from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '../constants/theme';

export default function FAQScreen() {
  const { t, locale } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const faqData = [
    { id: 1, q: t('faq.q1'), a: t('faq.a1') },
    { id: 2, q: t('faq.q2'), a: t('faq.a2') },
    { id: 3, q: t('faq.q3'), a: t('faq.a3') },
    { id: 4, q: t('faq.q4'), a: t('faq.a4') },
    { id: 5, q: t('faq.q5'), a: t('faq.a5') }
  ];

  const handleToggleExpand = (id) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
    }
  };

  const filteredFaqs = faqData.filter(item => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (item.q && item.q.toLowerCase().includes(query)) || 
           (item.a && item.a.toLowerCase().includes(query));
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={styles.container}>
        
        {/* Search bar wrapper */}
        <View style={styles.searchBox}>
          <View style={styles.inputWrapper}>
            <Ionicons name="search" size={18} color={colors.textSecondary} style={styles.searchIcon} />
            <TextInput
              style={styles.input}
              placeholder={t('faq.searchPlaceholder')}
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                setExpandedId(null);
              }}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearIcon}>
                <Ionicons name="close-circle" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* FAQ list */}
        <ScrollView 
          contentContainerStyle={styles.scrollContainer} 
          showsVerticalScrollIndicator={false}
        >
          {/* Informational intro card */}
          <View style={styles.introCard}>
            <View style={styles.introIconBox}>
              <Ionicons name="help-circle" size={24} color={colors.secondary} />
            </View>
            <View style={styles.introTextBox}>
              <Text style={styles.introTitle}>
                {locale === 'mr' ? 'नेहमी विचारले जाणारे प्रश्न' : 'Frequently Asked Questions'}
              </Text>
              <Text style={styles.introSubtitle}>
                {locale === 'mr' 
                  ? 'अन्न व औषध तक्रार निवारण प्रक्रिया, पुरावे आणि कायदेशीर माहिती'
                  : 'Common questions on FDA complaint filing, evidence rules, and case tracking'}
              </Text>
            </View>
          </View>

          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((item) => {
              const isExpanded = expandedId === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.faqCard, isExpanded && styles.faqCardExpanded]}
                  activeOpacity={0.8}
                  onPress={() => handleToggleExpand(item.id)}
                >
                  <View style={styles.questionRow}>
                    <Text style={[styles.questionText, isExpanded && styles.questionTextExpanded]}>
                      {item.q}
                    </Text>
                    <View style={[styles.chevronBox, isExpanded && styles.chevronBoxExpanded]}>
                      <Ionicons 
                        name={isExpanded ? "chevron-up" : "chevron-down"} 
                        size={18} 
                        color={isExpanded ? colors.secondary : colors.textSecondary} 
                      />
                    </View>
                  </View>
                  
                  {isExpanded && (
                    <View style={styles.answerWrapper}>
                      <Text style={styles.answerText}>{item.a}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.emptyBox}>
              <Ionicons name="help-circle-outline" size={48} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>
                {locale === 'mr' ? 'कोणतेही प्रश्न सापडले नाहीत' : 'No Results Found'}
              </Text>
              <Text style={styles.emptyText}>{t('faq.emptyState')}</Text>
            </View>
          )}

          {/* Citizen Helpline Footer Banner */}
          <View style={styles.helplineCard}>
            <View style={styles.helplineHeader}>
              <Ionicons name="call" size={18} color={colors.secondary} style={{ marginRight: 8 }} />
              <Text style={styles.helplineTitle}>
                {locale === 'mr' ? 'अजूनही प्रश्न किंवा अडचण आहे?' : 'Need Further Assistance?'}
              </Text>
            </View>
            <Text style={styles.helplineDesc}>
              {locale === 'mr'
                ? 'महाराष्ट्र अन्न व औषध प्रशासनाच्या टोल-फ्री क्रमांकावर थेट संपर्क साधा: १८००-२२२-३६५'
                : 'Contact FDA Maharashtra citizen helpline directly: 1800-222-365 (Mon-Sat, 9:30 AM to 6:00 PM)'}
            </Text>
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
  searchBox: {
    backgroundColor: colors.card,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderColor: colors.border,
    ...shadows.subtle,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 44,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: typography.bodyRegular.fontSize,
    color: colors.text,
    height: '100%',
  },
  clearIcon: {
    padding: 4,
  },
  scrollContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  introCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.subtle,
  },
  introIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  introTextBox: {
    flex: 1,
  },
  introTitle: {
    fontSize: typography.bodyRegular.fontSize,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 2,
  },
  introSubtitle: {
    fontSize: typography.caption.fontSize,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  faqCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.subtle,
  },
  faqCardExpanded: {
    borderColor: '#BFDBFE',
    borderLeftWidth: 4,
    borderLeftColor: colors.secondary,
  },
  questionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questionText: {
    fontSize: typography.bodyRegular.fontSize,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    paddingRight: spacing.sm,
    lineHeight: 20,
  },
  questionTextExpanded: {
    color: colors.primary,
    fontWeight: '700',
  },
  chevronBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chevronBoxExpanded: {
    backgroundColor: '#EFF6FF',
  },
  answerWrapper: {
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  answerText: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.textSecondary,
    lineHeight: 22,
    fontWeight: '400',
  },
  emptyBox: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl,
    marginTop: 40,
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyTitle: {
    fontSize: typography.h4.fontSize,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: '400',
  },
  helplineCard: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    backgroundColor: '#EFF6FF',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  helplineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  helplineTitle: {
    fontSize: typography.bodyRegular.fontSize,
    fontWeight: '700',
    color: colors.primary,
  },
  helplineDesc: {
    fontSize: typography.caption.fontSize,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
