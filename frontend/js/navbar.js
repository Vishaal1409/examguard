/**
 * ExamGuard — Shared Institutional Navbar Component
 * Renders and handles active state, mobile menu toggle, and user session across all pages.
 */

document.addEventListener('DOMContentLoaded', () => {
  renderNavbar();
});

function renderNavbar() {
  const mount = document.getElementById('shared-navbar');
  if (!mount) return;

  const currentPath = window.location.pathname;
  const page = currentPath.substring(currentPath.lastIndexOf('/') + 1) || 'index.html';

  const navLinks = [
    { href: 'dashboard.html', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { href: 'video-analysis.html', label: 'Video Analysis', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
    { href: 'text-analysis.html', label: 'Text Analysis', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { href: 'live-proctor.html', label: 'Live Proctor', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' },
    { href: 'history.html', label: 'History', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' }
  ];

  const user = (typeof getCurrentUser === 'function' ? getCurrentUser() : null) || { email: 'shruthika@examguard.edu', name: 'Shruthika' };
  const demoActive = typeof isDemoMode === 'function' ? isDemoMode() : true;

  const linksHtml = navLinks.map(link => {
    const isActive = page === link.href || (page === '' && link.href === 'dashboard.html');
    const activeClasses = isActive
      ? 'bg-slate-800 text-white font-semibold shadow-inner border-b-2 border-emerald-400'
      : 'text-slate-300 hover:bg-slate-800/60 hover:text-white';
    
    return `
      <a href="${link.href}" class="inline-flex items-center px-3.5 py-2 text-sm rounded-lg transition-colors duration-150 ${activeClasses}">
        <svg class="w-4 h-4 mr-2 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${link.icon}"></path>
        </svg>
        ${link.label}
      </a>
    `;
  }).join('');

  const mobileLinksHtml = navLinks.map(link => {
    const isActive = page === link.href;
    const activeClasses = isActive ? 'bg-slate-800 text-white font-semibold border-l-4 border-emerald-400' : 'text-slate-300 hover:bg-slate-800 hover:text-white';
    return `
      <a href="${link.href}" class="flex items-center px-4 py-3 text-base rounded-md transition-colors ${activeClasses}">
        <svg class="w-5 h-5 mr-3 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${link.icon}"></path>
        </svg>
        ${link.label}
      </a>
    `;
  }).join('');

  mount.innerHTML = `
    <nav class="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 shadow-md">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          
          <!-- Logo & Brand -->
          <div class="flex items-center space-x-3">
            <a href="dashboard.html" class="flex items-center space-x-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded-lg p-1">
              <div class="w-9 h-9 rounded-lg bg-gradient-to-tr from-slate-900 via-indigo-950 to-emerald-600 flex items-center justify-center shadow-md border border-slate-700">
                <svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
              </div>
              <div class="flex flex-col">
                <span class="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                  ExamGuard
                  <span class="text-[10px] font-medium tracking-wider uppercase px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">G2 Suite</span>
                </span>
                <span class="text-[11px] text-slate-400 hidden sm:inline -mt-1 font-medium">Academic Integrity & Review</span>
              </div>
            </a>
          </div>

          <!-- Desktop Navigation -->
          <div class="hidden md:flex items-center space-x-1 lg:space-x-2">
            ${linksHtml}
          </div>

          <!-- Right utilities: Demo Pill + User Profile + Logout -->
          <div class="hidden md:flex items-center space-x-3">
            <div class="flex items-center space-x-2 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700 text-xs">
              <span class="w-2 h-2 rounded-full ${demoActive ? 'bg-amber-400' : 'bg-emerald-400'} live-indicator"></span>
              <span class="text-slate-300 font-medium">${demoActive ? 'Demo Mode' : 'Live API'}</span>
            </div>

            <!-- User Menu -->
            <div class="flex items-center space-x-2 pl-2 border-l border-slate-800">
              <div class="w-8 h-8 rounded-full bg-slate-700 text-emerald-300 flex items-center justify-center font-bold text-xs border border-slate-600 shadow-sm">
                ${(user.name || user.email || 'S').charAt(0).toUpperCase()}
              </div>
              <div class="hidden xl:flex flex-col text-left">
                <span class="text-xs font-semibold text-slate-200 leading-tight">${user.name || 'Shruthika'}</span>
                <span class="text-[10px] text-slate-400 leading-tight truncate max-w-[120px]">${user.email}</span>
              </div>
              <button onclick="handleLogout()" title="Log out" class="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-md transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                </svg>
              </button>
            </div>
          </div>

          <!-- Mobile Hamburger Button -->
          <div class="flex md:hidden items-center space-x-2">
            <button id="mobile-menu-btn" class="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500" aria-label="Toggle navigation">
              <svg id="menu-icon-bars" class="w-6 h-6 block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
              <svg id="menu-icon-close" class="w-6 h-6 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

        </div>
      </div>

      <!-- Mobile dropdown menu -->
      <div id="mobile-menu" class="hidden md:hidden bg-slate-900 border-b border-slate-800 px-3 pt-2 pb-4 space-y-1">
        ${mobileLinksHtml}
        <div class="pt-4 pb-2 border-t border-slate-800">
          <div class="flex items-center justify-between px-3">
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 rounded-full bg-slate-700 text-emerald-300 flex items-center justify-center font-bold text-xs">
                ${(user.name || user.email || 'S').charAt(0).toUpperCase()}
              </div>
              <div>
                <p class="text-sm font-medium text-slate-200">${user.name || 'Shruthika'}</p>
                <p class="text-xs text-slate-400">${user.email}</p>
              </div>
            </div>
            <button onclick="handleLogout()" class="px-3 py-1 text-xs text-rose-300 bg-rose-950/60 border border-rose-900 rounded-md">
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  `;

  // Attach mobile toggle listener
  const mobileBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const iconBars = document.getElementById('menu-icon-bars');
  const iconClose = document.getElementById('menu-icon-close');

  if (mobileBtn && mobileMenu) {
    mobileBtn.addEventListener('click', () => {
      const isExpanded = !mobileMenu.classList.contains('hidden');
      if (isExpanded) {
        mobileMenu.classList.add('hidden');
        iconBars.classList.remove('hidden');
        iconClose.classList.add('hidden');
      } else {
        mobileMenu.classList.remove('hidden');
        iconBars.classList.add('hidden');
        iconClose.classList.remove('hidden');
      }
    });
  }
}

function handleLogout() {
  if (typeof clearAuth === 'function') {
    clearAuth();
  } else {
    localStorage.removeItem('examguard_token');
    localStorage.removeItem('examguard_user');
  }
  window.location.href = 'login.html';
}
