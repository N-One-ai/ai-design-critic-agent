/**
 * Supabase Storage helper — server-side only.
 *
 * Uses the Supabase Storage REST API directly (no SDK dependency required)
 * so the module compiles and runs without @supabase/supabase-js installed.
 *
 * Graceful fallback:
 *   When SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY are absent (local dev),
 *   uploadGeneratedImage() returns a data: URL so the rest of the pipeline
 *   stays functional without cloud storage.
 *
 * Required environment variables (add to .env):
 *   SUPABASE_URL              — e.g. https://xyzabc.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY — service role key (never expose to client)
 *
 * Supabase bucket setup:
 *   1. Create a bucket named "generated-images" in Supabase Dashboard → Storage
 *   2. Set bucket policy to allow public reads (for public URLs)
 *   3. Service role key has full write access by default
 */

export interface StorageUploadResult {
  /** Publicly accessible URL for the uploaded image. */
  publicUrl: string;
  /** Path inside the bucket, e.g. "images/1234567890-uuid.png". */
  storagePath: string;
  /** true = stored in Supabase; false = fell back to data: URL (dev mode). */
  persisted: boolean;
}

const BUCKET = "generated-images";

/**
 * Upload a base64-encoded image to Supabase Storage and return its public URL.
 *
 * Falls back to a data: URL when Supabase credentials are not configured —
 * the API route stays functional in all environments.
 */
export async function uploadGeneratedImage(
  base64Data: string,
  mimeType: string,
  filename: string,
): Promise<StorageUploadResult> {
  const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // ── Dev fallback: no Supabase configured ─────────────────────────────────
  if (!supabaseUrl || !serviceKey) {
    return {
      publicUrl: `data:${mimeType};base64,${base64Data}`,
      storagePath: `local/${filename}`,
      persisted: false,
    };
  }

  const storagePath = `images/${filename}`;
  const uploadUrl = `${supabaseUrl}/storage/v1/object/${BUCKET}/${storagePath}`;

  // Convert base64 string → binary Buffer (Node.js only — valid in Next.js API routes)
  const binaryBuffer = Buffer.from(base64Data, "base64");

  const uploadResponse = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      "Authorization":  `Bearer ${serviceKey}`,
      "Content-Type":   mimeType,
      "x-upsert":       "false",
    },
    body: binaryBuffer,
  });

  if (!uploadResponse.ok) {
    const errorBody = await uploadResponse.text().catch(() => "(unreadable)");
    throw new Error(
      `Supabase Storage upload failed: HTTP ${uploadResponse.status} — ${errorBody}`,
    );
  }

  // Supabase public URL format (bucket must have public read enabled)
  const publicUrl =
    `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${storagePath}`;

  return { publicUrl, storagePath, persisted: true };
}
