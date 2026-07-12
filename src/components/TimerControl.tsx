import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  timerMinutes: number;
  isTimerActive: boolean;
  timerRemaining: number;
  onSetTimer: (minutes: number) => void;
  onCancel: () => void;
}

const PRESETS = [15, 30, 60];

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function TimerControl({
  timerMinutes,
  isTimerActive,
  timerRemaining,
  onSetTimer,
  onCancel,
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Sleep Timer</Text>
      <View style={styles.row}>
        {PRESETS.map(m => (
          <TouchableOpacity
            key={m}
            style={[
              styles.button,
              timerMinutes === m && isTimerActive && styles.activeButton,
            ]}
            onPress={() => onSetTimer(m)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.buttonText,
                timerMinutes === m && isTimerActive && styles.activeButtonText,
              ]}
            >
              {m}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[
            styles.button,
            !isTimerActive && !timerMinutes && styles.activeButton,
          ]}
          onPress={onCancel}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.buttonText,
              !isTimerActive && !timerMinutes && styles.activeButtonText,
            ]}
          >
            ∞
          </Text>
        </TouchableOpacity>
      </View>
      {isTimerActive && timerMinutes > 0 && (
        <View style={styles.timerRow}>
          <Text style={styles.timerText}>{formatTime(timerRemaining)}</Text>
          <TouchableOpacity onPress={onCancel}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    gap: 6,
  },
  label: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#1a1a2e',
    borderWidth: 1,
    borderColor: '#2a2a3e',
    alignItems: 'center',
  },
  activeButton: {
    borderColor: '#6366f1',
    backgroundColor: '#6366f115',
  },
  buttonText: {
    fontSize: 13,
    color: '#9ca3af',
    fontWeight: '600',
  },
  activeButtonText: {
    color: '#818cf8',
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingTop: 4,
  },
  timerText: {
    fontSize: 14,
    color: '#818cf8',
    fontWeight: '600',
  },
  cancelText: {
    fontSize: 13,
    color: '#ef4444',
    fontWeight: '600',
  },
});
