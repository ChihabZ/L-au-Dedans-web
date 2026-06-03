/**
 * actualites.js — Dynamic event poster
 *
 * Fetches the most recently uploaded poster from Supabase
 * and injects it into the Événements section.
 *
 * Table : actualities
 * Columns: id (int8), image_url (text), created_at (timestamptz)
 * Storage bucket: actualities (public)
 *
 * Logic: ORDER BY created_at DESC LIMIT 1
 * → most recently uploaded poster is always shown.
 * → falls back to the static image if the table is empty or unreachable.
 */

import { supabase } from './supabase.js';

const BUCKET          = 'actualities';
const TABLE           = 'actualities';
const POSTER_IMG_ID   = 'eventPoster';
const FALLBACK_SRC    = 'building%20assets/fb-source-event.jpg';

// ── Fetch latest poster URL from DB ──────────────────────────
async function fetchLatestPoster() {
  const { data, error } = await supabase
    .from(TABLE)
    .select('image_url, created_at')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();          // returns null (not error) when table is empty

  if (error) {
    console.warn('[actualites] fetch error:', error.message);
    return null;
  }
  return data?.image_url ?? null;
}

// ── Inject poster into the page ───────────────────────────────
function applyPoster(url) {
  const img = document.getElementById(POSTER_IMG_ID);
  if (!img) return;

  if (!url) return; // keep static fallback already in HTML

  // Swap src; on error fall back to static image
  img.src = url;
  img.onerror = () => { img.src = FALLBACK_SRC; };
}

// ── Public init ───────────────────────────────────────────────
export async function initActualites() {
  const url = await fetchLatestPoster();
  applyPoster(url);
}

// ── Storage upload helper (used by dashboard) ─────────────────
export async function uploadPoster(file) {
  const ext      = file.name.split('.').pop().toLowerCase();
  const allowed  = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

  if (!allowed.includes(ext)) {
    return { url: null, error: 'Format non supporté. Utilisez JPG, PNG, WEBP ou GIF.' };
  }
  if (file.size > 8 * 1024 * 1024) {
    return { url: null, error: 'Fichier trop lourd. Maximum 8 Mo.' };
  }

  // Unique filename with timestamp to avoid cache stale issues
  const filename = `poster-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(filename, file, { cacheControl: '3600', upsert: false });

  if (uploadError) {
    return { url: null, error: uploadError.message };
  }

  // Get permanent public URL
  const { data } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(filename);

  return { url: data.publicUrl, error: null };
}

// ── DB insert helper (used by dashboard after upload) ─────────
export async function savePosterUrl(imageUrl) {
  const { error } = await supabase
    .from(TABLE)
    .insert([{ image_url: imageUrl }]);

  return { error };
}
