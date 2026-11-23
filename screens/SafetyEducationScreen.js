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
import { colors, spacing, borderRadius, shadows } from '../constants/theme';

export default function SafetyEducationScreen({ navigation }) {
  const { t, locale } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { key: 'all', label: t('safetyEducation.categories.all'), icon: 'apps-outline' },
    { key: 'food', label: t('safetyEducation.categories.food'), icon: 'restaurant-outline' },
    { key: 'drug', label: t('safetyEducation.categories.drug'), icon: 'medical-outline' },
    { key: 'cosmetics', label: t('safetyEducation.categories.cosmetics'), icon: 'sparkles-outline' },
    { key: 'rights', label: t('safetyEducation.categories.rights'), icon: 'scale-outline' },
  ];

  const handleArticlePress = (id) => {
    navigation.navigate('ArticleDetail', { articleId: id });
  };

  const getCategoryColor = (cat) => {
    switch (cat) {
      case 'food': return colors.secondary;
      case 'drug': return colors.primary;
      case 'cosmetics': return colors.warning;
      case 'rights': return '#7C3AED';
      default: return colors.textSecondary;
    }
  };

  const articles = getArticles(selectedCategory);
  
  const filteredArticles = articles.filter((item) => {
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
        activeOpacity={0.88}
        onPress={() => handleArticlePress(item.id)}
      >
        <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
        
        <View style={styles.cardContent}>
          <View style={[styles.badge, { backgroundColor: color + '15' }]}>
            <Text style={[styles.badgeText, { color }]}>{categoryLabel}</Text>
          </View>

          <Text style={styles.title} numberOfLines={2}>{titleText}</Text>
          <Text style={styles.desc} numberOfLines={2}>{descText}</Text>
          
          <View style={styles.cardFooter}>
            <Text style={[styles.readMoreText, { color: colors.secondary }]}>
              {t('safetyEducation.readMore')} →
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={styles.container}>
        
        {/* Search Header Bar */}
        <View style={styles.searchHeader}>
          <View style={styles.inputWrapper}>
            <Ionicons name="search" size={18} color={colors.textSecondary} style={styles.searchIcon} />
            <TextInput
              style={styles.input}
              placeholder={t('safetyEducation.searchPlaceholder')}
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Category Horizontal Filter Strip */}
        <View style={styles.categoriesWrapper}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={categories}
            keyExtractor={(item) => item.key}
            contentContainerStyle={styles.categoriesContent}
            renderItem={({ item }) => {
              const isSelected = selectedCategory === item.key;
              return (
                <TouchableOpacity
                  style={[styles.categoryPill, isSelected && styles.categoryPillActive]}
                  onPress={() => setSelectedCategory(item.key)}
                  activeOpacity={0.8}
                >
                  <Ionicons 
                    name={item.icon} 
                    size={14} 
                    color={isSelected ? '#FFFFFF' : colors.textSecondary} 
                    style={{ marginRight: 5 }}
                  />
                  <Text style={[styles.categoryLabel, isSelected && styles.categoryLabelActive]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        {/* Articles List */}
        <FlatList
          data={filteredArticles}
          keyExtractor={(item) => item.id}
          renderItem={renderArticleCard}
          contentContainerStyle={styles.articlesList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={44} color={colors.textMuted} />
              <Text style={styles.emptyText}>{t('safetyEducation.noResults')}</Text>
            </View>
          }
        />
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
  searchHeader: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 42,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 13.5,
    color: colors.text,
  },
  categoriesWrapper: {
    backgroundColor: colors.surface,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  categoriesContent: {
    paddingHorizontal: spacing.lg,
    gap: 8,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  categoryLabelActive: {
    color: '#FFFFFF',
  },
  articlesList: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  thumbnail: {
    width: '100%',
    height: 140,
    backgroundColor: '#E2E8F0',
  },
  cardContent: {
    padding: spacing.md,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
    marginBottom: 6,
  },
  badgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 14.5,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
    lineHeight: 20,
  },
  desc: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 17,
    marginBottom: spacing.sm,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
    alignItems: 'flex-end',
  },
  readMoreText: {
    fontSize: 12,
    fontWeight: '700',
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 8,
  },
});
