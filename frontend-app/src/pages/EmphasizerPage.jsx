import { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, RefreshCw, ChevronDown, Repeat } from 'lucide-react';
import useStore from '@/store/useStore';
import { uploadImage, applyEmphasizer } from '@/utils/api';
import InfoCard from '@/components/common/InfoCard';
import { EMPHASIZER_INFO } from '@/utils/education';
import './EmphasizerPage.css';

// 9 core actions — Fourier Repeat removed, now a separate post-processing control
const ACTIONS = [
  { value: 'shift',                label: '1. Spatial Shift' },
  { value: 'multiply_complex_exp', label: '2. Complex Exponential Multiply' },
  { value: 'stretch',              label: '3. Stretch' },
  { value: 'mirror',               label: '4. Mirror / Flip' },
  { value: 'make_even',            label: '5. Make Even (Symmetrize)' },
  { value: 'make_odd',             label: '6. Make Odd (Antisymmetrize)' },
  { value: 'rotate',               label: '7. Rotate' },
  { value: 'differentiate',        label: '8. Differentiate' },
  { value: 'integrate',            label: '9. Integrate (Cumulative Sum)' },
  { value: 'window',               label: '9b. Window Function' },
];

const FT_COMPONENTS = ['magnitude', 'phase', 'real', 'imaginary'];

function ParamControls({ action, params, setParam }) {
  const slider = (key, min, max, step, label, unit = '') => (
    <div className="ep-param-row" key={key}>
      <label className="label">{label}</label>
      <input type="range" min={min} max={max} step={step}
        value={params[key]}
        onChange={e => setParam(key, parseFloat(e.target.value))}
      />
      <span className="ep-val">{params[key]}{unit}</span>
    </div>
  );

  const intSlider = (key, min, max, label, unit = '') => (
    <div className="ep-param-row" key={key}>
      <label className="label">{label}</label>
      <input type="range" min={min} max={max} step={1}
        value={params[key]}
        onChange={e => setParam(key, parseInt(e.target.value))}
      />
      <span className="ep-val">{params[key]}{unit}</span>
    </div>
  );

  const toggle = (key, options) => (
    <div className="ep-param-row ep-param-row-toggle" key={key}>
      <label className="label">{key.replace(/_/g, ' ')}</label>
      <div className="ep-toggle-group">
        {options.map(o => (
          <button key={o.value}
            className={`ep-toggle ${params[key] === o.value ? 'ep-toggle-active' : ''}`}
            onClick={() => setParam(key, o.value)}
          >{o.label}</button>
        ))}
      </div>
    </div>
  );

  switch (action) {
    case 'shift':
      return <>{intSlider('shift_dy', -200, 200, 'Shift Y', 'px')}{intSlider('shift_dx', -200, 200, 'Shift X', 'px')}</>;
    case 'multiply_complex_exp':
      return <>{slider('u0', -1, 1, 0.01, 'Freq U₀')}{slider('v0', -1, 1, 0.01, 'Freq V₀')}</>;
    case 'stretch':
      return <>{slider('stretch_sy', 0.1, 4, 0.1, 'Scale Y', '×')}{slider('stretch_sx', 0.1, 4, 0.1, 'Scale X', '×')}</>;
    case 'mirror':
      return toggle('mirror_axis', [
        { value: 'horizontal', label: 'H' },
        { value: 'vertical', label: 'V' },
        { value: 'both', label: 'Both' },
      ]);
    case 'rotate':
      return intSlider('rotation_degrees', 0, 360, 'Degrees', '°');
    case 'differentiate':
      return toggle('diff_axis', [{ value: 'x', label: 'X axis' }, { value: 'y', label: 'Y axis' }]);
    case 'integrate':
      return toggle('integ_axis', [{ value: 'x', label: 'X axis' }, { value: 'y', label: 'Y axis' }]);
    case 'window':
      return (
        <>
          {toggle('window_type', [
            { value: 'rectangular', label: 'Rect' },
            { value: 'gaussian', label: 'Gauss' },
            { value: 'hamming', label: 'Hamm' },
            { value: 'hanning', label: 'Hann' },
          ])}
          {params.window_type === 'gaussian' && slider('window_sigma', 0.01, 1, 0.01, 'Sigma')}
        </>
      );
    default:
      return <p className="ep-no-params">No parameters needed</p>;
  }
}

