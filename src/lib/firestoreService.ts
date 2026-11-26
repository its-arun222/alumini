import {
  collection,
  doc,
  getDocs,
  getDocsFromServer,
  limit,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import {
  StudentProfile,
  AlumniProfile,
  Opportunity,
  MentorshipRequest,
  PendingProfileUpdate,
} from '../types';
import {
  CURRENT_STUDENT,
  ALUMNI_DATA,
  INITIAL_OPPORTUNITIES,
  INITIAL_MENTORSHIP_REQUESTS,
  INITIAL_PENDING_UPDATES,
} from '../data/seedData';

export type FirestoreCollectionName =
  | 'students'
  | 'alumni'
  | 'opportunities'
  | 'mentorship_requests'
  | 'pending_profile_updates';

export interface DbActivityEntry {
  id: string;
  timestamp: string;
  action: 'FETCH' | 'WRITE' | 'SEED' | 'ERROR';
  collection: FirestoreCollectionName;
  summary: string;
  docId?: string;
}

export interface LiveDatabaseSnapshot {
  students: StudentProfile[];
  alumni: AlumniProfile[];
  opportunities: Opportunity[];
  mentorship_requests: MentorshipRequest[];
  pending_profile_updates: PendingProfileUpdate[];
}

// Observable real-time Read/Write Activity Log
const MAX_ACTIVITY_ENTRIES = 120;
let activityEntries: DbActivityEntry[] = [];
const activityListeners = new Set<(entries: DbActivityEntry[]) => void>();

export function recordDbActivity(
  action: DbActivityEntry['action'],
  col: FirestoreCollectionName,
  summary: string,
  docId?: string
): void {
  const entry: DbActivityEntry = {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
    action,
    collection: col,
    summary,
    docId,
  };
  activityEntries = [entry, ...activityEntries].slice(0, MAX_ACTIVITY_ENTRIES);
  activityListeners.forEach((listener) => listener(activityEntries));
}

export function subscribeDbActivity(
  listener: (entries: DbActivityEntry[]) => void
): () => void {
  activityListeners.add(listener);
  listener(activityEntries);
  return () => {
    activityListeners.delete(listener);
  };
}

export function clearDbActivityLog(): void {
  activityEntries = [];
  activityListeners.forEach((listener) => listener(activityEntries));
}

function stripUndefined<T extends Record<string, any>>(obj: T): Record<string, any> {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) {
      if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
        out[k] = stripUndefined(v);
      } else {
        out[k] = v;
      }
    }
  }
  return out;
}

function sortOpportunities(items: Opportunity[]): Opportunity[] {
  return [...items].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
}

function sortMentorshipRequests(items: MentorshipRequest[]): MentorshipRequest[] {
  return [...items].sort((a, b) => (b.requestedAt || '').localeCompare(a.requestedAt || ''));
}

function sortPendingUpdates(items: PendingProfileUpdate[]): PendingProfileUpdate[] {
  return [...items].sort((a, b) => (b.submittedAt || '').localeCompare(a.submittedAt || ''));
}

function sortAlumni(items: AlumniProfile[]): AlumniProfile[] {
  return [...items].sort((a, b) => b.gradYear - a.gradYear || a.name.localeCompare(b.name));
}

const MAX_COLLECTION_QUERY_LIMIT = 200;

function boundedCollectionQuery(name: FirestoreCollectionName) {
  return query(collection(db, name), limit(MAX_COLLECTION_QUERY_LIMIT));
}

// One-time promise guard so React StrictMode double-effects never duplicate seeding
let seedingPromise: Promise<void> | null = null;

/**
 * Automatically seeds realistic MAIT CST sample records into Firestore ONLY for collections
 * that are completely empty. Never overwrites existing documents on refresh.
 */
