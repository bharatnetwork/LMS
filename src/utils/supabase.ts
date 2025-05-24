// import { createClient } from '@supabase/supabase-js';
// import type { Database } from '../types/supabase-types';

// // Create a single supabase client for interacting with your database
// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
// const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// if (!supabaseUrl || !supabaseAnonKey) {
//   console.error('Supabase credentials are missing. Please connect to Supabase by clicking the "Connect to Supabase" button in the top right corner.');
// }

// export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// export const getTables = async () => {
//   try {
//     const { data, error } = await supabase
//       .from('pg_tables')
//       .select('*')
//       .eq('schemaname', 'public');
    
//     if (error) throw error;
//     return data;
//   } catch (error) {
//     console.error('Error fetching tables:', error);
//     return [];
//   }
// };


// import { createClient } from '@supabase/supabase-js';
// import type { Database } from '../types/supabase-types';

// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// if (!supabaseUrl || !supabaseAnonKey) {
//   console.error('Supabase credentials are missing. Please connect to Supabase by clicking the "Connect to Supabase" button in the top right corner.');
// }

// export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
// import { createClient } from '@supabase/supabase-js';
// import type { Database } from '../types/supabase-types'; // Ensure this path is correct

// // Environment variables for Next.js
// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// if (!supabaseUrl || !supabaseAnonKey) {
//   console.error(
//     'Supabase credentials are missing. Please add them to your .env.local file.'
//   );
// }

// // Create Supabase client
// export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// // Optional: Get tables (assuming you have permissions)
// export const getTables = async () => {
//   try {
//     const { data, error } = await supabase
//       .from('pg_tables')
//       .select('*')
//       .eq('schemaname', 'public');

//     if (error) throw error;
//     return data;
//   } catch (error) {
//     console.error('Error fetching tables:', error);
//     return [];
//   }
// };




import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase-types';

// Create a single supabase client for interacting with your database
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase credentials are missing. Please connect to Supabase by clicking the "Connect to Supabase" button in the top right corner.');
}

export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
);

// Helper function to check connection
export const checkSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('leads').select('id').limit(1);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Supabase connection error:', error);
    return false;
  }
};