export default function EmphasizerPage() {
  const {
    emphImageId, emphSpatialB64, setEmphImage,
    emphAction, setEmphAction,
    emphDomain, setEmphDomain,
    emphParams, setEmphParam,
    emphResult, setEmphResult,
    isEmphasizing, setIsEmphasizing,
  } = useStore();

  const fileInputRef = useRef(null);
  const [loadingUpload, setLoadingUpload] = useState(false);
  const debounceRef = useRef(null);
  // Keep a local ref of the latest result so panels never go blank mid-update
  const stableResultRef = useRef(null);
  const [displayResult, setDisplayResult] = useState(null);

  const triggerApply = useCallback((imageId, action, domain, params) => {
    if (!imageId) return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setIsEmphasizing(true);
      try {
        const res = await applyEmphasizer({
          image_id: imageId,
          action,
          domain,
          ...params,
        });
        // Only update display when full result is ready — no intermediate blank
        stableResultRef.current = res.data;
        setDisplayResult(res.data);
        setEmphResult(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsEmphasizing(false);
      }
    }, 150);
  }, [setIsEmphasizing, setEmphResult]);

  useEffect(() => {
    triggerApply(emphImageId, emphAction, emphDomain, emphParams);
    return () => clearTimeout(debounceRef.current);
  }, [emphImageId, emphAction, emphDomain, emphParams, triggerApply]);

  const handleFileSelect = async (file) => {
    if (!file) return;
    setLoadingUpload(true);
    try {
      const res = await uploadImage(file);
      setEmphImage(res.data.image_id, res.data.spatial_b64);
    } catch (e) { console.error(e); }
    finally { setLoadingUpload(false); }
  };

  // Use displayResult (local state) — only updated when full response arrives
  // This means panels never flash blank between requests
  const result = displayResult;

  // Panel labels come from the backend response so they describe domain correctly
  const panelLabels = result
    ? [result.panel_tl_label, result.panel_tr_label, result.panel_bl_label, result.panel_br_label]
    : ['Original — Spatial', `Original — FT ${emphParams.ft_component}`, `Transformed — ${emphAction}`, 'FT of Transformed'];

  const panelB64s = result
    ? [result.panel_tl_b64, result.panel_tr_b64, result.panel_bl_b64, result.panel_br_b64]
    : [emphSpatialB64, null, null, null];

  // sublabels depend on domain
  const sublabels = emphDomain === 'spatial'
    ? ['f(x,y)', 'F(u,v)', 'g(x,y)', 'G(u,v)']
    : ['F(u,v)', 'f(x,y)', 'G(u,v)', 'g(x,y)'];

  const ImagePanel = ({ b64, label, sublabel, highlight }) => (
    <div className={`ep-panel ${highlight ? 'ep-panel-highlight' : ''}`}>
      <div className="ep-panel-label">
        <span className="label">{label}</span>
        {sublabel && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{sublabel}</span>}
      </div>
      <div className="ep-panel-body">
        {b64
          ? <img className="ep-image" src={`data:image/png;base64,${b64}`} alt={label} draggable={false} />
          : <div className="ep-panel-empty" />
        }
        {isEmphasizing && b64 && (
          <div className="ep-panel-updating"><RefreshCw size={14} className="spin" /></div>
        )}
      </div>
    </div>
  );

  return (
    <div className="emphasizer-page">
      <aside className="ep-controls">

        {/* Source image */}
        <div className="ep-section">
          <div className="ep-section-title">Source Image</div>
          <button className="btn btn-primary w-full"
            onClick={() => fileInputRef.current?.click()} disabled={loadingUpload}>
            {loadingUpload ? <RefreshCw size={12} className="spin" /> : <Upload size={12} />}
            {emphSpatialB64 ? 'Change Image' : 'Load Image'}
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }}
            onChange={e => handleFileSelect(e.target.files[0])} />
        </div>

        <div className="sep" />

        {/* Domain toggle — DUALITY CONTROL */}
        <div className="ep-section">
          <div className="ep-section-title">Apply Action On</div>
          <div className="ep-domain-toggle">
            <button
              className={`ep-domain-btn ${emphDomain === 'spatial' ? 'ep-domain-active-spatial' : ''}`}
              onClick={() => setEmphDomain('spatial')}
            >
              <span className="ep-domain-icon">f(x,y)</span>
              Spatial Domain
            </button>
            <div className="ep-domain-arrow">↔</div>
            <button
              className={`ep-domain-btn ${emphDomain === 'frequency' ? 'ep-domain-active-freq' : ''}`}
              onClick={() => setEmphDomain('frequency')}
            >
              <span className="ep-domain-icon">F(u,v)</span>
              Frequency Domain
            </button>
          </div>
          <p className="ep-domain-hint">
            {emphDomain === 'spatial'
              ? '🖼 You are modifying the image. Watch how its frequency spectrum reacts in real time.'
              : '📡 You are modifying the FT directly. Watch how the image reconstructed by IFFT changes.'}
          </p>
        </div>

        <div className="sep" />

        {/* Action */}
        <div className="ep-section">
          <div className="ep-section-title">Action</div>
          <div className="ep-select-wrap">
            <select className="input" value={emphAction} onChange={e => setEmphAction(e.target.value)}>
              {ACTIONS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
            </select>
            <ChevronDown size={10} className="ep-select-arrow" />
          </div>
        </div>

        <div className="sep" />

        {/* Action parameters */}
        <div className="ep-section">
          <div className="ep-section-title">Parameters</div>
          <ParamControls action={emphAction} params={emphParams} setParam={setEmphParam} />
        </div>

        <div className="sep" />

        {/* Educational info card — updates when action changes */}
        {EMPHASIZER_INFO[emphAction] && (
          <div className="ep-section" style={{ paddingTop: 0, paddingBottom: 0 }}>
            <InfoCard
              key={emphAction}
              spatial={EMPHASIZER_INFO[emphAction].spatial}
              frequency={EMPHASIZER_INFO[emphAction].frequency}
              duality={EMPHASIZER_INFO[emphAction].duality}
            />
          </div>
        )}

        <div className="sep" />

        {/* Repeated Fourier — post-processing, always visible */}
        <div className="ep-section">
          <div className="ep-section-title">
            <Repeat size={10} style={{ marginRight: 4 }} />
            Repeated Fourier (post-processing)
          </div>
          <div className="ep-param-row">
            <label className="label">FT times</label>
            <input type="range" min={0} max={8} step={1}
              value={emphParams.fourier_times}
              onChange={e => setEmphParam('fourier_times', parseInt(e.target.value))}
            />
            <span className="ep-val">
              {emphParams.fourier_times === 0 ? 'off' : `×${emphParams.fourier_times}`}
            </span>
          </div>
          <p className="ep-hint-small">
            Applied on top of any action above. FT of FT of FT…
          </p>
        </div>

        <div className="sep" />

        {/* FT component display */}
        <div className="ep-section">
          <div className="ep-section-title">FT Display Component</div>
          <div className="ep-select-wrap">
            <select className="input" value={emphParams.ft_component}
              onChange={e => setEmphParam('ft_component', e.target.value)}>
              {FT_COMPONENTS.map(c => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
            <ChevronDown size={10} className="ep-select-arrow" />
          </div>
        </div>

        <div className="sep" />

        {/* Brightness / Contrast */}
        <div className="ep-section">
          <div className="ep-section-title">Display Adjustments</div>
          <div className="ep-param-row">
            <label className="label">Brightness</label>
            <input type="range" min={0.1} max={5} step={0.1}
              value={emphParams.brightness}
              onChange={e => setEmphParam('brightness', parseFloat(e.target.value))} />
            <span className="ep-val">{emphParams.brightness.toFixed(1)}</span>
          </div>
          <div className="ep-param-row">
            <label className="label">Contrast</label>
            <input type="range" min={0.1} max={5} step={0.1}
              value={emphParams.contrast}
              onChange={e => setEmphParam('contrast', parseFloat(e.target.value))} />
            <span className="ep-val">{emphParams.contrast.toFixed(1)}</span>
          </div>
        </div>

        {/* Live indicator */}
        <div className="ep-live-badge">
          <div className={`ep-live-dot ${isEmphasizing ? 'ep-live-active' : 'ep-live-idle'}`} />
          <span>{isEmphasizing ? 'Updating…' : 'Live — changes apply instantly'}</span>
        </div>

      </aside>

      {/* 2×2 result grid */}
      <div className="ep-results">
        <div className="ep-results-header">
          {emphDomain === 'spatial' ? (
            <>
              <span className="label">Spatial Domain</span>
              <div className="ep-domain-sep"><span className="badge badge-cyan">Spatial → FT duality</span></div>
              <span className="label">Frequency Domain</span>
            </>
          ) : (
            <>
              <span className="label">Frequency Domain</span>
              <div className="ep-domain-sep"><span className="badge badge-amber">FT → Spatial duality</span></div>
              <span className="label">Spatial Domain</span>
            </>
          )}
        </div>

        <div className="ep-grid">
          {[0, 1, 2, 3].map(i => (
            <ImagePanel
              key={i}
              b64={panelB64s[i]}
              label={panelLabels[i]}
              sublabel={sublabels[i]}
              highlight={i >= 2} // bottom row = transformed
            />
          ))}
        </div>
      </div>
    </div>
  );
}