export function ensureFirestoreSeeded(): Promise<void> {
  if (seedingPromise) return seedingPromise;

  seedingPromise = (async () => {
    // 1. Students
    try {
      const snap = await getDocs(boundedCollectionQuery('students'));
      if (snap.empty) {
        await setDoc(doc(db, 'students', CURRENT_STUDENT.id), stripUndefined(CURRENT_STUDENT));
        recordDbActivity('SEED', 'students', `Seeded 1 initial MAIT CST student record ("${CURRENT_STUDENT.name}")`, CURRENT_STUDENT.id);
      }
    } catch (error) {
      recordDbActivity('ERROR', 'students', `Seed check failed: ${error instanceof Error ? error.message : String(error)}`);
      handleFirestoreError(error, OperationType.WRITE, 'students');
    }

    // 2. Alumni
    try {
      const snap = await getDocs(boundedCollectionQuery('alumni'));
      if (snap.empty) {
        const batch = writeBatch(db);
        for (const alm of ALUMNI_DATA) {
          batch.set(doc(db, 'alumni', alm.id), stripUndefined(alm));
        }
        await batch.commit();
        recordDbActivity('SEED', 'alumni', `Seeded ${ALUMNI_DATA.length} verified MAIT CST alumni profiles`);
      }
    } catch (error) {
      recordDbActivity('ERROR', 'alumni', `Seed check failed: ${error instanceof Error ? error.message : String(error)}`);
      handleFirestoreError(error, OperationType.WRITE, 'alumni');
    }

    // 3. Opportunities (honors Firestore state-machine rule: alumni posts start pending, then approved if pre-approved in seed)
    try {
      const snap = await getDocs(boundedCollectionQuery('opportunities'));
      if (snap.empty) {
        for (const opp of INITIAL_OPPORTUNITIES) {
          const ref = doc(db, 'opportunities', opp.id);
          if (opp.postedByRole === 'alumni' && opp.status === 'approved') {
            await setDoc(ref, stripUndefined({ ...opp, status: 'pending' }));
            await updateDoc(ref, { status: 'approved' });
          } else {
            await setDoc(ref, stripUndefined(opp));
          }
        }
        recordDbActivity('SEED', 'opportunities', `Seeded ${INITIAL_OPPORTUNITIES.length} initial opportunities & events`);
      }
    } catch (error) {
      recordDbActivity('ERROR', 'opportunities', `Seed check failed: ${error instanceof Error ? error.message : String(error)}`);
      handleFirestoreError(error, OperationType.WRITE, 'opportunities');
    }

    // 4. Mentorship Requests (honors Firestore state-machine rule: requests start pending, then accepted/declined)
    try {
      const snap = await getDocs(boundedCollectionQuery('mentorship_requests'));
      if (snap.empty) {
        for (const req of INITIAL_MENTORSHIP_REQUESTS) {
          const ref = doc(db, 'mentorship_requests', req.id);
          if (req.status !== 'pending') {
            const { responseNote, meetingUrl, ...baseReq } = req;
            await setDoc(ref, stripUndefined({ ...baseReq, status: 'pending' }));
            await updateDoc(ref, stripUndefined({ status: req.status, responseNote, meetingUrl }));
          } else {
            await setDoc(ref, stripUndefined(req));
          }
        }
        recordDbActivity('SEED', 'mentorship_requests', `Seeded ${INITIAL_MENTORSHIP_REQUESTS.length} mentorship request records`);
      }
    } catch (error) {
      recordDbActivity('ERROR', 'mentorship_requests', `Seed check failed: ${error instanceof Error ? error.message : String(error)}`);
      handleFirestoreError(error, OperationType.WRITE, 'mentorship_requests');
    }

    // 5. Pending Profile Updates
    try {
      const snap = await getDocs(boundedCollectionQuery('pending_profile_updates'));
      if (snap.empty) {
        const batch = writeBatch(db);
        for (const upd of INITIAL_PENDING_UPDATES) {
          batch.set(doc(db, 'pending_profile_updates', upd.id), stripUndefined(upd));
        }
        await batch.commit();
        recordDbActivity('SEED', 'pending_profile_updates', `Seeded ${INITIAL_PENDING_UPDATES.length} pending alumni profile updates`);
      }
    } catch (error) {
      recordDbActivity('ERROR', 'pending_profile_updates', `Seed check failed: ${error instanceof Error ? error.message : String(error)}`);
      handleFirestoreError(error, OperationType.WRITE, 'pending_profile_updates');
    }
  })().catch((err) => {
    seedingPromise = null;
    throw err;
  });

  return seedingPromise;
}

