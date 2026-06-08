// FILE NAME: d:\Omkar\Water\FDA\App.js

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { LanguageProvider } from './context/LanguageContext';
import { ComplaintProvider } from './context/ComplaintContext';
import AppNavigator from './navigation/AppNavigator';

export default function App() {
  return (
    <LanguageProvider>
      <ComplaintProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </ComplaintProvider>
    </LanguageProvider>
  );
}
