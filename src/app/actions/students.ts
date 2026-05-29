'use server';

import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import type { CreateStudentState } from '@/app/actions/students.types';

export async function createStudent(
  _prev: CreateStudentState,
  formData: FormData
): Promise<CreateStudentState> {
  await requireRole(['ADMIN']);

  const fullName = (formData.get('full_name') as string | null)?.trim() ?? '';
  if (!fullName) {
    return { error: 'Student name is required.', success: false };
  }

  if (fullName.length > 200) {
    return { error: 'Student name is too long (max 200 characters).', success: false };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('students').insert({ full_name: fullName });

  if (error) {
    console.error('[createStudent]', error.message, error.code);
    return {
      error: `Could not add student: ${error.message}`,
      success: false,
    };
  }

  revalidatePath('/admin/students');
  revalidatePath('/tutor', 'page');
  revalidatePath('/tutor', 'layout');
  revalidatePath('/admin', 'page');

  return { error: null, success: true };
}
