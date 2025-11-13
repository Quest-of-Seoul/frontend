import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Colors from '../constants/colors';
import { SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT } from '../constants/spacing';

const TabBarItem = memo(({ icon, label, active, onPress }) => (
  <TouchableOpacity style={styles.navItem} onPress={onPress} activeOpacity={0.7}>
    <Text style={styles.navIcon}>{icon}</Text>
    <Text style={[styles.navLabel, active && styles.navLabelActive]}>{label}</Text>
  </TouchableOpacity>
));

TabBarItem.displayName = 'TabBarItem';

const TabBar = ({
  activeTab = 'home',
  onHomePress,
  onQuestPress,
  onARPress,
  onRewardPress,
  onMyPress,
}) => {
  const tabs = [
    { id: 'home', icon: '🗺️', label: '홈', onPress: onHomePress },
    { id: 'quest', icon: '📍', label: '퀘스트', onPress: onQuestPress },
    { id: 'ar', icon: '📷', label: '', onPress: onARPress, isCenter: true },
    { id: 'reward', icon: '🎁', label: '보상', onPress: onRewardPress },
    { id: 'my', icon: '👤', label: '마이', onPress: onMyPress },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) =>
        tab.isCenter ? (
          <TouchableOpacity
            key={tab.id}
            style={styles.navItemCenter}
            onPress={tab.onPress}
            activeOpacity={0.8}
          >
            <Text style={styles.navIconCenter}>{tab.icon}</Text>
          </TouchableOpacity>
        ) : (
          <TabBarItem
            key={tab.id}
            icon={tab.icon}
            label={tab.label}
            active={activeTab === tab.id}
            onPress={tab.onPress}
          />
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: Colors.BORDER_LIGHT,
    backgroundColor: Colors.BACKGROUND_WHITE,
  },
  navItem: {
    alignItems: 'center',
    minWidth: 64,
    paddingVertical: 4,
  },
  navIcon: {
    fontSize: 20,
    color: Colors.TEXT_MUTED,
    textAlign: 'center',
  },
  navLabel: {
    marginTop: 4,
    fontSize: FONT_SIZE.xs,
    color: Colors.TEXT_PRIMARY,
    fontWeight: FONT_WEIGHT.medium,
  },
  navLabelActive: {
    color: Colors.PRIMARY,
    fontWeight: FONT_WEIGHT.bold,
  },
  navItemCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
    backgroundColor: Colors.PRIMARY,
    borderRadius: 30,
    marginBottom: 16,
    shadowColor: Colors.PRIMARY,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  navIconCenter: {
    fontSize: 28,
    color: Colors.TEXT_WHITE,
  },
});

export default memo(TabBar);
