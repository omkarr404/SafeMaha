// FILE NAME: d:\Omkar\Water\FDA\screens\ArticleDetailScreen.js

import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  Image, 
  ActivityIndicator, 
  StatusBar,
  Dimensions
} from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { getArticleById } from '../services/articleService';
import { Ionicons } from '@expo/vector-icons';
import CustomButton from '../components/CustomButton';

const { width } = Dimensions.get('window');

export default function ArticleDetailScreen({ route, navigation }) {
  const { locale, t } = useLanguage();
  const { articleId } = route.params || { articleId: null };
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (articleId) {
      const data = getArticleById(articleId);
      setArticle(data);
    }
    setLoading(false);
  }, [articleId]);

  const getCategoryColor = (cat) => {
    switch (cat) {
      case 'food': return '#38ADA9';
      case 'drug': return '#0A3D62';
      case 'cosmetics': return '#E58E26';
      case 'rights': return '#82589F';
      default: return '#64748B';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0A3D62" />
      </View>
    );
  }

  if (!article) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
        <Text style={styles.errorText}>
          {locale === 'mr' ? 'लेख आढळला नाही!' : 'Article not found!'}
        </Text>
        <CustomButton
          title={locale === 'mr' ? 'मागे जा' : 'Go Back'}
          onPress={() => navigation.goBack()}
          style={styles.errorBtn}
        />
      </View>
    );
  }

  const titleText = article.title[locale] || article.title['en'];
  const contentBlocks = article.content[locale] || article.content['en'];
  const categoryLabel = t(`safetyEducation.categories.${article.category}`);
  const color = getCategoryColor(article.category);

  // Custom block rendering component
  const renderBlock = (block, index) => {
    switch (block.type) {
      case 'heading':
        return (
          <View key={index} style={styles.headingWrapper}>
            <View style={[styles.accentLine, { backgroundColor: color }]} />
            <Text style={styles.headingBlock}>{block.text}</Text>
          </View>
        );
      case 'paragraph':
        return (
          <Text key={index} style={styles.paragraphBlock}>
            {block.text}
          </Text>
        );
      case 'bullet':
        return (
          <View key={index} style={styles.bulletRow}>
            <Ionicons name="checkmark-circle" size={18} color={color} style={styles.bulletIcon} />
            <Text style={styles.bulletText}>{block.text}</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* Banner Display */}
        <Image source={{ uri: article.banner }} style={styles.bannerImage} />
        
        {/* Article Details Container */}
        <View style={styles.contentCard}>
          <View style={styles.headerInfo}>
            <View style={[styles.categoryBadge, { backgroundColor: color + '15' }]}>
              <Text style={[styles.categoryBadgeText, { color }]}>{categoryLabel}</Text>
            </View>
            <Text style={styles.dateText}>
              {t('safetyEducation.publishedOn')}: {locale === 'mr' ? '६ जून, २०२६' : 'June 6, 2026'}
            </Text>
          </View>

          <Text style={styles.titleText}>{titleText}</Text>

          <View style={styles.divider} />

          {/* Render content blocks */}
          <View style={styles.bodyContainer}>
            {contentBlocks.map((block, index) => renderBlock(block, index))}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 16,
    marginBottom: 24,
  },
  errorBtn: {
    width: 150,
  },
  scrollContainer: {
    paddingBottom: 30,
  },
  bannerImage: {
    width: width,
    height: 220,
    resizeMode: 'cover',
  },
  contentCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
    minHeight: 400,
  },
  headerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  categoryBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  dateText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  titleText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0A3D62',
    lineHeight: 30,
    marginBottom: 16,
  },
  divider: {
    height: 1.5,
    backgroundColor: '#F1F5F9',
    marginBottom: 18,
  },
  bodyContainer: {
    width: '100%',
  },
  headingWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 12,
  },
  accentLine: {
    width: 4,
    height: '80%',
    borderRadius: 2,
    marginRight: 10,
  },
  headingBlock: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
  },
  paragraphBlock: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
    fontWeight: '500',
    marginBottom: 14,
    textAlign: 'justify',
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    paddingLeft: 4,
  },
  bulletIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  bulletText: {
    fontSize: 13,
    color: '#334155',
    flex: 1,
    lineHeight: 20,
    fontWeight: '600',
  },
});
