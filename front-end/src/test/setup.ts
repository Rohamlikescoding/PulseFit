import '@testing-library/jest-dom/vitest';
import React from 'react';
import { afterEach, beforeEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { useWorkoutStore } from '../store/workoutStore';

// Mirror <Providers>: the store uses skipHydration, so hydrate it before each test.
beforeEach(async () => {
  await useWorkoutStore.persist.rehydrate();
});

afterEach(() => {
  cleanup();
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock window.scrollTo
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: vi.fn(),
});

// Mock ResizeObserver for Recharts
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock AudioContext for Web Audio API
(window as any).AudioContext = class MockAudioContext {
  currentTime = 0;
  destination = {};
  createOscillator() {
    return {
      type: 'sine',
      frequency: { setValueAtTime: vi.fn() },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };
  }
  createGain() {
    return {
      gain: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    };
  }
};

// Mock next/navigation
let mockPathname = '/';
export const setMockPathname = (path: string) => {
  mockPathname = path;
};

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn((url: string) => {
      mockPathname = url;
    }),
    replace: vi.fn((url: string) => {
      mockPathname = url;
    }),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => mockPathname,
  useSearchParams: () => new URLSearchParams(),
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ href, children, onClick, onMouseEnter, onFocus, className, ...rest }: any) => {
    return React.createElement(
      'a',
      {
        href,
        className,
        onClick: (e: any) => {
          if (onClick) onClick(e);
        },
        onMouseEnter,
        onFocus,
        ...rest,
      },
      children
    );
  },
}));
