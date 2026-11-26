import React, { useMemo, useState } from 'react';
import {
  StudentProfile,
  AlumniProfile,
  Opportunity,
  MentorshipRequest,
  PendingProfileUpdate,
} from '../types';
import {
  DbActivityEntry,
  FirestoreCollectionName,
} from '../lib/firestoreService';
import { FIREBASE_CONFIG_META } from '../lib/firebase';
import {
  Database,
  RefreshCw,
  Search,
  Activity,
  Trash2,
  Code,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
} from 'lucide-react';

interface LiveDatabaseInspectorProps {
  students: StudentProfile[];
  alumniList: AlumniProfile[];
  opportunities: Opportunity[];
  mentorshipRequests: MentorshipRequest[];
  pendingUpdates: PendingProfileUpdate[];
  activityLog: DbActivityEntry[];
  lastSyncedAt: string | null;
  isRefreshing: boolean;
  onRefreshDatabase: () => Promise<void>;
  onClearActivityLog: () => void;
}

const COLLECTION_META: {
  id: FirestoreCollectionName;
  label: string;
  description: string;
}[] = [
  { id: 'students', label: 'students', description: 'MAIT CST student profiles' },
  { id: 'alumni', label: 'alumni', description: 'Verified alumni directory' },
  { id: 'opportunities', label: 'opportunities', description: 'Jobs, internships, webinars & reunions' },
  { id: 'mentorship_requests', label: 'mentorship_requests', description: '1:1 student-alumni requests' },
  { id: 'pending_profile_updates', label: 'pending_profile_updates', description: 'Profile moderation queue' },
];

