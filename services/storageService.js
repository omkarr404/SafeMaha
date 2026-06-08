// FILE NAME: d:\Omkar\Water\FDA\services\storageService.js

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const COMPLAINTS_KEY = '@safemaha_complaints';
const MOCK_SERVER_PORT = 8000;

// Android emulator maps the host machine loopback to 10.0.2.2
const getApiUrl = () => {
  const host = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
  return `http://${host}:${MOCK_SERVER_PORT}`;
};

export const API_URL = getApiUrl();

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
 * Retrieve all complaints, syncing from mock server if online.
 * @returns {Promise<Array>} List of all complaint objects, sorted newest first.
 */
export const getAllComplaints = async () => {
  try {
    // Try to fetch from mock server
    try {
      const res = await fetchWithTimeout(`${API_URL}/api/complaints`);
      if (res.ok) {
        const complaints = await res.json();
        // Sync local storage
        await AsyncStorage.setItem(COMPLAINTS_KEY, JSON.stringify(complaints));
        return complaints.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
    } catch (apiError) {
      // Server is offline, fall back silently to AsyncStorage
    }

    const rawData = await AsyncStorage.getItem(COMPLAINTS_KEY);
    if (!rawData) {
      return [];
    }
    const complaints = JSON.parse(rawData);
    return complaints.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (error) {
    console.error('Error in getAllComplaints:', error);
    return [];
  }
};

/**
 * Retrieve a specific complaint by its unique ID.
 * @param {string} id Unique complaint ID
 * @returns {Promise<object|null>} Complaint object if found, else null.
 */
export const getComplaint = async (id) => {
  try {
    // Try mock server first
    try {
      const res = await fetchWithTimeout(`${API_URL}/api/complaints/${id}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (apiError) {
      // Fallback to local
    }

    const complaints = await getAllComplaints();
    const found = complaints.find((item) => item.id === id);
    return found || null;
  } catch (error) {
    console.error(`Error in getComplaint for ID ${id}:`, error);
    return null;
  }
};

/**
 * Save a new complaint or update an existing one.
 * @param {object} newComplaint The complaint object to save
 * @returns {Promise<boolean>} True if successful, false otherwise.
 */
export const saveComplaint = async (newComplaint) => {
  try {
    // 1. Save locally to AsyncStorage immediately to ensure offline reliability
    const complaints = await getAllComplaints();
    const existingIndex = complaints.findIndex((item) => item.id === newComplaint.id);
    
    if (existingIndex > -1) {
      complaints[existingIndex] = newComplaint;
    } else {
      complaints.push(newComplaint);
    }
    await AsyncStorage.setItem(COMPLAINTS_KEY, JSON.stringify(complaints));

    // 2. Sync to mock server
    try {
      const res = await fetchWithTimeout(`${API_URL}/api/complaints`, {
        method: 'POST',
        body: JSON.stringify(newComplaint),
      });
      if (res.ok) {
        return true;
      }
    } catch (apiError) {
      // Saved locally, will sync later or is offline-first
    }

    return true;
  } catch (error) {
    console.error('Error in saveComplaint:', error);
    return false;
  }
};

/**
 * Reset all complaints in storage (useful for development/testing).
 */
export const clearAllComplaints = async () => {
  try {
    await AsyncStorage.removeItem(COMPLAINTS_KEY);
    
    try {
      await fetchWithTimeout(`${API_URL}/api/clear`, {
        method: 'DELETE',
      });
    } catch (apiError) {
      // Silently ignore server clearing failures
    }
    
    return true;
  } catch (error) {
    console.error('Error clearing complaints:', error);
    return false;
  }
};

