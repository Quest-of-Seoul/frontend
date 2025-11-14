import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import * as Colors from '../constants/colors';
import { RADIUS, FONT_SIZE, FONT_WEIGHT } from '../constants/spacing';

const Button = ({
  children,
  onPress,
  variant = 'primary', // primary, secondary, outline, gradient
  size = 'medium', // small, medium, large
  disabled = false,
  loading = false,
  icon,
  fullWidth = false,
  style,
  textStyle,
}) => {
  const buttonStyles = [
    styles.button,
    styles[`button_${size}`],
    styles[`button_${variant}`],
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`text_${size}`],
    styles[`text_${variant}`],
    disabled && styles.textDisabled,
    textStyle,
  ];

  const content = (
    <>
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? Colors.TEXT_WHITE : Colors.PRIMARY}
          size={size === 'small' ? 'small' : 'small'}
        />
      ) : (
        <>
          {icon}
          <Text style={textStyles}>{children}</Text>
        </>
      )}
    </>
  );

  if (variant === 'gradient') {
    return (
      <TouchableOpacity onPress={onPress} disabled={disabled || loading} activeOpacity={0.8}>
        <LinearGradient
          colors={[Colors.GRADIENT_START, Colors.PRIMARY]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={buttonStyles}
        >
          {content}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {content}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.md,
    gap: 8,
  },
  
  // Size variants
  button_small: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: RADIUS.md,
  },
  button_medium: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: RADIUS.lg,
  },
  button_large: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: RADIUS.xl,
  },

  // Style variants
  button_primary: {
    backgroundColor: Colors.PRIMARY,
  },
  button_secondary: {
    backgroundColor: Colors.SECONDARY,
  },
  button_outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.PRIMARY,
  },
  button_gradient: {
    // Handled by LinearGradient
  },

  fullWidth: {
    width: '100%',
  },

  disabled: {
    opacity: 0.5,
  },

  // Text styles
  text: {
    fontWeight: FONT_WEIGHT.semibold,
  },
  text_small: {
    fontSize: FONT_SIZE.sm,
  },
  text_medium: {
    fontSize: FONT_SIZE.md,
  },
  text_large: {
    fontSize: FONT_SIZE.lg,
  },
  text_primary: {
    color: Colors.TEXT_WHITE,
  },
  text_secondary: {
    color: Colors.TEXT_WHITE,
  },
  text_outline: {
    color: Colors.PRIMARY,
  },
  text_gradient: {
    color: Colors.TEXT_WHITE,
  },
  textDisabled: {
    opacity: 0.7,
  },
});

export default Button;

