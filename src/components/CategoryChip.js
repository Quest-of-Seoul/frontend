import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import * as Colors from '../constants/colors';
import { SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT } from '../constants/spacing';

const CategoryChip = ({
  label,
  selected = false,
  onPress,
  icon,
  style,
  size = 'medium', // small, medium, large
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.chip,
        styles[`chip_${size}`],
        selected && styles.chipSelected,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {icon && icon}
      <Text style={[styles.text, styles[`text_${size}`], selected && styles.textSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.BACKGROUND_WHITE,
    borderWidth: 1,
    borderColor: Colors.BORDER_LIGHT,
    borderRadius: RADIUS.round,
    gap: 6,
  },
  
  // Size variants
  chip_small: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  chip_medium: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  chip_large: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },

  chipSelected: {
    backgroundColor: Colors.PRIMARY,
    borderColor: Colors.PRIMARY,
  },

  text: {
    fontWeight: FONT_WEIGHT.semibold,
    color: Colors.TEXT_SECONDARY,
  },
  
  text_small: {
    fontSize: FONT_SIZE.xs,
  },
  text_medium: {
    fontSize: FONT_SIZE.sm,
  },
  text_large: {
    fontSize: FONT_SIZE.md,
  },

  textSelected: {
    color: Colors.TEXT_WHITE,
  },
});

export default CategoryChip;

