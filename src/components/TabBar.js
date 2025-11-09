/**
 * TabBar Component
 * Bottom navigation bar for the app
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const TabBar = ({
  activeTab = 'home',
  onHomePress,
  onQuestPress,
  onARPress,
  onRewardPress,
  onMyPress,
}) => {
  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity
        style={[styles.navItem, activeTab === 'home' && styles.navItemActive]}
        onPress={onHomePress}
      >
        <Text style={styles.navIcon}>🗺️</Text>
        <Text style={activeTab === 'home' ? styles.navLabelActive : styles.navLabel}>홈</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={onQuestPress}>
        <Text style={styles.navIcon}>📍</Text>
        <Text style={styles.navLabel}>퀘스트</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItemCenter} onPress={onARPress}>
        <Text style={styles.navIconCenter}>📷</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={onRewardPress}>
        <Text style={styles.navIcon}>🎁</Text>
        <Text style={styles.navLabel}>보상</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={onMyPress}>
        <Text style={styles.navIcon}>👤</Text>
        <Text style={styles.navLabel}>마이</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
  },
  navItem: {
    alignItems: 'center',
    width: 64,
  },
  navItemActive: {},
  navIcon: {
    fontSize: 18,
    color: '#64748b',
    textAlign: 'center',
  },
  navLabel: {
    marginTop: 4,
    fontSize: 11,
    color: '#1e293b',
  },
  navLabelActive: {
    marginTop: 4,
    fontSize: 11,
    color: '#f97316',
    fontWeight: '700',
  },
  navItemCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 64,
    height: 48,
    backgroundColor: '#f97316',
    borderRadius: 14,
    marginBottom: 6,
  },
  navIconCenter: {
    fontSize: 18,
    color: '#ffffff',
  },
});

export default TabBar;
