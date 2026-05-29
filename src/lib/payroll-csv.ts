/** One row per tutor with outstanding unpaid sessions (manual Paystack fallback export). */
export type UnpaidPayrollExportRow = {
  tutorName: string;
  unpaidSessions: number;
  amountOwedNgn: number;
  bankName: string;
  accountNumber: string;
  bankCode: string;
};

const CSV_HEADERS = [
  'Tutor Name',
  'Unpaid Sessions',
  'Amount Owed (NGN)',
  'Bank Name',
  'Account Number',
  'Bank Code',
] as const;

function escapeCsvCell(value: string | number): string {
  const s = String(value);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function buildPayrollCsv(rows: UnpaidPayrollExportRow[]): string {
  const lines = [
    CSV_HEADERS.join(','),
    ...rows.map((r) =>
      [
        escapeCsvCell(r.tutorName),
        escapeCsvCell(r.unpaidSessions),
        escapeCsvCell(r.amountOwedNgn),
        escapeCsvCell(r.bankName),
        escapeCsvCell(r.accountNumber),
        escapeCsvCell(r.bankCode),
      ].join(',')
    ),
  ];
  return lines.join('\n');
}

/** Trigger a browser download of the payroll CSV (client-only). */
export function downloadPayrollCsv(rows: UnpaidPayrollExportRow[]): void {
  const csv = buildPayrollCsv(rows);
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
  const date = new Date().toISOString().slice(0, 10);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `enabled-payroll-${date}.csv`;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
