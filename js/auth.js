// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Check if user is already logged in
  checkAuthStatus();
  
  // Setup form event listeners
  document.getElementById('register-form').addEventListener('submit', register);
  document.getElementById('login-form').addEventListener('submit', login);
  document.getElementById('logout-btn').addEventListener('click', logout);
});

async function checkAuthStatus() {
  const { data: { user } } = await window.supabaseClient.auth.getUser();
  if (user) {
    showDashboard(user);
  }
}

async function register(event) {
  event.preventDefault();
  const email = document.getElementById('reg-email').value;
  const password = document.getElementById('reg-password').value;
  const name = document.getElementById('reg-name').value;

  // 1. Create auth user (password handled by Supabase Auth)
  const { data: { user }, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {  // ← Additional profile data
      data: { name }  // Stores name in auth.users.raw_user_meta_data
    }
  });

  if (authError) {
    alert("Auth error: " + authError.message);
    return;
  }

  // 2. Insert into public.users (optional but recommended)
  const { error: dbError } = await supabase
    .from('users')
    .insert([{ id: user.id, email, name }]);

  if (dbError) alert("Database error: " + dbError.message);
  else alert("Registered! Check your email.");
}

async function login(event) {
  event.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  try {
    const { data, error } = await window.supabaseClient.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    showDashboard(data.user);
    event.target.reset();
  } catch (error) {
    console.error('Login error:', error);
    alert('Login failed: ' + error.message);
  }
}

function showDashboard(user) {
  document.getElementById('auth-section').style.display = 'none';
  document.getElementById('dashboard').style.display = 'block';
  document.getElementById('welcome-message').textContent = `Welcome, ${user.email}`;
}

async function logout() {
  try {
    const { error } = await window.supabaseClient.auth.signOut();
    if (error) throw error;
    
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('auth-section').style.display = 'block';
  } catch (error) {
    console.error('Logout error:', error);
    alert('Logout failed: ' + error.message);
  }
}