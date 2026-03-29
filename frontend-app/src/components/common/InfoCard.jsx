import { useState } from 'react';
import { ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import './InfoCard.css';

/**
 * Collapsible educational info card.
 * Shows a spatial / FT explanation side by side.
 * Completely presentational — no logic, no state outside this component.
 */
export default function InfoCard({ spatial, frequency, duality, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={`info-card ${open ? 'info-card-open' : ''}`}>
      <button className="info-card-toggle" onClick={() => setOpen(o => !o)}>
        <BookOpen size={9} />
        <span>What does this do?</span>
        {open ? <ChevronUp size={9} /> : <ChevronDown size={9} />}
      </button>

      {open && (
        <div className="info-card-body">
          {/* Two-column: spatial | frequency */}
          <div className="info-cols">
            <div className="info-col info-col-spatial">
              <div className="info-col-header">
                <span className="info-domain-tag info-tag-spatial">f(x,y)</span>
                <span className="info-col-title">Spatial Domain</span>
              </div>
              <p className="info-text">{spatial}</p>
            </div>

            <div className="info-divider">↔</div>

            <div className="info-col info-col-freq">
              <div className="info-col-header">
                <span className="info-domain-tag info-tag-freq">F(u,v)</span>
                <span className="info-col-title">Frequency Domain</span>
              </div>
              <p className="info-text">{frequency}</p>
            </div>
          </div>

          {/* Duality callout */}
          {duality && (
            <div className="info-duality">
              <span className="info-duality-label">⚡ FT Duality</span>
              <p className="info-duality-text">{duality}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
