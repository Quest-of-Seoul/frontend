import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import * as Colors from '../constants/colors';
import { SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT } from '../constants/spacing';

const PlaceCard = ({
  image,
  title,
  subtitle,
  category,
  distance,
  points,
  onPress,
  onAddPress,
  style,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {image && (
        <Image
          source={typeof image === 'string' ? { uri: image } : image}
          style={styles.image}
          resizeMode="cover"
        />
      )}
      
      <View style={styles.content}>
        <View style={styles.header}>
          {category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{category}</Text>
            </View>
          )}
          
          {onAddPress && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={onAddPress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        
        {subtitle && (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        )}

        <View style={styles.footer}>
          {distance && (
            <View style={styles.infoBadge}>
              <Text style={styles.infoText}>{distance}</Text>
            </View>
          )}
          
          {points && (
            <View style={[styles.infoBadge, styles.pointsBadge]}>
              <Text style={styles.pointsText}>{points} P</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.BACKGROUND_WHITE,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    shadowColor: Colors.SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: SPACING.md,
  },
  image: {
    width: '100%',
    height: 180,
    backgroundColor: Colors.GRAY_200,
  },
  content: {
    padding: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  categoryBadge: {
    backgroundColor: Colors.ACCENT,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: RADIUS.sm,
  },
  categoryText: {
    color: Colors.TEXT_WHITE,
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.semibold,
  },
  addButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: Colors.TEXT_WHITE,
    fontSize: 18,
    fontWeight: FONT_WEIGHT.bold,
    lineHeight: 20,
  },
  title: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: Colors.TEXT_PRIMARY,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: FONT_SIZE.sm,
    color: Colors.TEXT_MUTED,
    marginBottom: SPACING.sm,
  },
  footer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    flexWrap: 'wrap',
  },
  infoBadge: {
    backgroundColor: Colors.GRAY_100,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: RADIUS.sm,
  },
  infoText: {
    fontSize: FONT_SIZE.xs,
    color: Colors.TEXT_SECONDARY,
    fontWeight: FONT_WEIGHT.medium,
  },
  pointsBadge: {
    backgroundColor: Colors.PRIMARY,
  },
  pointsText: {
    fontSize: FONT_SIZE.xs,
    color: Colors.TEXT_WHITE,
    fontWeight: FONT_WEIGHT.bold,
  },
});

export default PlaceCard;

