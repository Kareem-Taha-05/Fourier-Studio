import { useEffect, useState } from 'react';
import { Activity, GitMerge, Radio, AlertCircle, Sun, Moon } from 'lucide-react';
import useStore from '@/store/useStore';
import './NavBar.css';

export default function NavBar() {
  const { mode, setMode, theme, setTheme } = useStore();
  const [backendOk, setBackendOk] = useState(null);

  // Apply theme on first mount
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, []);

  useEffect(() => {
    const check = async () => {
      try { const r = await fetch('/health'); setBackendOk(r.ok); }
      catch { setBackendOk(false); }
    };
    check();
    const id = setInterval(check, 15000);
    return () => clearInterval(id);
  }, []);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');
  const isLight = theme === 'light';

  return (
    <nav className="navbar">
      {/* Brand */}
      <div className="navbar-brand">
        <div className="navbar-logo"><Radio size={18} className="logo-icon" /></div>
        <div className="navbar-wordmark">
          <span className="navbar-title">FOURIER <span className="navbar-title-accent">STUDIO</span></span>
          <span className="navbar-subtitle">Fourier Transform Studio</span>
        </div>
      </div>

      {/* Mode tabs */}
      <div className="navbar-tabs">
        <button className={`nav-tab ${mode === 'mixer' ? 'nav-tab-active' : ''}`} onClick={() => setMode('mixer')}>
          <GitMerge size={12} /> Mixer
        </button>
        <button className={`nav-tab ${mode === 'emphasizer' ? 'nav-tab-active' : ''}`} onClick={() => setMode('emphasizer')}>
          <Activity size={12} /> Emphasizer
        </button>
      </div>

      {/* Right side: theme toggle + status */}
      <div className="navbar-right">

        {/* Theme toggle — hardware flip-switch style */}
        <button
          className={`theme-toggle ${isLight ? 'theme-toggle-light' : 'theme-toggle-dark'}`}
          onClick={toggleTheme}
          title={`Switch to ${isLight ? 'dark' : 'light'} mode`}
        >
          <span className="theme-toggle-track">
            <span className="theme-toggle-thumb">
              {isLight ? <Sun size={8} /> : <Moon size={8} />}
            </span>
          </span>
          <span className="theme-toggle-label">
            {isLight ? 'LIGHT' : 'DARK'}
          </span>
        </button>

        {/* Status readout */}
        {backendOk === null && (
          <div className="status-readout">
            <div className="status-dot status-checking pulse" />
            <span className="status-text">CONNECTING...</span>
          </div>
        )}
        {backendOk === true && (
          <div className="status-readout">
            <div className="status-dot status-ok pulse" />
            <span className="status-text">SYS ONLINE</span>
          </div>
        )}
        {backendOk === false && (
          <div className="status-error-wrap">
            <AlertCircle size={12} className="status-error" />
            <span className="status-err-text">OFFLINE</span>
          </div>
        )}
      </div>
    </nav>
  );
}
