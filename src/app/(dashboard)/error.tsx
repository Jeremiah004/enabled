'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[dashboard error]', error);
  }, [error]);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center px-6 py-16 text-center">
      <h1 className="text-lg font-semibold text-primary">Something went wrong</h1>
      <p className="text-sm text-muted mt-2 max-w-md leading-relaxed">
        This page hit an error while loading. You can try again or return to your dashboard.
      </p>
      {error.digest && (
        <p className="text-xs text-subtle mt-3 font-mono">Digest: {error.digest}</p>
      )}
      <div className="flex flex-wrap gap-3 mt-8 justify-center">
        <button
          type="button"
          onClick={() => reset()}
          className="btn-primary text-sm font-semibold px-5 py-2.5 rounded-xl min-h-[44px]"
        >
          Try again
        </button>
        <Link
          href="/admin"
          className="text-sm font-medium px-5 py-2.5 rounded-xl border border-default text-primary min-h-[44px] inline-flex items-center hover:bg-muted"
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}