/**
 * Explicitly fetches live documents directly from the Cloud Firestore server across all 5 collections.
 */
export async function fetchAllCollectionsFromServer(): Promise<LiveDatabaseSnapshot> {
  const readCol = async <T>(name: FirestoreCollectionName): Promise<T[]> => {
    try {
      const snap = await getDocsFromServer(boundedCollectionQuery(name));
      const docs = snap.docs.map((d) => d.data() as T);
      recordDbActivity('FETCH', name, `Loaded ${docs.length} record${docs.length === 1 ? '' : 's'} from Cloud Firestore`);
      return docs;
    } catch (error) {
      recordDbActivity('ERROR', name, `Fetch failed: ${error instanceof Error ? error.message : String(error)}`);
      handleFirestoreError(error, OperationType.LIST, name);
    }
  };

  const [students, alumni, opportunities, mentorship_requests, pending_profile_updates] =
    await Promise.all([
      readCol<StudentProfile>('students'),
      readCol<AlumniProfile>('alumni'),
      readCol<Opportunity>('opportunities'),
      readCol<MentorshipRequest>('mentorship_requests'),
      readCol<PendingProfileUpdate>('pending_profile_updates'),
    ]);

  return {
    students,
    alumni: sortAlumni(alumni),
    opportunities: sortOpportunities(opportunities),
    mentorship_requests: sortMentorshipRequests(mentorship_requests),
    pending_profile_updates: sortPendingUpdates(pending_profile_updates),
  };
}

/**
 * Attaches real-time Firestore onSnapshot listeners to all 5 collections.
 */
export function subscribeAllCollections(callbacks: {
  onStudents: (items: StudentProfile[]) => void;
  onAlumni: (items: AlumniProfile[]) => void;
  onOpportunities: (items: Opportunity[]) => void;
  onMentorshipRequests: (items: MentorshipRequest[]) => void;
  onPendingUpdates: (items: PendingProfileUpdate[]) => void;
  onError: (err: Error) => void;
}): () => void {
  const unsubs: Unsubscribe[] = [];

  const attach = <T>(
    name: FirestoreCollectionName,
    handler: (items: T[]) => void,
    transform?: (items: T[]) => T[]
  ) => {
    const unsub = onSnapshot(
      boundedCollectionQuery(name),
      (snapshot) => {
        const raw = snapshot.docs.map((d) => d.data() as T);
        const items = transform ? transform(raw) : raw;
        recordDbActivity('FETCH', name, `Loaded ${items.length} record${items.length === 1 ? '' : 's'} (live sync)`);
        handler(items);
      },
      (error) => {
        recordDbActivity('ERROR', name, `Live sync error: ${error.message}`);
        try {
          handleFirestoreError(error, OperationType.LIST, name);
        } catch (wrapped) {
          callbacks.onError(wrapped instanceof Error ? wrapped : new Error(String(wrapped)));
        }
      }
    );
    unsubs.push(unsub);
  };

  attach<StudentProfile>('students', callbacks.onStudents);
  attach<AlumniProfile>('alumni', callbacks.onAlumni, sortAlumni);
  attach<Opportunity>('opportunities', callbacks.onOpportunities, sortOpportunities);
  attach<MentorshipRequest>('mentorship_requests', callbacks.onMentorshipRequests, sortMentorshipRequests);
  attach<PendingProfileUpdate>('pending_profile_updates', callbacks.onPendingUpdates, sortPendingUpdates);

  return () => {
    unsubs.forEach((u) => u());
  };
}

