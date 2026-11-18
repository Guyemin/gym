"use client";

import { useSyncExternalStore } from "react";
import { createClient, supabaseConfigured } from "./supabase/client";
import { getState, onChange, replaceState, type Progress } from "./store";

export type SyncStatus = "off" | "loading" | "synced" | "saving" | "error";

let status: SyncStatus = "off";
let email: string | null = null;
let lastSynced: number | null = null;
const listeners = new Set<() => void>();
let snapshot: { status: SyncStatus; email: string | null; lastSynced: number | null } = { status, email, lastSynced };

function setStatus(s: SyncStatus) {
  status = s;
  if (s === "synced") lastSynced = Date.now();
  snapshot = { status, email, lastSynced };
  listeners.forEach((l) => l());
}

export function useSync() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => {
        listeners.delete(l);
      };
    },
    () => snapshot,
    () => snapshot,
  );
}

let userId: string | null = null;
let ready = false;
let applyingRemote = false;
let timer: ReturnType<typeof setTimeout> | null = null;
let started = false;

async function push(keepalive = false) {
  if (!userId) return;
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  setStatus("saving");
  try {
    const res = await fetch("/api/progress", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: getState() }),
      keepalive,
    });
    setStatus(res.ok ? "synced" : "error");
    if (!res.ok) console.error("sync push failed", res.status);
  } catch (e) {
    setStatus("error");
    console.error("sync push failed", e);
  }
}

async function pull() {
  if (!userId) return;
  let remote: Progress | undefined;
  try {
    const res = await fetch("/api/progress", { cache: "no-store" });
    if (!res.ok) throw new Error(`status ${res.status}`);
    remote = ((await res.json()).data ?? undefined) as Progress | undefined;
  } catch (e) {
    console.error("sync pull failed", e);
    setStatus("error");
    return;
  }
  const local = getState();
  if (remote && (remote.updatedAt ?? 0) > (local.updatedAt ?? 0)) {
    applyingRemote = true;
    replaceState(remote);
    applyingRemote = false;
    setStatus("synced");
  } else if (!remote || (local.updatedAt ?? 0) > (remote.updatedAt ?? 0)) {
    await push();
  } else {
    setStatus("synced");
  }
}

/** Start cloud sync once per page load. Safe to call repeatedly. */
export async function startSync() {
  if (started || !supabaseConfigured) return;
  started = true;
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  userId = user.id;
  email = user.email ?? null;
  setStatus("loading");
  await pull();
  ready = true;

  onChange(() => {
    if (!ready || applyingRemote) return;
    if (timer) clearTimeout(timer);
    timer = setTimeout(push, 1500);
  });

  // save before leaving, and pick up changes made on another device when coming back
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      if (timer) push(true);
    } else if (!timer) {
      pull();
    }
  });
}

export async function signOut() {
  if (timer) await push();
  await createClient().auth.signOut();
  window.location.href = "/login";
}
