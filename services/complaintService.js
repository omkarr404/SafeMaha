// FILE NAME: d:\Omkar\Water\FDA\services\complaintService.js

import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const COMPLAINTS_CACHE_KEY = '@safemaha_complaints_cache';

/**
 * Upload citizen evidence file to FastAPI server.
 * Supports React Native platform FormData file upload.
 * @param {string} fileUri Local image URI on device
 * @returns {Promise<string>} Public URL of the uploaded image
 */
export const uploadEvidence = async (fileUri) => {
  try {
    const formData = new FormData();
    const uriParts = fileUri.split('/');
    const fileName = uriParts[uriParts.length - 1];
    const extension = fileName.split('.').pop().toLowerCase();
    
    // Fallback MIME mapping
    let mimeType = 'image/jpeg';
    if (extension === 'png') mimeType = 'image/png';
    else if (extension === 'webp') mimeType = 'image/webp';
    else if (extension === 'gif') mimeType = 'image/gif';
    else if (extension === 'pdf') mimeType = 'application/pdf';

    formData.append('file', {
      uri: fileUri,
      name: fileName,
      type: mimeType,
    });

    const response = await api.post('/api/upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.url;
  } catch (error) {
    console.error('Error uploading evidence file:', error.response?.data || error.message);
    throw new Error(error.response?.data?.detail || 'Failed to upload evidence photo.');
  }
};

/**
 * Submit a new complaint, uploading any local images to backend beforehand.
 * @param {object} complaintData Draft complaint fields
 */
export const createComplaint = async (complaintData) => {
  try {
    // 1. Process and upload evidence image list if they are local file URIs
    const uploadedUrls = [];
    if (complaintData.evidence && complaintData.evidence.length > 0) {
      for (const uri of complaintData.evidence) {
        if (uri.startsWith('http://') || uri.startsWith('https://')) {
          uploadedUrls.push(uri);
        } else {
          try {
            const url = await uploadEvidence(uri);
            uploadedUrls.push(url);
          } catch (e) {
            console.warn(`Failed to upload evidence item ${uri}, proceeding without it:`, e);
          }
        }
      }
    }

    // Automatic keyword-based priority classification if not pre-set
    let priorityVal = complaintData.priority || 'Low';
    if (!complaintData.priority) {
      const descLower = (complaintData.description || '').toLowerCase();
      const titleLower = (complaintData.title || '').toLowerCase();
      const combinedText = `${titleLower} ${descLower}`;
      
      if (combinedText.includes('poison') || combinedText.includes('outbreak') || combinedText.includes('hospital')) {
        priorityVal = 'Critical';
      } else if (combinedText.includes('expire') || combinedText.includes('contaminat') || combinedText.includes('fake') || combinedText.includes('adulterat')) {
        priorityVal = 'High';
      } else if (complaintData.category === 'drug' || complaintData.category === 'food') {
        priorityVal = 'Medium';
      }
    }

    // 2. Prepare payload matching FastAPI schema (ComplaintCreate)
    const payload = {
      title: complaintData.title,
      category: complaintData.category,
      description: complaintData.description,
      name: complaintData.name,
      location: complaintData.location ? {
        latitude: complaintData.location.latitude,
        longitude: complaintData.location.longitude,
        address: complaintData.location.address
      } : null,
      evidence: uploadedUrls,
      priority: priorityVal,
      district_id: complaintData.district_id,
      taluka_id: complaintData.taluka_id
    };

    const response = await api.post('/api/complaints/', payload);
    return response.data;
  } catch (error) {
    console.error('Error submitting complaint to API:', error.response?.data || error.message);
    throw new Error(error.response?.data?.detail || 'Failed to file your complaint with the server.');
  }
};

/**
 * Fetch list of Maharashtra districts from backend.
 */
export const getDistricts = async () => {
  try {
    const response = await api.get('/api/districts/');
    return response.data;
  } catch (error) {
    console.error('Error loading districts:', error);
    return [];
  }
};

/**
 * Fetch list of talukas for a district from backend.
 */
export const getTalukas = async (districtId) => {
  try {
    const response = await api.get(`/api/districts/${districtId}/talukas`);
    return response.data;
  } catch (error) {
    console.error('Error loading talukas:', error);
    return [];
  }
};


/**
 * Fetch all complaints filed by the authenticated citizen.
 * Uses local AsyncStorage cache as fallback if API server is offline.
 */
export const getComplaints = async () => {
  try {
    const response = await api.get('/api/complaints/');
    const list = response.data;
    
    // Sync cache
    await AsyncStorage.setItem(COMPLAINTS_CACHE_KEY, JSON.stringify(list));
    return list;
  } catch (error) {
    console.warn('API getComplaints failed, reading offline cache:', error.message);
    const cached = await AsyncStorage.getItem(COMPLAINTS_CACHE_KEY);
    return cached ? JSON.parse(cached) : [];
  }
};

/**
 * Retrieve specific complaint information and progress timeline.
 * @param {string} id Complaint reference ID
 */
export const getComplaintDetails = async (id) => {
  try {
    const response = await api.get(`/api/complaints/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error loading details for ${id}:`, error.response?.data || error.message);
    
    // Read from cache fallback
    const cached = await AsyncStorage.getItem(COMPLAINTS_CACHE_KEY);
    if (cached) {
      const list = JSON.parse(cached);
      const found = list.find(c => c.id === id);
      if (found) return found;
    }
    throw new Error(error.response?.data?.detail || 'Complaint details unavailable.');
  }
};
