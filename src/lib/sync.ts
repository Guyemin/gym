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

async function push() {
  if (!userId) return;
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  setStatus("saving");
  const data = getState();
  const { error } = await createClient()
    .from("arabic_progress")
    .upsert({ user_id: userId, data, updated_at: new Date(data.updatedAt || Date.now()).toISOString() });
  setStatus(error ? "error" : "synced");
  if (error) console.error("sync push failed", error.message);
}

async function pull() {
  if (!userId) return;
  const { data, error } = await createClient().from("arabic_progress").select("data").eq("user_id", userId).maybeSingle();
  if (error) {
    console.error("sync pull failed", error.message);
    setStatus("error");
    return;
  }
  const remote = data?.data as Progress | undefined;
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
      if (timer) push();
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
