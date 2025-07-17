import React from 'react';

// 懒加载组件工具
export function createLazyComponent<T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ComponentType
) {
  const LazyComponent = React.lazy(importFunc);
  
  return (props: React.ComponentProps<T>) => {
    const FallbackComponent = fallback;
    return React.createElement(
      React.Suspense,
      {
        fallback: FallbackComponent 
          ? React.createElement(FallbackComponent)
          : React.createElement('div', null, 'Loading...')
      },
      React.createElement(LazyComponent, props)
    );
  };
}

// 错误边界组件
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error }> },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback;
      return FallbackComponent 
        ? React.createElement(FallbackComponent, { error: this.state.error })
        : React.createElement('div', null, `Error: ${this.state.error.message}`);
    }

    return this.props.children;
  }
}

// 高阶组件：添加错误边界
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<{ error: Error }>
) {
  return (props: P) => {
    return React.createElement(
      ErrorBoundary,
      { fallback },
      React.createElement(Component, props)
    );
  };
}

// 高阶组件：添加加载状态
export function withLoading<P extends object>(
  Component: React.ComponentType<P>,
  LoadingComponent?: React.ComponentType
) {
  return (props: P & { loading?: boolean }) => {
    const { loading, ...restProps } = props;
    
    if (loading) {
      return LoadingComponent 
        ? React.createElement(LoadingComponent)
        : React.createElement('div', null, 'Loading...');
    }
    
    return React.createElement(Component, restProps as P);
  };
}