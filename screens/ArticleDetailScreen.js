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
  TouchableOpacity
} from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { getArticleById } from '../services/articleService';
import { Ionicons } from '@expo/vector-icons';
import CustomButton from '../components/CustomButton';
import { colors, spacing, borderRadius, shadows } from '../constants/theme';

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
      case 'food': return colors.secondary;
      case 'drug': return colors.primary;
      case 'cosmetics': return colors.warning;
      case 'rights': return '#7C3AED';
      default: return colors.textSecondary;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!article) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={56} color={colors.critical} />
        <Text style={styles.errorText}>
          {locale === 'mr' ? 'लेख आढळला नाही!' : 'Advisory Article Not Found'}
        </Text>
        <CustomButton
          title={locale === 'mr' ? 'मागे जा' : 'Return to Education Hub'}
          onPress={() => navigation.goBack()}
          variant="outline"
          style={{ width: 200, marginTop: 16 }}
        />
      </View>
    );
  }

  const titleText = article.title[locale] || article.title['en'];
  const contentBlocks = article.content[locale] || article.content['en'];
  const categoryLabel = t(`safetyEducation.categories.${article.category}`);
  const color = getCategoryColor(article.category);

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
            <Ionicons name="checkmark-circle" size={16} color={color} style={styles.bulletIcon} />
            <Text style={styles.bulletText}>{block.text}</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* Hero Cover Image */}
        {article.thumbnail && (
          <Image source={{ uri: article.thumbnail }} style={styles.heroImage} />
        )}

        <View style={styles.contentWrap}>
          {/* Category Chip */}
          <View style={[styles.badge, { backgroundColor: color + '15' }]}>
            <Text style={[styles.badgeText, { color }]}>{categoryLabel}</Text>
          </View>

          {/* Article Title */}
          <Text style={styles.articleTitle}>{titleText}</Text>
          
          <View style={styles.divider} />

          {/* Dynamic Content Blocks */}
          <View style={styles.blocksContainer}>
            {contentBlocks.map((block, idx) => renderBlock(block, idx))}
          </View>

          {/* Official FDA Advice Footer */}
          <View style={styles.fdaNoticeCard}>
            <Ionicons name="shield-checkmark" size={20} color={colors.primary} style={{ marginRight: 8, marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.noticeTitle}>Food & Drug Administration Notice</Text>
              <Text style={styles.noticeDesc}>
                {locale === 'mr' 
                  ? 'अन्न अथवा औषधातील संशयास्पद भेसळ आढळल्यास त्वरित सेफमहा अ‍ॅपवर तक्रार नोंदवा किंवा टोल-फ्री क्रमांक 1800-222-365 वर संपर्क साधा.'
                  : 'If you suspect food adulteration or spurious medicines, report immediately through SafeMaha or call toll-free 1800-222-365.'}
              </Text>
            </View>
          </View>

          <View style={{ marginTop: spacing.lg }}>
            <CustomButton
              title={locale === 'mr' ? 'या विषयावर तक्रार नोंदवा' : 'Report Issue on this Topic'}
              onPress={() => navigation.navigate('ComplaintForm')}
              variant="primary"
              icon={<Ionicons name="alert-circle-outline" size={18} color="#FFFFFF" />}
            />
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    paddingBottom: spacing.xxxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.md,
  },
  heroImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#E2E8F0',
  },
  contentWrap: {
    padding: spacing.lg,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xs,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  articleTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    lineHeight: 26,
    marginTop: 2,
    marginBottom: spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  blocksContainer: {
    gap: spacing.md,
  },
  headingWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: spacing.sm,
  },
  accentLine: {
    width: 3.5,
    height: 18,
    borderRadius: 2,
  },
  headingBlock: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  paragraphBlock: {
    fontSize: 13.5,
    color: colors.text,
    lineHeight: 20,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bulletIcon: {
    marginTop: 2,
  },
  bulletText: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
    lineHeight: 19,
  },
  fdaNoticeCard: {
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: spacing.xl,
  },
  noticeTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 2,
  },
  noticeDesc: {
    fontSize: 11.5,
    color: colors.text,
    lineHeight: 16,
  },
});
