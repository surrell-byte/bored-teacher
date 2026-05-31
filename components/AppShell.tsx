'use client';
// components/AppShell.tsx
// Centralises Navbar and Toast rendering for all non-game, non-auth routes.
// Replaces the per-page <Navbar /> and <Toast /> imports.

import { usePathname } from 'next/navigation';
import { type ReactNode } from 'react';
import Navbar from './Navbar';
import Toast from './Toast';

const NO_SHELL = ['/auth', '/games/'];

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? '';
  const showShell = !NO_SHELL.some(p => pathname.startsWith(p));

  return (
    <>
      {showShell && <Navbar />}
      {showShell && <Toast />}
      {children}
    </>
  );
}