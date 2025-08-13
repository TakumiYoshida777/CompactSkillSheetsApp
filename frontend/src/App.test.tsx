import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import App from './App';

// React Router のモック
vi.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Routes: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Route: ({ element }: { element: React.ReactNode }) => <div>{element}</div>,
  Navigate: () => <div>Navigate</div>,
  useNavigate: () => vi.fn(),
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}));

// TanStack Query のモック
vi.mock('@tanstack/react-query', () => ({
  QueryClient: vi.fn(),
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Ant Design のモック
vi.mock('antd', () => ({
  ConfigProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  message: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}));

// Store のモック
vi.mock('./stores/authStore', () => ({
  useAuthStore: () => ({
    checkAuth: vi.fn(),
    isAuthenticated: false,
    user: null,
  }),
}));

describe('App', () => {
  it('アプリケーションが正常にレンダリングされる', () => {
    const { container } = render(<App />);
    expect(container).toBeDefined();
  });

  it('QueryClientProviderが含まれている', () => {
    const { container } = render(<App />);
    expect(container.querySelector('div')).toBeInTheDocument();
  });

  it('ConfigProviderが含まれている', () => {
    const { container } = render(<App />);
    expect(container.querySelector('div')).toBeInTheDocument();
  });
});