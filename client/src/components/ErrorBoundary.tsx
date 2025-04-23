import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to logging service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Here we would log to our logging service in a production environment
    if (typeof window !== 'undefined' && window.logErrorToService) {
      window.logErrorToService(error, errorInfo);
    }
  }

  resetError = (): void => {
    this.setState({ hasError: false, error: undefined });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center min-h-[300px] p-6 text-center border rounded-lg bg-gray-50 dark:bg-gray-900">
          <AlertTriangle className="h-10 w-10 text-orange-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Terjadi kesalahan pada aplikasi</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {this.state.error?.message || 'Sesuatu tidak berjalan dengan baik. Silakan coba lagi.'}
          </p>
          <Button onClick={this.resetError}>Coba Lagi</Button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Add ErrorBoundary to Window interface for our logging service
declare global {
  interface Window {
    logErrorToService?: (error: Error, errorInfo: ErrorInfo) => void;
  }
}

export default ErrorBoundary;