/**
 * ExamGuard — Authentication Logic (Login & Registration)
 * Supports client-side validation, password toggles, real FastAPI token auth,
 * and seamless fallback to Demo Mode for Day 1 evaluations.
 */

document.addEventListener('DOMContentLoaded', () => {
  setupPasswordToggles();
  setupLoginForm();
  setupRegisterForm();
  setupDemoQuickFill();
});

// Show / Hide Password Toggle
function setupPasswordToggles() {
  document.querySelectorAll('[data-toggle-password]').forEach(button => {
    button.addEventListener('click', () => {
      const targetId = button.getAttribute('data-toggle-password');
      const input = document.getElementById(targetId);
      if (!input) return;

      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';

      // Toggle Eye Icon
      const eyeOpen = button.querySelector('.eye-open');
      const eyeClosed = button.querySelector('.eye-closed');
      if (eyeOpen && eyeClosed) {
        eyeOpen.classList.toggle('hidden', !isPassword);
        eyeClosed.classList.toggle('hidden', isPassword);
      }
    });
  });
}

// Demo quick-fill helper
function setupDemoQuickFill() {
  const quickFillBtn = document.getElementById('btn-demo-quickfill');
  if (quickFillBtn) {
    quickFillBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('email');
      const passInput = document.getElementById('password');
      const nameInput = document.getElementById('name');
      const confirmInput = document.getElementById('confirmPassword');

      if (emailInput) emailInput.value = 'shruthika@examguard.edu';
      if (passInput) passInput.value = 'Security123!';
      if (nameInput) nameInput.value = 'Shruthika Nair';
      if (confirmInput) confirmInput.value = 'Security123!';

      showFeedback('Demo credentials filled. Ready to login.', 'info');
    });
  }
}

// Feedback banner helper
function showFeedback(message, type = 'error') {
  const container = document.getElementById('auth-feedback');
  if (!container) return;

  const styles = {
    error: 'bg-rose-50 border-rose-200 text-rose-800',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };

  container.className = `p-3.5 rounded-lg border text-sm font-medium mb-4 flex items-center justify-between ${styles[type] || styles.error}`;
  container.innerHTML = `
    <span>${message}</span>
    <button type="button" onclick="this.parentElement.classList.add('hidden')" class="ml-2 text-current opacity-70 hover:opacity-100">&times;</button>
  `;
  container.classList.remove('hidden');
}

// Setup Login Form
function setupLoginForm() {
  const form = document.getElementById('login-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const isDemoCheckbox = document.getElementById('demo-mode-checkbox');
    const forceDemo = isDemoCheckbox ? isDemoCheckbox.checked : true;

    // Client Validation
    if (!email || !email.includes('@') || !email.includes('.')) {
      showFeedback('Please enter a valid institutional email address.', 'error');
      return;
    }
    if (!password || password.length < 8) {
      showFeedback('Password must be at least 8 characters long.', 'error');
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
      </svg> Authenticating...
    `;

    // Attempt FastAPI Login or Fallback to Demo
    if (!forceDemo) {
      try {
        const response = await fetch(`${CONFIG.API_BASE}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        if (response.ok) {
          const data = await response.json();
          setAuthToken(data.access_token);
          setCurrentUser({ email, name: email.split('@')[0] });
          setDemoMode(false);
          window.location.href = 'dashboard.html';
          return;
        } else {
          const errData = await response.json().catch(() => ({}));
          showFeedback(errData.detail || 'Authentication failed. Check your credentials.', 'error');
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
          return;
        }
      } catch (err) {
        console.warn('Backend server unreachable, falling back to Demo Mode:', err);
      }
    }

    // Demo Mode Authentication
    setTimeout(() => {
      setAuthToken('demo-token-shruthika-examguard-day1');
      setCurrentUser({
        email: email || 'shruthika@examguard.edu',
        name: 'Shruthika Nair',
        role: 'Chief Examiner / Integrity Reviewer'
      });
      setDemoMode(true);
      window.location.href = 'dashboard.html';
    }, 600);
  });
}

// Setup Register Form
function setupRegisterForm() {
  const form = document.getElementById('register-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const isDemoCheckbox = document.getElementById('demo-mode-checkbox');
    const forceDemo = isDemoCheckbox ? isDemoCheckbox.checked : true;

    // Validation
    if (!name) {
      showFeedback('Please provide your full legal / institutional name.', 'error');
      return;
    }
    if (!email || !email.includes('@') || !email.includes('.')) {
      showFeedback('Please provide a valid institutional email address.', 'error');
      return;
    }
    if (password.length < 8) {
      showFeedback('Password must be at least 8 characters long.', 'error');
      return;
    }
    if (password !== confirmPassword) {
      showFeedback('Passwords do not match. Please verify and retype.', 'error');
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
      </svg> Registering Account...
    `;

    if (!forceDemo) {
      try {
        const response = await fetch(`${CONFIG.API_BASE}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        if (response.status === 201) {
          const data = await response.json();
          setAuthToken(data.access_token);
          setCurrentUser({ email, name });
          setDemoMode(false);
          window.location.href = 'dashboard.html';
          return;
        } else {
          const errData = await response.json().catch(() => ({}));
          showFeedback(errData.detail || 'Registration failed. Email may already be in use.', 'error');
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
          return;
        }
      } catch (err) {
        console.warn('Backend server unreachable, falling back to Demo Mode:', err);
      }
    }

    // Demo Mode Registration
    setTimeout(() => {
      setAuthToken('demo-token-shruthika-examguard-day1');
      setCurrentUser({
        email,
        name,
        role: 'Registered Examiner'
      });
      setDemoMode(true);
      window.location.href = 'dashboard.html';
    }, 600);
  });
}
