// FILE NAME: d:\Omkar\Water\FDA\services\api.js

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const BACKEND_PORT = 8000;

const getBaseUrl = () => {
  const host = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
  return `http://${host}:${BACKEND_PORT}`;
};

export const BASE_URL = getBaseUrl();

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor to attach JWT citizen token automatically
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('@safemaha_jwt_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.warn('Axios interceptor: could not retrieve token from storage.', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
