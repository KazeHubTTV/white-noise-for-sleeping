import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';

const COLORS = [
  '#0a0a1a',
  '#0d0d2b',
  '#0f0f20',
  '#0a0a2e',
];

const AnimatedView = Animated.createAnimatedComponent(View);

export default function BackgroundGradient() {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 10000 }),
      -1,
      true
    );
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => {
    const bg = interpolateColor(
      progress.value,
      [0, 0.33, 0.66, 1],
      COLORS
    );
    return { backgroundColor: bg };
  });

  return <AnimatedView style={[styles.container, animatedStyle]} />;
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
});