export const LiveDatabaseInspector: React.FC<LiveDatabaseInspectorProps> = ({
  students,
  alumniList,
  opportunities,
  mentorshipRequests,
  pendingUpdates,
  activityLog,
  lastSyncedAt,
  isRefreshing,
  onRefreshDatabase,
  onClearActivityLog,
}) => {
  const [selectedCollection, setSelectedCollection] =
    useState<FirestoreCollectionName>('opportunities');
  const [tableQuery, setTableQuery] = useState('');
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [logFilter, setLogFilter] = useState<'ALL' | 'WRITE' | 'FETCH' | 'SEED'>('ALL');

  const collectionsMap: Record<FirestoreCollectionName, any[]> = useMemo(
    () => ({
      students,
      alumni: alumniList,
      opportunities,
      mentorship_requests: mentorshipRequests,
      pending_profile_updates: pendingUpdates,
    }),
    [students, alumniList, opportunities, mentorshipRequests, pendingUpdates]
  );

  const activeRows = collectionsMap[selectedCollection] || [];

  const filteredRows = useMemo(() => {
    const q = tableQuery.trim().toLowerCase();
    if (!q) return activeRows;
    return activeRows.filter((row) => JSON.stringify(row).toLowerCase().includes(q));
  }, [activeRows, tableQuery]);

  const filteredLogs = useMemo(() => {
    if (logFilter === 'ALL') return activityLog;
    return activityLog.filter((entry) => entry.action === logFilter);
  }, [activityLog, logFilter]);

  const formatTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  const renderStatusPill = (status: string) => {
    const styles =
      status === 'approved' || status === 'accepted'
        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
        : status === 'pending'
        ? 'bg-amber-50 text-amber-800 border-amber-200'
        : 'bg-rose-50 text-rose-700 border-rose-200';
    return (
      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase border ${styles}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header & Manual Refresh Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Cloud Firestore Live</span>
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              Project: {FIREBASE_CONFIG_META.projectId}
            </span>
          </div>
          <h2 className="text-base font-bold text-slate-900">
            Live Firestore Database Inspector
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time view of all 5 Cloud Firestore collections ({FIREBASE_CONFIG_META.databaseId})
            {lastSyncedAt ? ` · Last synced ${formatTime(lastSyncedAt)}` : ''}
          </p>
        </div>

        <button
          type="button"
          onClick={() => void onRefreshDatabase()}
          disabled={isRefreshing}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-semibold inline-flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Fetching from Firestore...' : 'Refresh from Firestore'}</span>
        </button>
      </div>

      {/* 5 Collection Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {COLLECTION_META.map((col) => {
          const count = collectionsMap[col.id].length;
          const isSelected = selectedCollection === col.id;
          return (
            <button
              key={col.id}
              type="button"
              onClick={() => {
                setSelectedCollection(col.id);
                setExpandedRowId(null);
              }}
              className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-blue-50/70 border-blue-600 ring-1 ring-blue-600/20 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <Database className={`w-4 h-4 ${isSelected ? 'text-blue-700' : 'text-slate-400'}`} />
                <span
                  className={`text-lg font-bold ${
                    isSelected ? 'text-blue-700' : 'text-slate-900'
                  }`}
                >
                  {count}
                </span>
              </div>
              <div className="font-mono text-xs font-bold text-slate-900 truncate">
                {col.label}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                {col.description}
              </div>
            </button>
          );
        })}
      </div>

      {/* Interactive Collection Data Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-mono flex items-center gap-2">
              <span>/{selectedCollection}</span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-sans font-semibold bg-slate-100 text-slate-700">
                {filteredRows.length} document{filteredRows.length === 1 ? '' : 's'}
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Click "Inspect JSON" on any row to view the exact stored Firestore document fields.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={tableQuery}
              onChange={(e) => setTableQuery(e.target.value)}
              placeholder={`Filter ${selectedCollection} records...`}
              aria-label={`Filter ${selectedCollection} records`}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {filteredRows.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-500">
              No matching documents in <span className="font-mono font-semibold">{selectedCollection}</span>.
            </div>
          ) : (
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                {selectedCollection === 'students' && (
                  <tr>
                    <th className="px-4 py-3">Document ID</th>
                    <th className="px-4 py-3">Name & Roll No</th>
                    <th className="px-4 py-3">Semester / CGPA</th>
                    <th className="px-4 py-3">Skills</th>
                    <th className="px-4 py-3 text-right">Document</th>
                  </tr>
                )}
                {selectedCollection === 'alumni' && (
                  <tr>
                    <th className="px-4 py-3">Document ID</th>
                    <th className="px-4 py-3">Alumnus</th>
                    <th className="px-4 py-3">Company & Role</th>
                    <th className="px-4 py-3">Mentoring</th>
                    <th className="px-4 py-3 text-right">Document</th>
                  </tr>
                )}
                {selectedCollection === 'opportunities' && (
                  <tr>
                    <th className="px-4 py-3">Document ID</th>
                    <th className="px-4 py-3">Title & Host</th>
                    <th className="px-4 py-3">Type / Poster</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Registered</th>
                    <th className="px-4 py-3 text-right">Document</th>
                  </tr>
                )}
                {selectedCollection === 'mentorship_requests' && (
                  <tr>
                    <th className="px-4 py-3">Document ID</th>
                    <th className="px-4 py-3">Student → Mentor</th>
                    <th className="px-4 py-3">Topic</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Document</th>
                  </tr>
                )}
                {selectedCollection === 'pending_profile_updates' && (
                  <tr>
                    <th className="px-4 py-3">Document ID</th>
                    <th className="px-4 py-3">Alumnus</th>
                    <th className="px-4 py-3">Reason</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Document</th>
                  </tr>
                )}
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredRows.map((row: any) => {
                  const isExpanded = expandedRowId === row.id;
                  const colSpan = selectedCollection === 'opportunities' ? 6 : 5;
                  return (
                    <React.Fragment key={row.id}>
                      <tr className="hover:bg-slate-50/80">
                        <td className="px-4 py-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                          {row.id}
                        </td>

                        {selectedCollection === 'students' && (
                          <>
                            <td className="px-4 py-3">
                              <div className="font-semibold text-slate-900">{row.name}</div>
                              <div className="text-[11px] text-slate-500">
                                {row.rollNo} · {row.email}
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              Sem {row.currentSemester} · <span className="font-semibold text-slate-900">{row.cgpa} CGPA</span>
                            </td>
                            <td className="px-4 py-3 max-w-xs truncate">
                              {(row.skills || []).join(', ')}
                            </td>
                          </>
                        )}

                        {selectedCollection === 'alumni' && (
                          <>
                            <td className="px-4 py-3">
                              <div className="font-semibold text-slate-900">{row.name}</div>
                              <div className="text-[11px] text-slate-500">
                                CST '{String(row.gradYear).slice(-2)} · {row.location}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-medium text-slate-900">{row.currentCompany}</div>
                              <div className="text-[11px] text-slate-500">{row.designation}</div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                                  row.isAvailableForMentoring
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : 'bg-slate-100 text-slate-600 border-slate-200'
                                }`}
                              >
                                {row.isAvailableForMentoring ? 'Open' : 'Paused'}
                              </span>
                            </td>
                          </>
                        )}

                        {selectedCollection === 'opportunities' && (
                          <>
                            <td className="px-4 py-3">
                              <div className="font-semibold text-slate-900">{row.title}</div>
                              <div className="text-[11px] text-slate-500">
                                {row.companyOrOrganizer} · {row.mode}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="uppercase text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 mr-1.5">
                                {row.type}
                              </span>
                              <span className="text-[11px] text-slate-600">
                                {row.posterName} ({row.postedByRole})
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {renderStatusPill(row.status)}
                            </td>
                            <td className="px-4 py-3 font-semibold text-slate-900">
                              {(row.registeredStudentIds || []).length}
                            </td>
                          </>
                        )}

                        {selectedCollection === 'mentorship_requests' && (
                          <>
                            <td className="px-4 py-3">
                              <div className="font-semibold text-slate-900">
                                {row.studentName} → {row.alumniName}
                              </div>
                              <div className="text-[11px] text-slate-500">
                                {row.alumniCompany} · {row.preferredMode}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-slate-700">{row.topic}</td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {renderStatusPill(row.status)}
                            </td>
                          </>
                        )}

                        {selectedCollection === 'pending_profile_updates' && (
                          <>
                            <td className="px-4 py-3">
                              <div className="font-semibold text-slate-900">{row.alumniName}</div>
                              <div className="text-[11px] text-slate-500">
                                {row.currentCompany} · Class of {row.gradYear}
                              </div>
                            </td>
                            <td className="px-4 py-3 max-w-xs truncate">{row.reason}</td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {renderStatusPill(row.status)}
                            </td>
                          </>
                        )}

                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setExpandedRowId(isExpanded ? null : row.id)}
                            className="px-2.5 py-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-[11px] font-semibold text-slate-700 inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Code className="w-3 h-3" />
                            <span>{isExpanded ? 'Hide JSON' : 'Inspect JSON'}</span>
                            {isExpanded ? (
                              <ChevronUp className="w-3 h-3" />
                            ) : (
                              <ChevronDown className="w-3 h-3" />
                            )}
                          </button>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr className="bg-slate-50">
                          <td colSpan={colSpan} className="px-4 py-3">
                            <pre className="text-[11px] font-mono text-slate-800 bg-white border border-slate-200 rounded-xl p-3 overflow-x-auto max-h-64">
                              {JSON.stringify(row, null, 2)}
                            </pre>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Live Read/Write Activity Log Panel */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Real-Time Firestore Read/Write Activity Log
              </h3>
              <p className="text-xs text-slate-500">
                Live telemetry of every Firestore fetch, seed, and write performed in this session.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            {(['ALL', 'WRITE', 'FETCH', 'SEED'] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setLogFilter(filter)}
                className={`px-2.5 py-1 rounded-lg font-semibold cursor-pointer transition-colors ${
                  logFilter === filter
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {filter}
              </button>
            ))}
            <button
              type="button"
              onClick={onClearActivityLog}
              className="ml-1 px-2.5 py-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-600 font-semibold inline-flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto font-mono text-xs">
          {filteredLogs.length === 0 ? (
            <div className="py-8 text-center text-slate-500 font-sans text-xs">
              No Firestore activity recorded for this filter yet.
            </div>
          ) : (
            filteredLogs.map((entry) => {
              const badgeStyle =
                entry.action === 'WRITE'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : entry.action === 'FETCH'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : entry.action === 'SEED'
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200';
              return (
                <div
                  key={entry.id}
                  className="px-4 py-2.5 flex flex-wrap items-center gap-2 hover:bg-slate-50/70"
                >
                  <span className="text-[11px] text-slate-400 shrink-0">
                    {formatTime(entry.timestamp)}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold border shrink-0 ${badgeStyle}`}
                  >
                    [{entry.action}]
                  </span>
                  <span className="font-bold text-slate-800 shrink-0">
                    {entry.collection}
                  </span>
                  <span className="text-slate-400">—</span>
                  <span className="text-slate-700 font-sans text-xs">
                    {entry.summary}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