// ---------------- DIRECT FIRESTORE MUTATIONS ----------------

export async function updateStudentProfileInFirestore(student: StudentProfile): Promise<void> {
  const path = `students/${student.id}`;
  try {
    await updateDoc(doc(db, 'students', student.id), {
      name: student.name,
      currentSemester: student.currentSemester,
      cgpa: student.cgpa,
      skills: student.skills,
      interests: student.interests,
      dreamCompanies: student.dreamCompanies,
      bio: student.bio,
      githubUrl: student.githubUrl || '',
      linkedinUrl: student.linkedinUrl || '',
    });
    recordDbActivity('WRITE', 'students', `Updated student profile for "${student.name}" (Sem ${student.currentSemester}, CGPA ${student.cgpa})`, student.id);
  } catch (error) {
    recordDbActivity('ERROR', 'students', `Failed to update profile for "${student.name}"`, student.id);
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function createOpportunityInFirestore(opp: Opportunity): Promise<void> {
  const path = `opportunities/${opp.id}`;
  try {
    await setDoc(doc(db, 'opportunities', opp.id), stripUndefined(opp));
    recordDbActivity('WRITE', 'opportunities', `Added "${opp.title}" (${opp.status})`, opp.id);
  } catch (error) {
    recordDbActivity('ERROR', 'opportunities', `Failed to add "${opp.title}"`, opp.id);
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function moderateOpportunityInFirestore(
  opportunityId: string,
  action: 'approved' | 'rejected',
  title?: string
): Promise<void> {
  const path = `opportunities/${opportunityId}`;
  try {
    await updateDoc(doc(db, 'opportunities', opportunityId), { status: action });
    recordDbActivity(
      'WRITE',
      'opportunities',
      `Moderated "${title || opportunityId}" -> ${action}`,
      opportunityId
    );
  } catch (error) {
    recordDbActivity('ERROR', 'opportunities', `Failed to moderate "${title || opportunityId}"`, opportunityId);
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function toggleOpportunityRegistrationInFirestore(
  opportunityId: string,
  registeredStudentIds: string[],
  title: string,
  isNowRegistered: boolean
): Promise<void> {
  const path = `opportunities/${opportunityId}`;
  try {
    await updateDoc(doc(db, 'opportunities', opportunityId), { registeredStudentIds });
    recordDbActivity(
      'WRITE',
      'opportunities',
      `${isNowRegistered ? 'Registered student for' : 'Cancelled registration for'} "${title}" (${registeredStudentIds.length} total)`,
      opportunityId
    );
  } catch (error) {
    recordDbActivity('ERROR', 'opportunities', `Registration update failed for "${title}"`, opportunityId);
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function createMentorshipRequestInFirestore(req: MentorshipRequest): Promise<void> {
  const path = `mentorship_requests/${req.id}`;
  try {
    await setDoc(doc(db, 'mentorship_requests', req.id), stripUndefined(req));
    recordDbActivity(
      'WRITE',
      'mentorship_requests',
      `Created mentorship request from ${req.studentName} to ${req.alumniName} (pending)`,
      req.id
    );
  } catch (error) {
    recordDbActivity('ERROR', 'mentorship_requests', `Failed to submit mentorship request`, req.id);
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function respondToMentorshipRequestInFirestore(
  requestId: string,
  status: 'accepted' | 'declined',
  responseNote?: string,
  meetingUrl?: string,
  studentName?: string
): Promise<void> {
  const path = `mentorship_requests/${requestId}`;
  try {
    const payload: Record<string, any> = {
      status,
      responseNote:
        responseNote ||
        (status === 'accepted'
          ? 'Looking forward to our mentorship session! Please find meeting details.'
          : 'Currently at capacity for new 1:1 mentees this month. Please reach out again next semester!'),
    };
    if (status === 'accepted') {
      payload.meetingUrl = meetingUrl || 'https://meet.google.com/mait-alumni-session';
    }
    await updateDoc(doc(db, 'mentorship_requests', requestId), payload);
    recordDbActivity(
      'WRITE',
      'mentorship_requests',
      `${status === 'accepted' ? 'Accepted' : 'Declined'} mentorship request${studentName ? ` from ${studentName}` : ''}`,
      requestId
    );
  } catch (error) {
    recordDbActivity('ERROR', 'mentorship_requests', `Failed to update mentorship request ${requestId}`, requestId);
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function toggleAlumniAvailabilityInFirestore(
  alumniId: string,
  isAvailableForMentoring: boolean,
  alumniName: string
): Promise<void> {
  const path = `alumni/${alumniId}`;
  try {
    await updateDoc(doc(db, 'alumni', alumniId), { isAvailableForMentoring });
    recordDbActivity(
      'WRITE',
      'alumni',
      `Set mentoring availability for ${alumniName} -> ${isAvailableForMentoring ? 'Open' : 'Paused'}`,
      alumniId
    );
  } catch (error) {
    recordDbActivity('ERROR', 'alumni', `Failed to toggle mentoring availability for ${alumniName}`, alumniId);
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function createPendingProfileUpdateInFirestore(
  update: PendingProfileUpdate
): Promise<void> {
  const path = `pending_profile_updates/${update.id}`;
  try {
    await setDoc(doc(db, 'pending_profile_updates', update.id), stripUndefined(update));
    recordDbActivity(
      'WRITE',
      'pending_profile_updates',
      `Submitted profile update request for ${update.alumniName} (pending)`,
      update.id
    );
  } catch (error) {
    recordDbActivity('ERROR', 'pending_profile_updates', `Failed to submit profile update for ${update.alumniName}`, update.id);
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function moderateProfileUpdateInFirestore(
  targetUpdate: PendingProfileUpdate,
  targetAlumni: AlumniProfile | undefined,
  action: 'approved' | 'rejected',
  adminRemark?: string
): Promise<void> {
  const updatePath = `pending_profile_updates/${targetUpdate.id}`;
  try {
    const batch = writeBatch(db);
    const updatePayload: Record<string, any> = { status: action };
    if (adminRemark) updatePayload.adminRemark = adminRemark;
    batch.update(doc(db, 'pending_profile_updates', targetUpdate.id), updatePayload);

    if (action === 'approved' && targetAlumni) {
      const alumniChanges: Record<string, any> = {};
      if (targetUpdate.requestedChanges.company) {
        alumniChanges.currentCompany = targetUpdate.requestedChanges.company;
      }
      if (targetUpdate.requestedChanges.designation) {
        alumniChanges.designation = targetUpdate.requestedChanges.designation;
      }
      if (targetUpdate.requestedChanges.location) {
        alumniChanges.location = targetUpdate.requestedChanges.location;
      }
      if (targetUpdate.requestedChanges.bio) {
        alumniChanges.bio = targetUpdate.requestedChanges.bio;
      }
      if (targetUpdate.requestedChanges.skills && targetUpdate.requestedChanges.skills.length > 0) {
        alumniChanges.skills = targetUpdate.requestedChanges.skills;
      }
      if (Object.keys(alumniChanges).length > 0) {
        batch.update(doc(db, 'alumni', targetAlumni.id), alumniChanges);
      }
    }

    await batch.commit();
    recordDbActivity(
      'WRITE',
      'pending_profile_updates',
      `${action === 'approved' ? 'Approved' : 'Rejected'} profile update for ${targetUpdate.alumniName}`,
      targetUpdate.id
    );
    if (action === 'approved' && targetAlumni) {
      recordDbActivity(
        'WRITE',
        'alumni',
        `Synced approved profile changes to ${targetAlumni.name}`,
        targetAlumni.id
      );
    }
  } catch (error) {
    recordDbActivity('ERROR', 'pending_profile_updates', `Failed to moderate update for ${targetUpdate.alumniName}`, targetUpdate.id);
    handleFirestoreError(error, OperationType.UPDATE, updatePath);
  }
}
