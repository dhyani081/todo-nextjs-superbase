import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or ANON key is missing. Check .env.local');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


// import { createClient } from '@supabase/supabase-js';

// // yahi values tumhare Supabase dashboard se aayi thi
// const supabaseUrl = 'https://piaqnyrfiknqwtncywup.supabase.co';
// const supabaseAnonKey =
//   'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpYXFueXJmaWtucXd0bmN5d3VwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5MzM5ODksImV4cCI6MjA3OTUwOTk4OX0.0WKWvu2oNPwUWERd8NvwzObrR4mF2JvggWsGQ2rMqOw';

// export const supabase = createClient(supabaseUrl, supabaseAnonKey);
