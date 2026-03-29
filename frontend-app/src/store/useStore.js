import { create } from 'zustand';

const useStore = create((set, get) => ({
  mode: 'mixer',
  setMode: (mode) => set({ mode }),

  // ── THEME ─────────────────────────────────────────────────────────────────────
  theme: 'dark',   // 'dark' | 'light'
  setTheme: (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    set({ theme });
  },

  // ── MIXER STATE ───────────────────────────────────────────────────────────────
  viewports: [null, null, null, null],
  setViewport: (index, data) =>
    set((s) => { const v = [...s.viewports]; v[index] = data; return { viewports: v }; }),
  clearViewport: (index) =>
    set((s) => { const v = [...s.viewports]; v[index] = null; return { viewports: v }; }),

  ftDisplayComponents: ['magnitude', 'magnitude', 'magnitude', 'magnitude'],
  setFTDisplayComponent: (index, component) =>
    set((s) => { const a = [...s.ftDisplayComponents]; a[index] = component; return { ftDisplayComponents: a }; }),

  ftMixRoles: ['magnitude', 'phase', 'magnitude', 'phase'],
  setFTMixRole: (index, role) =>
    set((s) => { const a = [...s.ftMixRoles]; a[index] = role; return { ftMixRoles: a }; }),

  viewportSettings: [
    { brightness: 1.0, contrast: 1.0 },
    { brightness: 1.0, contrast: 1.0 },
    { brightness: 1.0, contrast: 1.0 },
    { brightness: 1.0, contrast: 1.0 },
  ],
  setViewportSetting: (index, key, value) =>
    set((s) => ({
      viewportSettings: s.viewportSettings.map((v, i) => i === index ? { ...v, [key]: value } : v)
    })),

  mixWeights: [1.0, 1.0, 1.0, 1.0],
  setMixWeight: (index, value) =>
    set((s) => { const a = [...s.mixWeights]; a[index] = value; return { mixWeights: a }; }),

  mixMode: 'magnitude_phase',
  setMixMode: (mixMode) =>
    set(() => ({
      mixMode,
      ftMixRoles: mixMode === 'magnitude_phase'
        ? ['magnitude', 'phase', 'magnitude', 'phase']
        : ['real', 'imaginary', 'real', 'imaginary'],
    })),

  resizePolicy: 'smallest',
  setResizePolicy: (resizePolicy) => set({ resizePolicy }),
  keepAspect: false,
  setKeepAspect: (keepAspect) => set({ keepAspect }),

  // Region mixer state
  regionFraction: 0.5,
  setRegionFraction: (regionFraction) => set({ regionFraction }),
  regionType: 'inner',
  setRegionType: (regionType) => set({ regionType }),
  regionEnabled: false,
  setRegionEnabled: (regionEnabled) => set({ regionEnabled }),

  activeOutput: 0,
  setActiveOutput: (activeOutput) => set({ activeOutput }),
  outputImages: [null, null],
  setOutputImage: (index, b64) =>
    set((s) => { const a = [...s.outputImages]; a[index] = b64; return { outputImages: a }; }),

  simulateDelay: false,
  setSimulateDelay: (simulateDelay) => set({ simulateDelay }),
  isMixing: false,
  mixProgress: 0,
  setIsMixing: (isMixing) => set({ isMixing }),
  setMixProgress: (mixProgress) => set({ mixProgress }),

  // ── EMPHASIZER STATE ──────────────────────────────────────────────────────────
  emphImageId: null,
  emphSpatialB64: null,
  setEmphImage: (imageId, b64) => set({ emphImageId: imageId, emphSpatialB64: b64 }),

  emphAction: 'shift',
  setEmphAction: (emphAction) => set({ emphAction }),

  // domain: apply action on 'spatial' or 'frequency' domain
  emphDomain: 'spatial',
  setEmphDomain: (emphDomain) => set({ emphDomain }),

  emphParams: {
    shift_dy: 50, shift_dx: 50,
    u0: 0.1, v0: 0.1,
    stretch_sy: 1.5, stretch_sx: 1.5,
    mirror_axis: 'horizontal',
    rotation_degrees: 45,
    diff_axis: 'x',
    integ_axis: 'x',
    window_type: 'gaussian',
    window_sigma: 0.3,
    window_alpha: 0.54,
    // post-processing: repeated FT (0 = off)
    fourier_times: 0,
    ft_component: 'magnitude',
    brightness: 1.0,
    contrast: 1.0,
  },
  setEmphParam: (key, value) =>
    set((s) => ({ emphParams: { ...s.emphParams, [key]: value } })),

  emphResult: null,
  setEmphResult: (emphResult) => set({ emphResult }),
  isEmphasizing: false,
  setIsEmphasizing: (isEmphasizing) => set({ isEmphasizing }),
}));

export default useStore;
