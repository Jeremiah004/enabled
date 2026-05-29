import { FLAT_SESSION_PAYOUT_NGN } from '@/lib/sessions';
import type { UnpaidPayrollExportRow } from '@/lib/payroll-csv';

type SessionRow = { tutor_id: string; status: string };

type TutorProfileRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  bank_name: string | null;
  bank_code: string | null;
  account_number: string | null;
};

/**
 * Groups unpaid sessions by tutor — same basis as Process Payouts bulk transfer.
 */
export function buildUnpaidPayrollRows(
  sessions: SessionRow[],
  profiles: TutorProfileRow[]
): UnpaidPayrollExportRow[] {
  const unpaidByTutor = new Map<string, number>();

  for (const session of sessions) {
    if (session.status !== 'UNPAID') continue;
    unpaidByTutor.set(session.tutor_id, (unpaidByTutor.get(session.tutor_id) ?? 0) + 1);
  }

  const profileById = new Map(profiles.map((p) => [p.id, p]));

  const rows: UnpaidPayrollExportRow[] = [];

  for (const [tutorId, unpaidSessions] of unpaidByTutor) {
    const profile = profileById.get(tutorId);
    const tutorName =
      profile?.full_name?.trim() || profile?.email?.trim() || 'Unknown tutor';

    rows.push({
      tutorName,
      unpaidSessions,
      amountOwedNgn: unpaidSessions * FLAT_SESSION_PAYOUT_NGN,
      bankName: profile?.bank_name?.trim() ?? '',
      accountNumber: profile?.account_number?.replace(/\D/g, '') ?? '',
      bankCode: profile?.bank_code?.trim() ?? '',
    });
  }

  rows.sort((a, b) =>
    a.tutorName.localeCompare(b.tutorName, 'en', { sensitivity: 'base' })
  );

  return rows;
}
