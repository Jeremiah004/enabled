'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

type DashboardShellProps = {
  children: React.ReactNode;
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
      className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors min-h-[44px] ${
        active
          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25'
          : 'text-zinc-300 hover:text-white hover:bg-zinc-800 border border-transparent'
      }`}
    >
      <span className={active ? 'text-emerald-400' : 'text-zinc-500'}>{icon}</span>
      {label}
    </Link>
  );
}

export default function DashboardShell({
  children,
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
      <p className="px-2 pb-2 text-[10px] font-semibold text-zinc-600 uppercase tracking-widest">
        {isAdmin ? 'Admin' : 'Tutor'} workspace
      </p>
      {isAdmin ? (
        <NavLink href="/admin" label="Payroll dashboard" icon={adminIcon} onNavigate={onNavigate} />
      ) : (
        <NavLink href="/tutor" label="Log session" icon={tutorIcon} onNavigate={onNavigate} />
      )}
    </>
  );

  const userBlock = (
    <div className="border-t border-zinc-800 pt-4 mt-4 space-y-3">
      <div className="flex items-center gap-3 px-2">
        <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-bold text-emerald-400">{initials}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white truncate">{displayName}</p>
          <p className="text-xs text-zinc-500 capitalize">{roleLabel}</p>
        </div>
      </div>
      <form action="/auth/signout" method="POST">
        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-sm font-medium text-zinc-400 hover:text-red-400 hover:bg-zinc-800 border border-zinc-800 min-h-[44px] transition-colors"
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
    <div className="flex min-h-[100dvh] bg-zinc-950 text-white">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 flex-shrink-0 bg-zinc-900 border-r border-zinc-800 flex-col">
        <div className="px-5 py-5 border-b border-zinc-800">
          <BrandMark />
        </div>
        <nav className="flex-1 px-3 py-4">{navContent()}</nav>
        <div className="px-3 py-4">{userBlock}</div>
      </aside>

      {/* Mobile drawer */}
      {menuOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={closeMenu}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[min(100vw-3rem,18rem)] bg-zinc-900 border-r border-zinc-800 flex flex-col transform transition-transform duration-200 ease-out lg:hidden safe-top safe-bottom ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-hidden={!menuOpen}
      >
        <div className="px-4 py-4 border-b border-zinc-800 flex items-center justify-between">
          <BrandMark compact />
          <button
            type="button"
            onClick={closeMenu}
            className="p-2 -mr-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="flex-1 px-3 py-4 overflow-y-auto">{navContent(closeMenu)}</nav>
        <div className="px-3 py-4">{userBlock}</div>
      </aside>

      <div className="flex flex-1 flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="lg:hidden sticky top-0 z-30 flex items-center gap-3 px-4 py-3 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-md safe-top">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="p-2 -ml-2 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Open menu"
            aria-expanded={menuOpen}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white truncate">{displayName}</p>
            <p className="text-[11px] text-zinc-500 capitalize">{roleLabel}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-emerald-400">{initials}</span>
          </div>
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

function BrandMark({ compact }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center flex-shrink-0">
        <svg className="w-4 h-4 text-zinc-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 3.741-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5"
          />
        </svg>
      </div>
      {!compact && (
        <div>
          <p className="text-xs font-bold text-white leading-tight tracking-tight">Enabled Multi</p>
          <p className="text-xs text-zinc-500 leading-tight">Concept</p>
        </div>
      )}
      {compact && <p className="text-sm font-bold text-white">Enabled</p>}
    </div>
  );
}
