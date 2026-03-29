/**
 * RegionOverlay
 * Draws a semi-transparent rectangle on the FT panel showing
 * the selected frequency region (inner or outer).
 * The rectangle is unified across all four viewports.
 */
export default function RegionOverlay({ fraction, regionType }) {
  if (!fraction || fraction <= 0) return null;

  // Rectangle is centered; fraction of the panel size
  const pct = fraction * 100;
  const offset = (100 - pct) / 2;

  const rectStyle = {
    position: 'absolute',
    left:   `${offset}%`,
    top:    `${offset}%`,
    width:  `${pct}%`,
    height: `${pct}%`,
    boxSizing: 'border-box',
    pointerEvents: 'none',
    zIndex: 5,
  };

  if (regionType === 'inner') {
    // Inner selected: highlight the rectangle, darken outside
    return (
      <>
        {/* Dark overlay covering everything */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 4,
          background: 'rgba(0,0,0,0.45)',
          pointerEvents: 'none',
        }} />
        {/* Cut-out highlight for the inner rect */}
        <div style={{
          ...rectStyle,
          background: 'rgba(0, 229, 255, 0.18)',
          border: '1px solid rgba(0, 229, 255, 0.7)',
          boxShadow: 'inset 0 0 12px rgba(0,229,255,0.12)',
        }}>
          {/* Hatch lines inside */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 4px,
              rgba(0,229,255,0.08) 4px,
              rgba(0,229,255,0.08) 5px
            )`,
          }} />
          <span style={{
            position: 'absolute', bottom: 2, right: 4,
            fontSize: 8, fontWeight: 700, letterSpacing: '0.08em',
            color: 'rgba(0,229,255,0.8)', fontFamily: 'var(--font-mono)',
          }}>LOW FREQ</span>
        </div>
      </>
    );
  } else {
    // Outer selected: highlight everything outside the rectangle
    return (
      <>
        {/* Semi-transparent tint on outer region (full panel) */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 4,
          background: 'rgba(255, 179, 71, 0.12)',
          border: '1px solid rgba(255,179,71,0.3)',
          pointerEvents: 'none',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 4px,
              rgba(255,179,71,0.06) 4px,
              rgba(255,179,71,0.06) 5px
            )`,
          }} />
        </div>
        {/* Dark mask over the inner rect to "exclude" it */}
        <div style={{
          ...rectStyle,
          zIndex: 5,
          background: 'rgba(0,0,0,0.5)',
          border: '1px dashed rgba(255,179,71,0.6)',
        }}>
          <span style={{
            position: 'absolute', bottom: 2, right: 4,
            fontSize: 8, fontWeight: 700, letterSpacing: '0.08em',
            color: 'rgba(255,179,71,0.9)', fontFamily: 'var(--font-mono)',
          }}>EXCLUDED</span>
        </div>
        <span style={{
          position: 'absolute', bottom: 4, left: 4, zIndex: 6,
          fontSize: 8, fontWeight: 700, letterSpacing: '0.08em',
          color: 'rgba(255,179,71,0.8)', fontFamily: 'var(--font-mono)',
          pointerEvents: 'none',
        }}>HIGH FREQ</span>
      </>
    );
  }
}
