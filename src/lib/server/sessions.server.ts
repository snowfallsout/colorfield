/*
 * src/lib/server/sessions.server.ts
 * Purpose: Persist display session state as per-session JSON files that can be
 * managed by both REST routes and Socket.IO handlers.
 */
import fs from 'node:fs';
import path from 'node:path';
import { MBTI_ORDER } from '../shared/constants/mbti.js';
import { serverConfig } from '../config/server.js';

export type Session = {
  id: string;
  name: string;
  createdAt: string;
  archivedAt?: string;
  counts: Record<string, number>;
  total: number;
};

type SessionFile = Session & {
  active: boolean;
};

const SESSIONS_DIR = serverConfig.sessionsDir;
const SESSION_FILE_PREFIX = serverConfig.sessionFilePrefix;
const SESSION_FILE_RE = new RegExp(`^${SESSION_FILE_PREFIX}.+\\.json$`, 'i');
const VALID_MBTI_KEYS = new Set<string>(MBTI_ORDER);

function ensureSessionsDir(): void {
  fs.mkdirSync(SESSIONS_DIR, { recursive: true });
}

function sessionFilePath(id: string): string {
  return path.join(SESSIONS_DIR, `${SESSION_FILE_PREFIX}${id}.json`);
}

function tempSessionFilePath(id: string): string {
  return `${sessionFilePath(id)}.${process.pid}.${Date.now()}.tmp`;
}

function totalFromCounts(counts: Record<string, number>): number {
  return Object.values(counts).reduce((sum, value) => sum + value, 0);
}

function sanitizeCounts(counts: unknown): Record<string, number> {
  if (!counts || typeof counts !== 'object') {
    return {};
  }

  const next: Record<string, number> = {};
  for (const [key, rawValue] of Object.entries(counts)) {
    if (!VALID_MBTI_KEYS.has(key)) {
      continue;
    }

    const value = typeof rawValue === 'number' ? rawValue : Number(rawValue);
    if (!Number.isFinite(value) || value <= 0) {
      continue;
    }

    next[key] = Math.floor(value);
  }

  return next;
}

function normalizeMbtiKey(value: string): string | null {
  const normalized = value.trim().toUpperCase();
  return VALID_MBTI_KEYS.has(normalized) ? normalized : null;
}

function normalizeSessionFile(value: unknown): SessionFile | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const session = value as Partial<SessionFile> & { counts?: unknown };
  if (
    typeof session.id !== 'string' ||
    typeof session.name !== 'string' ||
    typeof session.createdAt !== 'string'
  ) {
    return null;
  }

  const counts = sanitizeCounts(session.counts);
  const total =
    typeof session.total === 'number' && Number.isFinite(session.total) && session.total >= 0
      ? Math.max(Math.floor(session.total), totalFromCounts(counts))
      : totalFromCounts(counts);

  return {
    id: session.id,
    name: session.name.trim() || serverConfig.defaultSessionName,
    createdAt: session.createdAt,
    archivedAt: typeof session.archivedAt === 'string' ? session.archivedAt : undefined,
    counts,
    total,
    active: session.active === true
  };
}

function sortSessionsNewestFirst(left: SessionFile, right: SessionFile): number {
  const leftTime = Date.parse(left.archivedAt ?? left.createdAt);
  const rightTime = Date.parse(right.archivedAt ?? right.createdAt);
  return rightTime - leftTime;
}

function createSessionRecord(name?: string): SessionFile {
  const now = new Date().toISOString();
  const id = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  const normalizedName = name?.trim() || `Session ${new Date(now).toLocaleDateString('zh-TW')}`;
  return {
    id,
    name: normalizedName,
    createdAt: now,
    counts: {},
    total: 0,
    active: true
  };
}

function persistSession(session: SessionFile): void {
  ensureSessionsDir();
  const normalizedSession = normalizeSessionFile(session);
  if (!normalizedSession) {
    throw new Error(`Refusing to persist invalid session record: ${session.id}`);
  }
	const targetPath = sessionFilePath(session.id);
	const tempPath = tempSessionFilePath(session.id);
  const payload = JSON.stringify(normalizedSession, null, 2);

	try {
		fs.writeFileSync(tempPath, payload, 'utf8');
		fs.renameSync(tempPath, targetPath);
	} catch (error) {
		try {
			fs.unlinkSync(tempPath);
		} catch (cleanupError) {
			void cleanupError;
		}
		throw error;
	}
}

