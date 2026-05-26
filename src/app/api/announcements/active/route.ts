import { NextResponse } from 'next/server';
import { getActiveAnnouncements } from '@/lib/announcements';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const announcements = await getActiveAnnouncements();
    return NextResponse.json({ announcements: announcements ?? [] });
  } catch (err) {
    console.error('[api/announcements/active]', err);
    return NextResponse.json({ announcements: [] });
  }
}
