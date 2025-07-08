// Auth State Management
let currentUser = null;

// DOM Ready
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await checkAuthStatus();
    setupEventListeners();
  } catch (error) {
    console.error('Initialization error:', error);
  }
});

// Event Listeners
function setupEventListeners() {
  const registerForm = document.getElementById('register-form');
  const loginForm = document.getElementById('login-form');
  const logoutBtn = document.getElementById('logout-btn');

  if (registerForm) registerForm.addEventListener('submit', handleRegister);
  if (loginForm) loginForm.addEventListener('submit', handleLogin);
  if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
}

// Auth Status Check
async function checkAuthStatus() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) throw error;
    if (user) {
      currentUser = user;
      updateUIForAuthState(true);
      return user;
    }
    
    updateUIForAuthState(false);
    return null;
  } catch (error) {
    console.error('Auth check error:', error);
    showNotification('Error checking authentication status', 'error');
    return null;
  }
}

// Registration Handler
async function handleRegister(event) {
  event.preventDefault();
  
  const email = document.getElementById('reg-email').value;
  const password = document.getElementById('reg-password').value;
  const name = document.getElementById('reg-name').value;

  showLoading(true, 'register-form');

  try {
    // 1. Create auth user
    const { data: { user }, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { 
          name,
          last_login: new Date().toISOString()
        }
      }
    });

    if (authError) throw authError;

    // 2. Create profile in public.users
    const { error: dbError } = await supabase
      .from('users')
      .insert([{ 
        id: user.id, 
        email, 
        name,
        created_at: new Date().toISOString()
      }]);

    if (dbError) throw dbError;

    showNotification('Registration successful! Please check your email.', 'success');
    event.target.reset();
    
    // Optional: Redirect to login after short delay
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1500);

  } catch (error) {
    console.error('Registration error:', error);
    showNotification(`Registration failed: ${error.message}`, 'error');
  } finally {
    showLoading(false, 'register-form');
  }
}

// Login Handler
async function handleLogin(event) {
  event.preventDefault();
  
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  showLoading(true, 'login-form');

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    currentUser = data.user;
    updateUIForAuthState(true);
    
    // Update last login time
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', currentUser.id);

    showNotification('Login successful!', 'success');
    event.target.reset();

    // Redirect to dashboard after short delay
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1000);

  } catch (error) {
    console.error('Login error:', error);
    showNotification(`Login failed: ${error.message}`, 'error');
  } finally {
    showLoading(false, 'login-form');
  }
}

// Logout Handler
async function handleLogout() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    currentUser = null;
    updateUIForAuthState(false);
    showNotification('Logged out successfully', 'success');

    // Redirect to home after short delay
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1000);

  } catch (error) {
    console.error('Logout error:', error);
    showNotification(`Logout failed: ${error.message}`, 'error');
  }
}

// UI Updates
function updateUIForAuthState(isAuthenticated) {
  const authSection = document.getElementById('auth-section');
  const dashboard = document.getElementById('dashboard');
  const profileDropdown = document.getElementById('auth-dropdown');

  if (isAuthenticated) {
    // Update main UI
    if (authSection) authSection.style.display = 'none';
    if (dashboard) {
      dashboard.style.display = 'block';
      document.getElementById('welcome-message').textContent = 
        `Welcome, ${currentUser.user_metadata?.name || currentUser.email}`;
    }

    // Update profile dropdown
    if (profileDropdown) {
      profileDropdown.innerHTML = `
        <div class="user-info">
          <p>${currentUser.user_metadata?.name || currentUser.email}</p>
          <button id="logout-btn" class="logout-btn">Logout</button>
        </div>
      `;
      document.getElementById('logout-btn').addEventListener('click', handleLogout);
    }
  } else {
    // Update main UI
    if (authSection) authSection.style.display = 'block';
    if (dashboard) dashboard.style.display = 'none';

    // Update profile dropdown
    if (profileDropdown) {
      profileDropdown.innerHTML = `
        <a href="login.html">Login</a>
        <a href="registration.html">Register</a>
      `;
    }
  }
}

// Helper Functions
function showLoading(isLoading, formId) {
  const form = document.getElementById(formId);
  if (!form) return;

  const submitButton = form.querySelector('button[type="submit"]');
  if (submitButton) {
    submitButton.disabled = isLoading;
    submitButton.innerHTML = isLoading 
      ? '<span class="spinner"></span> Processing...' 
      : submitButton.textContent.replace('Processing...', '').trim();
  }
}

function showNotification(message, type = 'info') {
  // Remove any existing notifications
  const existing = document.querySelector('.notification');
  if (existing) existing.remove();

  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);

  // Auto-remove after 5 seconds
  setTimeout(() => {
    notification.classList.add('fade-out');
    setTimeout(() => notification.remove(), 300);
  }, 5000);
}