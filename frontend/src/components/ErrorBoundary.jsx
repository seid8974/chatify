import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className='min-h-screen bg-slate-900 flex items-center justify-center p-4'>
          <div className='text-center max-w-md'>
            <div className='size-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4'>
              <span className='text-3xl'>⚠️</span>
            </div>
            <h2 className='text-xl font-semibold text-slate-200 mb-2'>Something went wrong</h2>
            <p className='text-slate-400 text-sm mb-6'>
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className='px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors'
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
