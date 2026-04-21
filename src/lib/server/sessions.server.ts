import fs from 'fs';
import path from 'path';

const SESSIONS_FILE = path.join(__dirname, '../../../static/sessions.json');

export type Session = {
  id: string;
  name: string;
  createdAt: string;
  archivedAt?: string;
  counts: Record<string, number>;
  total: number;
};

type SessionsFile = {
  active: Session | null;
  history: Session[];
};

function loadSessions(): SessionsFile {
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      return JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf8')) as SessionsFile;
    }
  } catch (e: unknown) {
    // best-effort logging
    // eslint-disable-next-line no-console
    console.warn('Failed to load sessions:', (e as Error).message);
  }
  return { active: null, history: [] };
}

function saveSessions(data: SessionsFile) {
  fs.writeFileSync(SESSIONS_FILE, JSON.stringify(data, null, 2), 'utf8');
}

let sessionsData = loadSessions();

if (!sessionsData.active) {
  sessionsData.active = {
    id: Date.now().toString(36),
    name: '默认活动',
    createdAt: new Date().toISOString(),
    counts: {},
    total: 0,
  };
  saveSessions(sessionsData);
}

export function currentCounts() { return sessionsData.active!.counts; }
export function currentTotal() { return sessionsData.active!.total; }

export function getActive() { return sessionsData.active; }
export function getHistory() { return sessionsData.history || []; }

export function createNewSession(name?: string) {
  sessionsData.history = sessionsData.history || [];
  sessionsData.history.unshift({ ...sessionsData.active!, archivedAt: new Date().toISOString() });
  sessionsData.active = {
    id: Date.now().toString(36),
    name: name || `活动 ${sessionsData.history.length + 2}`,
    createdAt: new Date().toISOString(),
    counts: {},
    total: 0,
  };
  saveSessions(sessionsData);
  return sessionsData.active;
}

export function findHistoryById(id: string) {
  return (sessionsData.history || []).find(h => h.id === id);
}

export function deleteHistoryById(id: string) {
  const idx = (sessionsData.history || []).findIndex(h => h.id === id);
  if (idx === -1) return false;
  sessionsData.history.splice(idx, 1);
  saveSessions(sessionsData);
  return true;
}

export function incrementCount(mbti: string) {
  const counts = currentCounts();
  counts[mbti] = (counts[mbti] || 0) + 1;
  sessionsData.active!.total = (sessionsData.active!.total || 0) + 1;
  saveSessions(sessionsData);
  return { counts, total: currentTotal() };
}

export default {
  getActive,
  getHistory,
  createNewSession,
  findHistoryById,
  deleteHistoryById,
  incrementCount,
  currentCounts,
  currentTotal,
  sessionsData,
};
