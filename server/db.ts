import type { Express } from 'express';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// client collection name -> table name
const TABLES = {
  students: 'students',
  alumni: 'alumni',
  opportunities: 'opportunities',
  mentorshipRequests: 'mentorship_requests',
  pendingUpdates: 'pending_profile_updates',
} as const;
type Collection = keyof typeof TABLES;

let client: SupabaseClient | null = null;
function db(): SupabaseClient | null {
  if (client) return client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  client = createClient(url, key, { auth: { persistSession: false } });
  return client;
}

const toSnake = (k: string) => k.replace(/[A-Z]/g, (c) => '_' + c.toLowerCase());
const toCamel = (k: string) => k.replace(/_([a-z])/g, (_, c) => c.toUpperCase());

// top-level keys only; jsonb contents are left untouched
function rowToDb(obj: Record<string, any>) {
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [toSnake(k), v === undefined ? null : v]));
}
function rowFromDb(row: Record<string, any>) {
  return Object.fromEntries(
    Object.entries(row)
      .filter(([k, v]) => v !== null && k !== 'inserted_at')
      .map(([k, v]) => [toCamel(k), v])
  );
}

export function registerDbRoutes(app: Express) {
  // Load everything the UI needs in one call
  app.get('/api/state', async (_req, res) => {
    const sb = db();
    if (!sb) return res.status(503).json({ error: 'Database not configured' });
    try {
      const out: Record<string, any[]> = {};
      for (const [name, table] of Object.entries(TABLES)) {
        const { data, error } = await sb.from(table).select('*').order('inserted_at', { ascending: false });
        if (error) throw error;
        out[name] = (data || []).map(rowFromDb);
      }
      res.json({
        student: out.students[0] || null,
        alumniList: out.alumni,
        opportunities: out.opportunities,
        mentorshipRequests: out.mentorshipRequests,
        pendingUpdates: out.pendingUpdates,
      });
    } catch (e: any) {
      console.error('GET /api/state failed', e);
      res.status(500).json({ error: e?.message || 'DB error' });
    }
  });

  // Upsert rows into one collection
  app.post('/api/upsert/:collection', async (req, res) => {
    const sb = db();
    if (!sb) return res.status(503).json({ error: 'Database not configured' });
    const collection = req.params.collection as Collection;
    const table = TABLES[collection];
    const rows = req.body?.rows;
    if (!table || collection === 'students') return res.status(404).json({ error: 'Unknown collection' });
    if (!Array.isArray(rows) || rows.length === 0 || rows.length > 50 || rows.some((r) => !r || typeof r.id !== 'string')) {
      return res.status(400).json({ error: 'rows must be a non-empty array (max 50) of objects with string id' });
    }
    const { error } = await sb.from(table).upsert(rows.map(rowToDb), { onConflict: 'id' });
    if (error) {
      console.error(`upsert ${table} failed`, error);
      return res.status(500).json({ error: error.message });
    }
    res.json({ ok: true, count: rows.length });
  });
}
