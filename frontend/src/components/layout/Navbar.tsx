'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { clearSession, getStoredUser, type StoredUser } from '@/lib/api';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/showcase', label: 'Showcase' },
];

export function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<StoredUser | null>(null);

  const refreshUser = useCallback(() => {
    setUser(getStoredUser());
  }, []);

  useEffect(() => {
    refreshUser();
    window.addEventListener('ecostay-auth-change', refreshUser);
    return () => window.removeEventListener('ecostay-auth-change', refreshUser);
  }, [refreshUser]);

  const handleLogout = () => {
    clearSession();
    setUser(null);
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-emerald-800/20 bg-emerald-700 shadow-md dark:border-emerald-900 dark:bg-emerald-900">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8"
      >
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20 text-lg font-bold text-white">
            E
          </span>
          <span className="text-lg font-bold tracking-tight text-white sm:text-xl">
            EcoStay Explorer
          </span>
        </Link>
        <ul className="flex flex-wrap items-center gap-1 sm:gap-2">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-emerald-50 transition-colors hover:bg-white/15 hover:text-white"
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            {user ? (
              <div className="flex items-center gap-2">
                <span className="hidden rounded-lg bg-white/10 px-3 py-2 text-xs text-emerald-50 sm:inline">
                  {user.name || user.email}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-emerald-50 transition-colors hover:bg-white/15 hover:text-white"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="rounded-lg px-3 py-2 text-sm font-medium text-emerald-50 transition-colors hover:bg-white/15 hover:text-white"
              >
                Login
              </Link>
            )}
          </li>
        </ul>
      </nav>
    </header>
  );
}
