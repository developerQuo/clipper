import { createClient } from '@supabase/supabase-js';

const URL = process.env.DATABASE_URL;
const API_KEY = process.env.DATABASE_API_KEY;

if (!URL || !API_KEY) {
	throw new Error('Database url or api key vars missing');
}

export const supabase = createClient(URL, API_KEY);
