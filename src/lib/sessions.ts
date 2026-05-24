export type SessionTimestampsResult =
  | { ok: true; start_time: string; end_time: string; durationHours: number }
  | { ok: false; error: string };

/** Normalize to 24h "HH:MM" — accepts "09:00", "09:00:00", or "5:30 PM" */
export function normalizeTimeInput(time: string): string | null {
  const trimmed = time.trim();

  const twelveHour = trimmed.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)$/i);
  if (twelveHour) {
    const h12 = parseInt(twelveHour[1], 10);
    const m = parseInt(twelveHour[2], 10);
    const period = twelveHour[3].toUpperCase();
    if (Number.isNaN(h12) || Number.isNaN(m) || h12 < 1 || h12 > 12 || m < 0 || m > 59) {
      return null;
    }
    let h24 = h12 % 12;
    if (period === 'PM') h24 += 12;
    return `${String(h24).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  const twentyFour = trimmed.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (!twentyFour) return null;
  const hours = Math.min(23, Math.max(0, parseInt(twentyFour[1], 10)));
  const minutes = Math.min(59, Math.max(0, parseInt(twentyFour[2], 10)));
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/** Parse YYYY-MM-DD + HH:MM as local wall-clock time (no timezone string bugs). */
export function parseLocalSessionDateTime(sessionDate: string, time: string): Date | null {
  const normalized = normalizeTimeInput(time);
  if (!normalized) return null;

  const dateMatch = sessionDate.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!dateMatch) return null;

  const year = parseInt(dateMatch[1], 10);
  const month = parseInt(dateMatch[2], 10) - 1;
  const day = parseInt(dateMatch[3], 10);
  const [hours, minutes] = normalized.split(':').map((n) => parseInt(n, 10));

  const dt = new Date(year, month, day, hours, minutes, 0, 0);
  if (Number.isNaN(dt.getTime())) return null;
  return dt;
}

/** Hours between two ISO timestamptz values (always non-negative). */
export function sessionDurationHours(startTime: string, endTime: string): number {
  const start = new Date(startTime);
  const end = new Date(endTime);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
  return Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60);
}

/**
 * Validates date + times and returns ISO strings for Supabase timestamptz.
 * Uses local calendar date/time so browser time inputs behave predictably.
 */
export function validateAndBuildSessionTimestamps(
  sessionDate: string,
  startTime: string,
  endTime: string
): SessionTimestampsResult {
  const start = parseLocalSessionDateTime(sessionDate, startTime);
  const end = parseLocalSessionDateTime(sessionDate, endTime);

  if (!start || !end) {
    return {
      ok: false,
      error: 'Please select a valid date and complete both start and end times.',
    };
  }

  if (end.getTime() <= start.getTime()) {
    return {
      ok: false,
      error: 'End time must be later than start time on the same day.',
    };
  }

  const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

  return {
    ok: true,
    start_time: start.toISOString(),
    end_time: end.toISOString(),
    durationHours,
  };
}

/** Client-side preview (same rules as server validation). */
export function previewSessionDuration(
  sessionDate: string,
  startTime: string,
  endTime: string
): { valid: true; hours: number; label: string } | { valid: false; message: string } {
  if (!sessionDate || !startTime || !endTime) {
    return { valid: false, message: 'Select start and end times.' };
  }

  const result = validateAndBuildSessionTimestamps(sessionDate, startTime, endTime);
  if (!result.ok) {
    return { valid: false, message: result.error };
  }

  const h = result.durationHours;
  const label =
    h < 1
      ? `${Math.round(h * 60)} minutes`
      : h === 1
        ? '1 hour'
        : `${h % 1 === 0 ? h : h.toFixed(1)} hours`;

  return { valid: true, hours: h, label };
}

/** Add minutes to a normalized HH:MM string, returns HH:MM */
export function addMinutesToTime(time: string, minutesToAdd: number): string | null {
  const normalized = normalizeTimeInput(time);
  if (!normalized) return null;
  const [h, m] = normalized.split(':').map((n) => parseInt(n, 10));
  const total = h * 60 + m + minutesToAdd;
  const newH = Math.floor(total / 60) % 24;
  const newM = total % 60;
  return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
}
