import { create } from 'zustand';

interface DiagnosticsState {
  showDiagnostics: boolean;
  setShowDiagnostics: (show: boolean) => void;
}

export const useDiagnostics = create<DiagnosticsState>((set) => ({
  showDiagnostics: false,
  setShowDiagnostics: (show) => set({ showDiagnostics: show }),
}));