// FILE NAME: d:\Omkar\Water\FDA\components\CustomButton.js

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { colors, borderRadius, spacing } from '../constants/theme';

export default function CustomButton({
  title,
  onPress,
  variant = 'primary', // 'primary' | 'secondary' | 'destructive' | 'outline' | 'accent'
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
}) {
  const getButtonStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondaryButton;
      case 'destructive':
      case 'danger':
        return styles.destructiveButton;
      case 'outline':
        return styles.outlineButton;
      case 'accent':
        return styles.secondaryButton; // Re-mapped to enterprise secondary blue
      case 'primary':
      default:
        return styles.primaryButton;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'outline':
        return styles.outlineText;
      case 'secondary':
      case 'destructive':
      case 'danger':
      case 'accent':
      case 'primary':
      default:
        return styles.whiteText;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.buttonBase,
        getButtonStyle(),
        disabled && styles.disabledButton,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'outline' ? colors.primary : '#FFFFFF'} 
        />
      ) : (
        <View style={styles.contentContainer}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text style={[styles.textBase, getTextStyle(), disabled && styles.disabledText, textStyle]}>
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  buttonBase: {
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    borderWidth: 1,
    borderColor: 'transparent',
    width: '100%',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: spacing.sm,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  secondaryButton: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  destructiveButton: {
    backgroundColor: colors.critical,
    borderColor: colors.critical,
  },
  outlineButton: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  disabledButton: {
    backgroundColor: '#F1F5F9',
    borderColor: colors.border,
  },
  textBase: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  whiteText: {
    color: '#FFFFFF',
  },
  outlineText: {
    color: colors.primary,
  },
  disabledText: {
    color: colors.textMuted,
  },
});
