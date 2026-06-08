import React, { createContext, useState, useContext, useEffect } from 'react';
import * as complaintService from '../services/complaintService';
import { getCurrentUserPhone } from '../services/authService';

const ComplaintContext = createContext();

const initialDraftState = {
  name: '',
  mobile: '',
  category: '',
  title: '',
  description: '',
  evidence: [], // Array of image URIs
  location: null, // { latitude, longitude, address }
};

export const ComplaintProvider = ({ children }) => {
  const [draftComplaint, setDraftComplaint] = useState(initialDraftState);
  const [allComplaints, setAllComplaints] = useState([]);
  const [loading, setLoading] = useState(false);

  // Sync state list with FastAPI server (caching fallback inside service)
  const refreshComplaints = async () => {
    setLoading(true);
    try {
      const list = await complaintService.getComplaints();
      setAllComplaints(list);
    } catch (e) {
      console.log('Error refreshing complaints:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshComplaints();
  }, []);

  const updateDraft = (fields) => {
    setDraftComplaint((prev) => ({ ...prev, ...fields }));
  };

  const resetDraft = () => {
    setDraftComplaint(initialDraftState);
  };

  /**
   * Submit the current draft complaint to FastAPI server.
   * Leverages backend sequence generation for IDs, uploads files first.
   * 
   * @returns {Promise<string>} Generated Complaint ID
   */
  const submitComplaint = async () => {
    try {
      // Automatically attach logged in citizen phone number to draft if missing
      let activePhone = draftComplaint.mobile;
      if (!activePhone) {
        activePhone = await getCurrentUserPhone();
      }

      const finalDraft = {
        ...draftComplaint,
        mobile: activePhone || '9876543210',
      };

      // Call API Service (handles multi-part file uploads and post schema mapping)
      const result = await complaintService.createComplaint(finalDraft);

      // Clean draft complaint form state
      resetDraft();

      // Refresh list to keep context sync'd
      await refreshComplaints();

      return result.id;
    } catch (error) {
      console.error('Error submitting complaint in Context:', error);
      throw error;
    }
  };


  /**
   * Search saved complaints by ID or Mobile Number.
   * 
   * @param {string} query Search input
   * @returns {Array} List of matching complaints
   */
  const searchComplaints = (query) => {
    if (!query) return [];
    const target = query.trim().toLowerCase();
    
    return allComplaints.filter((c) => {
      const idMatch = c.id && c.id.toLowerCase().includes(target);
      const mobileMatch = c.mobile && c.mobile.includes(target);
      return idMatch || mobileMatch;
    });
  };

  return (
    <ComplaintContext.Provider
      value={{
        draftComplaint,
        allComplaints,
        loading,
        updateDraft,
        resetDraft,
        submitComplaint,
        searchComplaints,
        refreshComplaints,
      }}
    >
      {children}
    </ComplaintContext.Provider>
  );
};

export const useComplaints = () => {
  const context = useContext(ComplaintContext);
  if (!context) {
    throw new Error('useComplaints must be used within a ComplaintProvider');
  }
  return context;
};
