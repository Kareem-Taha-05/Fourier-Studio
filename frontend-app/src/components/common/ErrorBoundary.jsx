import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', height: '100%', gap: 16, padding: 32,
        }}>
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800,
            color: 'var(--red)',
          }}>
            Render Error
          </div>
          <pre style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border)',
            borderRadius: 8, padding: 16, fontSize: 11,
            color: 'var(--text-secondary)', maxWidth: 600, overflowX: 'auto',
          }}>
            {this.state.error?.toString()}
          </pre>
          <button
            className="btn btn-primary"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
