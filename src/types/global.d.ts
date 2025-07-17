/// <reference types="vite/client" />
/// <reference types="vitest/globals" />

declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION__?: any;
  }
}

// 扩展 Performance 接口以支持内存监控
interface Performance {
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}

export {};