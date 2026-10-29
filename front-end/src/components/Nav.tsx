"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { TabSection } from "../types/workout";
import { useWorkoutStore } from "../store/workoutStore";
import { useTimerStore } from "../store/timerStore";
import { Dumbbell, Leaf, LogIn, LogOut, Moon, ShieldCheck, Sun, Timer as TimerIcon } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import {
  prefetchRouteChunk,
  prefetchExercisesData,
  prefetchExerciseDetail,
} from "../lib/queryClient";

interface NavProps {
  currentTab?: TabSection;
  onSelectTab?: (tab: TabSection) => void;
}

export const Nav: React.FC<NavProps> = ({ currentTab, onSelectTab }) => {
  const pathname = usePathname();
  const { activeSession, settings, updateSettings, routines, activeRoutineId } =
    useWorkoutStore();
  const isRunning = useTimerStore((s) => s.isRunning);
  const authStatus = useAuthStore((s) => s.status);
  const session = useAuthStore((s) => s.session);
  const logout = useAuthStore((s) => s.logout);

  const handlePrefetch = (path: string) => {
    prefetchRouteChunk(path);
    if (path === "/workouts") {
      prefetchExercisesData().catch(() => {});
      const activeRoutine =
        routines.find((r) => r.id === activeRoutineId) || routines[0];
      if (activeRoutine) {
        activeRoutine.days.forEach((day) => {
          day.exercises.forEach((ex) => {
            prefetchExerciseDetail(ex.exerciseId).catch(() => {});
          });
        });
      }
    }
  };

  const isLight =
    settings.theme === "light" ||
    (settings.theme === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: light)").matches);

  const toggleTheme = () => {
    updateSettings({ theme: isLight ? "dark" : "light" });
  };

  const getNavLinkClass = (isActive: boolean) =>
    `transition-colors whitespace-nowrap pb-1 border-b-2 ${
      isActive
        ? `text-token-primary ${isLight ? "border-[#1d1b18]" : "border-[#74a87c]"} font-bold`
        : "text-token-muted border-transparent hover:text-token-primary"
    }`;

  const isRouteActive = (routePath: string, tabId: TabSection): boolean => {
    if (currentTab) return currentTab === tabId;
    if (routePath === "/") return pathname === "/";
    return Boolean(pathname?.startsWith(routePath));
  };

  return (
    <header className="sticky top-0 z-40 bg-app/90 backdrop-blur-xl border-b border-token px-4 sm:px-8 py-3.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <Link
          href="/"
          onClick={() => onSelectTab?.("main")}
          className="text-lg font-bold tracking-tight text-token-primary hover:text-accent-brand transition-colors flex items-center gap-2.5 text-left cursor-pointer"
        >
          <span
            className={`flex h-7 w-7 items-center justify-center rounded-xl font-bold text-sm shadow-sm transition-colors ${
              isLight
                ? "bg-[#1d1b18] text-[#ffffff]"
                : "bg-[#74a87c] text-[#0e1511]"
            }`}
          >
            <Leaf className="h-4 w-4 fill-current" />
          </span>
          <span className="font-extrabold tracking-tight font-serif-editorial text-xl sm:text-2xl">
            PulseFit
          </span>
        </Link>

        {/* Zone 2: 4 nav links, single-line, clean text links */}
        <nav
          className="hidden md:flex items-center gap-8 text-sm font-medium"
          aria-label="Main Navigation"
        >
          <Link
            href="/"
            onClick={() => onSelectTab?.("main")}
            onMouseEnter={() => handlePrefetch("/")}
            onFocus={() => handlePrefetch("/")}
            className={getNavLinkClass(isRouteActive("/", "main"))}
          >
            Overview
          </Link>
          <Link
            href="/workouts"
            onClick={() => onSelectTab?.("workouts")}
            onMouseEnter={() => handlePrefetch("/workouts")}
            onFocus={() => handlePrefetch("/workouts")}
            className={getNavLinkClass(isRouteActive("/workouts", "workouts"))}
          >
            Routines
          </Link>
          <Link
            href="/timer"
            onClick={() => onSelectTab?.("timer")}
            onMouseEnter={() => handlePrefetch("/timer")}
            onFocus={() => handlePrefetch("/timer")}
            className={`${getNavLinkClass(isRouteActive("/timer", "timer"))} flex items-center gap-1.5`}
          >
            <span>Timer</span>
            {isRunning && (
              <span
                className={`inline-block h-2 w-2 rounded-full animate-pulse ${
                  isLight ? "bg-[#466645]" : "bg-[#9dd3a4]"
                }`}
              />
            )}
          </Link>
          <Link
            href="/dashboard"
            onClick={() => onSelectTab?.("dashboard")}
            onMouseEnter={() => handlePrefetch("/dashboard")}
            onFocus={() => handlePrefetch("/dashboard")}
            className={getNavLinkClass(
              isRouteActive("/dashboard", "dashboard"),
            )}
          >
            Analytics
          </Link>
        </nav>

        {/* Zone 3: Primary actions + Quick Theme Toggle */}
        <div className="flex items-center gap-2.5">
          {/* Theme Quick Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={
              isLight ? "Switch to dark sanctuary" : "Switch to light sanctuary"
            }
            className="p-2.5 rounded-xl text-token-secondary hover:text-token-primary hover:bg-surface-tertiary border border-token transition-colors cursor-pointer"
          >
            {isLight ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4 text-[#d9c3a5]" />
            )}
          </button>

          {/* Account: Log in, or who you are + log out */}
          {authStatus === "ready" &&
            (session ? (
              <div className="flex items-center gap-1.5">
                {session.role === "coach" ? (
                  <Link
                    href="/coach"
                    className="px-3 py-2 text-xs font-semibold rounded-xl btn-secondary-token flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Coach app</span>
                  </Link>
                ) : (
                  <span
                    className="hidden sm:flex h-9 px-3 items-center text-xs font-semibold text-token-secondary rounded-xl border border-token max-w-[9rem] truncate"
                    title={session.user.email}
                  >
                    {session.user.name.split(" ")[0]}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => logout()}
                  aria-label="Log out"
                  title="Log out"
                  className="p-2.5 rounded-xl text-token-secondary hover:text-token-primary hover:bg-surface-tertiary border border-token transition-colors cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-3.5 py-2 text-xs font-semibold rounded-xl btn-secondary-token flex items-center gap-1.5 whitespace-nowrap"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Log in</span>
              </Link>
            ))}

          {activeSession ? (
            <Link
              href="/workouts"
              onClick={() => onSelectTab?.("workouts")}
              onMouseEnter={() => handlePrefetch("/workouts")}
              onFocus={() => handlePrefetch("/workouts")}
              className="px-4 py-2 text-xs font-bold rounded-xl btn-primary-token flex items-center gap-2 whitespace-nowrap cursor-pointer"
            >
              <Dumbbell className="h-3.5 w-3.5" />
              <span>In Session</span>
            </Link>
          ) : (
            <Link
              href="/workouts"
              onClick={() => onSelectTab?.("workouts")}
              onMouseEnter={() => handlePrefetch("/workouts")}
              onFocus={() => handlePrefetch("/workouts")}
              className="px-4 py-2 text-xs font-semibold rounded-xl btn-secondary-token whitespace-nowrap cursor-pointer"
            >
              Begin Session
            </Link>
          )}

          {isRunning && (
            <Link
              href="/timer"
              onClick={() => onSelectTab?.("timer")}
              aria-label="Open Running Timer"
              className="px-3 py-1.5 text-xs font-mono font-medium rounded-xl bg-[#74a87c]/15 text-[#9dd3a4] border border-[#74a87c]/30 flex items-center gap-1.5 hover:bg-[#74a87c]/25 transition-colors cursor-pointer"
            >
              <TimerIcon
                className="h-3.5 w-3.5 animate-spin"
                style={{ animationDuration: "6s" }}
              />
              <span>Flow Active</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
