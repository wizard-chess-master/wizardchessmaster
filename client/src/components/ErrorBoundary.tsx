/**
 * React Error Boundary Component
 * Catches JavaScript errors anywhere in the component tree
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCount: number;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console
    console.error('🚨 ErrorBoundary caught an error:', error, errorInfo);
    
    // Log error details
    console.error('Component Stack:', errorInfo.componentStack);
    
    // Update state with error details
    this.setState(prevState => ({
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // Send error to logging service (in production)
    if (process.env.NODE_ENV === 'production') {
      this.logErrorToService(error, errorInfo);
    }
  }

  logErrorToService(error: Error, errorInfo: ErrorInfo) {
    // Send error to server for logging
    fetch('/api/log/error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      }),
    }).catch(err => {
      console.error('Failed to log error to service:', err);
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return <>{this.props.fallback}</>;
      }

      // Default fallback UI
      return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center p-4">
          <div className="bg-gray-800 border border-red-500 rounded-lg p-8 max-w-2xl w-full shadow-2xl">
            <div className="flex items-center mb-6">
              <AlertCircle className="h-8 w-8 text-red-500 mr-3" />
              <h1 className="text-2xl font-bold text-red-500">Something went wrong</h1>
            </div>
            
            <p className="text-gray-300 mb-4">
              We encountered an unexpected error. The error has been logged and we'll look into it.
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6">
                <details className="cursor-pointer">
                  <summary className="text-yellow-400 hover:text-yellow-300 mb-2">
                    Show error details (Development only)
                  </summary>
                  <div className="bg-gray-900 rounded p-4 mt-2 overflow-auto">
                    <p className="text-red-400 font-mono text-sm mb-2">
                      {this.state.error.message}
                    </p>
                    <pre className="text-gray-400 font-mono text-xs whitespace-pre-wrap">
                      {this.state.error.stack}
                    </pre>
                    {this.state.errorInfo && (
                      <div className="mt-4 pt-4 border-t border-gray-700">
                        <p className="text-yellow-400 text-sm mb-2">Component Stack:</p>
                        <pre className="text-gray-400 font-mono text-xs whitespace-pre-wrap">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              </div>
            )}
            
            <div className="flex gap-3">
              <button
                onClick={this.handleReset}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </button>
              
              <button
                onClick={this.handleReload}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Reload Page
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                <Home className="h-4 w-4" />
                Go Home
              </button>
            </div>
            
            {this.state.errorCount > 2 && (
              <div className="mt-4 p-3 bg-yellow-900/50 border border-yellow-600 rounded">
                <p className="text-yellow-400 text-sm">
                  This error has occurred multiple times. Consider refreshing the page or clearing your browser cache.
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

// Specific error boundaries for different parts of the app
export class GameErrorBoundary extends ErrorBoundary {
  constructor(props: Props) {
    super(props);
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    super.componentDidCatch(error, errorInfo);
    console.error('🎮 Game-specific error:', error);
    
    // Reset game state if needed
    try {
      // Clear any game-related local storage
      localStorage.removeItem('gameState');
      localStorage.removeItem('currentGame');
    } catch (e) {
      console.error('Failed to clear game state:', e);
    }
  }
}

export class AudioErrorBoundary extends ErrorBoundary {
  constructor(props: Props) {
    super(props);
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    super.componentDidCatch(error, errorInfo);
    console.error('🔊 Audio-specific error:', error);
    
    // Disable audio if it's causing issues
    try {
      localStorage.setItem('audioDisabled', 'true');
    } catch (e) {
      console.error('Failed to disable audio:', e);
    }
  }
}