// Initialize Supabase client and make it globally available
const supabaseUrl = 'https://nfnmmehpsomwnexgythn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5mbm1tZWhwc29td25leGd5dGhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4MTU3MjUsImV4cCI6MjA2NzM5MTcyNX0.sp-z2vJjdmdhRRSnc49On5Z0PeCyfX3WLO1dkYnKmUA';

const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// Make it available globally
window.supabaseClient = supabase;

console.log('Supabase initialized successfully');