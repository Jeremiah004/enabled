import type { SupabaseClient } from '@supabase/supabase-js';

export type StudentOption = {
  id: string;
  full_name: string;
};

const STUDENTS_PAGE_SIZE = 1000;

/**
 * Fetches all students with pagination to avoid partial lists when row limits apply.
 */
export async function getAllStudents(
  supabase: SupabaseClient
): Promise<{ students: StudentOption[]; totalCount: number | null }> {
  const all: StudentOption[] = [];
  let from = 0;
  let totalCount: number | null = null;

  while (true) {
    const to = from + STUDENTS_PAGE_SIZE - 1;
    const { data, error, count } = await supabase
      .from('students')
      .select('id, full_name', { count: 'exact' })
      .order('full_name', { ascending: true })
      .range(from, to);

    if (error) {
      console.error('[students] fetch failed:', error.message);
      break;
    }

    if (totalCount === null && typeof count === 'number') {
      totalCount = count;
    }

    const batch = (data ?? [])
      .filter((s) => s?.id)
      .map((s) => ({
        id: s.id as string,
        full_name: String(s.full_name ?? '').trim(),
      }))
      .filter((s) => s.full_name.length > 0);

    all.push(...batch);

    if ((data ?? []).length < STUDENTS_PAGE_SIZE) break;
    from += STUDENTS_PAGE_SIZE;
  }

  all.sort((a, b) =>
    a.full_name.localeCompare(b.full_name, 'en', { sensitivity: 'base' })
  );

  return { students: all, totalCount };
}
