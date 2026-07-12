import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import VolumeControl from '../components/VolumeControl';
import { NOISE_CONFIGS, type NoiseType } from '../types';
import { useAudio } from '../context/AudioContext';

interface Props {
  navigation: any;
}

export default function MixScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const {
    state,
    toggleNoise,
    setNoiseVolume,
    setMasterVolume,
    isInMix,
  } = useAudio();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color="#e5e7eb" />
        </TouchableOpacity>
        <Text style={styles.title}>Sound Mixer</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.masterRow}>
        <Text style={styles.masterLabel}>Master</Text>
        <VolumeControl
          volume={state.masterVolume}
          onChange={setMasterVolume}
          compact
        />
      </View>

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {NOISE_CONFIGS.map(config => {
          const active = !!state.activeNoises[config.key];
          const entry = state.activeNoises[config.key];

          return (
            <View
              key={config.key}
              style={[styles.item, active && { borderColor: config.color }]}
            >
              <View style={styles.itemLeft}>
                <TouchableOpacity
                  onPress={() => toggleNoise(config.key)}
                  activeOpacity={0.7}
                  style={[styles.soundBtn, active && { backgroundColor: config.color + '20' }]}
                >
                  <Ionicons
                    name={config.icon as any}
                    size={22}
                    color={active ? config.color : '#6b7280'}
                  />
                </TouchableOpacity>
                <Text style={[styles.itemLabel, active && { color: config.color }]}>
                  {config.label}
                </Text>
              </View>

              <View style={styles.itemRight}>
                {entry && (
                  <VolumeControl
                    volume={entry.volume}
                    onChange={(v) => setNoiseVolume(config.key, v)}
                    compact
                  />
                )}
                <Ionicons
                  name={active ? 'checkmark-circle' : 'add-circle-outline'}
                  size={20}
                  color={active ? config.color : '#4b5563'}
                  style={styles.itemIcon}
                />
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#e5e7eb',
  },
  masterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a3e',
  },
  masterLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#818cf8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    width: 50,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    gap: 8,
    paddingBottom: 30,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a3e',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  soundBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111125',
  },
  itemLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9ca3af',
    flexShrink: 1,
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1.2,
  },
  itemIcon: {
    marginLeft: 4,
  },
});
