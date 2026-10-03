import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[TopLevelErrorBoundary] Uncaught component error:', error, errorInfo);
  }

  private handleReset = () => {
    this.props.onReset?.();
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[#0e1511] text-[#dde4de] flex items-center justify-center p-6 antialiased">
          <div className="max-w-md w-full p-6 sm:p-8 rounded-2xl bg-[#161d19] border border-[#273229] shadow-2xl text-center space-y-5">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-[#ffb4ab]/10 border border-[#ffb4ab]/30 flex items-center justify-center text-[#ffb4ab]">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-mono tracking-widest uppercase text-[#9dd3a4]">
                Sanctuary Guard
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold font-serif-editorial text-[#dde4de] tracking-tight">
                Something went wrong
              </h1>
              <p className="text-xs sm:text-sm text-[#a8b3a9] leading-relaxed">
                An unexpected interface error occurred. Your training history and current routine data remain safely preserved.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="p-3 rounded-xl bg-[#0e1511] border border-[#273229] text-left">
                <span className="text-[10px] font-mono text-[#74a87c] block uppercase">Error Details</span>
                <p className="text-xs font-mono text-[#ffb4ab] break-words mt-1">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full py-2.5 px-4 text-xs font-bold rounded-xl bg-[#74a87c] hover:bg-[#85b98d] text-[#0e1511] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-98"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Try Again</span>
              </button>
              <a
                href="/"
                className="w-full py-2.5 px-4 text-xs font-semibold rounded-xl bg-[#202823] hover:bg-[#273229] text-[#dde4de] border border-[#273229] flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Home className="w-4 h-4 text-[#d9c3a5]" />
                <span>Return to Sanctuary</span>
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
