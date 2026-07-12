import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NOISE_CONFIGS, type NoiseType, type MixEntry } from '../types';
import NoiseCard from './NoiseCard';

interface Props {
  activeNoises: Partial<Record<NoiseType, MixEntry>>;
  soloNoise: NoiseType | null;
  onToggle: (type: NoiseType) => void;
  onSolo: (type: NoiseType) => void;
}

export default function NoiseGrid({ activeNoises, soloNoise, onToggle, onSolo }: Props) {
  return (
    <View style={styles.grid}>
      {NOISE_CONFIGS.map(config => {
        const entry = activeNoises[config.key];
        return (
          <NoiseCard
            key={config.key}
            config={config}
            isInMix={!!entry && !entry.isLoading}
            isSolo={soloNoise === config.key}
            isLoading={!!entry?.isLoading}
            onToggle={() => onToggle(config.key)}
            onSolo={() => onSolo(config.key)}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: 16,
  },
});
