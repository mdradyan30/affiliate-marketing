import { supabase } from "@/integrations/supabase/client";

const BUCKET = "media";
const TEN_YEARS = 60 * 60 * 24 * 365 * 10;

export type MediaItem = { path: string; url: string; name: string; created_at?: string };

export async function uploadMedia(file: File): Promise<MediaItem> {
  const ext = file.name.split(".").pop() || "bin";
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { cacheControl: "31536000", upsert: false, contentType: file.type });
  if (error) throw error;
  const { data, error: se } = await supabase.storage.from(BUCKET).createSignedUrl(path, TEN_YEARS);
  if (se || !data?.signedUrl) throw se ?? new Error("Failed to sign URL");
  return { path, url: data.signedUrl, name: file.name };
}

export async function listMedia(limit = 100): Promise<MediaItem[]> {
  const { data, error } = await supabase.storage.from(BUCKET).list("", { limit, sortBy: { column: "created_at", order: "desc" } });
  if (error || !data) return [];
  const files = data.filter((f) => f.name && !f.name.endsWith("/"));
  const signed = await Promise.all(
    files.map(async (f) => {
      const { data: s } = await supabase.storage.from(BUCKET).createSignedUrl(f.name, TEN_YEARS);
      return { path: f.name, url: s?.signedUrl ?? "", name: f.name, created_at: f.created_at } as MediaItem;
    }),
  );
  return signed.filter((x) => x.url);
}

export async function deleteMedia(path: string) {
  await supabase.storage.from(BUCKET).remove([path]);
}
