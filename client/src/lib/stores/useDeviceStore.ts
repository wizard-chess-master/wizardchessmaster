import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export interface DeviceSettings {
  // Mobile-specific settings
  mobileUIScale: number;
  mobileChessBoardSize: 'small' | 'medium' | 'large';
  mobileShowCoordinates: boolean;
  mobileAnimationSpeed: 'fast' | 'normal' | 'slow';
  
  // Touch settings
  touchSensitivity: number;
  doubleTapDelay: number;
  longPressDelay: number;
  
  // Performance settings
  reducedAnimations: boolean;
  lowPowerMode: boolean;
  preloadAssets: boolean;
  
  // Layout preferences
  compactMode: boolean;
  hideNonEssentialUI: boolean;
  sidebarCollapsed: boolean;
}

interface DeviceStore {
  settings: DeviceSettings;
  deviceType: 'mobile' | 'tablet' | 'desktop' | null;
  orientation: 'portrait' | 'landscape' | null;
  isOnline: boolean;
  
  // Actions
  setDeviceType: (type: 'mobile' | 'tablet' | 'desktop') => void;
  setOrientation: (orientation: 'portrait' | 'landscape') => void;
  setOnlineStatus: (isOnline: boolean) => void;
  updateSetting: <K extends keyof DeviceSettings>(key: K, value: DeviceSettings[K]) => void;
  resetToDefaults: () => void;
  loadDeviceSettings: () => void;
  saveDeviceSettings: () => void;
}

const defaultSettings: DeviceSettings = {
  mobileUIScale: 1.0,
  mobileChessBoardSize: 'medium',
  mobileShowCoordinates: false,
  mobileAnimationSpeed: 'normal',
  touchSensitivity: 1.0,
  doubleTapDelay: 300,
  longPressDelay: 500,
  reducedAnimations: false,
  lowPowerMode: false,
  preloadAssets: true,
  compactMode: false,
  hideNonEssentialUI: false,
  sidebarCollapsed: false
};

const STORAGE_KEY = 'wizard-chess-device-settings';

export const useDeviceStore = create<DeviceStore>()(
  subscribeWithSelector((set, get) => ({
    settings: defaultSettings,
    deviceType: null,
    orientation: null,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,

    setDeviceType: (type) => {
      set({ deviceType: type });
      
      // Auto-adjust settings based on device type
      const { settings } = get();
      if (type === 'mobile') {
        set({
          settings: {
            ...settings,
            compactMode: true,
            hideNonEssentialUI: true,
            mobileChessBoardSize: 'small',
            reducedAnimations: true
          }
        });
      } else if (type === 'tablet') {
        set({
          settings: {
            ...settings,
            compactMode: false,
            hideNonEssentialUI: false,
            mobileChessBoardSize: 'medium'
          }
        });
      } else if (type === 'desktop') {
        set({
          settings: {
            ...settings,
            compactMode: false,
            hideNonEssentialUI: false,
            reducedAnimations: false
          }
        });
      }
      
      get().saveDeviceSettings();
    },

    setOrientation: (orientation) => {
      set({ orientation });
      
      // Adjust settings based on orientation
      const { settings, deviceType } = get();
      if (deviceType === 'mobile' && orientation === 'landscape') {
        set({
          settings: {
            ...settings,
            sidebarCollapsed: true,
            mobileChessBoardSize: 'large'
          }
        });
      } else if (deviceType === 'mobile' && orientation === 'portrait') {
        set({
          settings: {
            ...settings,
            sidebarCollapsed: false,
            mobileChessBoardSize: 'medium'
          }
        });
      }
    },

    setOnlineStatus: (isOnline) => {
      set({ isOnline });
      
      // Adjust settings for offline mode
      if (!isOnline) {
        const { settings } = get();
        set({
          settings: {
            ...settings,
            lowPowerMode: true,
            preloadAssets: false
          }
        });
      }
    },

    updateSetting: (key, value) => {
      set((state) => ({
        settings: {
          ...state.settings,
          [key]: value
        }
      }));
      get().saveDeviceSettings();
    },

    resetToDefaults: () => {
      set({ settings: { ...defaultSettings } });
      get().saveDeviceSettings();
    },

    loadDeviceSettings: () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsedSettings = JSON.parse(stored);
          set((state) => ({
            settings: {
              ...defaultSettings,
              ...parsedSettings
            }
          }));
        }
      } catch (error) {
        console.error('Failed to load device settings:', error);
      }
    },

    saveDeviceSettings: () => {
      try {
        const { settings } = get();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      } catch (error) {
        console.error('Failed to save device settings:', error);
      }
    }
  }))
);

// Load settings on initialization
if (typeof window !== 'undefined') {
  useDeviceStore.getState().loadDeviceSettings();
  
  // Listen for online/offline events
  window.addEventListener('online', () => useDeviceStore.getState().setOnlineStatus(true));
  window.addEventListener('offline', () => useDeviceStore.getState().setOnlineStatus(false));
}