function readSession(filePath: string): SessionFile | null {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
		const parsed = JSON.parse(raw) as unknown;
		return normalizeSessionFile(parsed);
  } catch (error) {
    console.warn('Failed to read session file:', filePath, error);
    return null;
  }
}

function loadSessions(): SessionFile[] {
  ensureSessionsDir();
  const entries = fs
    .readdirSync(SESSIONS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isFile() && SESSION_FILE_RE.test(entry.name))
    .map((entry) => readSession(path.join(SESSIONS_DIR, entry.name)))
    .filter((entry): entry is SessionFile => !!entry)
    .sort(sortSessionsNewestFirst);

  if (entries.length > 0) return entries;

  const initial = createSessionRecord(serverConfig.defaultSessionName);
  persistSession(initial);
  return [initial];
}

function setActiveSession(id: string): void {
  const sessions = loadSessions();
  const now = new Date().toISOString();

  for (const session of sessions) {
    const next: SessionFile = {
      ...session,
      active: session.id === id,
      archivedAt: session.id === id ? undefined : session.archivedAt ?? now
    };
    persistSession(next);
  }
}

export function currentCounts(): Record<string, number> {
  return { ...(getActive()?.counts ?? {}) };
}

export function currentTotal(): number {
  return getActive()?.total ?? 0;
}

export function getActive(): Session | null {
  const active = loadSessions().find((session) => session.active) ?? null;
  if (active) {
    return {
      id: active.id,
      name: active.name,
      createdAt: active.createdAt,
      archivedAt: active.archivedAt,
      counts: { ...active.counts },
      total: active.total
    };
  }

  const created = createSessionRecord(serverConfig.defaultSessionName);
  persistSession(created);
  return {
    id: created.id,
    name: created.name,
    createdAt: created.createdAt,
    archivedAt: created.archivedAt,
    counts: {},
    total: 0
  };
}

export function getHistory(): Session[] {
  return loadSessions()
    .filter((session) => !session.active)
    .sort(sortSessionsNewestFirst)
    .map((session) => ({
      id: session.id,
      name: session.name,
      createdAt: session.createdAt,
      archivedAt: session.archivedAt,
      counts: { ...session.counts },
      total: session.total
    }));
}

export function createNewSession(name?: string): Session {
  const current = getActive();
  if (current) {
    const archived: SessionFile = {
      ...current,
      active: false,
      archivedAt: new Date().toISOString()
    };
    persistSession(archived);
  }

  const next = createSessionRecord(name);
  persistSession(next);
  setActiveSession(next.id);

  return {
    id: next.id,
    name: next.name,
    createdAt: next.createdAt,
    archivedAt: next.archivedAt,
    counts: {},
    total: 0
  };
}

export function findHistoryById(id: string): Session | undefined {
  const match = loadSessions().find((session) => session.id === id && !session.active);
  if (!match) return undefined;
  return {
    id: match.id,
    name: match.name,
    createdAt: match.createdAt,
    archivedAt: match.archivedAt,
    counts: { ...match.counts },
    total: match.total
  };
}

export function deleteHistoryById(id: string): boolean {
  const match = loadSessions().find((session) => session.id === id && !session.active);
  if (!match) return false;
  fs.unlinkSync(sessionFilePath(id));
  return true;
}

export function incrementCount(mbti: string): { counts: Record<string, number>; total: number; session: Session | null } {
  const active = getActive();
  if (!active) {
    return { counts: {}, total: 0, session: null };
  }

	const mbtiKey = normalizeMbtiKey(mbti);
	if (!mbtiKey) {
		return {
			counts: { ...active.counts },
			total: active.total,
			session: active
		};
	}

  const nextCounts = { ...active.counts };
  nextCounts[mbtiKey] = (nextCounts[mbtiKey] || 0) + 1;
  const nextSession: SessionFile = {
    ...active,
    counts: nextCounts,
    total: (active.total || 0) + 1,
    active: true,
    archivedAt: undefined
  };

  persistSession(nextSession);

  return {
    counts: { ...nextCounts },
    total: nextSession.total,
    session: {
      id: nextSession.id,
      name: nextSession.name,
      createdAt: nextSession.createdAt,
      archivedAt: nextSession.archivedAt,
      counts: { ...nextSession.counts },
      total: nextSession.total
    }
  };
}

export default {
  getActive,
  getHistory,
  createNewSession,
  findHistoryById,
  deleteHistoryById,
  incrementCount,
  currentCounts,
  currentTotal
};
