// FILE NAME: d:\Omkar\Water\FDA\services\authService.js

import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const JWT_TOKEN_KEY = '@safemaha_jwt_token';
export const USER_PHONE_KEY = '@safemaha_phone';

/**
 * Request OTP for citizen verification.
 * @param {string} phone Number to verify
 */
export const requestOTP = async (phone) => {
  try {
    const response = await api.post('/api/auth/request-otp', { phone_number: phone });
    return response.data;
  } catch (error) {
    console.error('Error requesting OTP:', error.response?.data || error.message);
    throw new Error(error.response?.data?.detail || 'Failed to send OTP.');
  }
};

/**
 * Verify OTP code and retrieve access token.
 * Stores token and user number in AsyncStorage.
 * @param {string} phone Number verified
 * @param {string} code OTP verification code
 */
export const verifyOTP = async (phone, code) => {
  try {
    const response = await api.post('/api/auth/verify-otp', {
      phone_number: phone,
      code: code,
    });
    
    const { access_token, phone_number } = response.data;
    
    // Persist JWT and active profile number
    await AsyncStorage.setItem(JWT_TOKEN_KEY, access_token);
    await AsyncStorage.setItem(USER_PHONE_KEY, phone_number);
    
    return response.data;
  } catch (error) {
    console.error('Error verifying OTP:', error.response?.data || error.message);
    throw new Error(error.response?.data?.detail || 'Invalid verification code.');
  }
};

/**
 * Terminate citizen authentication session.
 */
export const logout = async () => {
  try {
    await AsyncStorage.removeItem(JWT_TOKEN_KEY);
    await AsyncStorage.removeItem(USER_PHONE_KEY);
    return true;
  } catch (e) {
    console.error('Error during logout:', e);
    return false;
  }
};

/**
 * Checks if the user is authenticated.
 */
export const isAuthenticated = async () => {
  try {
    const token = await AsyncStorage.getItem(JWT_TOKEN_KEY);
    return token !== null;
  } catch (e) {
    return false;
  }
};

/**
 * Get active phone number of the authenticated user.
 */
export const getCurrentUserPhone = async () => {
  try {
    return await AsyncStorage.getItem(USER_PHONE_KEY);
  } catch (e) {
    return null;
  }
};

/**
 * Register Expo push token with backend.
 */
export const registerPushToken = async (token) => {
  try {
    const response = await api.post('/api/auth/register-push-token', { token });
    return response.data;
  } catch (error) {
    console.error('Error registering push token:', error.response?.data || error.message);
    return null;
  }
};

/**
 * Retrieve current user profile statistics.
 */
export const getUserProfile = async () => {
  try {
    const response = await api.get('/api/auth/profile');
    return response.data;
  } catch (error) {
    console.error('Error fetching profile:', error.response?.data || error.message);
    throw new Error(error.response?.data?.detail || 'Failed to fetch user profile.');
  }
};

/**
 * Update current user profile name.
 */
export const updateUserProfile = async (name) => {
  try {
    const response = await api.put('/api/auth/profile', { name });
    return response.data;
  } catch (error) {
    console.error('Error updating profile:', error.response?.data || error.message);
    throw new Error(error.response?.data?.detail || 'Failed to save profile details.');
  }
};

