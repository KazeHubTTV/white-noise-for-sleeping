export type NoiseType = 'white' | 'pink' | 'brown' | 'rain' | 'ocean' | 'wind' | 'fan' | 'thunderstorm' | 'campfire' | 'crickets' | 'waterfall' | 'heartbeat';

export interface NoiseConfig {
  key: NoiseType;
  label: string;
  icon: string;
  file: string;
  color: string;
}

export const NOISE_CONFIGS: NoiseConfig[] = [
  { key: 'white', label: 'White Noise', icon: 'radio-tower', file: 'white-noise.wav', color: '#6366f1' },
  { key: 'pink', label: 'Pink Noise', icon: 'heart-pulse', file: 'pink-noise.wav', color: '#ec4899' },
  { key: 'brown', label: 'Brown Noise', icon: 'waves', file: 'brown-noise.wav', color: '#f59e0b' },
  { key: 'rain', label: 'Rain', icon: 'weather-pouring', file: 'rain.wav', color: '#3b82f6' },
  { key: 'ocean', label: 'Ocean', icon: 'sail-boat', file: 'ocean.wav', color: '#06b6d4' },
  { key: 'wind', label: 'Wind', icon: 'weather-windy', file: 'wind.wav', color: '#8b5cf6' },
  { key: 'fan', label: 'Box Fan', icon: 'fan', file: 'fan.wav', color: '#10b981' },
  { key: 'thunderstorm', label: 'Thunderstorm', icon: 'thunderstorm', file: 'thunderstorm.wav', color: '#6b7280' },
  { key: 'campfire', label: 'Campfire', icon: 'flame', file: 'campfire.wav', color: '#f97316' },
  { key: 'crickets', label: 'Crickets', icon: 'bug', file: 'crickets.wav', color: '#84cc16' },
  { key: 'waterfall', label: 'Waterfall', icon: 'water', file: 'waterfall.wav', color: '#06b6d4' },
  { key: 'heartbeat', label: 'Heartbeat', icon: 'fitness', file: 'heartbeat.wav', color: '#ef4444' },
];

export interface MixEntry {
  volume: number;
  isLoaded: boolean;
  isLoading: boolean;
}

export interface AudioState {
  activeNoises: Partial<Record<NoiseType, MixEntry>>;
  masterVolume: number;
  isPlaying: boolean;
  timerMinutes: number;
  timerRemaining: number;
  isTimerActive: boolean;
}

export type AudioAction =
  | { type: 'ADD_TO_MIX'; noise: NoiseType; volume: number }
  | { type: 'REMOVE_FROM_MIX'; noise: NoiseType }
  | { type: 'SET_MIX_VOLUME'; noise: NoiseType; volume: number }
  | { type: 'SET_MIX_LOADING'; noise: NoiseType; loading: boolean }
  | { type: 'SET_MIX_LOADED'; noise: NoiseType; loaded: boolean }
  | { type: 'CLEAR_MIX' }
  | { type: 'SET_MASTER_VOLUME'; volume: number }
  | { type: 'SET_PLAYING'; playing: boolean }
  | { type: 'SET_TIMER_MINUTES'; minutes: number }
  | { type: 'SET_TIMER_REMAINING'; seconds: number }
  | { type: 'SET_TIMER_ACTIVE'; active: boolean };
