import React, { createContext, useContext, useReducer, useRef, useCallback, useEffect } from 'react';
import { Audio } from 'expo-av';
import type { AudioState, AudioAction, NoiseType, MixEntry } from '../types';
import { NOISE_CONFIGS } from '../types';

const AUDIO_SOURCES: Record<string, any> = {
  'white-noise.wav': require('../../assets/audio/white-noise.wav'),
  'pink-noise.wav': require('../../assets/audio/pink-noise.wav'),
  'brown-noise.wav': require('../../assets/audio/brown-noise.wav'),
  'rain.wav': require('../../assets/audio/rain.wav'),
  'ocean.wav': require('../../assets/audio/ocean.wav'),
  'wind.wav': require('../../assets/audio/wind.wav'),
  'fan.wav': require('../../assets/audio/fan.wav'),
  'thunderstorm.wav': require('../../assets/audio/thunderstorm.wav'),
  'campfire.wav': require('../../assets/audio/campfire.wav'),
  'crickets.wav': require('../../assets/audio/crickets.wav'),
  'waterfall.wav': require('../../assets/audio/waterfall.wav'),
  'heartbeat.wav': require('../../assets/audio/heartbeat.wav'),
};

const DEFAULT_VOLUME = 0.7;

function initialState(): AudioState {
  return {
    activeNoises: {},
    masterVolume: DEFAULT_VOLUME,
    isPlaying: false,
    timerMinutes: 0,
    timerRemaining: 0,
    isTimerActive: false,
  };
}

function reducer(state: AudioState, action: AudioAction): AudioState {
  switch (action.type) {
    case 'ADD_TO_MIX': {
      const entry: MixEntry = { volume: action.volume, isLoaded: false, isLoading: true };
      return { ...state, activeNoises: { ...state.activeNoises, [action.noise]: entry } };
    }
    case 'REMOVE_FROM_MIX': {
      const { [action.noise]: _, ...rest } = state.activeNoises;
      return { ...state, activeNoises: rest };
    }
    case 'SET_MIX_VOLUME': {
      const entry = state.activeNoises[action.noise];
      if (!entry) return state;
      return {
        ...state,
        activeNoises: {
          ...state.activeNoises,
          [action.noise]: { ...entry, volume: action.volume },
        },
      };
    }
    case 'SET_MIX_LOADING': {
      const entry = state.activeNoises[action.noise];
      if (!entry) return state;
      return {
        ...state,
        activeNoises: {
          ...state.activeNoises,
          [action.noise]: { ...entry, isLoading: action.loading },
        },
      };
    }
    case 'SET_MIX_LOADED': {
      const entry = state.activeNoises[action.noise];
      if (!entry) return state;
      return {
        ...state,
        activeNoises: {
          ...state.activeNoises,
          [action.noise]: { ...entry, isLoaded: action.loaded, isLoading: false },
        },
      };
    }
    case 'CLEAR_MIX':
      return { ...state, activeNoises: {} };
    case 'SET_MASTER_VOLUME':
      return { ...state, masterVolume: action.volume };
    case 'SET_PLAYING':
      return { ...state, isPlaying: action.playing };
    case 'SET_TIMER_MINUTES':
      return { ...state, timerMinutes: action.minutes };
    case 'SET_TIMER_REMAINING':
      return { ...state, timerRemaining: action.seconds };
    case 'SET_TIMER_ACTIVE':
      return { ...state, isTimerActive: action.active };
    default:
      return state;
  }
}

interface AudioContextValue {
  state: AudioState;
  toggleNoise: (type: NoiseType) => Promise<void>;
  soloNoise: (type: NoiseType) => Promise<void>;
  removeNoise: (type: NoiseType) => Promise<void>;
  setNoiseVolume: (type: NoiseType, volume: number) => Promise<void>;
  setMasterVolume: (volume: number) => Promise<void>;
  playAll: () => Promise<void>;
  pauseAll: () => Promise<void>;
  isInMix: (type: NoiseType) => boolean;
  setTimer: (minutes: number) => void;
  cancelTimer: () => void;
}

