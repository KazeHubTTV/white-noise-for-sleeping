import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NoiseConfig } from '../types';

interface Props {
  config: NoiseConfig;
  isInMix: boolean;
  isSolo: boolean;
  isLoading: boolean;
  onToggle: () => void;
  onSolo: () => void;
}

export default function NoiseCard({
  config,
  isInMix,
  isSolo,
  isLoading,
  onToggle,
  onSolo,
}: Props) {
  const isActive = isInMix || isSolo;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isInMix && { borderColor: config.color, backgroundColor: config.color + '15' },
        isSolo && { borderColor: config.color, backgroundColor: config.color + '25' },
      ]}
      onPress={onToggle}
      onLongPress={onSolo}
      delayLongPress={400}
      activeOpacity={0.7}
    >
      {isLoading && <View style={[styles.loadingSpinner, { borderColor: config.color }]} />}
      <Ionicons
        name={config.icon as any}
        size={28}
        color={isActive ? config.color : '#6b7280'}
      />
      <Text style={[styles.label, isActive && { color: config.color }]}>
        {config.label}
      </Text>
      {isSolo && <View style={[styles.soloBadge, { backgroundColor: config.color }]}>
        <Text style={styles.soloText}>S</Text>
      </View>}
      {isInMix && !isSolo && (
        <Ionicons name="checkmark-circle" size={14} color={config.color} style={styles.check} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    aspectRatio: 1.4,
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2a2a3e',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 100,
    position: 'relative',
  },
  label: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '600',
    textAlign: 'center',
  },
  check: {
    position: 'absolute',
    top: 6,
    right: 8,
  },
  soloBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  soloText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '800',
  },
  loadingSpinner: {
    position: 'absolute',
    top: 6,
    left: 8,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderTopColor: 'transparent',
  },
});
