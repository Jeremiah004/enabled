import Link from 'next/link';
import Logo from '@/components/Logo';
import ThemeToggle from '@/components/ThemeToggle';

export default function HomeHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-default bg-elevated/90 backdrop-blur-md safe-top">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <Logo variant="full" size="sm" href="/" priority />
        <nav className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <ThemeToggle />
          <Link
            href="/login"
            className="text-sm text-muted hover:text-primary px-3 py-2.5 min-h-[44px] flex items-center transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/login"
            className="text-sm font-medium text-white btn-primary hover:opacity-90 px-4 py-2.5 rounded-sm min-h-[44px] flex items-center transition-colors"
          >
            Staff access
          </Link>
        </nav>
      </div>
    </header>
  );
}
