import { Download } from 'lucide-react';
import useStore from '@/store/useStore';
import './OutputViewport.css';

export default function OutputViewport({ index }) {
  const { outputImages, activeOutput, setActiveOutput } = useStore();
  const b64 = outputImages[index];
  const isActive = activeOutput === index;

  const handleDownload = () => {
    if (!b64) return;
    const a = document.createElement('a');
    a.href = `data:image/png;base64,${b64}`;
    a.download = `ft_mix_output_${index + 1}.png`;
    a.click();
  };

  return (
    <div
      className={`output-viewport ${isActive ? 'ov-active' : ''}`}
      onClick={() => setActiveOutput(index)}
    >
      <div className="ov-header">
        <span className="ov-label">OUTPUT {index + 1}</span>
        <div className="ov-actions">
          {isActive && <span className="badge badge-cyan">Active Target</span>}
          {b64 && (
            <button className="btn btn-ghost" onClick={(e) => { e.stopPropagation(); handleDownload(); }}>
              <Download size={11} />
            </button>
          )}
        </div>
      </div>
      <div className="ov-body">
        {b64 ? (
          <img
            className="ov-image fade-in"
            src={`data:image/png;base64,${b64}`}
            alt={`Output ${index + 1}`}
            draggable={false}
          />
        ) : (
          <div className="ov-empty">
            <div className="ov-empty-text">
              {isActive ? 'Mix result will appear here' : 'Click to set as target'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
