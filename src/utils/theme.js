import { StyleSheet } from 'react-native';
import * as Colors from '../constants/colors';
import { SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT } from '../constants/spacing';

// Common shadow styles
export const shadows = {
  small: {
    shadowColor: Colors.SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: Colors.SHADOW,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: Colors.SHADOW,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

// Common text styles
export const textStyles = StyleSheet.create({
  h1: {
    fontSize: FONT_SIZE.display,
    fontWeight: FONT_WEIGHT.bold,
    color: Colors.TEXT_PRIMARY,
    lineHeight: 40,
  },
  h2: {
    fontSize: FONT_SIZE.heading,
    fontWeight: FONT_WEIGHT.bold,
    color: Colors.TEXT_PRIMARY,
    lineHeight: 36,
  },
  h3: {
    fontSize: FONT_SIZE.title,
    fontWeight: FONT_WEIGHT.bold,
    color: Colors.TEXT_PRIMARY,
    lineHeight: 32,
  },
  body: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.normal,
    color: Colors.TEXT_SECONDARY,
    lineHeight: 22,
  },
  bodyBold: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: Colors.TEXT_PRIMARY,
    lineHeight: 22,
  },
  caption: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.normal,
    color: Colors.TEXT_MUTED,
    lineHeight: 18,
  },
  label: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.semibold,
    color: Colors.TEXT_SECONDARY,
    lineHeight: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

// Common container styles
export const containerStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND_LIGHT,
  },
  safeArea: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND_WHITE,
  },
  card: {
    backgroundColor: Colors.BACKGROUND_WHITE,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    ...shadows.medium,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

// Common layout constants
export const layout = {
  headerHeight: 60,
  tabBarHeight: 70,
  borderWidth: 1,
  modalMaxWidth: '90%',
  modalMaxHeight: '80%',
};

export default {
  shadows,
  textStyles,
  containerStyles,
  layout,
};

