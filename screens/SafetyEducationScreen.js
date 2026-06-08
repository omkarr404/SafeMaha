// FILE NAME: d:\Omkar\Water\FDA\screens\SafetyEducationScreen.js

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TextInput, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  StatusBar 
} from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { getArticles } from '../services/articleService';
import { Ionicons } from '@expo/vector-icons';

export default function SafetyEducationScreen({ navigation }) {
  const { t, locale } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all'); // 'all', 'food', 'drug', 'cosmetics', 'rights'

  const categories = [
    { key: 'all', label: t('safetyEducation.categories.all'), icon: 'apps-outline' },
    { key: 'food', label: t('safetyEducation.categories.food'), icon: 'restaurant-outline' },
    { key: 'drug', label: t('safetyEducation.categories.drug'), icon: 'medical-outline' },
    { key: 'cosmetics', label: t('safetyEducation.categories.cosmetics'), icon: 'rose-outline' },
    { key: 'rights', label: t('safetyEducation.categories.rights'), icon: 'scale-outline' }
  ];

  const handleArticlePress = (id) => {
    navigation.navigate('ArticleDetail', { articleId: id });
  };

  const getCategoryColor = (cat) => {
    switch (cat) {
      case 'food': return '#38ADA9'; // Teal
      case 'drug': return '#0A3D62'; // Blue
      case 'cosmetics': return '#E58E26'; // Gold
      case 'rights': return '#82589F'; // Purple
      default: return '#64748B';
    }
  };

  const articles = getArticles(selectedCategory);
  
  const filteredArticles = articles.filter(item => {
    const title = (item.title[locale] || item.title['en'] || '').toLowerCase();
    const desc = (item.description[locale] || item.description['en'] || '').toLowerCase();
    const query = searchQuery.toLowerCase().trim();
    return title.includes(query) || desc.includes(query);
  });

  const renderArticleCard = ({ item }) => {
    const titleText = item.title[locale] || item.title['en'];
    const descText = item.description[locale] || item.description['en'];
    const categoryLabel = t(`safetyEducation.categories.${item.category}`);
    const color = getCategoryColor(item.category);

    return (
      <TouchableOpacity 
        style={styles.card} 
        activeOpacity={0.95}
        onPress={() => handleArticlePress(item.id)}
      >
        <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
        
        <View style={styles.cardContent}>
          <View style={[styles.badge, { backgroundColor: color + '15' }]}>
            <Text style={[styles.badgeText, { color }]}>{categoryLabel}</Text>
          </View>

          <Text style={styles.title} numberOfLines={2}>{titleText}</Text>
          <Text style={styles.desc} numberOfLines={3}>{descText}</Text>
          
          <View style={styles.cardFooter}>
            <Text style={[styles.readMoreText, { color }]}>
              {t('safetyEducation.readMore')} →
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.container}>
        
        {/* Search Header */}
        <View style={styles.searchHeader}>
          <View style={styles.inputWrapper}>
            <Ionicons name="search" size={20} color="#64748B" style={styles.searchIcon} />
            <TextInput
              style={styles.input}
              placeholder={t('safetyEducation.searchPlaceholder')}
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearIcon}>
                <Ionicons name="close-circle" size={18} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Categories Scroller */}
        <View style={styles.categoriesWrapper}>
          <FlatList
            horizontal
            data={categories}
            keyExtractor={(item) => item.key}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
            renderItem={({ item }) => {
              const isActive = selectedCategory === item.key;
              return (
                <TouchableOpacity
                  style={[
                    styles.categoryTab,
                    isActive && styles.categoryTabActive
                  ]}
                  onPress={() => setSelectedCategory(item.key)}
                >
                  <Ionicons 
                    name={item.icon} 
                    size={16} 
                    color={isActive ? '#FFFFFF' : '#64748B'} 
                    style={styles.tabIcon} 
                  />
                  <Text style={[
                    styles.tabText,
                    isActive && styles.tabTextActive
                  ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        {/* Articles list */}
        <View style={styles.listContainer}>
          {filteredArticles.length > 0 ? (
            <FlatList
              data={filteredArticles}
              keyExtractor={(item) => item.id}
              renderItem={renderArticleCard}
              contentContainerStyle={styles.listScroll}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyBox}>
              <Ionicons name="book-outline" size={48} color="#CBD5E1" />
              <Text style={styles.emptyText}>{t('faq.emptyState')}</Text>
            </View>
          )}
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
  },
  searchHeader: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
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
  categoriesWrapper: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 10,
  },
  categoriesList: {
    paddingHorizontal: 14,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  categoryTabActive: {
    backgroundColor: '#0A3D62',
  },
  tabIcon: {
    marginRight: 6,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  listScroll: {
    paddingTop: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0A3D62',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 3,
  },
  thumbnail: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  cardContent: {
    padding: 16,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginBottom: 10,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0A3D62',
    lineHeight: 22,
    marginBottom: 8,
  },
  desc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 14,
  },
  cardFooter: {
    borderTopWidth: 1.5,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
    alignItems: 'flex-start',
  },
  readMoreText: {
    fontSize: 13,
    fontWeight: '700',
  },
  emptyBox: {
    flex: 1,
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
