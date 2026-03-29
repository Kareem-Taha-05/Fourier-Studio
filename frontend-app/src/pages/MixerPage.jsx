import ImageViewport from '@/components/viewer/ImageViewport';
import MixerControls from '@/components/mixer/MixerControls';
import OutputViewport from '@/components/mixer/OutputViewport';
import useStore from '@/store/useStore';
import './MixerPage.css';

export default function MixerPage() {
  const { viewports } = useStore();
  const loadedCount = viewports.filter(v => v?.imageId).length;

  return (
    <div className="mixer-page">

      {/* ── Top strip: 4 input slots side by side like tape cassette bays ── */}
      <div className="mixer-tape-deck">
        <div className="mixer-deck-label">
          <span className="deck-title">▶ INPUT CHANNELS</span>
          <span className="badge badge-cyan">{loadedCount} / 4</span>
          <span className="deck-hint">DBL-CLICK TO LOAD · DRAG TO ADJUST B/C</span>
        </div>
        <div className="mixer-slots">
          {[0, 1, 2, 3].map(i => (
            <ImageViewport key={i} index={i} />
          ))}
        </div>
      </div>

      {/* ── Bottom area: output screens + controls side by side ── */}
      <div className="mixer-bottom">

        {/* Output screens — like broadcast monitors */}
        <div className="mixer-monitors">
          <div className="monitors-label">
            <span className="deck-title">▶ OUTPUT MONITORS</span>
            <span className="deck-hint">CLICK TO SELECT TARGET</span>
          </div>
          <div className="monitors-row">
            <OutputViewport index={0} />
            <OutputViewport index={1} />
          </div>
        </div>

        {/* Controls panel */}
        <MixerControls />
      </div>

    </div>
  );
}
