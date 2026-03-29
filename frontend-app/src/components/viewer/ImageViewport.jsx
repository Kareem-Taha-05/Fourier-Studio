import { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, RefreshCw, X, ChevronDown, ZoomIn } from 'lucide-react';
import useStore from '@/store/useStore';
import { uploadImage, getFTComponent, getSpatialAdjusted } from '@/utils/api';
import RegionOverlay from './RegionOverlay';
import './ImageViewport.css';

const FT_OPTIONS = [
  { value: 'magnitude', label: 'FT Magnitude' },
  { value: 'phase',     label: 'FT Phase' },
  { value: 'real',      label: 'FT Real' },
  { value: 'imaginary', label: 'FT Imaginary' },
];

const VIEWPORT_LABELS = ['IMG 01', 'IMG 02', 'IMG 03', 'IMG 04'];
const VIEWPORT_COLORS = ['var(--cyan)', 'var(--amber)', 'var(--violet)', 'var(--green)'];

export default function ImageViewport({ index }) {
  const {
    viewports, setViewport, clearViewport,
    ftDisplayComponents, setFTDisplayComponent,
    viewportSettings, setViewportSetting,
    regionFraction, regionType, regionEnabled,
  } = useStore();

  const viewport = viewports[index];
  const displayComponent = ftDisplayComponents[index];
  const { brightness, contrast } = viewportSettings[index];

  const [ftB64, setFtB64] = useState(null);
  const [spatialB64, setSpatialB64] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingFT, setLoadingFT] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const dragRef = useRef(null);
  const fileInputRef = useRef(null);
  // Prevent double-open: track whether dialog is already open
  const dialogOpenRef = useRef(false);
  const color = VIEWPORT_COLORS[index];

  useEffect(() => {
    if (!viewport?.imageId) { setFtB64(null); return; }
    setLoadingFT(true);
    getFTComponent(viewport.imageId, displayComponent, brightness, contrast)
      .then(r => setFtB64(r.data.data_b64))
      .catch(console.error)
      .finally(() => setLoadingFT(false));
  }, [viewport?.imageId, displayComponent, brightness, contrast]);

  useEffect(() => {
    if (!viewport?.imageId) return;
    getSpatialAdjusted(viewport.imageId, brightness, contrast)
      .then(r => setSpatialB64(r.data.data_b64))
      .catch(() => {});
  }, [viewport?.imageId, brightness, contrast]);

  // Seed spatialB64 immediately from store when image changes
  // (covers both first load and after resize-policy updates)
  useEffect(() => {
    if (viewport?.spatialB64) setSpatialB64(viewport.spatialB64);
    else if (!viewport) setSpatialB64(null);
  }, [viewport?.imageId, viewport?.spatialB64]);

  const handleFileSelect = useCallback(async (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setLoading(true);
    try {
      const res = await uploadImage(file);
      const { image_id, width, height, spatial_b64 } = res.data;
      setSpatialB64(spatial_b64);
      setViewport(index, { imageId: image_id, spatialB64: spatial_b64, width, height, filename: file.name });
    } catch (e) {
      console.error('Upload failed:', e);
    } finally {
      setLoading(false);
    }
  }, [index, setViewport]);

  // Single open-file handler used for BOTH empty and loaded states
  // Guard prevents the dialog firing twice from event bubbling on dblclick
  const openFileDialog = useCallback(() => {
    if (dialogOpenRef.current) return;
    dialogOpenRef.current = true;
    fileInputRef.current?.click();
    setTimeout(() => { dialogOpenRef.current = false; }, 600);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files[0]);
  }, [handleFileSelect]);

  // Mouse-drag on loaded spatial image = brightness/contrast
  const handleMouseDown = useCallback((e) => {
    if (!viewport?.imageId) return;
    dragRef.current = { x: e.clientX, y: e.clientY, brightness, contrast };
    const onMove = (ev) => {
      const dx = (ev.clientX - dragRef.current.x) / 100;
      const dy = -(ev.clientY - dragRef.current.y) / 100;
      setViewportSetting(index, 'brightness', parseFloat(Math.max(0.1, Math.min(5, dragRef.current.brightness + dy)).toFixed(2)));
      setViewportSetting(index, 'contrast',   parseFloat(Math.max(0.1, Math.min(5, dragRef.current.contrast  + dx)).toFixed(2)));
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [viewport, brightness, contrast, index, setViewportSetting]);

  const isEmpty = !viewport?.imageId;

  return (
    <div
      className={`image-viewport ${isDragging ? 'vp-drag' : ''}`}
      style={{ '--vp-color': color }}
      onDrop={handleDrop}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
    >
      {/* Header */}
      <div className="vp-header">
        <div className="vp-label" style={{ color }}>
          <span className="vp-index">{VIEWPORT_LABELS[index]}</span>
          <span className="vp-display-tag">display</span>
          {viewport && <span className="vp-filename truncate">{viewport.filename}</span>}
        </div>
        <div className="vp-actions">
          {viewport && (
            <>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {viewport.width}×{viewport.height}
              </span>
              <button className="btn btn-ghost" onClick={() => {
                clearViewport(index);
                setFtB64(null);
                setSpatialB64(null);
              }}>
                <X size={11} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Dual panels */}
      <div className="vp-panels">
        {/* Spatial panel — double-click ALWAYS opens file dialog (empty or loaded) */}
        <div
          className="vp-panel vp-panel-spatial"
          onDoubleClick={openFileDialog}
          onMouseDown={!isEmpty ? handleMouseDown : undefined}
          title={isEmpty
            ? 'Double-click to open image'
            : 'Double-click to replace · Drag up/down = brightness, left/right = contrast'}
        >
          {loading && (
            <div className="vp-overlay">
              <RefreshCw size={18} className="spin" style={{ color }} />
            </div>
          )}
          {!isEmpty && spatialB64 ? (
            <img
              className="vp-image"
              src={`data:image/png;base64,${spatialB64}`}
              alt="Spatial"
              draggable={false}
            />
          ) : (
            <div className="vp-empty">
              <div className="vp-empty-icon" style={{ borderColor: color, color }}>
                <Upload size={16} />
              </div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Double-click or drop image
              </p>
            </div>
          )}
          <div className="vp-panel-label">SPATIAL</div>
          {viewport && (
            <div className="vp-bc-hint text-xs">B:{brightness.toFixed(1)} C:{contrast.toFixed(1)}</div>
          )}
        </div>

        {/* FT panel */}
        <div className="vp-panel vp-panel-ft">
          {loadingFT && !ftB64 && (
            <div className="vp-overlay">
              <RefreshCw size={18} className="spin" style={{ color }} />
            </div>
          )}
          {loadingFT && ftB64 && (
            <div className="vp-ft-updating">
              <RefreshCw size={11} className="spin" style={{ color }} />
            </div>
          )}
          {!isEmpty && ftB64 ? (
            <img
              className="vp-image"
              src={`data:image/png;base64,${ftB64}`}
              alt="FT"
              draggable={false}
            />
          ) : (
            <div className="vp-empty">
              <ZoomIn size={16} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
              <p className="text-xs" style={{ color: 'var(--text-muted)', opacity: 0.4 }}>FT preview</p>
            </div>
          )}
          {regionEnabled && !isEmpty && ftB64 && (
            <RegionOverlay fraction={regionFraction} regionType={regionType} />
          )}
          <div className="vp-panel-label">FREQUENCY</div>
        </div>
      </div>

      {/* Footer */}
      <div className="vp-footer">
        <div className="vp-select-wrap">
          <select
            className="input vp-select"
            value={displayComponent}
            onChange={e => setFTDisplayComponent(index, e.target.value)}
            disabled={isEmpty}
          >
            {FT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <ChevronDown size={10} className="vp-select-arrow" />
        </div>
      </div>

      {/* Hidden file input — value reset so same file can re-trigger onChange */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={e => {
          const file = e.target.files[0];
          e.target.value = ''; // Reset so same file can be picked again
          handleFileSelect(file);
        }}
      />
    </div>
  );
}
