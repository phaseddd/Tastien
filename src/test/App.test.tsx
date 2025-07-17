import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';

// 测试工具函数
const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('App Component', () => {
  it('renders without crashing', () => {
    renderWithRouter(<App />);
    expect(screen.getByText(/Tastien/i)).toBeInTheDocument();
  });

  it('has correct navigation structure', () => {
    renderWithRouter(<App />);
    // 检查导航元素是否存在
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });
});

// Hook测试示例
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '../hooks';

describe('useLocalStorage Hook', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should return initial value when localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
    expect(result.current[0]).toBe('initial');
  });

  it('should update localStorage when value changes', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
    
    act(() => {
      result.current[1]('updated');
    });

    expect(result.current[0]).toBe('updated');
    expect(localStorage.setItem).toHaveBeenCalledWith('test-key', '"updated"');
  });
});