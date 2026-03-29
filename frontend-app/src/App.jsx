import '@/styles/globals.css';
import './App.css';
import NavBar from '@/components/common/NavBar';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import MixerPage from '@/pages/MixerPage';
import EmphasizerPage from '@/pages/EmphasizerPage';
import useStore from '@/store/useStore';

export default function App() {
  const { mode } = useStore();

  return (
    <div className="app-root">
      <NavBar />
      <main className="app-main">
        <ErrorBoundary>
          {mode === 'mixer'      && <MixerPage />}
          {mode === 'emphasizer' && <EmphasizerPage />}
        </ErrorBoundary>
      </main>
    </div>
  );
}
