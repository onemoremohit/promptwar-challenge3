// src/components/ErrorBoundary.tsx
import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error captured by ErrorBoundary:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
          <div className="glass-card text-center" style={{ maxWidth: '480px', padding: '40px' }} role="alert" aria-live="assertive">
            <div style={{ width: '64px', height: '64px', background: 'var(--coral-dim)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto', color: 'var(--coral)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '10px' }}>Something went wrong</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>
              An unexpected runtime error occurred. You can restore offline local defaults and try again.
            </p>
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', fontSize: '0.8rem', fontFamily: 'monospace', color: 'var(--coral)', marginBottom: '24px', textAlign: 'left', overflowX: 'auto' }}>
              {this.state.error?.toString()}
            </div>
            <button className="btn btn-primary" onClick={this.handleReset} style={{ margin: '0 auto' }} aria-label="Recover application state">
              Recover & Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
