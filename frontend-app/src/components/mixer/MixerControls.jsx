import { useEffect, useRef } from 'react';
import { Settings2, Square, Cpu } from 'lucide-react';
import useStore from '@/store/useStore';
import { mixImages, resizeImages } from '@/utils/api';
import InfoCard from '@/components/common/InfoCard';
import { MIXER_INFO } from '@/utils/education';
import './MixerControls.css';

const VIEWPORT_COLORS = ['var(--cyan)', 'var(--amber)', 'var(--violet)', 'var(--green)'];
const VIEWPORT_LABELS = ['IMG 01', 'IMG 02', 'IMG 03', 'IMG 04'];

const ROLE_OPTIONS = {
  magnitude_phase: [
    { value: 'magnitude', short: 'MAG' },
    { value: 'phase',     short: 'PHS' },
  ],
  real_imaginary: [
    { value: 'real',      short: 'RE' },
    { value: 'imaginary', short: 'IM' },
  ],
};

export default function MixerControls() {
  const store = useStore();
  const {
    viewports, setViewport,
    mixWeights, setMixWeight,
    mixMode, setMixMode,
    ftMixRoles, setFTMixRole,
    resizePolicy, setResizePolicy,
    keepAspect, setKeepAspect,
    regionFraction, setRegionFraction,
    regionType, setRegionType,
    regionEnabled, setRegionEnabled,
    activeOutput, setActiveOutput,
    setOutputImage,
    simulateDelay, setSimulateDelay,
    isMixing, setIsMixing,
    mixProgress, setMixProgress,
  } = store;

  // Always-current ref — timeout reads this, never a stale closure
  const latestRef = useRef({});
  latestRef.current = {
    viewports, mixWeights, ftMixRoles, mixMode,
    resizePolicy, keepAspect, regionEnabled, regionFraction, regionType,
    activeOutput, simulateDelay,
  };

  const abortRef     = useRef(null);
  const debounceRef  = useRef(null);
  const progressRef  = useRef(null);
  const resizeDebRef = useRef(null);

  const roleOptions = ROLE_OPTIONS[mixMode];

  // ── Run mix using latest values from ref ──────────────────────────────────
  const runMix = () => {
    const {
      viewports, mixWeights, ftMixRoles, mixMode,
      resizePolicy, keepAspect, regionEnabled, regionFraction, regionType,
      activeOutput, simulateDelay,
    } = latestRef.current;

    const active = viewports
      .map((v, i) => ({ v, i }))
      .filter(({ v }) => v?.imageId);

    if (active.length === 0) return;

    // Cancel any in-flight request
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsMixing(true);
    setMixProgress(10);
    clearInterval(progressRef.current);
    progressRef.current = setInterval(() => {
      setMixProgress(p => Math.min(p + 4, 85));
    }, 150);

    mixImages(
      {
        image_ids:       active.map(({ v }) => v.imageId),
        weights:         active.map(({ i }) => mixWeights[i]),
        image_roles:     active.map(({ i }) => ftMixRoles[i]),
        mix_mode:        mixMode,
        resize_policy:   resizePolicy,
        fixed_height:    512,
        fixed_width:     512,
        keep_aspect:     keepAspect,
        region_fraction: regionEnabled ? regionFraction : null,
        region_type:     regionType,
        simulate_delay:  simulateDelay,
      },
      controller.signal
    ).then(res => {
      clearInterval(progressRef.current);
      setMixProgress(100);
      setOutputImage(activeOutput, res.data.result_b64);
      setTimeout(() => { setMixProgress(0); setIsMixing(false); }, 300);
    }).catch(e => {
      clearInterval(progressRef.current);
      if (e.code !== 'ERR_CANCELED' && e.name !== 'CanceledError') {
        console.error('Mix failed:', e);
      }
      setMixProgress(0);
      setIsMixing(false);
    });
  };

  // ── Trigger mix with debounce whenever any mix input changes ──────────────
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(runMix, 180);
    return () => clearTimeout(debounceRef.current);
  }, [
    // Stringify to detect deep changes without triggering on reference changes
    JSON.stringify(viewports.map(v => v?.imageId)),
    JSON.stringify(mixWeights),
    JSON.stringify(ftMixRoles),
    mixMode, resizePolicy, keepAspect,
    regionEnabled, regionFraction, regionType,
    activeOutput, simulateDelay,
  ]);

  // ── Update input viewport previews to match resize policy ─────────────────
  useEffect(() => {
    const loaded = viewports.filter(v => v?.imageId);
    if (loaded.length < 2) return;

    clearTimeout(resizeDebRef.current);
    resizeDebRef.current = setTimeout(async () => {
      try {
        const res = await resizeImages(
          loaded.map(v => v.imageId),
          resizePolicy, 512, 512, keepAspect
        );
        const results = res.data.results;
        // Update each viewport's displayed spatialB64 in the store
        useStore.setState(s => {
          const vps = s.viewports.map(v => {
            if (v?.imageId && results[v.imageId]) {
              return { ...v, spatialB64: results[v.imageId] };
            }
            return v;
          });
          return { viewports: vps };
        });
      } catch (e) {
        console.warn('Resize preview failed:', e);
      }
    }, 300);

    return () => clearTimeout(resizeDebRef.current);
  }, [
    JSON.stringify(viewports.map(v => v?.imageId)),
    resizePolicy, keepAspect,
  ]);

  const handleStop = () => {
    if (abortRef.current) abortRef.current.abort();
    clearInterval(progressRef.current);
    setIsMixing(false);
    setMixProgress(0);
  };

  const activeCount = viewports.filter(v => v?.imageId).length;

  return (
    <aside className="mixer-controls">

      {/* Mix Mode */}
      <div className="mc-section">
        <div className="mc-section-title"><Settings2 size={11} /> Mix Mode</div>
        <div className="mc-toggle-group">
          <button className={`mc-toggle ${mixMode === 'magnitude_phase' ? 'mc-toggle-active' : ''}`}
            onClick={() => setMixMode('magnitude_phase')}>Mag / Phase</button>
          <button className={`mc-toggle ${mixMode === 'real_imaginary' ? 'mc-toggle-active' : ''}`}
            onClick={() => setMixMode('real_imaginary')}>Real / Imag</button>
        </div>
        <p className="mc-hint">
          Set each image's <strong>role</strong> and <strong>weight</strong> below.
          Output updates automatically.
        </p>
        <InfoCard
          spatial={MIXER_INFO.mixMode.spatial}
          frequency={MIXER_INFO.mixMode.frequency}
          duality={MIXER_INFO.mixMode.duality}
        />
      </div>

      <div className="sep" />

      {/* Per-image role + weight */}
      <div className="mc-section">
        <div className="mc-section-title">Image Contributions</div>
        <InfoCard
          spatial={MIXER_INFO.roles.spatial}
          frequency={MIXER_INFO.roles.frequency}
          duality={MIXER_INFO.roles.duality}
        />
        {VIEWPORT_LABELS.map((label, i) => {
          const color = VIEWPORT_COLORS[i];
          const disabled = !viewports[i]?.imageId;
          return (
            <div key={i} className={`mc-image-block ${disabled ? 'disabled' : ''}`}>
              <div className="mc-image-header">
                <span className="mc-weight-label" style={{ color: disabled ? 'var(--text-muted)' : color }}>
                  {label}
                </span>
                <div className="mc-role-toggle">
                  {roleOptions.map(opt => (
                    <button
                      key={opt.value}
                      className={`mc-role-btn ${ftMixRoles[i] === opt.value ? 'mc-role-active' : ''}`}
                      style={ftMixRoles[i] === opt.value ? { '--role-color': color } : {}}
                      onClick={() => !disabled && setFTMixRole(i, opt.value)}
                    >
                      {opt.short}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mc-weight-row">
                <span className="label" style={{ opacity: 0.6 }}>weight</span>
                <input type="range" className="mc-slider"
                  min={0} max={1} step={0.01}
                  value={mixWeights[i]} disabled={disabled}
                  onChange={e => setMixWeight(i, parseFloat(e.target.value))}
                  style={{ '--slider-color': color }}
                />
                <span className="mc-weight-val">{mixWeights[i].toFixed(2)}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="sep" />

      {/* Resize policy */}
      <div className="mc-section">
        <div className="mc-section-title">Resize Policy</div>
        <select className="input" value={resizePolicy} onChange={e => setResizePolicy(e.target.value)}>
          <option value="smallest">Smallest</option>
          <option value="largest">Largest</option>
          <option value="fixed">Fixed (512×512)</option>
        </select>
        <label className="mc-checkbox-row">
          <input type="checkbox" checked={keepAspect} onChange={e => setKeepAspect(e.target.checked)} />
          <span>Keep Aspect Ratio</span>
        </label>
        <p className="mc-hint">Applied to both input previews and output.</p>
      </div>

      <div className="sep" />

      {/* Frequency region */}
      <div className="mc-section">
        <div className="mc-section-title">Frequency Region</div>
        <InfoCard
          spatial={MIXER_INFO.region.spatial}
          frequency={MIXER_INFO.region.frequency}
          duality={MIXER_INFO.region.duality}
        />
        <label className="mc-checkbox-row">
          <input type="checkbox" checked={regionEnabled}
            onChange={e => setRegionEnabled(e.target.checked)} />
          <span>Enable Region Selection</span>
        </label>
        {regionEnabled && (
          <>
            <div className="mc-toggle-group">
              <button className={`mc-toggle ${regionType === 'inner' ? 'mc-toggle-active' : ''}`}
                onClick={() => setRegionType('inner')}>Inner (Low)</button>
              <button className={`mc-toggle ${regionType === 'outer' ? 'mc-toggle-active' : ''}`}
                onClick={() => setRegionType('outer')}>Outer (High)</button>
            </div>
            <div className="mc-weight-row">
              <span className="label">Size</span>
              <input type="range" min={0.05} max={1} step={0.01}
                value={regionFraction}
                onChange={e => setRegionFraction(parseFloat(e.target.value))}
              />
              <span className="mc-weight-val">{Math.round(regionFraction * 100)}%</span>
            </div>
            <p className="mc-hint">Unified rectangle shown on all FT panels.</p>
          </>
        )}
      </div>

      <div className="sep" />

      {/* Output target */}
      <div className="mc-section">
        <div className="mc-section-title">Output Viewport</div>
        <div className="mc-toggle-group">
          <button className={`mc-toggle ${activeOutput === 0 ? 'mc-toggle-active' : ''}`}
            onClick={() => setActiveOutput(0)}>Output 1</button>
          <button className={`mc-toggle ${activeOutput === 1 ? 'mc-toggle-active' : ''}`}
            onClick={() => setActiveOutput(1)}>Output 2</button>
        </div>
      </div>

      <div className="sep" />

      {/* Debug */}
      <div className="mc-section">
        <label className="mc-checkbox-row">
          <input type="checkbox" checked={simulateDelay} onChange={e => setSimulateDelay(e.target.checked)} />
          <Cpu size={10} />
          <span>Simulate Bottleneck (3s)</span>
        </label>
      </div>

      <div className="mc-spacer" />

      {/* Live status */}
      <div className="mc-live-row">
        {isMixing ? (
          <>
            <div className="progress-bar mc-progress">
              <div className="progress-bar-fill" style={{ width: `${mixProgress}%` }} />
            </div>
            <button className="btn btn-amber mc-cancel-btn" onClick={handleStop}>
              <Square size={10} /> Cancel
            </button>
          </>
        ) : (
          <div className="mc-live-idle">
            <div className="mc-live-dot" />
            <span>Live — updates automatically</span>
          </div>
        )}
      </div>

    </aside>
  );
}
