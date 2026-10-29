import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { hydrateRoot } from 'react-dom/client';
import { vi } from 'vitest';
import { useWorkoutStore } from '../store/workoutStore';
import { MainView } from '../components/views/MainView';
import { DashboardView } from '../components/views/DashboardView';
import { WorkoutsView } from '../components/views/WorkoutsView';

const STORAGE_KEY = 'apexfit-storage';

describe('workoutStore hydration', () => {
  beforeEach(() => {
    window.localStorage.clear();
    useWorkoutStore.setState({ isHydrated: false });
  });

  it('does not hydrate automatically (skipHydration) and flips the flag on rehydrate', async () => {
    expect(useWorkoutStore.getState().isHydrated).toBe(false);
    await act(async () => {
      await useWorkoutStore.persist.rehydrate();
    });
    expect(useWorkoutStore.getState().isHydrated).toBe(true);
  });

  it('notifies subscribers when hydration completes', async () => {
    const seen: boolean[] = [];
    const unsub = useWorkoutStore.subscribe((s) => seen.push(s.isHydrated));
    await act(async () => {
      await useWorkoutStore.persist.rehydrate();
    });
    unsub();
    expect(seen).toContain(true);
  });

  it('loads saved data from localStorage on rehydrate', async () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        state: { dismissedNotificationDates: ['2026-01-01'] },
        version: 0,
      })
    );
    await act(async () => {
      await useWorkoutStore.persist.rehydrate();
    });
    expect(useWorkoutStore.getState().dismissedNotificationDates).toEqual(['2026-01-01']);
  });

  it('never persists isHydrated or actions to localStorage', async () => {
    await act(async () => {
      await useWorkoutStore.persist.rehydrate();
    });
    act(() => {
      useWorkoutStore.getState().dismissNotificationForDate('2026-02-02');
    });
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}');
    expect(saved.state).toBeDefined();
    expect(saved.state).not.toHaveProperty('isHydrated');
    expect(saved.state.dismissedNotificationDates).toContain('2026-02-02');
  });

  it.each([
    ['MainView', MainView],
    ['DashboardView', DashboardView],
    ['WorkoutsView', WorkoutsView],
  ])('%s shows a skeleton until hydrated, then switches without a hook-order error', async (_name, View) => {
    render(<View />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');

    await act(async () => {
      await useWorkoutStore.persist.rehydrate();
    });
    expect(screen.queryByRole('status', { busy: true })).not.toBeInTheDocument();
  });

  it('hydrates server HTML without mismatch even when localStorage holds different data', async () => {
    // "Server": fresh module graph, no saved data
    vi.resetModules();
    window.localStorage.clear();
    const server = {
      React: (await import('react')).default,
      renderToString: (await import('react-dom/server')).renderToString,
      MainView: (await import('../components/views/MainView')).MainView,
    };
    const html = server.renderToString(server.React.createElement(server.MainView));

    // "Client": brand-new module graph that loads with saved data already in localStorage
    vi.resetModules();
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ state: { routines: [], sessionLogs: [] }, version: 0 })
    );
    const client = {
      React: (await import('react')).default,
      hydrateRoot: (await import('react-dom/client')).hydrateRoot,
      MainView: (await import('../components/views/MainView')).MainView,
      store: (await import('../store/workoutStore')).useWorkoutStore,
    };

    const recoverable: unknown[] = [];
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
    const container = document.createElement('div');
    container.innerHTML = html;
    document.body.appendChild(container);

    await act(async () => {
      client.hydrateRoot(container, client.React.createElement(client.MainView), {
        onRecoverableError: (e) => recoverable.push(e),
      });
    });

    const mismatches = errors.mock.calls.filter((c) => /hydrat|did not match/i.test(String(c[0])));
    expect(recoverable).toEqual([]);
    expect(mismatches).toEqual([]);

    // Saved data applies only after the explicit rehydrate
    expect(client.store.getState().routines.length).toBeGreaterThan(0);
    await act(async () => {
      await client.store.persist.rehydrate();
    });
    expect(client.store.getState().routines).toEqual([]);

    errors.mockRestore();
    container.remove();
  });
});
