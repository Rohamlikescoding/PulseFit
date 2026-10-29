import '@testing-library/jest-dom/vitest';
import React, { Profiler } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { Timer } from '../components/Timer';
import { useTimerStore } from '../store/timerStore';

describe('Timer re-render behaviour', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'Date', 'setInterval', 'clearInterval'] });
    useTimerStore.getState().resetTimer();
  });
  afterEach(() => {
    useTimerStore.getState().resetTimer();
    vi.useRealTimers();
  });

  it('does not re-render React while the clock is ticking, but the display still advances', () => {
    let commits = 0;
    render(
      <Profiler id="timer" onRender={() => { commits++; }}>
        <Timer />
      </Profiler>
    );

    fireEvent.click(screen.getByRole('button', { name: /start flow/i }));
    const commitsAfterStart = commits;

    // Run 5 seconds of animation frames
    act(() => {
      vi.advanceTimersByTime(5100);
    });

    // Display advanced via direct DOM writes...
    expect(screen.getByText(/^00:05$/)).toBeInTheDocument();
    expect(screen.getByText(/Total:/).textContent).toMatch(/00:05\.\d/);
    // ...with no extra React commits during the 5s of ticking.
    expect(commits).toBe(commitsAfterStart);
  });

  it('still re-renders on real state changes (pause / lap)', () => {
    render(<Timer />);
    fireEvent.click(screen.getByRole('button', { name: /start flow/i }));
    act(() => { vi.advanceTimersByTime(2000); });
    fireEvent.click(screen.getByRole('button', { name: /next exercise/i }));
    expect(screen.getByText(/Exercise Loop #2/)).toBeInTheDocument();
    expect(screen.getByText(/Logged Exercise Loops \(1\)/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /pause timer/i }));
    expect(screen.getByRole('button', { name: /resume flow/i })).toBeInTheDocument();
  });
});
