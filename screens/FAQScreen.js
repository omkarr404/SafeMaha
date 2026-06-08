// FILE NAME: d:\Omkar\Water\FDA\screens\FAQScreen.js

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
    return item.q.toLowerCase().includes(query) || item.a.toLowerCase().includes(query);
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.container}>
        
        {/* Search bar wrapper */}
        <View style={styles.searchBox}>
          <View style={styles.inputWrapper}>
            <Ionicons name="search" size={20} color="#64748B" style={styles.searchIcon} />
            <TextInput
              style={styles.input}
              placeholder={t('faq.searchPlaceholder')}
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                setExpandedId(null); // Collapse when searching
              }}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearIcon}>
                <Ionicons name="close-circle" size={18} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* FAQ list */}
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((item) => {
              const isExpanded = expandedId === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.faqCard, isExpanded && styles.faqCardExpanded]}
                  activeOpacity={0.9}
                  onPress={() => handleToggleExpand(item.id)}
                >
                  <View style={styles.questionRow}>
                    <Text style={[styles.questionText, isExpanded && styles.questionTextExpanded]}>
                      {item.q}
                    </Text>
                    <Ionicons 
                      name={isExpanded ? "chevron-up" : "chevron-down"} 
                      size={20} 
                      color={isExpanded ? "#38ADA9" : "#64748B"} 
                    />
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
              <Ionicons name="help-circle-outline" size={48} color="#94A3B8" />
              <Text style={styles.emptyText}>{t('faq.emptyState')}</Text>
            </View>
          )}
        </ScrollView>

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
  },
  searchBox: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    height: '100%',
  },
  clearIcon: {
    padding: 4,
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 30,
  },
  faqCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.01,
    shadowRadius: 2,
    elevation: 1,
  },
  faqCardExpanded: {
    borderColor: '#38ADA9',
    shadowColor: '#38ADA9',
    shadowOpacity: 0.05,
    elevation: 2,
  },
  questionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0A3D62',
    flex: 1,
    paddingRight: 10,
    lineHeight: 20,
  },
  questionTextExpanded: {
    color: '#0A3D62',
  },
  answerWrapper: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  answerText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
    fontWeight: '500',
  },
  emptyBox: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 60,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '500',
  },
});
