'use client';

import { useEffect, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { getPaystackBanks } from '@/app/actions/paystack';
import { updatePayoutDetails } from '@/app/actions/updatePayoutDetails';
import {
  payoutDetailsInitialState,
  type PayoutDetailsState,
} from '@/app/actions/updatePayoutDetails.types';
import type { PaystackBank } from '@/lib/paystack';

const inputClass =
  'w-full input-field text-base sm:text-sm rounded-xl px-3.5 py-3.5 sm:py-3 min-h-[48px] transition-all';

const labelClass = 'block text-xs font-medium text-muted mb-1.5';

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full sm:w-auto btn-primary disabled:opacity-50 font-semibold text-sm px-8 py-3 rounded-xl min-h-[48px] transition-all hover:opacity-90"
    >
      {pending ? 'Saving…' : 'Save payout details'}
    </button>
  );
}

export default function PayoutSettingsForm({
  initial,
}: {
  initial: {
    bank_name: string | null;
    bank_code: string | null;
    account_number: string | null;
    account_name: string | null;
  };
}) {
  const [state, formAction] = useFormState<PayoutDetailsState, FormData>(
    updatePayoutDetails,
    payoutDetailsInitialState
  );

  const [banks, setBanks] = useState<PaystackBank[]>([]);
  const [banksLoading, setBanksLoading] = useState(true);
  const [banksNotice, setBanksNotice] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadBanks() {
      try {
        const result = await getPaystackBanks();
        if (cancelled) return;
        setBanks(result.banks);
        if (result.error) {
          setBanksNotice(result.error);
        } else if (result.source === 'fallback') {
          setBanksNotice('Using standard bank list — Paystack live list unavailable.');
        } else {
          setBanksNotice(null);
        }
      } catch {
        if (!cancelled) {
          setBanksNotice('Could not load banks. Refresh the page to try again.');
          setBanks([]);
        }
      } finally {
        if (!cancelled) setBanksLoading(false);
      }
    }

    loadBanks();
    return () => {
      cancelled = true;
    };
  }, []);

  const matchedInitialCode =
    initial.bank_code ||
    banks.find((b) => b.name === initial.bank_name)?.code ||
    '';

  useEffect(() => {
    if (!banks.length || !matchedInitialCode) return;
    const bank = banks.find((b) => b.code === matchedInitialCode);
    const hidden = document.getElementById('bank_name_hidden') as HTMLInputElement | null;
    if (bank && hidden) hidden.value = bank.name;
  }, [banks, matchedInitialCode]);

  const hasDetails =
    Boolean(initial.bank_name) &&
    Boolean(initial.account_number) &&
    Boolean(initial.account_name);

  return (
    <div className="rounded-2xl border border-default bg-elevated p-4 sm:p-6 md:p-7 card-glow max-w-lg">
      <h2 className="text-lg font-semibold text-primary">Payout settings</h2>
      <p className="text-muted text-sm mt-1 leading-relaxed">
        Required before Paystack bulk payouts are enabled. Your admin uses these details
        to transfer session earnings.
      </p>

      {hasDetails && !state.success && (
        <p className="mt-4 text-xs text-emerald-400/90 border border-emerald-500/20 rounded-lg px-3 py-2 bg-emerald-500/5">
          Banking details on file — update below if anything changes.
        </p>
      )}

      <form action={formAction} className="mt-6 space-y-5">
        {state.error && (
          <div className="rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/40 px-4 py-3">
            <p className="text-sm text-red-800 dark:text-red-200">{state.error}</p>
          </div>
        )}
        {state.success && (
          <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/40 px-4 py-3">
            <p className="text-sm text-emerald-800 dark:text-emerald-200 font-medium">Payout details saved.</p>
          </div>
        )}

        <div>
          <label htmlFor="bank_code" className={labelClass}>
            Bank
          </label>
          <input type="hidden" name="bank_name" id="bank_name_hidden" defaultValue={initial.bank_name ?? ''} />
          {banksLoading ? (
            <p className="text-sm text-muted py-3">Loading Nigerian banks…</p>
          ) : banks.length === 0 ? (
            <p className="text-sm text-amber-700 dark:text-amber-300 py-2">
              No banks available. Restart the dev server if you just added Paystack keys.
            </p>
          ) : (
            <>
              <select
                id="bank_code"
                name="bank_code"
                required
                defaultValue={matchedInitialCode}
                onChange={(e) => {
                  const bank = banks.find((b) => b.code === e.target.value);
                  const hidden = document.getElementById('bank_name_hidden') as HTMLInputElement | null;
                  if (hidden && bank) hidden.value = bank.name;
                }}
                className={inputClass}
              >
                <option value="">Select your bank…</option>
                {banks.map((b) => (
                  <option key={b.code} value={b.code}>
                    {b.name}
                  </option>
                ))}
              </select>
              {banksNotice && (
                <p className="text-xs text-subtle mt-1.5">{banksNotice}</p>
              )}
            </>
          )}
          {!banksLoading && initial.bank_name && !matchedInitialCode && (
            <p className="text-xs text-subtle mt-1.5">
              Previously saved: {initial.bank_name} — please re-select from the list.
            </p>
          )}
        </div>

        <div>
          <label htmlFor="account_number" className={labelClass}>
            Account number
          </label>
          <input
            id="account_number"
            name="account_number"
            type="text"
            inputMode="numeric"
            required
            maxLength={10}
            pattern="[0-9]{10}"
            defaultValue={initial.account_number ?? ''}
            placeholder="10-digit NUBAN"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="account_name" className={labelClass}>
            Account Name (The full name on your bank account)
          </label>
          <input
            id="account_name"
            name="account_name"
            type="text"
            required
            defaultValue={initial.account_name ?? ''}
            placeholder="Exactly as it appears on your bank account"
            className={inputClass}
          />
        </div>

        <SaveButton />
      </form>
    </div>
  );
}
