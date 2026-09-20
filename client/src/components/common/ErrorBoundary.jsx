import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import Button from '../ui/Button';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled UI Component Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="max-w-lg w-full p-6 rounded-2xl bg-[#151D2E] border border-rose-500/30 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6 text-rose-400" />
            </div>
            
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white">Something went wrong</h2>
              <p className="text-xs text-[#94A3B8]">
                An unexpected error occurred while rendering this page component.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="p-3 rounded-lg bg-[#111827] border border-[#263247] text-left">
                <p className="text-[11px] font-mono text-rose-300 break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="pt-2 flex items-center justify-center gap-3">
              <Button
                variant="primary"
                size="sm"
                onClick={this.handleReset}
                leftIcon={<RefreshCw className="w-4 h-4" />}
              >
                Reload Page
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
