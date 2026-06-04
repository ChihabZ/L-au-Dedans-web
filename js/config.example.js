/**
 * config.example.js — Template for js/config.js
 *
 * js/config.js is gitignored and must be created manually on each machine.
 * Copy this file, rename it to config.js, and fill in the real values.
 *
 * Find the values in: Supabase → Project Settings → API
 *   - Project URL  → SUPABASE_URL
 *   - anon / public key → SUPABASE_ANON
 *
 * The anon key is safe to use client-side — Supabase RLS policies
 * control what it can actually access.
 */

export const SUPABASE_URL  = 'https://YOUR_PROJECT_ID.supabase.co';
export const SUPABASE_ANON = 'YOUR_ANON_PUBLIC_KEY';
