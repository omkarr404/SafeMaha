// FILE NAME: d:\Omkar\Water\FDA\components\CustomButton.js

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';

export default function CustomButton({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
}) {
  const buttonStyles = [styles.button];
  const labelStyles = [styles.text];

  if (variant === 'primary') {
    buttonStyles.push(styles.primaryButton);
    labelStyles.push(styles.primaryText);
  } else if (variant === 'secondary') {
    buttonStyles.push(styles.secondaryButton);
    labelStyles.push(styles.secondaryText);
  } else if (variant === 'accent') {
    buttonStyles.push(styles.accentButton);
    labelStyles.push(styles.accentText);
  } else if (variant === 'outline') {
    buttonStyles.push(styles.outlineButton);
    labelStyles.push(styles.outlineText);
  }

  if (disabled) {
    buttonStyles.push(styles.disabledButton);
    labelStyles.push(styles.disabledText);
  }

  if (style) {
    buttonStyles.push(style);
  }
  if (textStyle) {
    labelStyles.push(textStyle);
  }

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variant === 'outline' ? '#0A3D62' : '#FFFFFF'} />
      ) : (
        <View style={styles.contentContainer}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text style={labelStyles}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
    width: '100%',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
  primaryButton: {
    backgroundColor: '#0A3D62',
  },
  secondaryButton: {
    backgroundColor: '#3C6382',
  },
  accentButton: {
    backgroundColor: '#38ADA9',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#0A3D62',
    elevation: 0,
    shadowOpacity: 0,
  },
  disabledButton: {
    backgroundColor: '#D1D8E0',
    borderColor: '#D1D8E0',
    elevation: 0,
    shadowOpacity: 0,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: '#FFFFFF',
  },
  accentText: {
    color: '#FFFFFF',
  },
  outlineText: {
    color: '#0A3D62',
  },
  disabledText: {
    color: '#888888',
  },
});