const AudioContext = createContext<AudioContextValue | null>(null);

function computeEffectiveVolume(noiseVolume: number, masterVolume: number): number {
  const eff = noiseVolume * masterVolume;
  if (eff < 0.003) return 0;
  return Math.min(1, eff);
}

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const soundRefs = useRef<Map<NoiseType, Audio.Sound>>(new Map());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const remainingRef = useRef(0);

  const applyVolume = useCallback(async (type: NoiseType, noiseVolume: number, master: number) => {
    const sound = soundRefs.current.get(type);
    if (!sound) return;
    const eff = computeEffectiveVolume(noiseVolume, master);
    try {
      await sound.setVolumeAsync(eff);
    } catch { }
  }, []);

  const applyVolumeAll = useCallback(async (master: number) => {
    const entries = Object.entries(state.activeNoises) as [NoiseType, MixEntry][];
    await Promise.all(entries.map(([type, entry]) => applyVolume(type, entry.volume, master)));
  }, [state.activeNoises, applyVolume]);

  const unloadSound = useCallback(async (type: NoiseType) => {
    const sound = soundRefs.current.get(type);
    if (sound) {
      try {
        await sound.unloadAsync();
      } catch { }
      soundRefs.current.delete(type);
    }
  }, []);

  const unloadAllSounds = useCallback(async () => {
    const types = Array.from(soundRefs.current.keys());
    await Promise.all(types.map(unloadSound));
  }, [unloadSound]);

  const loadSound = useCallback(async (type: NoiseType, shouldPlay: boolean): Promise<boolean> => {
    const config = NOISE_CONFIGS.find(c => c.key === type);
    if (!config) return false;

    Audio.setAudioModeAsync({
      staysActiveInBackground: true,
      shouldDuckAndroid: false,
    });

    try {
      const source = AUDIO_SOURCES[config.file];
      if (!source) return false;

      const { sound } = await Audio.Sound.createAsync(
        source,
        { shouldPlay, volume: 0, isLooping: true }
      );
      soundRefs.current.set(type, sound);
      return true;
    } catch (e) {
      console.error('Failed to load sound:', type, e);
      return false;
    }
  }, []);

  const refreshAllPlayStates = useCallback(async (shouldPlay: boolean) => {
    const promises = Array.from(soundRefs.current.entries()).map(async ([type, sound]) => {
      try {
        const status = await sound.getStatusAsync();
        if (status.isLoaded) {
          if (shouldPlay && !status.isPlaying) await sound.playAsync();
          else if (!shouldPlay && status.isPlaying) await sound.pauseAsync();
        }
      } catch { }
    });
    await Promise.all(promises);
  }, []);

  const isInMix = useCallback((type: NoiseType) => {
    return !!state.activeNoises[type];
  }, [state.activeNoises]);

  const toggleNoise = useCallback(async (type: NoiseType) => {
    if (state.activeNoises[type]) {
      await unloadSound(type);
      dispatch({ type: 'REMOVE_FROM_MIX', noise: type });
      return;
    }

    const vol = DEFAULT_VOLUME;
    dispatch({ type: 'ADD_TO_MIX', noise: type, volume: vol });
    dispatch({ type: 'SET_MIX_LOADING', noise: type, loading: true });

    const ok = await loadSound(type, state.isPlaying);
    if (ok) {
      await applyVolume(type, vol, state.masterVolume);
      dispatch({ type: 'SET_MIX_LOADED', noise: type, loaded: true });
    } else {
      dispatch({ type: 'REMOVE_FROM_MIX', noise: type });
    }
  }, [state.activeNoises, state.isPlaying, state.masterVolume, loadSound, unloadSound, applyVolume]);

  const soloNoise = useCallback(async (type: NoiseType) => {
    const currentTypes = Array.from(soundRefs.current.keys());
    const toUnload = currentTypes.filter(t => t !== type);
    await Promise.all(toUnload.map(unloadSound));
    const soloTypes = currentTypes.filter(t => t === type);
    dispatch({ type: 'CLEAR_MIX' });

    if (soloTypes.length > 0) {
      dispatch({ type: 'ADD_TO_MIX', noise: type, volume: DEFAULT_VOLUME });
      dispatch({ type: 'SET_MIX_LOADED', noise: type, loaded: true });
      const sound = soundRefs.current.get(type);
      if (sound) {
        await applyVolume(type, DEFAULT_VOLUME, state.masterVolume);
        try {
          const status = await sound.getStatusAsync();
          if (status.isLoaded && !status.isPlaying) {
            await sound.playAsync();
          }
        } catch { }
      }
      dispatch({ type: 'SET_PLAYING', playing: true });
    } else {
      dispatch({ type: 'ADD_TO_MIX', noise: type, volume: DEFAULT_VOLUME });
      dispatch({ type: 'SET_MIX_LOADING', noise: type, loading: true });
      const ok = await loadSound(type, true);
      if (ok) {
        await applyVolume(type, DEFAULT_VOLUME, state.masterVolume);
        dispatch({ type: 'SET_MIX_LOADED', noise: type, loaded: true });
      } else {
        dispatch({ type: 'REMOVE_FROM_MIX', noise: type });
      }
      dispatch({ type: 'SET_PLAYING', playing: true });
    }
  }, [state.masterVolume, loadSound, unloadSound, applyVolume]);

  const removeNoise = useCallback(async (type: NoiseType) => {
    await unloadSound(type);
    dispatch({ type: 'REMOVE_FROM_MIX', noise: type });
  }, [unloadSound]);

  const setNoiseVolume = useCallback(async (type: NoiseType, volume: number) => {
    dispatch({ type: 'SET_MIX_VOLUME', noise: type, volume });
    await applyVolume(type, volume, state.masterVolume);
  }, [state.masterVolume, applyVolume]);

  const setMasterVolume = useCallback(async (volume: number) => {
    dispatch({ type: 'SET_MASTER_VOLUME', volume });
    await applyVolumeAll(volume);
  }, [applyVolumeAll]);

  const playAll = useCallback(async () => {
    dispatch({ type: 'SET_PLAYING', playing: true });
    await refreshAllPlayStates(true);
  }, [refreshAllPlayStates]);

  const pauseAll = useCallback(async () => {
    dispatch({ type: 'SET_PLAYING', playing: false });
    await refreshAllPlayStates(false);
  }, [refreshAllPlayStates]);

  const cancelTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    remainingRef.current = 0;
    dispatch({ type: 'SET_TIMER_MINUTES', minutes: 0 });
    dispatch({ type: 'SET_TIMER_ACTIVE', active: false });
    dispatch({ type: 'SET_TIMER_REMAINING', seconds: 0 });
  }, []);

  const setTimer = useCallback((minutes: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (minutes <= 0) { cancelTimer(); return; }

    remainingRef.current = minutes * 60;
    dispatch({ type: 'SET_TIMER_MINUTES', minutes });
    dispatch({ type: 'SET_TIMER_ACTIVE', active: true });
    dispatch({ type: 'SET_TIMER_REMAINING', seconds: remainingRef.current });

    timerRef.current = setInterval(() => {
      remainingRef.current -= 1;
      dispatch({ type: 'SET_TIMER_REMAINING', seconds: remainingRef.current });
      if (remainingRef.current <= 0) {
        cancelTimer();
        pauseAll();
      }
    }, 1000);
  }, [cancelTimer, pauseAll]);

  useEffect(() => {
    return () => {
      unloadAllSounds();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [unloadAllSounds]);

  return (
    <AudioContext.Provider value={{
      state, toggleNoise, soloNoise, removeNoise,
      setNoiseVolume, setMasterVolume, playAll, pauseAll, isInMix,
      setTimer, cancelTimer,
    }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio(): AudioContextValue {
  const ctx = useContext(AudioContext);
  if (!ctx) throw new Error('useAudio must be used within AudioProvider');
  return ctx;
}
