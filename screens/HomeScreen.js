// FILE NAME: d:\Omkar\Water\FDA\screens\HomeScreen.js

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar, 
  ScrollView, 
  Image, 
  Dimensions 
} from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getNotifications } from '../services/notificationService';
import { colors, spacing, borderRadius, shadows } from '../constants/theme';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const { t, locale } = useLanguage();
  const isFocused = useIsFocused();
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    async function loadUnreadCount() {
      try {
        const savedMobile = await AsyncStorage.getItem('@safemaha_saved_mobile');
        if (savedMobile) {
          const list = await getNotifications(savedMobile);
          const unread = list.filter((n) => !n.read).length;
          setUnreadNotifications(unread);
        } else {
          setUnreadNotifications(0);
        }
      } catch (err) {
        console.log('Error checking unread notifications:', err);
      }
    }

    if (isFocused) {
      loadUnreadCount();
    }
  }, [isFocused]);

  const handleCardPress = (targetScreen) => {
    navigation.navigate(targetScreen);
  };

  const serviceCards = [
    {
      id: 'file',
      title: t('home.cards.fileComplaint.title'),
      desc: t('home.cards.fileComplaint.desc'),
      icon: 'document-text-outline',
      highlight: true,
      screen: 'ComplaintForm',
    },
    {
      id: 'track',
      title: t('home.cards.trackComplaint.title'),
      desc: t('home.cards.trackComplaint.desc'),
      icon: 'search-outline',
      screen: 'TrackComplaint',
    },
    {
      id: 'my-complaints',
      title: t('home.cards.myComplaints.title'),
      desc: t('home.cards.myComplaints.desc'),
      icon: 'folder-open-outline',
      screen: 'MyComplaints',
    },
    {
      id: 'education',
      title: t('home.cards.safetyEducation.title'),
      desc: t('home.cards.safetyEducation.desc'),
      icon: 'shield-checkmark-outline',
      screen: 'SafetyEducation',
    },
    {
      id: 'profile',
      title: t('profile.headerTitle'),
      desc: locale === 'mr' ? 'आपले प्रोफाईल व तक्रारींची आकडेवारी.' : 'Profile details & complaint metrics.',
      icon: 'person-circle-outline',
      screen: 'CitizenProfile',
    },
    {
      id: 'faq',
      title: t('home.cards.faqs.title'),
      desc: t('home.cards.faqs.desc'),
      icon: 'help-circle-outline',
      screen: 'FAQ',
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      {/* Top Government Strip */}
      <View style={styles.govStrip}>
        <Text style={styles.govStripText}>
          {locale === 'mr' 
            ? 'महाराष्ट्र शासन • अन्न व औषध प्रशासन' 
            : 'GOVT. OF MAHARASHTRA • FOOD & DRUG ADMINISTRATION'}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* Executive Government Header Banner */}
        <View style={styles.banner}>
          <View style={styles.bannerTopRow}>
            <View style={styles.brandRow}>
              <View style={styles.logoWrap}>
                <Image 
                  source={require('../assets/logo-2.png')} 
                  style={styles.fdaLogo} 
                />
              </View>
              <View>
                <Text style={styles.bannerTitle}>SafeMaha</Text>
                <Text style={styles.bannerSubtitle}>
                  {locale === 'mr' ? 'नागरिक सुरक्षा व तक्रार निवारण पोर्टल' : 'Citizen Safety & Grievance Portal'}
                </Text>
              </View>
            </View>

            {/* Notification Bell */}
            <TouchableOpacity 
              style={styles.notifButton} 
              onPress={() => navigation.navigate('Notifications')}
              activeOpacity={0.8}
            >
              <Ionicons name="notifications-outline" size={20} color="#FFFFFF" />
              {unreadNotifications > 0 && (
                <View style={styles.bellBadge}>
                  <Text style={styles.bellBadgeText}>{unreadNotifications}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Quick Primary Call to Action */}
          <View style={styles.heroActionCard}>
            <View style={{ flex: 1, paddingRight: spacing.md }}>
              <Text style={styles.heroActionTitle}>
                {locale === 'mr' ? 'असुरक्षित अन्न किंवा औषधाची तक्रार नोंदवा' : 'Report Unsafe Food or Medicine'}
              </Text>
              <Text style={styles.heroActionSub}>
                {locale === 'mr' 
                  ? 'अन्न भेसळ, बनावट औषधे व कॉस्मेटिक्सवर थेट एफडीए कारवाई.'
                  : 'Fast investigation & sampling by Maharashtra FDA officers.'}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.heroButton}
              onPress={() => navigation.navigate('ComplaintForm')}
              activeOpacity={0.85}
            >
              <Text style={styles.heroButtonText}>
                {locale === 'mr' ? 'तक्रार करा' : 'File Now'}
              </Text>
              <Ionicons name="arrow-forward" size={14} color="#FFFFFF" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Emergency Helplines Strip */}
        <View style={styles.helplineBar}>
          <View style={styles.helplineItem}>
            <Ionicons name="call" size={14} color={colors.secondary} />
            <Text style={styles.helplineText}>FDA Toll-Free: <strong>1800-222-365</strong></Text>
          </View>
          <View style={styles.helplineDivider} />
          <View style={styles.helplineItem}>
            <Ionicons name="shield" size={14} color={colors.success} />
            <Text style={styles.helplineText}>NCH: <strong>1915</strong></Text>
          </View>
        </View>

        {/* Main Services Grid */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeadingRow}>
            <Text style={styles.sectionHeading}>
              {locale === 'mr' ? 'नागरिक सेवा केंद्र' : 'Citizen Services'}
            </Text>
            <Text style={styles.sectionSub}>
              {locale === 'mr' ? 'अधिकृत सेवा निवडा' : 'Select an official service'}
            </Text>
          </View>
          
          <View style={styles.gridContainer}>
            {serviceCards.map((card) => (
              <TouchableOpacity
                key={card.id}
                style={[
                  styles.card,
                  card.highlight && styles.highlightedCard,
                ]}
                activeOpacity={0.85}
                onPress={() => handleCardPress(card.screen)}
              >
                <View style={styles.cardHeader}>
                  <View style={[
                    styles.iconWrapper, 
                    card.highlight ? styles.iconWrapperHighlighted : styles.iconWrapperNormal
                  ]}>
                    <Ionicons 
                      name={card.icon} 
                      size={22} 
                      color={card.highlight ? colors.secondary : colors.primary} 
                    />
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                </View>
                <Text style={styles.cardTitle}>{card.title}</Text>
                <Text style={styles.cardDesc} numberOfLines={2}>{card.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Official Public Safety Advisory Banner */}
        <View style={styles.advisoryCard}>
          <View style={styles.advisoryHeader}>
            <Ionicons name="alert-circle" size={18} color={colors.warning} />
            <Text style={styles.advisoryTitle}>
              {locale === 'mr' ? 'अधिकृत सुरक्षा सूचना' : 'Official FDA Public Advisory'}
            </Text>
          </View>
          <Text style={styles.advisoryText}>
            {locale === 'mr' 
              ? 'औषधे खरेदी करताना नेहमी वैध जीएसटी बिल आणि औषध परवाना क्रमांक तपासा. कालबाह्य औषधे विकणे हा दंडनीय गुन्हा आहे.'
              : 'Always demand a valid invoice with license details when purchasing medicines. Selling expired or unscratched drugs is a punishable offense under Drugs & Cosmetics Act.'}
          </Text>
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
  govStrip: {
    backgroundColor: colors.primaryDark,
    paddingVertical: 5,
    alignItems: 'center',
    width: '100%',
  },
  govStripText: {
    color: '#CBD5E1',
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 1,
  },
  scrollContainer: {
    paddingBottom: spacing.xxl,
  },
  banner: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  bannerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  logoWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fdaLogo: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  bannerSubtitle: {
    fontSize: 11,
    color: '#CBD5E1',
    fontWeight: '500',
  },
  notifButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  bellBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: colors.critical,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  bellBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  heroActionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroActionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  heroActionSub: {
    fontSize: 11,
    color: '#CBD5E1',
    lineHeight: 15,
  },
  heroButton: {
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  helplineBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    marginTop: -spacing.sm,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'space-around',
    ...shadows.sm,
  },
  helplineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  helplineText: {
    fontSize: 11,
    color: colors.text,
  },
  helplineDivider: {
    width: 1,
    height: 16,
    backgroundColor: colors.border,
  },
  sectionContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  sectionHeadingRow: {
    marginBottom: spacing.md,
  },
  sectionHeading: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  sectionSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    width: (width - 48 - 12) / 2,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
    minHeight: 125,
    justifyContent: 'space-between',
  },
  highlightedCard: {
    borderColor: 'rgba(37, 99, 235, 0.3)',
    backgroundColor: '#FAFBFD',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  iconWrapper: {
    width: 38,
    height: 38,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapperNormal: {
    backgroundColor: '#F1F5F9',
  },
  iconWrapperHighlighted: {
    backgroundColor: colors.infoBg,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  cardDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 15,
  },
  advisoryCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  advisoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  advisoryTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400E',
  },
  advisoryText: {
    fontSize: 11.5,
    color: '#78350F',
    lineHeight: 16,
  },
});
