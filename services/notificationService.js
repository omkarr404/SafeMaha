// FILE NAME: d:\Omkar\Water\FDA\services\notificationService.js

import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from './storageService';

const NOTIFICATIONS_KEY = '@safemaha_notifications';

// Helper to make fetch requests with a timeout
const fetchWithTimeout = async (url, options = {}, timeoutMs = 1500) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

/**
 * Get all notifications for the saved mobile number.
 * @param {string} mobile Citizen mobile number
 * @returns {Promise<Array>} Notifications list
 */
export const getNotifications = async (mobile) => {
  try {
    // Try to fetch from server if mobile is provided
    if (mobile) {
      try {
        const res = await fetchWithTimeout(`${API_URL}/api/notifications?mobile=${mobile}`);
        if (res.ok) {
          const serverNotifs = await res.json();
          // Sync locally
          await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(serverNotifs));
          return serverNotifs;
        }
      } catch (apiError) {
        // Fallback to local AsyncStorage
      }
    }

    const rawData = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
    if (!rawData) return [];
    
    let localNotifs = JSON.parse(rawData);
    if (mobile) {
      localNotifs = localNotifs.filter(n => n.mobile === mobile);
    }
    return localNotifs;
  } catch (error) {
    console.error('Error getting notifications:', error);
    return [];
  }
};

/**
 * Create a new notification (useful for submission events generated on device).
 * @param {object} param0 Notification fields
 */
export const createNotification = async ({ complaintId, title, description, mobile }) => {
  try {
    const newNotif = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      complaintId,
      mobile: mobile || '',
      title: typeof title === 'object' ? title : { en: title, mr: title },
      description: typeof description === 'object' ? description : { en: description, mr: description },
      date: new Date().toISOString(),
      read: false
    };

    // Save locally
    const rawData = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
    const localNotifs = rawData ? JSON.parse(rawData) : [];
    localNotifs.unshift(newNotif);
    await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(localNotifs));

    // Try syncing to server
    try {
      await fetchWithTimeout(`${API_URL}/api/notifications`, {
        method: 'POST',
        body: JSON.stringify(newNotif),
      });
    } catch (apiError) {
      // Standalone mode, saved locally
    }

    return newNotif;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

/**
 * Mark a single notification as read.
 * @param {string} id Notification ID
 */
export const markAsRead = async (id) => {
  try {
    // Save locally
    const rawData = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
    if (rawData) {
      const localNotifs = JSON.parse(rawData);
      const index = localNotifs.findIndex(n => n.id === id);
      if (index > -1) {
        localNotifs[index].read = true;
        await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(localNotifs));
      }
    }

    // Try server update
    try {
      await fetchWithTimeout(`${API_URL}/api/notifications/${id}/read`, {
        method: 'PUT',
      });
    } catch (apiError) {
      // Safe to ignore
    }

    return true;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
};

/**
 * Mark all notifications as read for a citizen number.
 * @param {string} mobile Mobile number
 */
export const markAllAsRead = async (mobile) => {
  try {
    // Local update
    const rawData = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
    if (rawData) {
      const localNotifs = JSON.parse(rawData);
      const updated = localNotifs.map(n => {
        if (!mobile || n.mobile === mobile) {
          n.read = true;
        }
        return n;
      });
      await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
    }

    // Server update
    try {
      const query = mobile ? `?mobile=${mobile}` : '';
      await fetchWithTimeout(`${API_URL}/api/notifications/read-all${query}`, {
        method: 'PUT',
      });
    } catch (apiError) {
      // Safe to ignore
    }

    return true;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return false;
  }
};
