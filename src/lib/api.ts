import type { AlumniProfile, MentorshipRequest, Opportunity, PendingProfileUpdate, StudentProfile } from '../types';

export interface AppState {
  student: StudentProfile | null;
  alumniList: AlumniProfile[];
  opportunities: Opportunity[];
  mentorshipRequests: MentorshipRequest[];
  pendingUpdates: PendingProfileUpdate[];
}

export type Collection = 'students' | 'alumni' | 'opportunities' | 'mentorshipRequests' | 'pendingUpdates';

/** Returns null when the DB is unavailable so the app can fall back to mock data. */
export async function fetchState(): Promise<AppState | null> {
  try {
    const res = await fetch('/api/state');
    if (!res.ok) return null;
    const data = (await res.json()) as AppState;
    return data.alumniList?.length ? data : null;
  } catch {
    return null;
  }
}

async function upsert(collection: Collection, rows: object[]): Promise<boolean> {
  if (rows.length === 0) return true;
  try {
    const res = await fetch(`/api/upsert/${collection}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rows }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Persist only the items that are new or changed (reference-different) between two list versions. */
export function persistChanges<T extends { id: string }>(collection: Collection, prev: T[], next: T[]) {
  const before = new Map(prev.map((p) => [p.id, p]));
  const changed = next.filter((n) => before.get(n.id) !== n);
  return upsert(collection, changed);
}
