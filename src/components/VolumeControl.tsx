import React, { useRef } from 'react';
import { StyleSheet, Text, View, PanResponder, LayoutChangeEvent } from 'react-native';

interface Props {
  volume: number;
  onChange: (value: number) => void;
  label?: string;
  compact?: boolean;
}

export default function VolumeControl({ volume, onChange, label, compact }: Props) {
  const barWidth = useRef(1);
  const thumbSize = compact ? 20 : 24;

  const onLayout = (e: LayoutChangeEvent) => {
    barWidth.current = e.nativeEvent.layout.width - thumbSize;
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const x = evt.nativeEvent.locationX;
        const clamped = Math.max(0, Math.min(1, x / barWidth.current));
        onChange(clamped);
      },
      onPanResponderMove: (evt) => {
        const x = evt.nativeEvent.locationX;
        const clamped = Math.max(0, Math.min(1, x / barWidth.current));
        onChange(clamped);
      },
    })
  ).current;

  return (
    <View style={compact ? styles.compactContainer : styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.sliderRow}>
        {!compact && <Text style={styles.icon}>🔈</Text>}
        <View
          style={compact ? styles.compactTrackContainer : styles.trackContainer}
          onLayout={onLayout}
          {...panResponder.panHandlers}
        >
          <View style={compact ? styles.compactTrack : styles.track}>
            <View style={[styles.fill, { width: `${volume * 100}%` }]} />
          </View>
          <View
            style={[
              compact ? styles.compactThumb : styles.thumb,
              { left: `${volume * 100}%`, marginLeft: -(compact ? 10 : 12) },
            ]}
          />
        </View>
        {!compact && <Text style={styles.icon}>🔊</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    gap: 6,
  },
  compactContainer: {
    gap: 4,
  },
  label: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    fontSize: 16,
  },
  trackContainer: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
    position: 'relative',
  },
  compactTrackContainer: {
    flex: 1,
    height: 32,
    justifyContent: 'center',
    position: 'relative',
  },
  track: {
    height: 4,
    backgroundColor: '#2a2a3e',
    borderRadius: 2,
    overflow: 'hidden',
  },
  compactTrack: {
    height: 3,
    backgroundColor: '#2a2a3e',
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 2,
  },
  thumb: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#818cf8',
    top: '50%',
    marginTop: -12,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  compactThumb: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#818cf8',
    top: '50%',
    marginTop: -10,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
});
