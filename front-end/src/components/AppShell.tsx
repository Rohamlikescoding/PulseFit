'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Nav } from './Nav';
import { FloatingBar } from './FloatingBar';
import { NotificationHost } from './NotificationHost';
import { NewFeaturesBanner } from './NewFeaturesBanner';

const isAuthPage = (p: string | null) => p === '/login' || p === '/signup';
const isCoachArea = (p: string | null) => p === '/coach' || Boolean(p?.startsWith('/coach/'));

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const coach = isCoachArea(pathname);
  const auth = isAuthPage(pathname);
  const showUserChrome = !coach && !auth;

  return (
    <div className="flex flex-col min-h-screen">
      {!coach && <Nav />}
      {showUserChrome && <NotificationHost />}
      <main id="main-content" className="flex-1 px-4 sm:px-8 pt-6 pb-28 focus:outline-none">
        {children}
      </main>
      {showUserChrome && <FloatingBar />}
      {showUserChrome && <NewFeaturesBanner />}
    </div>
  );
};
