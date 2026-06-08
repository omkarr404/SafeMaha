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
  Alert,
  Dimensions
} from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getNotifications } from '../services/notificationService';

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
          const unread = list.filter(n => !n.read).length;
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

  const featureCards = [
    {
      id: 'file',
      title: t('home.cards.fileComplaint.title'),
      desc: t('home.cards.fileComplaint.desc'),
      icon: 'document-text-outline',
      color: '#38ADA9', // Accent Teal
      screen: 'ComplaintForm'
    },
    {
      id: 'track',
      title: t('home.cards.trackComplaint.title'),
      desc: t('home.cards.trackComplaint.desc'),
      icon: 'time-outline',
      color: '#3C6382', // Secondary Blue
      screen: 'TrackComplaint'
    },
    {
      id: 'my-complaints',
      title: t('home.cards.myComplaints.title'),
      desc: t('home.cards.myComplaints.desc'),
      icon: 'folder-open-outline',
      color: '#0A3D62', // Primary Blue
      screen: 'MyComplaints'
    },
    {
      id: 'education',
      title: t('home.cards.safetyEducation.title'),
      desc: t('home.cards.safetyEducation.desc'),
      icon: 'book-outline',
      color: '#E58E26', // Warning Gold
      screen: 'SafetyEducation'
    },
    {
      id: 'faq',
      title: t('home.cards.faqs.title'),
      desc: t('home.cards.faqs.desc'),
      icon: 'help-circle-outline',
      color: '#82589F', // Help Purple
      screen: 'FAQ'
    },
    {
      id: 'notifications',
      title: t('home.cards.notifications.title'),
      desc: t('home.cards.notifications.desc'),
      icon: 'notifications-outline',
      color: '#EF4444', // Alert Red
      screen: 'Notifications',
      badge: unreadNotifications
    },
    {
      id: 'profile',
      title: t('profile.headerTitle'),
      desc: locale === 'mr' ? 'आपले प्रोफाईल तपशील आणि तक्रारींची आकडेवारी पहा.' : 'View your profile details and complaint statistics.',
      icon: 'person-outline',
      color: '#0D9488',
      screen: 'CitizenProfile'
    }
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0A3D62" />
      
      {/* Top Government Strip */}
      <View style={styles.govStrip}>
        <Text style={styles.govStripText}>
          {locale === 'mr' ? 'महाराष्ट्र शासन • अन्न व औषध प्रशासन' : 'GOVT. OF MAHARASHTRA • FOOD & DRUG ADMINISTRATION'}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* Welcome Banner */}
        <View style={styles.banner}>
          <View style={styles.bannerHeader}>
            <Image 
              source={require('../assets/logo-2.png')} 
              style={styles.fdaLogo} 
            />
            <View style={styles.titleContainer}>
              <Text style={styles.bannerTitle}>{t('common.appName')}</Text>
              <Text style={styles.bannerSubtitle}>
                {locale === 'mr' ? 'महाराष्ट्र ग्राहक सुरक्षा पोर्टल' : 'Maharashtra Consumer Safety'}
              </Text>
            </View>
          </View>
          <Text style={styles.welcomeMsg}>{t('home.welcomeTitle')}</Text>
          <Text style={styles.welcomeSub}>{t('home.welcomeSub')}</Text>
        </View>

        {/* Features Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeading}>{t('home.sectionTitle')}</Text>
          
          <View style={styles.gridContainer}>
            {featureCards.map((card) => (
              <TouchableOpacity
                key={card.id}
                style={styles.card}
                activeOpacity={0.9}
                onPress={() => handleCardPress(card.screen)}
              >
                <View style={styles.cardHeader}>
                  <View style={[styles.iconWrapper, { backgroundColor: card.color + '15' }]}>
                    <Ionicons name={card.icon} size={28} color={card.color} />
                  </View>
                  {card.badge > 0 && (
                    <View style={styles.badgeContainer}>
                      <Text style={styles.badgeText}>{card.badge}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.cardTitle}>{card.title}</Text>
                <Text style={styles.cardDesc} numberOfLines={3}>{card.desc}</Text>
                
                {/* Footer action arrow */}
                <View style={styles.cardFooter}>
                  <Text style={[styles.actionText, { color: '#0A3D62' }]}>
                    {locale === 'mr' ? 'उघडा' : 'Open'} →
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Live Safety Advisory Alert Banner (Static Mock) */}
        <View style={styles.advisoryCard}>
          <View style={styles.advisoryHeader}>
            <Ionicons name="warning" size={20} color="#E58E26" />
            <Text style={styles.advisoryTitle}>
              {locale === 'mr' ? 'नवीनतम सुरक्षा सूचना' : 'Latest Safety Advisory'}
            </Text>
          </View>
          <Text style={styles.advisoryText}>
            {locale === 'mr' 
              ? 'बनावट सौंदर्यप्रसाधने आणि कालबाह्य औषधांविषयी दक्ष रहा. खरेदी करताना नेहमी वैध परवाना तपासा.'
              : 'Be vigilant against counterfeit cosmetics and expired drugs. Always verify the license number on medical purchases.'}
          </Text>
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
  govStrip: {
    backgroundColor: '#07263E',
    paddingVertical: 6,
    alignItems: 'center',
    width: '100%',
  },
  govStripText: {
    color: '#D1D8E0',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  scrollContainer: {
    paddingBottom: 30,
  },
  banner: {
    backgroundColor: '#0A3D62',
    padding: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  bannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  fdaLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    marginRight: 14,
  },
  titleContainer: {
    justifyContent: 'center',
  },
  bannerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  bannerSubtitle: {
    fontSize: 13,
    color: '#38ADA9',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  welcomeMsg: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  welcomeSub: {
    fontSize: 14,
    color: '#E2E8F0',
    lineHeight: 20,
    opacity: 0.9,
  },
  sectionContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0A3D62',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    width: (width - 52) / 2, // Responsive grid card widths
    marginBottom: 16,
    shadowColor: '#0A3D62',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 3,
    justifyContent: 'space-between',
    minHeight: 180,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconWrapper: {
    width: 46,
    height: 46,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeContainer: {
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0A3D62',
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 15,
    flex: 1,
  },
  cardFooter: {
    marginTop: 10,
    alignItems: 'flex-start',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '700',
  },
  advisoryCard: {
    backgroundColor: '#FFF9EB',
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#FFE0A3',
  },
  advisoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  advisoryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#B7791F',
    marginLeft: 8,
  },
  advisoryText: {
    fontSize: 12,
    color: '#744210',
    lineHeight: 18,
  },
});
