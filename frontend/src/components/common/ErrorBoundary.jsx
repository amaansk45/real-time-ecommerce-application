import React from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled UI Error caught by Indian Bazar ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-white rounded-3xl p-8 shadow-card border border-slate-200/80 text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h1 className="font-heading font-extrabold text-2xl text-slate-900">
                Something Went Wrong
              </h1>
              <p className="text-sm text-slate-500">
                An unexpected error occurred while loading this view. Your session, cart items, and orders remain completely safe.
              </p>
            </div>

            {/* Error Message Details (Helpful in Dev/Troubleshooting) */}
            {this.state.error && (
              <div className="p-3.5 bg-red-50 rounded-2xl border border-red-200 text-left font-mono text-xs text-red-700 overflow-x-auto max-h-32">
                <p className="font-bold">{this.state.error.toString()}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-heading font-bold text-sm shadow-md shadow-primary-500/20 inline-flex items-center justify-center gap-2 transition-all"
              >
                <RotateCcw className="w-4 h-4" /> Reload Page
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-heading font-bold text-sm inline-flex items-center justify-center gap-2 transition-all"
              >
                <Home className="w-4 h-4" /> Go to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
