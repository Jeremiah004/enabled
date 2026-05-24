'use client';

import { useState } from 'react';

type Tab = 'sessions' | 'payout';

export default function TutorDashboardTabs({
  sessionsPanel,
  payoutPanel,
}: {
  sessionsPanel: React.ReactNode;
  payoutPanel: React.ReactNode;
}) {
  const [tab, setTab] = useState<Tab>('sessions');

  return (
    <div>
      <div
        className="flex gap-1 p-1 rounded-xl bg-zinc-900 border border-zinc-800 mb-6"
        role="tablist"
        aria-label="Tutor dashboard sections"
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'sessions'}
          onClick={() => setTab('sessions')}
          className={`flex-1 min-h-[44px] text-sm font-medium rounded-lg transition-colors ${
            tab === 'sessions'
              ? 'bg-emerald-500 text-zinc-950'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
          }`}
        >
          Sessions
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'payout'}
          onClick={() => setTab('payout')}
          className={`flex-1 min-h-[44px] text-sm font-medium rounded-lg transition-colors ${
            tab === 'payout'
              ? 'bg-emerald-500 text-zinc-950'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
          }`}
        >
          Payout settings
        </button>
      </div>

      <div role="tabpanel" hidden={tab !== 'sessions'}>
        {tab === 'sessions' ? sessionsPanel : null}
      </div>
      <div role="tabpanel" hidden={tab !== 'payout'}>
        {tab === 'payout' ? payoutPanel : null}
      </div>
    </div>
  );
}
