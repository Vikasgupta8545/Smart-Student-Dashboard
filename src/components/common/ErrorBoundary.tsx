import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Database } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  constructor(props: Props) {
    super(props);
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught React Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetCache = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      // ignore
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4 font-sans text-slate-900 dark:text-slate-100">
          <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 text-center">
            <div className="mx-auto w-14 h-14 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center text-amber-600 dark:text-amber-400 mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Dr. A.P.J. Abdul Kalam Technical University
            </h1>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
              Portal encountered an unexpected state
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-6">
              The application recovered gracefully to prevent a blank screen. You can reload or reset the session cache.
            </p>

            {this.state.error && (
              <div className="bg-slate-100 dark:bg-slate-900/60 p-3 rounded-xl text-left text-xs font-mono text-rose-600 dark:text-rose-400 mb-6 max-h-32 overflow-auto border border-slate-200 dark:border-slate-700">
                {this.state.error.message || 'Unknown runtime exception'}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
              <button
                id="btn-error-reload"
                onClick={this.handleReload}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Portal</span>
              </button>
              <button
                id="btn-error-reset-cache"
                onClick={this.handleResetCache}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl transition-colors"
              >
                <Database className="w-4 h-4" />
                <span>Clear Cache & Restart</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
