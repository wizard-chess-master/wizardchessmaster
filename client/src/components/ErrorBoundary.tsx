import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { logger, LogCategory } from '../lib/utils/clientLogger';

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

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error
    logger.error(LogCategory.UI, 'React Error Boundary caught error', error, {
      componentStack: errorInfo.componentStack,
      errorCount: this.state.errorCount + 1
    });

    // Update state
    this.setState(prevState => ({
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Send to analytics if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'exception', {
        description: error.toString(),
        fatal: false
      });
    }
  }

  handleReset = () => {
    logger.info(LogCategory.UI, 'Error boundary reset by user');
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  handleReload = () => {
    logger.info(LogCategory.UI, 'Page reload requested after error');
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return <>{this.props.fallback}</>;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 to-slate-800 p-4">
          <Card className="max-w-2xl w-full medieval-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-500">
                <AlertTriangle className="w-6 h-6" />
                Oops! Something went wrong
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                We encountered an unexpected error. The issue has been logged and we'll look into it.
              </p>

              {/* Error details in development */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="bg-slate-900 rounded-lg p-4 space-y-2">
                  <p className="text-red-400 font-mono text-sm">
                    {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <details className="cursor-pointer">
                      <summary className="text-xs text-muted-foreground hover:text-white">
                        Component Stack
                      </summary>
                      <pre className="text-xs text-gray-400 mt-2 overflow-auto max-h-64">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={this.handleReset} variant="outline">
                  Try Again
                </Button>
                <Button onClick={this.handleReload} className="medieval-btn">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reload Page
                </Button>
              </div>

              {this.state.errorCount > 2 && (
                <p className="text-xs text-yellow-500">
                  Multiple errors detected. Consider refreshing the page or clearing your browser cache.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Specific error boundaries for different parts of the app
export class GameErrorBoundary extends ErrorBoundary {
  constructor(props: Props) {
    super({
      ...props,
      onError: (error, errorInfo) => {
        logger.error(LogCategory.GAME, 'Game component crashed', error, errorInfo);
        if (props.onError) props.onError(error, errorInfo);
      }
    });
  }
}

export class MultiplayerErrorBoundary extends ErrorBoundary {
  constructor(props: Props) {
    super({
      ...props,
      onError: (error, errorInfo) => {
        logger.error(LogCategory.MULTIPLAYER, 'Multiplayer component crashed', error, errorInfo);
        if (props.onError) props.onError(error, errorInfo);
      }
    });
  }
}