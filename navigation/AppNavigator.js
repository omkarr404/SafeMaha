// FILE NAME: d:\Omkar\Water\FDA\navigation\AppNavigator.js

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/SplashScreen';
import LanguageSelectionScreen from '../screens/LanguageSelectionScreen';
import HomeScreen from '../screens/HomeScreen';
import ComplaintFormScreen from '../screens/ComplaintFormScreen';
import EvidenceUploadScreen from '../screens/EvidenceUploadScreen';
import LocationScreen from '../screens/LocationScreen';
import ComplaintReviewScreen from '../screens/ComplaintReviewScreen';
import ComplaintSuccessScreen from '../screens/ComplaintSuccessScreen';
import TrackComplaintScreen from '../screens/TrackComplaintScreen';
import ComplaintStatusScreen from '../screens/ComplaintStatusScreen';
import MyComplaintsScreen from '../screens/MyComplaintsScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import FAQScreen from '../screens/FAQScreen';
import SafetyEducationScreen from '../screens/SafetyEducationScreen';
import ArticleDetailScreen from '../screens/ArticleDetailScreen';
import CitizenProfileScreen from '../screens/CitizenProfileScreen';
import { useLanguage } from '../context/LanguageContext';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { t } = useLanguage();

  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#0A3D62', // Government Primary Blue
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 18,
        },
        headerTitleAlign: 'center',
        animation: 'slide_from_right', // Smooth transition
      }}
    >
      {/* Splash Screen */}
      <Stack.Screen 
        name="Splash" 
        component={SplashScreen} 
        options={{ headerShown: false }} 
      />
      
      {/* Language Selection Screen */}
      <Stack.Screen 
        name="LanguageSelection" 
        component={LanguageSelectionScreen} 
        options={{ headerShown: false }} 
      />
      
      {/* Home Dashboard Screen */}
      <Stack.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ headerShown: false }} 
      />
      
      {/* Complaint Form Screen */}
      <Stack.Screen 
        name="ComplaintForm" 
        component={ComplaintFormScreen} 
        options={{ 
          title: t('form.headerTitle'),
          headerShown: true,
        }} 
      />

      {/* Evidence Upload Screen */}
      <Stack.Screen 
        name="EvidenceUpload" 
        component={EvidenceUploadScreen} 
        options={{ 
          title: t('evidence.headerTitle'),
          headerShown: true,
        }} 
      />

      {/* Incident Location Capture Screen */}
      <Stack.Screen 
        name="LocationCapture" 
        component={LocationScreen} 
        options={{ 
          title: t('location.headerTitle'),
          headerShown: true,
        }} 
      />

      {/* Complaint Review Screen */}
      <Stack.Screen 
        name="ComplaintReview" 
        component={ComplaintReviewScreen} 
        options={{ 
          title: t('review.headerTitle'),
          headerShown: true,
        }} 
      />

      {/* Complaint Success Screen */}
      <Stack.Screen 
        name="ComplaintSuccess" 
        component={ComplaintSuccessScreen} 
        options={{ 
          headerShown: false, // Hide header on success screen
        }} 
      />

      {/* Track Complaint Screen */}
      <Stack.Screen 
        name="TrackComplaint" 
        component={TrackComplaintScreen} 
        options={{ 
          title: t('track.headerTitle'),
          headerShown: true,
        }} 
      />

      {/* Complaint Status & Timeline Screen */}
      <Stack.Screen 
        name="ComplaintStatus" 
        component={ComplaintStatusScreen} 
        options={{ 
          title: t('status.headerTitle'),
          headerShown: true,
        }} 
      />

      {/* My Complaints History Screen */}
      <Stack.Screen 
        name="MyComplaints" 
        component={MyComplaintsScreen} 
        options={{ 
          title: t('myComplaints.headerTitle'),
          headerShown: true,
        }} 
      />

      {/* Notification Center Screen */}
      <Stack.Screen 
        name="Notifications" 
        component={NotificationsScreen} 
        options={{ 
          title: t('notifications.headerTitle'),
          headerShown: true,
        }} 
      />

      {/* FAQ Center Screen */}
      <Stack.Screen 
        name="FAQ" 
        component={FAQScreen} 
        options={{ 
          title: t('faq.headerTitle'),
          headerShown: true,
        }} 
      />

      {/* Consumer Safety Education Hub Screen */}
      <Stack.Screen 
        name="SafetyEducation" 
        component={SafetyEducationScreen} 
        options={{ 
          title: t('safetyEducation.headerTitle'),
          headerShown: true,
        }} 
      />

      {/* Educational Article Detail Screen */}
      <Stack.Screen 
        name="ArticleDetail" 
        component={ArticleDetailScreen} 
        options={{ 
          title: t('safetyEducation.headerTitle'),
          headerShown: true,
        }} 
      />

      {/* Citizen Profile Screen */}
      <Stack.Screen 
        name="CitizenProfile" 
        component={CitizenProfileScreen} 
        options={{ 
          title: t('profile.headerTitle'),
          headerShown: true,
        }} 
      />
    </Stack.Navigator>
  );
}
