import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let admin: SupabaseClient | null | undefined;

/** Service-role client (server only). Null when the key is not configured. */
export function getAdmin() {
  if (admin === undefined) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    admin = url && key ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }) : null;
  }
  return admin;
}

export const BUCKET = "arabic-progress";
let bucketReady = false;

export async function ensureBucket(sb: SupabaseClient) {
  if (bucketReady) return;
  const { error } = await sb.storage.createBucket(BUCKET, { public: false });
  if (error && !/exist/i.test(error.message)) throw error;
  bucketReady = true;
}

async function readJson<T>(sb: SupabaseClient, path: string): Promise<T | null> {
  const { data, error } = await sb.storage.from(BUCKET).download(path);
  if (error || !data) return null;
  try {
    return JSON.parse(await data.text()) as T;
  } catch {
    return null;
  }
}

async function writeJson(sb: SupabaseClient, path: string, value: unknown) {
  const { error } = await sb.storage
    .from(BUCKET)
    .upload(path, JSON.stringify(value), { upsert: true, contentType: "application/json", cacheControl: "0" });
  if (error) throw error;
}

let ownerCache: string | null = null;

/**
 * The app belongs to a single person: the first account that logs in becomes the owner,
 * and every other account is refused. Returns true when `userId` is (or just became) the owner.
 * Returns true when no service key is configured (lock disabled).
 */
export async function isOwner(userId: string): Promise<boolean> {
  const sb = getAdmin();
  if (!sb) return true;
  if (ownerCache) return ownerCache === userId;
  await ensureBucket(sb);
  const owner = await readJson<{ id: string }>(sb, "owner.json");
  if (owner?.id) {
    ownerCache = owner.id;
    return owner.id === userId;
  }
  await writeJson(sb, "owner.json", { id: userId, claimedAt: new Date().toISOString() });
  ownerCache = userId;
  return true;
}

export async function loadProgress(userId: string) {
  const sb = getAdmin();
  if (!sb) return null;
  await ensureBucket(sb);
  return readJson<Record<string, unknown>>(sb, `users/${userId}.json`);
}

export async function saveProgress(userId: string, data: unknown) {
  const sb = getAdmin();
  if (!sb) throw new Error("storage not configured");
  await ensureBucket(sb);
  await writeJson(sb, `users/${userId}.json`, data);
}
