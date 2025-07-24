// Initialize Supabase client and make it globally available
const supabaseUrl = 'https://czpindulyzkqnonsxtcc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6cGluZHVseXprcW5vbnN4dGNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0MTIwMzUsImV4cCI6MjA2Mjk4ODAzNX0.EZY2o4LGGQ7StjSVrJt6vCgjvI1uD48y26a0JekOJhc';

const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// Make it available globally
window.supabaseClient = supabase;

console.log('Supabase initialized successfully');