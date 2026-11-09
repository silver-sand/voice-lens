import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BYOPSection } from './BYOPSection';
import { usePollinationsAuth } from '../../hooks/usePollinationsAuth';

// Mock the auth hook
vi.mock('../../hooks/usePollinationsAuth', () => ({
  usePollinationsAuth: vi.fn(),
}));

const mockUsePollinationsAuth = vi.mocked(usePollinationsAuth);

describe('BYOPSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePollinationsAuth.mockReturnValue({
      isConnected: false,
      isLoading: false,
      error: null,
      connect: vi.fn(),
      disconnect: vi.fn(),
      accessToken: null,
      isConfigured: true,
    });
  });

  it('renders connect button when not connected', () => {
    render(<BYOPSection />);
    expect(screen.getByRole('button', { name: /connect pollen/i })).toBeInTheDocument();
  });

  it('shows disconnected state', () => {
    render(<BYOPSection />);
    expect(screen.getByText('Not connected')).toBeInTheDocument();
    expect(screen.getByText('Connect to enable AI-powered style interpretation and rewrites.')).toBeInTheDocument();
  });

  it('shows connected state when isConnected is true', () => {
    mockUsePollinationsAuth.mockReturnValue({
      isConnected: true,
      isLoading: false,
      error: null,
      connect: vi.fn(),
      disconnect: vi.fn(),
      accessToken: 'test-token-12345678',
      isConfigured: true,
    });

    render(<BYOPSection />);
    expect(screen.getByText('Connected')).toBeInTheDocument();
    expect(screen.getByText('Your Pollen account is linked. AI interpretation enabled.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /disconnect/i })).toBeInTheDocument();
    expect(screen.getByText('test-tok...5678')).toBeInTheDocument();
  });

  it('shows loading state during connection', () => {
    mockUsePollinationsAuth.mockReturnValue({
      isConnected: false,
      isLoading: true,
      error: null,
      connect: vi.fn(),
      disconnect: vi.fn(),
      accessToken: null,
      isConfigured: true,
    });

    render(<BYOPSection />);
    expect(screen.getByRole('button', { name: /connecting/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /connecting/i })).toBeDisabled();
  });

  it('shows error message when error exists', () => {
    mockUsePollinationsAuth.mockReturnValue({
      isConnected: false,
      isLoading: false,
      error: 'Failed to connect',
      connect: vi.fn(),
      disconnect: vi.fn(),
      accessToken: null,
      isConfigured: true,
    });

    render(<BYOPSection />);
    expect(screen.getByText('Failed to connect')).toBeInTheDocument();
  });

  it('toggles details when show details button is clicked', async () => {
    render(<BYOPSection />);

    // Details should be hidden initially
    expect(screen.queryByText('How it works')).not.toBeInTheDocument();

    // Click show details
    fireEvent.click(screen.getByRole('button', { name: /show details/i }));

    await waitFor(() => {
      expect(screen.getByText('How it works')).toBeInTheDocument();
    });

    // Click hide details
    fireEvent.click(screen.getByRole('button', { name: /hide details/i }));

    await waitFor(() => {
      expect(screen.queryByText('How it works')).not.toBeInTheDocument();
    });
  });

  it('calls connect when connect button is clicked', () => {
    const mockConnect = vi.fn();
    mockUsePollinationsAuth.mockReturnValue({
      isConnected: false,
      isLoading: false,
      error: null,
      connect: mockConnect,
      disconnect: vi.fn(),
      accessToken: null,
      isConfigured: true,
    });

    render(<BYOPSection />);
    fireEvent.click(screen.getByRole('button', { name: /connect pollen/i }));

    expect(mockConnect).toHaveBeenCalledTimes(1);
  });

  it('calls disconnect when disconnect button is clicked', () => {
    const mockDisconnect = vi.fn();
    mockUsePollinationsAuth.mockReturnValue({
      isConnected: true,
      isLoading: false,
      error: null,
      connect: vi.fn(),
      disconnect: mockDisconnect,
      accessToken: 'test-token',
      isConfigured: true,
    });

    render(<BYOPSection />);
    fireEvent.click(screen.getByRole('button', { name: /disconnect/i }));

    expect(mockDisconnect).toHaveBeenCalledTimes(1);
  });
});