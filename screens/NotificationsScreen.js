// FILE NAME: d:\Omkar\Water\FDA\screens\NotificationsScreen.js

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  StatusBar
} from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { getNotifications, markAsRead, markAllAsRead } from '../services/notificationService';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as authService from '../services/authService';

const SAVED_MOBILE_KEY = '@safemaha_saved_mobile';

export default function NotificationsScreen({ navigation }) {
  const { t, locale } = useLanguage();
  const [mobileNumber, setMobileNumber] = useState('');
  const [isMobileSaved, setIsMobileSaved] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMobileAndNotifications();
  }, []);

  const loadMobileAndNotifications = async () => {
    setLoading(true);
    try {
      const isAuth = await authService.isAuthenticated();
      const savedMobile = await authService.getCurrentUserPhone();
      
      if (isAuth && savedMobile) {
        setMobileNumber(savedMobile);
        setIsMobileSaved(true);
        const list = await getNotifications(savedMobile);
        setNotifications(list);
      } else {
        setIsMobileSaved(false);
      }
    } catch (e) {
      console.log('Error loading notifications:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    if (notifications.length === 0) return;
    setLoading(true);
    try {
      await markAllAsRead(mobileNumber);
      // Reload
      const list = await getNotifications(mobileNumber);
      setNotifications(list);
    } catch (e) {
      console.log('Error marking all as read:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationTap = async (item) => {
    if (!item.read) {
      await markAsRead(item.id);
      // Update local state
      setNotifications(prev => 
        prev.map(n => n.id === item.id ? { ...n, read: true } : n)
      );
    }
    
    if (item.complaintId) {
      navigation.navigate('ComplaintStatus', { complaintId: item.complaintId });
    }
  };

  const getNotificationIcon = (title) => {
    const text = (title.en || '').toLowerCase();
    if (text.includes('submitted')) return { name: 'document-text', color: '#3C6382' };
    if (text.includes('assigned')) return { name: 'person', color: '#0A3D62' };
    if (text.includes('investigation')) return { name: 'search', color: '#E58E26' };
    if (text.includes('action')) return { name: 'shield-checkmark', color: '#38ADA9' };
    if (text.includes('closed')) return { name: 'checkmark-circle', color: '#888888' };
    return { name: 'notifications', color: '#0A3D62' };
  };

  const formattedDate = (isoString) => {
    return new Date(isoString).toLocaleDateString(
      locale === 'mr' ? 'mr-IN' : 'en-US',
      { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
    );
  };

  const renderNotifItem = ({ item }) => {
    const iconData = getNotificationIcon(item.title);
    const titleText = item.title[locale] || item.title['en'];
    const descText = item.description[locale] || item.description['en'];

    return (
      <TouchableOpacity 
        style={[styles.card, !item.read && styles.unreadCard]} 
        activeOpacity={0.8}
        onPress={() => handleNotificationTap(item)}
      >
        <View style={[styles.iconContainer, { backgroundColor: iconData.color + '10' }]}>
          <Ionicons name={iconData.name} size={22} color={iconData.color} />
        </View>

        <View style={styles.textContainer}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, !item.read && styles.unreadText]}>{titleText}</Text>
            {!item.read && <View style={styles.unreadDot} />}
          </View>
          <Text style={styles.cardDesc} numberOfLines={2}>{descText}</Text>
          <Text style={styles.cardDate}>{formattedDate(item.date)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && notifications.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0A3D62" />
        </View>
      </SafeAreaView>
    );
  }

  // If no saved mobile, ask user to link number first
  if (!isMobileSaved) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.promptContainer}>
          <Ionicons name="notifications-off-outline" size={80} color="#CBD5E1" style={styles.promptIcon} />
          <Text style={styles.promptTitle}>
            {locale === 'mr' ? 'सूचना मिळवा' : 'Get Live Updates'}
          </Text>
          <Text style={styles.promptDesc}>
            {locale === 'mr'
              ? 'तुमच्या तक्रारींच्या प्रगतीचे त्वरित इशारे मिळवण्यासाठी कृपया तुमच्या तक्रारीशी लिंक केलेला मोबाईल क्रमांक पडताळणी करा.'
              : 'Please verify your mobile number on the My Complaints tab first to view push alerts and status updates linked to your filings.'}
          </Text>
          <CustomButton
            title={locale === 'mr' ? 'माझ्या तक्रारी उघडा' : 'Open My Complaints'}
            onPress={() => navigation.navigate('MyComplaints')}
            style={styles.promptBtn}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.container}>
        
        {/* Actions Header bar */}
        {notifications.length > 0 && (
          <View style={styles.actionHeader}>
            <Text style={styles.countText}>
              {locale === 'mr' ? `एकूण ${notifications.length} सूचना` : `${notifications.length} notifications`}
            </Text>
            <TouchableOpacity onPress={handleMarkAllRead} style={styles.readAllBtn}>
              <Ionicons name="checkmark-done" size={16} color="#38ADA9" />
              <Text style={styles.readAllText}>{t('notifications.markAllRead')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Notifications list */}
        <View style={styles.listContainer}>
          {notifications.length > 0 ? (
            <FlatList
              data={notifications}
              keyExtractor={(item) => item.id}
              renderItem={renderNotifItem}
              contentContainerStyle={styles.listScroll}
              showsVerticalScrollIndicator={false}
              refreshing={loading}
              onRefresh={loadMobileAndNotifications}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="notifications-outline" size={60} color="#CBD5E1" />
              <Text style={styles.emptyText}>{t('notifications.emptyState')}</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  promptContainer: {
    flex: 1,
    padding: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  promptIcon: {
    marginBottom: 20,
  },
  promptTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0A3D62',
    marginBottom: 10,
  },
  promptDesc: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  promptBtn: {
    width: 220,
  },
  actionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
  },
  countText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  readAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  readAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#38ADA9',
    marginLeft: 4,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  listScroll: {
    paddingBottom: 20,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'flex-start',
    shadowColor: '#0A3D62',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.01,
    shadowRadius: 3,
    elevation: 1.5,
  },
  unreadCard: {
    borderColor: '#D0E2EF',
    backgroundColor: '#F3F8FC',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    flex: 1,
    paddingRight: 6,
  },
  unreadText: {
    color: '#0A3D62',
    fontWeight: '800',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#38ADA9',
  },
  cardDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
    marginBottom: 6,
  },
  cardDate: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
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
