import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in UI component:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#FAF8F6] p-6 text-center select-none animate-fadeIn">
          <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-4 shadow-sm">
            <span translate="no" className="material-symbols-outlined text-3xl font-black">
              error
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight mb-2">
            Une erreur inattendue est survenue
          </h2>
          <p className="text-xs text-slate-500 max-w-sm mb-6 leading-relaxed">
            L'affichage de cette section a rencontré une anomalie. Vous pouvez rafraîchir la page pour reprendre normalement.
          </p>
          <div className="flex gap-3">
            <button
              onClick={this.handleReload}
              className="px-5 py-2.5 bg-primary hover:bg-[#921316] text-white text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer shadow-md transition-all border-0"
            >
              Recharger la page
            </button>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl cursor-pointer transition-all border-0"
            >
              Réessayer
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

