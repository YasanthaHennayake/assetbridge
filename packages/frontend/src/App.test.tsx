import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from './App';
import * as api from './services/api';

// Mock the API module
vi.mock('./services/api', () => ({
  api: {
    getHelloWorld: vi.fn(),
  },
}));

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders AssetBridge title', () => {
    render(<App />);
    expect(screen.getByText('AssetBridge')).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    render(<App />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('displays hello world message on successful fetch', async () => {
    const mockData = {
      message: 'Hello World from AssetBridge!',
      timestamp: new Date().toISOString(),
    };

    vi.mocked(api.api.getHelloWorld).mockResolvedValue(mockData);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Hello World from AssetBridge!')).toBeInTheDocument();
    });
  });

  it('displays error message on failed fetch', async () => {
    vi.mocked(api.api.getHelloWorld).mockRejectedValue(new Error('Network error'));

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Error: Network error/)).toBeInTheDocument();
    });
  });

  it('displays tech stack information', () => {
    render(<App />);

    expect(screen.getByText(/Frontend: React \+ Vite \+ TypeScript/)).toBeInTheDocument();
    expect(screen.getByText(/Backend: Node\.js \+ Express \+ TypeScript/)).toBeInTheDocument();
    expect(screen.getByText(/Database: MongoDB Atlas/)).toBeInTheDocument();
  });
});
