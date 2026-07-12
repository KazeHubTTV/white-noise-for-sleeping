import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NOISE_CONFIGS } from '../types';
import { useAudio } from '../context/AudioContext';
import BackgroundGradient from '../components/BackgroundGradient';
import NoiseGrid from '../components/NoiseGrid';
import MixPanel from '../components/MixPanel';
import VolumeControl from '../components/VolumeControl';
import TimerControl from '../components/TimerControl';

interface Props {
  navigation: any;
}

export default function HomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const {
    state,
    toggleNoise,
    soloNoise,
    removeNoise,
    setNoiseVolume,
    setMasterVolume,
    playAll,
    pauseAll,
    setTimer,
    cancelTimer,
  } = useAudio();

  const activeCount = Object.keys(state.activeNoises).length;
  const isSolo = activeCount === 1;
  const firstNoise = isSolo ? Object.keys(state.activeNoises)[0] as any : null;
  const firstConfig = firstNoise ? NOISE_CONFIGS.find(c => c.key === firstNoise) : null;

  const getNowPlayingText = () => {
    if (activeCount === 0) return null;
    if (activeCount === 1 && firstConfig) return firstConfig.label;
    return `${activeCount} sounds`;
  };

  const nowPlaying = getNowPlayingText();

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <BackgroundGradient />

      <View style={styles.header}>
        <Ionicons name="moon" size={24} color="#818cf8" />
        <Text style={styles.title}>White Noise</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Mix')} activeOpacity={0.7}>
          <Ionicons name="options-outline" size={22} color="#818cf8" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.nowPlayingSection}>
          {nowPlaying ? (
            <>
              <View style={styles.waveformDots}>
                {state.isPlaying && [0, 1, 2, 3].map(i => (
                  <View
                    key={i}
                    style={[
                      styles.dot,
                      { backgroundColor: firstConfig?.color || '#6366f1', opacity: 0.4 + i * 0.15 },
                    ]}
                  />
                ))}
              </View>
              <Text style={[styles.nowPlayingText, { color: firstConfig?.color || '#e5e7eb' }]}>
                {nowPlaying}
              </Text>
              {!state.isPlaying && activeCount > 0 && (
                <Text style={styles.pausedText}>Paused</Text>
              )}
            </>
          ) : (
            <>
              <Ionicons name="moon-outline" size={28} color="#6b7280" />
              <Text style={styles.idleText}>Select a sound</Text>
              <Text style={styles.hintText}>Tap to mix · Hold to solo</Text>
            </>
          )}
        </View>

        <NoiseGrid
          activeNoises={state.activeNoises}
          soloNoise={isSolo ? firstNoise : null}
          onToggle={toggleNoise}
          onSolo={soloNoise}
        />

        <MixPanel
          activeNoises={state.activeNoises}
          masterVolume={state.masterVolume}
          onNoiseVolume={setNoiseVolume}
          onRemoveNoise={removeNoise}
          onOpenMixer={() => navigation.navigate('Mix')}
        />

        <View style={{ gap: 10 }}>
          <VolumeControl
            volume={state.masterVolume}
            onChange={setMasterVolume}
            label="Master Volume"
          />

          <TimerControl
            timerMinutes={state.timerMinutes}
            isTimerActive={state.isTimerActive}
            timerRemaining={state.timerRemaining}
            onSetTimer={setTimer}
            onCancel={cancelTimer}
          />
        </View>

        {activeCount > 0 && (
          <View style={styles.playRow}>
            <TouchableOpacity
              style={styles.playButton}
              onPress={state.isPlaying ? pauseAll : playAll}
              activeOpacity={0.8}
            >
              <Ionicons
                name={state.isPlaying ? 'pause' : 'play'}
                size={28}
                color="#fff"
                style={state.isPlaying ? undefined : { marginLeft: 3 }}
              />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#e5e7eb',
  },
  content: {
    flex: 1,
    gap: 14,
    paddingTop: 4,
    paddingBottom: 10,
  },
  nowPlayingSection: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    minHeight: 60,
  },
  waveformDots: {
    flexDirection: 'row',
    gap: 4,
    height: 6,
    alignItems: 'center',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  nowPlayingText: {
    fontSize: 18,
    fontWeight: '700',
  },
  pausedText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  idleText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  hintText: {
    fontSize: 11,
    color: '#4b5563',
    fontWeight: '500',
  },
  playRow: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});
