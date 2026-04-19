function renderDashboard() {
  const panel = document.getElementById('tab-dashboard');

  const overdue = STATE.tasks.filter(isOverdue);
  const topActions = getTopActions();
  const stuckProjects = STATE.projects.filter(p => {
    const days = Math.floor(
      (new Date() - new Date(p.lastTouched)) / 86400000
    );
    return days > 7 && p.status === 'active';
  });

  panel.innerHTML = `
    <!-- Capture Box -->
    <div class="capture-box">
      <i data-lucide="zap" style="color:var(--color-primary);flex-shrink:0"></i>
      <input class="capture-input" id="captureInput"
        placeholder="Drop a thought into the Force..." />
      <button class="capture-btn" onclick="handleCapture()">Capture</button>
    </div>

    <!-- KPI Row -->
    <div class="kpi-grid">
      ${kpiCard("Open Tasks",
          STATE.tasks.filter(t=>t.status!=='done').length, "tasks", "")}
      ${kpiCard("Active Projects",
          STATE.projects.filter(p=>p.status==='active').length, "folder-kanban", "")}
      ${kpiCard("Memories Stored",
          STATE.memoryStats.total, "brain",
          `+${STATE.memoryStats.thisWeek} this week`)}
      ${kpiCard("Overdue",
          overdue.length, "alert-triangle",
          overdue.length > 0 ? "Needs attention" : "All clear", overdue.length > 0)}
    </div>

    <!-- Two-col digest -->
    <div class="dashboard-digest">

      <!-- Top 3 Actions -->
      <div class="panel">
        <div class="panel-header">
          <span class="panel-title">TODAY'S TOP ACTIONS</span>
          <button onclick="openAddTask()" style="color:var(--color-primary);font-size:var(--text-xs);background:none;border:none;cursor:pointer">+ Add</button>
        </div>
        ${topActions.map((t, i) => taskRow(t, i+1)).join('')}
      </div>

      <!-- Overdue -->
      <div class="panel">
        <div class="panel-header">
          <span class="panel-title">OVERDUE</span>
          <span class="badge badge-overdue">${overdue.length}</span>
        </div>
        ${overdue.length === 0
          ? `<p style="color:var(--color-text-muted);font-size:var(--text-sm)">
               All clear — the Force is with you.</p>`
          : overdue.map(t => taskRow(t)).join('')}
      </div>

      <!-- People Follow-ups -->
      <div class="panel">
        <div class="panel-header">
          <span class="panel-title">PEOPLE TO CONNECT</span>
          <button onclick="openAddPerson()" style="color:var(--color-primary);font-size:var(--text-xs);background:none;border:none;cursor:pointer">+ Add</button>
        </div>
        ${STATE.people.map(p => personRow(p)).join('')}
      </div>

      <!-- Stuck / Neglected -->
      <div class="panel">
        <div class="panel-header">
          <span class="panel-title">STUCK / NEGLECTED</span>
          <span class="badge badge-stuck">${stuckProjects.length}</span>
        </div>
        ${stuckProjects.length === 0
          ? `<p style="color:var(--color-text-muted);font-size:var(--text-sm)">
               No neglected projects. Good momentum.</p>`
          : stuckProjects.map(p => stuckRow(p)).join('')}
      </div>

    </div>
  `;

  lucide.createIcons();
}

function kpiCard(label, value, icon, delta, isAlert=false) {
  return `
    <div class="kpi-card">
      <div class="kpi-label">${label}</div>
      <div class="kpi-value" style="${isAlert?'color:var(--color-error)':''}">${value}</div>
      ${delta ? `<div class="kpi-delta ${isAlert?'down':'up'}">${delta}</div>` : ''}
    </div>`;
}

function taskRow(task, num=null) {
  const overdueBadge = isOverdue(task)
    ? `<span class="badge badge-overdue">overdue</span>` : '';
  const todayBadge = isDueToday(task)
    ? `<span class="badge badge-today">today</span>` : '';

  return `
    <div class="task-item">
      <div class="task-check ${task.status==='done'?'done':''}"
        onclick="toggleTask(${task.id})"></div>
      <div style="flex:1">
        <div class="task-text">${num ? `<strong>${num}.</strong> ` : ''}${task.text}</div>
        <div class="task-meta">
          ${task.project} · Due ${task.dueDate}
          ${overdueBadge}${todayBadge}
        </div>
      </div>
    </div>`;
}

function personRow(person) {
  const daysSince = Math.floor(
    (new Date() - new Date(person.lastContact)) / 86400000
  );
  return `
    <div class="task-item">
      <div class="task-avatar">
        ${person.name.split(' ').map(n=>n[0]).join('')}
      </div>
      <div style="flex:1; min-width: 0;">
        <div class="task-text">${person.name}</div>
        <div class="task-meta">${person.followUp} · ${daysSince}d ago</div>
      </div>
    </div>`;
}

function stuckRow(project) {
  const days = Math.floor(
    (new Date() - new Date(project.lastTouched)) / 86400000
  );
  return `
    <div class="task-item">
      <div style="flex:1">
        <div class="task-text">${project.name}</div>
        <div class="task-meta">Last touched ${days} days ago
          · Next: ${project.nextAction}</div>
      </div>
    </div>`;
}

// Capture handler
function handleCapture() {
  const input = document.getElementById('captureInput');
  const text = input.value.trim();
  if (!text) return;
  STATE.memories.unshift({
    id: Date.now(), content: text,
    category: 'ideas', source: 'Manual', date: TODAY
  });
  STATE.memoryStats.total++;
  STATE.memoryStats.thisWeek++;
  input.value = '';
  renderDashboard();
}

function toggleTask(id) {
  const task = STATE.tasks.find(t => t.id === id);
  if (task) {
    task.status = task.status === 'done' ? 'todo' : 'done';
    renderDashboard();
  }
}

// Global functions for buttons
window.openAddTask = () => alert('Add Task functionality coming soon!');
window.openAddPerson = () => alert('Add Person functionality coming soon!');
window.handleCapture = handleCapture;
window.toggleTask = toggleTask;
