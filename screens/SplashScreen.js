// FILE NAME: d:\Omkar\Water\FDA\screens\SplashScreen.js

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image, StatusBar } from 'react-native';
import { Asset } from 'expo-asset';
import { SvgXml } from 'react-native-svg';
import { colors, typography, spacing } from '../constants/theme';

export default function SplashScreen({ navigation }) {
  const [svgXml, setSvgXml] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadEmblem() {
      try {
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

    const timer = setTimeout(() => {
      navigation.replace('LanguageSelection');
    }, 2800);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [navigation]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      {/* Top Department Ribbon */}
      <View style={styles.topRibbon}>
        <Text style={styles.govText}>GOVERNMENT OF MAHARASHTRA</Text>
        <Text style={styles.deptText}>Food & Drug Administration (FDA)</Text>
      </View>

      {/* Center Brandmark */}
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          {svgXml ? (
            <SvgXml xml={svgXml} width={110} height={160} />
          ) : (
            <View style={styles.fallbackContainer}>
              <Image 
                source={require('../assets/logo-2.png')} 
                style={styles.fallbackLogo} 
              />
            </View>
          )}
        </View>

        <Text style={styles.appName}>SafeMaha</Text>
        <View style={styles.taglineBadge}>
          <Text style={styles.taglineText}>Consumer Safety & Public Health Portal</Text>
        </View>
        <Text style={styles.marathiSub}>महाराष्ट्र अन्न व औषध प्रशासन नागरिक तक्रार निवारण कक्ष</Text>
      </View>

      {/* Footer System Indicator */}
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#FFFFFF" style={styles.loader} />
        <Text style={styles.footerSecurityNote}>OFFICIAL GRIEVANCE REDRESSAL SYSTEM</Text>
        <Text style={styles.footerVersion}>v1.0 • Enterprise Citizen Portal</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
  },
  topRibbon: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  govText: {
    fontSize: 11,
    color: '#CBD5E1',
    letterSpacing: 2.2,
    fontWeight: '700',
  },
  deptText: {
    fontSize: 12,
    color: colors.secondaryLight,
    fontWeight: '600',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  logoContainer: {
    height: 170,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  fallbackContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  fallbackLogo: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  appName: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1.2,
    marginBottom: spacing.xs,
  },
  taglineBadge: {
    backgroundColor: 'rgba(37, 99, 235, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.4)',
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: spacing.sm,
  },
  taglineText: {
    fontSize: 13,
    color: '#E2E8F0',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  marathiSub: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.lg,
  },
  footer: {
    alignItems: 'center',
    width: '100%',
  },
  loader: {
    marginBottom: spacing.md,
  },
  footerSecurityNote: {
    fontSize: 10,
    color: '#94A3B8',
    letterSpacing: 1.8,
    fontWeight: '700',
  },
  footerVersion: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
});
