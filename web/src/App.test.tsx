import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

describe('App UI flows', () => {
  beforeEach(() => {
    // Mock fetch
    global.fetch = vi.fn(async (input: RequestInfo) => {
      const url = typeof input === 'string' ? input : input.url;
      if (url.endsWith('/api/image/latest')) {
        // 404 by default
        return new Response(null, { status: 404 });
      }
      if (url.endsWith('/api/capture')) {
        return new Response(JSON.stringify({ saved: true }), { status: 201 });
      }
      if (url.endsWith('/api/analyze')) {
        return new Response(
          JSON.stringify({ description: 'x', verdict: 'ok', confidence: 0.7 }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }
      return new Response(null, { status: 500 });
    }) as any;

    // Mock webcam
    // @ts-expect-error minimal mediaDevices mock
    navigator.mediaDevices = {
      getUserMedia: vi.fn(async () => ({ getTracks: () => [{ stop: vi.fn() }] }))
    };
    // mock HTMLVideoElement.play
    Object.defineProperty(HTMLMediaElement.prototype, 'play', {
      configurable: true,
      value: vi.fn(),
    });
    Object.defineProperty(HTMLMediaElement.prototype, 'srcObject', {
      configurable: true,
      set: vi.fn(),
    });
    // Mock canvas toDataURL
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      configurable: true,
      value: () => ({ drawImage: vi.fn() }),
    });
    Object.defineProperty(HTMLCanvasElement.prototype, 'toDataURL', {
      configurable: true,
      value: () => 'data:image/jpeg;base64,AAAA',
    });
  });

  it('renders and triggers analyze', async () => {
    render(<App />);
    const input = screen.getByLabelText('description');
    fireEvent.change(input, { target: { value: 'hello' } });
    fireEvent.click(screen.getByText('Analyze'));
    await waitFor(() => expect(screen.getByText(/"verdict"/)).toBeInTheDocument());
  });

  it('captures a snapshot and calls capture API', async () => {
    render(<App />);
    fireEvent.click(screen.getByText('Capture'));
    await waitFor(() => {
      expect((global.fetch as any)).toHaveBeenCalledWith('/api/capture', expect.any(Object));
    });
  });
});

