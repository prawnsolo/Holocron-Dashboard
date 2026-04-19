const TABS = ['dashboard','projects','memory','weekly'];

function navigate(tab) {
  // Update panels
  TABS.forEach(t => {
    const el = document.getElementById(`tab-${t}`);
    if (el) el.classList.toggle('active', t === tab);
  });

  // Update nav items
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.tab === tab);
  });

  // Re-render the active tab
  const renderers = {
    dashboard: typeof renderDashboard !== 'undefined' ? renderDashboard : null,
    projects:  typeof renderProjects !== 'undefined' ? renderProjects : null,
    memory:    typeof renderMemory !== 'undefined' ? renderMemory : null,
    weekly:    typeof renderWeekly !== 'undefined' ? renderWeekly : null,
  };
  
  if (renderers[tab]) {
    renderers[tab]();
  }

  location.hash = tab;
}

// Init on load
window.addEventListener('DOMContentLoaded', () => {
  const hash = location.hash.replace('#','') || 'dashboard';
  setTimeout(() => {
    navigate(TABS.includes(hash) ? hash : 'dashboard');
  }, 0);

  // Wire nav links
  document.querySelectorAll('.nav-item').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      navigate(el.dataset.tab);
    });
  });

  // System clock
  setInterval(() => {
    const el = document.getElementById('systemTime');
    if (el) el.textContent = new Date().toLocaleTimeString();
  }, 1000);
});

// Mobile Sidebar Logic
window.addEventListener('DOMContentLoaded', () => {
  const mainContent = document.querySelector('.main-content');
  const sidebar = document.querySelector('.sidebar');
  const body = document.body;

  if (mainContent && sidebar) {
    // Toggle on touch/click
    sidebar.addEventListener('click', (e) => {
      if (window.innerWidth <= 768) {
        body.classList.toggle('sidebar-expanded');
      }
    });

    // Collapse on scroll
    mainContent.addEventListener('scroll', () => {
      if (window.innerWidth <= 768 && body.classList.contains('sidebar-expanded')) {
        body.classList.remove('sidebar-expanded');
      }
    }, { passive: true });
  }
});

// Dark mode toggle
(function(){
  window.addEventListener('DOMContentLoaded', () => {
    const r = document.documentElement;
    let d = r.getAttribute('data-theme') || 'dark';
    
    const toggleBtn = document.querySelector('[data-theme-toggle]');
    if (toggleBtn) {
      // Set initial icon
      toggleBtn.innerHTML = d === 'dark' ? '<i data-lucide="sun"></i>' : '<i data-lucide="moon"></i>';
      lucide.createIcons();
      
      toggleBtn.addEventListener('click', () => {
        d = d === 'dark' ? 'light' : 'dark';
        r.setAttribute('data-theme', d);
        toggleBtn.innerHTML = d === 'dark' ? '<i data-lucide="sun"></i>' : '<i data-lucide="moon"></i>';
        lucide.createIcons();
      });
    }
  });
})();
