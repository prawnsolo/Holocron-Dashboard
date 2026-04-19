function renderWeekly() {
  const panel = document.getElementById('tab-weekly');
  const w = STATE.weekly;

  panel.innerHTML = `
    <h1 style="font-family:var(--font-display);font-size:var(--text-xl);
      color:var(--color-primary);letter-spacing:0.1em;
      margin-bottom:var(--space-8)">WEEKLY RECAP</h1>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-6)">

      <!-- Wins / Reflection Journal -->
      <div class="panel">
        <div class="panel-header">
          <span class="panel-title">⚡ WINS THIS WEEK</span>
        </div>
        ${w.completedThisWeek.map(item => `
          <div class="task-item">
            <div style="color:var(--color-success)">✓</div>
            <div class="task-text">${item}</div>
          </div>`).join('')}
        <textarea id="winsJournal"
          style="width:100%;margin-top:var(--space-4);
            background:var(--color-surface-offset);
            border:1px solid var(--color-border);
            border-radius:var(--radius-md);
            padding:var(--space-3);color:var(--color-text);
            font-family:var(--font-body);font-size:var(--text-sm);
            resize:vertical;min-height:80px"
          placeholder="Add your reflection here..."
          oninput="STATE.weekly.wins=this.value"
        >${w.wins}</textarea>
      </div>

      <!-- Open Loops -->
      <div class="panel">
        <div class="panel-header">
          <span class="panel-title">🔄 OPEN LOOPS</span>
          <span class="badge badge-today">${w.openLoops.length}</span>
        </div>
        ${w.openLoops.map(item => `
          <div class="task-item">
            <div style="color:var(--color-warning)">○</div>
            <div class="task-text">${item}</div>
          </div>`).join('')}
      </div>

      <!-- Blocked -->
      <div class="panel">
        <div class="panel-header">
          <span class="panel-title">🚧 BLOCKED</span>
          <span class="badge badge-overdue">${w.blocked.length}</span>
        </div>
        ${w.blocked.map(item => `
          <div class="task-item">
            <div style="color:var(--color-error)">✕</div>
            <div class="task-text">${item}</div>
          </div>`).join('')}
      </div>

      <!-- Next Week Priorities -->
      <div class="panel">
        <div class="panel-header">
          <span class="panel-title">🎯 NEXT WEEK</span>
        </div>
        ${w.nextWeekPriorities.map((item, i) => `
          <div class="task-item">
            <div style="color:var(--color-primary);
              font-family:var(--font-mono);font-size:var(--text-xs)">
              0${i+1}</div>
            <div class="task-text">${item}</div>
          </div>`).join('')}
      </div>

    </div>

    <!-- Memory Growth Chart -->
    <div class="panel" style="margin-top:var(--space-6)">
      <div class="panel-header">
        <span class="panel-title">📈 MEMORY GROWTH (LAST 7 DAYS)</span>
      </div>
      <div style="position: relative; height: 200px; width: 100%;">
        <canvas id="memoryGrowthChart"></canvas>
      </div>
    </div>

    <!-- People Follow-up Summary -->
    <div class="panel" style="margin-top:var(--space-6)">
      <div class="panel-header">
        <span class="panel-title">👥 PEOPLE THIS WEEK</span>
      </div>
      ${STATE.people.map(p => {
        const days = Math.floor(
          (new Date() - new Date(p.lastContact)) / 86400000
        );
        return `
          <div class="task-item">
            <div style="width:32px;height:32px;border-radius:50%;
              background:var(--color-primary-highlight);
              display:flex;align-items:center;justify-content:center;
              color:var(--color-primary);font-size:var(--text-xs);
              font-weight:700;flex-shrink:0">
              ${p.name.split(' ').map(n=>n[0]).join('')}
            </div>
            <div style="flex:1">
              <div class="task-text">${p.name}</div>
              <div class="task-meta">
                ${days > 14 ? '⚠️ ' : ''}Last contact: ${days} days ago
                · ${p.followUp}</div>
            </div>
          </div>`;
      }).join('')}
    </div>
  `;

  // Render Chart.js line chart
  const canvas = document.getElementById('memoryGrowthChart');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
        datasets: [{
          data: w.memoryGrowth,
          borderColor: '#00d4ff',
          backgroundColor: 'rgba(0, 212, 255, 0.08)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#00d4ff',
          pointRadius: 4,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.05)' },
               ticks: { color: '#8b90a0', font: { size: 11 } } },
          y: { grid: { color: 'rgba(255,255,255,0.05)' },
               ticks: { color: '#8b90a0', font: { size: 11 } } }
        }
      }
    });
  }
}
