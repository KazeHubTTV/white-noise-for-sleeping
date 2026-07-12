import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import VolumeControl from './VolumeControl';
import { NOISE_CONFIGS, type NoiseType, type MixEntry } from '../types';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Props {
  activeNoises: Partial<Record<NoiseType, MixEntry>>;
  masterVolume: number;
  onNoiseVolume: (type: NoiseType, volume: number) => void;
  onRemoveNoise: (type: NoiseType) => void;
  onOpenMixer: () => void;
}

export default function MixPanel({
  activeNoises,
  masterVolume,
  onNoiseVolume,
  onRemoveNoise,
  onOpenMixer,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const entries = Object.entries(activeNoises) as [NoiseType, MixEntry][];
  const count = entries.length;

  if (count === 0) return null;

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.header} onPress={toggleExpand} activeOpacity={0.7}>
        <View style={styles.headerLeft}>
          <Ionicons name="options-outline" size={16} color="#818cf8" />
          <Text style={styles.headerText}>Mix ({count})</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={onOpenMixer} activeOpacity={0.7} style={styles.openBtn}>
            <Text style={styles.openBtnText}>Open</Text>
          </TouchableOpacity>
          <Ionicons name={expanded ? 'chevron-down' : 'chevron-up'} size={16} color="#6b7280" />
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.body}>
          {entries.map(([type, entry]) => {
            const config = NOISE_CONFIGS.find(c => c.key === type);
            if (!config) return null;
            return (
              <View key={type} style={styles.row}>
                <View style={styles.rowLeft}>
                  <Ionicons name={config.icon as any} size={14} color={config.color} />
                  <Text style={[styles.rowLabel, { color: config.color }]} numberOfLines={1}>
                    {config.label}
                  </Text>
                </View>
                <View style={styles.sliderWrapper}>
                  <VolumeControl
                    volume={entry.volume}
                    onChange={(v) => onNoiseVolume(type, v)}
                    compact
                  />
                </View>
                <TouchableOpacity onPress={() => onRemoveNoise(type)} activeOpacity={0.6}>
                  <Ionicons name="close-circle" size={18} color="#6b7280" />
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a3e',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerText: {
    fontSize: 13,
    color: '#e5e7eb',
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  openBtn: {
    backgroundColor: '#6366f115',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#6366f140',
  },
  openBtnText: {
    fontSize: 11,
    color: '#818cf8',
    fontWeight: '600',
  },
  body: {
    paddingHorizontal: 14,
    paddingBottom: 10,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    width: 90,
  },
  rowLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  sliderWrapper: {
    flex: 1,
  },
});
