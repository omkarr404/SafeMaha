// FILE NAME: d:\Omkar\Resume-Projects\FDA\screens\NotificationsScreen.js

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  StatusBar
} from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { getNotifications, markAsRead, markAllAsRead } from '../services/notificationService';
import { Ionicons } from '@expo/vector-icons';
import * as authService from '../services/authService';
import CustomButton from '../components/CustomButton';
import { colors, spacing, borderRadius, typography, shadows } from '../constants/theme';

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
    if (text.includes('submitted')) return { name: 'document-text', color: colors.primary };
    if (text.includes('assigned')) return { name: 'person', color: colors.secondary };
    if (text.includes('investigation')) return { name: 'search', color: colors.warning };
    if (text.includes('action')) return { name: 'shield-checkmark', color: colors.success };
    if (text.includes('closed')) return { name: 'checkmark-circle', color: colors.textMuted };
    return { name: 'notifications', color: colors.secondary };
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
        activeOpacity={0.75}
        onPress={() => handleNotificationTap(item)}
      >
        <View style={[styles.iconContainer, { backgroundColor: iconData.color + '15' }]}>
          <Ionicons name={iconData.name} size={20} color={iconData.color} />
        </View>

        <View style={styles.textContainer}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, !item.read && styles.unreadText]}>{titleText}</Text>
            {!item.read && <View style={styles.unreadDot} />}
          </View>
          <Text style={styles.cardDesc} numberOfLines={2}>{descText}</Text>
          <View style={styles.metaRow}>
            <Ionicons name="time-outline" size={12} color={colors.textMuted} style={{ marginRight: 4 }} />
            <Text style={styles.cardDate}>{formattedDate(item.date)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && notifications.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>
            {locale === 'mr' ? 'सूचना लोड होत आहेत...' : 'Loading notifications...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // If no saved mobile, ask user to link number first
  if (!isMobileSaved) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
        <View style={styles.promptContainer}>
          <View style={styles.promptIconBox}>
            <Ionicons name="notifications-off-outline" size={44} color={colors.secondary} />
          </View>
          <Text style={styles.promptTitle}>
            {locale === 'mr' ? 'अद्ययावत सूचना मिळवा' : 'Track Case Notifications'}
          </Text>
          <Text style={styles.promptDesc}>
            {locale === 'mr'
              ? 'आपल्या नोंदणीकृत तक्रारींच्या तपासणी व कारवाईचे थेट अपडेट मिळवण्यासाठी कृपया प्रथम आपला मोबाईल क्रमांक OTP द्वारे पडताळा.'
              : 'To view real-time investigation alerts, officer notes, and milestone updates for your complaints, verify your registered mobile number.'}
          </Text>
          <CustomButton
            title={locale === 'mr' ? 'माझ्या तक्रारी उघडा' : 'Verify Mobile Number'}
            onPress={() => navigation.navigate('MyComplaints')}
            variant="primary"
            style={styles.promptBtn}
          />
        </View>
      </SafeAreaView>
    );
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={styles.container}>
        
        {/* Actions Header bar */}
        <View style={styles.actionHeader}>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>
              {locale === 'mr' 
                ? `एकूण ${notifications.length} सूचना (${unreadCount} नवीन)` 
                : `${notifications.length} Notifications (${unreadCount} unread)`}
            </Text>
          </View>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={handleMarkAllRead} style={styles.readAllBtn}>
              <Ionicons name="checkmark-done" size={16} color={colors.secondary} />
              <Text style={styles.readAllText}>{t('notifications.markAllRead')}</Text>
            </TouchableOpacity>
          )}
        </View>

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
              <View style={styles.emptyIconBox}>
                <Ionicons name="notifications-outline" size={42} color={colors.textMuted} />
              </View>
              <Text style={styles.emptyTitle}>
                {locale === 'mr' ? 'कोणत्याही नवीन सूचना नाहीत' : 'No Notifications'}
              </Text>
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
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.bodySmall.fontSize,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  promptContainer: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.card,
  },
  promptIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  promptTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  promptDesc: {
    fontSize: typography.bodyRegular.fontSize,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.sm,
  },
  promptBtn: {
    width: 240,
  },
  actionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  countBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countText: {
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  readAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: borderRadius.sm,
    backgroundColor: '#EFF6FF',
  },
  readAllText: {
    fontSize: typography.caption.fontSize,
    fontWeight: '700',
    color: colors.secondary,
    marginLeft: 4,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  listScroll: {
    paddingBottom: spacing.xxl,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'flex-start',
    ...shadows.subtle,
  },
  unreadCard: {
    borderColor: '#BFDBFE',
    backgroundColor: '#F8FAFC',
    borderLeftWidth: 4,
    borderLeftColor: colors.secondary,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
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
    fontSize: typography.bodyRegular.fontSize,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    paddingRight: 6,
  },
  unreadText: {
    color: colors.primary,
    fontWeight: '700',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.secondary,
  },
  cardDesc: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardDate: {
    fontSize: typography.caption.fontSize,
    color: colors.textMuted,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl,
    marginTop: 60,
  },
  emptyIconBox: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyTitle: {
    fontSize: typography.h4.fontSize,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  emptyText: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: '400',
  },
});
