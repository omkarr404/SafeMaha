// FILE NAME: d:\Omkar\Water\FDA\screens\SplashScreen.js

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image, StatusBar } from 'react-native';
import { Asset } from 'expo-asset';
import { SvgXml } from 'react-native-svg';

export default function SplashScreen({ navigation }) {
  const [svgXml, setSvgXml] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadEmblem() {
      try {
        // Dynamically load the SVG asset using expo-asset
        const asset = Asset.fromModule(require('../assets/emblem.svg'));
        await asset.downloadAsync();
        const response = await fetch(asset.localUri || asset.uri);
        const text = await response.text();
        if (text && typeof text === 'string') {
          const trimmed = text.trim();
          if (trimmed.startsWith('<svg') || trimmed.startsWith('<?xml')) {
            if (isMounted) {
              setSvgXml(text);
            }
          } else {
            console.log('Fetched content is not a valid SVG (e.g. error page/empty). Falling back to PNG logo.');
          }
        }
      } catch (error) {
        console.log('Error loading emblem SVG:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadEmblem();

    // Automatically navigate to Language Selection Screen after 3 seconds
    const timer = setTimeout(() => {
      navigation.replace('LanguageSelection');
    }, 3000);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [navigation]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A3D62" />
      
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          {svgXml ? (
            <SvgXml xml={svgXml} width={100} height={170} />
          ) : (
            // Fallback to high-quality image logo if SVG is still loading or fails
            <View style={styles.fallbackContainer}>
              <Image 
                source={require('../assets/logo-2.png')} 
                style={styles.fallbackLogo} 
              />
            </View>
          )}
        </View>

        <Text style={styles.appName}>SafeMaha</Text>
        <Text style={styles.tagline}>Consumer Safety & Public Health Platform</Text>
        <Text style={styles.department}>Food & Drug Administration, Maharashtra</Text>
      </View>

      <View style={styles.footer}>
        <ActivityIndicator size="large" color="#38ADA9" style={styles.loader} />
        <Text style={styles.governmentText}>GOVERNMENT OF MAHARASHTRA</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A3D62',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  logoContainer: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  fallbackContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  fallbackLogo: {
    width: 90,
    height: 90,
    resizeMode: 'contain',
  },
  appName: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1.5,
    marginBottom: 10,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 16,
    color: '#D1D8E0',
    textAlign: 'center',
    marginBottom: 6,
    fontWeight: '500',
    paddingHorizontal: 10,
  },
  department: {
    fontSize: 13,
    color: '#38ADA9',
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  footer: {
    alignItems: 'center',
    width: '100%',
  },
  loader: {
    marginBottom: 24,
  },
  governmentText: {
    fontSize: 12,
    color: '#FFFFFF',
    letterSpacing: 2,
    fontWeight: '700',
    opacity: 0.8,
  },
});
