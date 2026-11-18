"use client";

import { useState, useSyncExternalStore } from "react";

export type Card = { box: number; due: number };

export type Settings = {
  rate: number;
  voiceURI: string;
  recLang: string;
  showTranslit: boolean;
  dailyGoal: number;
};

export type Progress = {
  xp: number;
  streak: number;
  lastDay: string | null;
  todayXp: number;
  completed: Record<string, number>; // lesson key -> best score (0-100)
  letters: Record<string, true>; // letters studied
  cards: Record<string, Card>; // spaced repetition deck
  settings: Settings;
};

const KEY = "arabic-progress-v1";

export const DEFAULT_SETTINGS: Settings = {
  rate: 0.85,
  voiceURI: "",
  recLang: "ar-JO",
  showTranslit: true,
  dailyGoal: 30,
};

const EMPTY: Progress = {
  xp: 0,
  streak: 0,
  lastDay: null,
  todayXp: 0,
  completed: {},
  letters: {},
  cards: {},
  settings: DEFAULT_SETTINGS,
};

let state: Progress = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function dayDiff(a: string, b: string) {
  const [y1, m1, d1] = a.split("-").map(Number);
  const [y2, m2, d2] = b.split("-").map(Number);
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86400000);
}

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const p = JSON.parse(raw) as Partial<Progress>;
      state = { ...EMPTY, ...p, settings: { ...DEFAULT_SETTINGS, ...p.settings } };
    }
  } catch {
    /* storage unavailable */
  }
  // reset daily counter / broken streak
  if (state.lastDay && state.lastDay !== today()) {
    const gap = dayDiff(state.lastDay, today());
    state = { ...state, todayXp: 0, streak: gap > 1 ? 0 : state.streak };
  }
}

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

export function update(fn: (p: Progress) => Progress) {
  load();
  state = fn(state);
  save();
}

function subscribe(l: () => void) {
  listeners.add(l);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      loaded = false;
      load();
      l();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(l);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot() {
  load();
  return state;
}

export function useProgress() {
  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
}

/* ---------------- actions ---------------- */

export function addXp(n: number) {
  update((p) => {
    const t = today();
    let streak = p.streak;
    if (p.lastDay !== t) {
      streak = p.lastDay && dayDiff(p.lastDay, t) === 1 ? p.streak + 1 : 1;
    }
    return {
      ...p,
      xp: p.xp + n,
      todayXp: (p.lastDay === t ? p.todayXp : 0) + n,
      lastDay: t,
      streak,
    };
  });
}

export function completeLesson(key: string, score: number, cardIds: string[] = [], xp = 20) {
  update((p) => {
    const cards = { ...p.cards };
    for (const id of cardIds) if (!cards[id]) cards[id] = { box: 0, due: Date.now() };
    return {
      ...p,
      completed: { ...p.completed, [key]: Math.max(score, p.completed[key] ?? 0) },
      cards,
    };
  });
  addXp(xp);
}

export function markLetter(id: string) {
  update((p) =>
    p.letters[id]
      ? p
      : { ...p, letters: { ...p.letters, [id]: true }, cards: { ...p.cards, [`l:${id}`]: p.cards[`l:${id}`] ?? { box: 0, due: Date.now() } } },
  );
}

const INTERVALS_DAYS = [0, 1, 2, 4, 8, 16, 32, 64];

export function gradeCard(id: string, correct: boolean) {
  update((p) => {
    const c = p.cards[id] ?? { box: 0, due: 0 };
    const box = correct ? Math.min(c.box + 1, INTERVALS_DAYS.length - 1) : 0;
    const due = correct ? Date.now() + INTERVALS_DAYS[box] * 86400000 - 3600000 : Date.now() + 60000;
    return { ...p, cards: { ...p.cards, [id]: { box, due } } };
  });
}

export function setSettings(s: Partial<Settings>) {
  update((p) => ({ ...p, settings: { ...p.settings, ...s } }));
}

export function resetProgress() {
  update((p) => ({ ...EMPTY, settings: p.settings }));
}

export function level(xp: number) {
  // each level needs a bit more xp than the previous
  let lvl = 1;
  let need = 100;
  let rest = xp;
  while (rest >= need) {
    rest -= need;
    lvl++;
    need = Math.round(need * 1.2);
  }
  return { lvl, into: rest, need };
}

/** Number of spaced-repetition cards due now. */
export function useDueCount() {
  const p = useProgress();
  const [now] = useState(() => Date.now());
  return Object.values(p.cards).filter((c) => c.due <= now).length;
}
