import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { NOISE_CONFIGS, type NoiseType } from '../types';

interface Props {
  noise: NoiseType | null;
  isPlaying: boolean;
}

function WaveformDot({ delay, color, active }: { delay: number; color: string; active: boolean }) {
  const height = useSharedValue(4);

  useEffect(() => {
    cancelAnimation(height);
    if (active) {
      height.value = withRepeat(
        withDelay(
          delay,
          withSequence(
            withTiming(20, { duration: 400, easing: Easing.inOut(Easing.sin) }),
            withTiming(4, { duration: 400, easing: Easing.inOut(Easing.sin) }),
          )
        ),
        -1,
        true
      );
    } else {
      height.value = withTiming(4, { duration: 200 });
    }
  }, [active, delay, height]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: height.value,
  }));

  return <Animated.View style={[styles.dot, { backgroundColor: color }, animatedStyle]} />;
}

export default function NowPlaying({ noise, isPlaying }: Props) {
  if (!noise) {
    return (
      <View style={styles.container}>
        <Ionicons name="moon-outline" size={28} color="#6b7280" />
        <Text style={styles.idleText}>Select a sound</Text>
      </View>
    );
  }

  const config = NOISE_CONFIGS.find(c => c.key === noise);
  const color = config?.color || '#6366f1';

  return (
    <View style={styles.container}>
      <View style={styles.waveform}>
        {[0, 100, 200, 300, 400].map(d => (
          <WaveformDot key={d} delay={d} color={color} active={isPlaying} />
        ))}
      </View>
      <Text style={[styles.label, { color }]}>
        {config?.label || noise}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 20,
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 24,
  },
  dot: {
    width: 4,
    borderRadius: 2,
  },
  label: {
    fontSize: 20,
    fontWeight: '700',
  },
  idleText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
});
