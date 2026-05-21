export type AnnouncementPriority = 'info' | 'urgent';

export type Announcement = {
  id: string;
  title: string;
  date: string;
  body: string;
  priority: AnnouncementPriority;
};

export const ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'payroll-cutoff',
    title: 'Payroll submission deadline',
    date: '2026-05-01',
    body: 'Log all sessions for the current pay period by the last Friday of each month. Unlogged sessions may delay payment.',
    priority: 'urgent',
  },
  {
    id: 'session-same-day',
    title: 'Log sessions the same day',
    date: '2026-04-15',
    body: 'Please submit session logs on the day the class took place. Double-check start and end times before submitting.',
    priority: 'info',
  },
  {
    id: 'new-students',
    title: 'New students on the roster',
    date: '2026-04-01',
    body: 'The student dropdown is updated from the master list. If a student is missing, contact the administrator to add them in Supabase.',
    priority: 'info',
  },
  {
    id: 'holiday-schedule',
    title: 'Public holiday schedule',
    date: '2026-03-20',
    body: 'No regular classes on public holidays unless arranged with parents. Do not log sessions for days when no class occurred.',
    priority: 'info',
  },
];
