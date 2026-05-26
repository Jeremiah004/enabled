'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Logo from '@/components/Logo';
import ThemeToggle from '@/components/ThemeToggle';

type DashboardShellProps = {
  children: React.ReactNode;
  topBanner?: React.ReactNode;
  isAdmin: boolean;
  displayName: string;
  initials: string;
  roleLabel: string;
};

function NavLink({
  href,
  label,
  icon,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors min-h-[44px] border ${
        active ? 'nav-link-active' : 'nav-link-idle'
      }`}
    >
      <span className={active ? 'text-accent' : 'text-subtle'}>{icon}</span>
      {label}
    </Link>
  );
}

const announcementsIcon = (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337 5.972 5.972 0 0 1-5.41 20.97 5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
    />
  </svg>
);

export default function DashboardShell({
  children,
  topBanner,
  isAdmin,
  displayName,
  initials,
  roleLabel,
}: DashboardShellProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  const tutorIcon = (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125"
      />
    </svg>
  );

  const adminIcon = (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"
      />
    </svg>
  );

  const navContent = (onNavigate?: () => void) => (
    <>
      <p className="px-2 pb-2 text-[10px] font-semibold text-subtle uppercase tracking-widest">
        {isAdmin ? 'Admin' : 'Tutor'} workspace
      </p>
      {isAdmin ? (
        <>
          <NavLink href="/admin" label="Payroll dashboard" icon={adminIcon} onNavigate={onNavigate} />
          <NavLink
            href="/admin/announcements"
            label="Announcements"
            icon={announcementsIcon}
            onNavigate={onNavigate}
          />
        </>
      ) : (
        <NavLink href="/tutor" label="Log session" icon={tutorIcon} onNavigate={onNavigate} />
      )}
    </>
  );

  const userBlock = (
    <div className="border-t border-default pt-4 mt-4 space-y-3">
      <div className="flex items-center gap-3 px-2">
        <div className="w-10 h-10 rounded-full bg-[var(--accent-subtle)] border border-[var(--nav-active-border)] flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-bold text-accent">{initials}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-primary truncate">{displayName}</p>
          <p className="text-xs text-muted capitalize">{roleLabel}</p>
        </div>
      </div>
      <form action="/auth/signout" method="POST">
        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-sm font-medium text-muted hover:text-red-500 dark:hover:text-red-400 hover:bg-muted border border-default min-h-[44px] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"
            />
          </svg>
          Sign out
        </button>
      </form>
    </div>
  );

  return (
    <div className="flex min-h-[100dvh] bg-page text-primary">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 flex-shrink-0 bg-sidebar border-r border-default flex-col">
        <div className="px-5 py-5 border-b border-default">
          <Logo variant="full" size="sm" href={isAdmin ? '/admin' : '/tutor'} />
        </div>
        <nav className="flex-1 px-3 py-4">{navContent()}</nav>
        <div className="px-3 py-4 space-y-3">
          <div className="flex justify-center">
            <ThemeToggle />
          </div>
          {userBlock}
        </div>
      </aside>

      {/* Mobile drawer */}
      {menuOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={closeMenu}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[min(100vw-3rem,18rem)] bg-sidebar border-r border-default flex flex-col transform transition-transform duration-200 ease-out lg:hidden safe-top safe-bottom ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-hidden={!menuOpen}
      >
        <div className="px-4 py-4 border-b border-default flex items-center justify-between gap-2">
          <Logo variant="full" size="sm" href={isAdmin ? '/admin' : '/tutor'} />
          <button
            type="button"
            onClick={closeMenu}
            className="p-2 -mr-1 rounded-lg text-muted hover:text-primary hover:bg-muted min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="flex-1 px-3 py-4 overflow-y-auto">{navContent(closeMenu)}</nav>
        <div className="px-3 py-4">
          <div className="flex justify-center mb-3">
            <ThemeToggle />
          </div>
          {userBlock}
        </div>
      </aside>

      <div className="flex flex-1 flex-col min-w-0">
        {topBanner}

        {/* Mobile top bar */}
        <header className="lg:hidden sticky top-0 z-30 flex items-center gap-3 px-4 py-3 border-b border-default bg-page/95 backdrop-blur-md safe-top">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="p-2 -ml-2 rounded-lg text-muted hover:text-primary hover:bg-muted min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Open menu"
            aria-expanded={menuOpen}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          <Logo variant="full" size="sm" href={isAdmin ? '/admin' : '/tutor'} className="flex-shrink-0 max-w-[120px]" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-primary truncate">{displayName}</p>
            <p className="text-[11px] text-muted capitalize">{roleLabel}</p>
          </div>
          <ThemeToggle />
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="px-4 py-5 sm:px-6 sm:py-6 lg:p-8 max-w-6xl lg:max-w-none mx-auto lg:mx-0 safe-bottom">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
