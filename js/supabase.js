/**
 * supabase.js — Supabase client initialisation
 *
 * Single shared instance imported by every module that needs DB access.
 * Uses the official SDK via ESM CDN — no npm/build step required.
 *
 * Future: swap the CDN import for a bundled version when you add a build step.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SUPABASE_URL, SUPABASE_ANON } from './config.js';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);
