let projectView = 'list'; // 'list' | 'kanban' | 'timeline'

function renderProjects() {
  const panel = document.getElementById('tab-projects');
  panel.innerHTML = `
    <div class="panel-header" style="margin-bottom:var(--space-6)">
      <h1 style="font-family:var(--font-display);font-size:var(--text-xl);
        color:var(--color-primary);letter-spacing:0.1em">PROJECTS</h1>
      <div style="display:flex;gap:var(--space-2)">
        ${['list','kanban','timeline'].map(v => `
          <button onclick="setProjectView('${v}')"
            class="view-btn ${projectView===v?'active':''}">${v}</button>
        `).join('')}
        <button class="capture-btn" onclick="openAddProject()">+ New Project</button>
      </div>
    </div>
    ${projectView === 'list'    ? renderProjectList()     : ''}
    ${projectView === 'kanban'  ? renderProjectKanban()   : ''}
    ${projectView === 'timeline'? renderProjectTimeline() : ''}
  `;
  lucide.createIcons();
}

function renderProjectList() {
  return `
    <div class="panel" style="overflow-x: auto; -webkit-overflow-scrolling: touch;">
      <table style="width:100%; border-collapse: collapse; min-width: 600px;">
        <thead>
          <tr style="border-bottom:1px solid var(--color-divider)">
            <th style="text-align:left;padding:var(--space-3);
              font-size:var(--text-xs);color:var(--color-text-muted);
              text-transform:uppercase;letter-spacing:0.1em">Project</th>
            <th style="text-align:left;padding:var(--space-3); font-size:var(--text-xs);color:var(--color-text-muted); text-transform:uppercase;letter-spacing:0.1em">Status</th>
            <th style="text-align:left;padding:var(--space-3); font-size:var(--text-xs);color:var(--color-text-muted); text-transform:uppercase;letter-spacing:0.1em">Next Action</th>
            <th style="text-align:left;padding:var(--space-3); font-size:var(--text-xs);color:var(--color-text-muted); text-transform:uppercase;letter-spacing:0.1em">Last Touched</th>
            <th style="text-align:left;padding:var(--space-3); font-size:var(--text-xs);color:var(--color-text-muted); text-transform:uppercase;letter-spacing:0.1em">Tags</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${STATE.projects.map(p => `
            <tr style="border-bottom:1px solid var(--color-divider)">
              <td style="padding:var(--space-3);font-weight:600;
                color:var(--color-text)">${p.name}</td>
              <td style="padding:var(--space-3)"><span class="badge badge-${p.status==='active'?'active':
                p.status==='stalled'?'stuck':'today'}">${p.status}</span></td>
              <td style="padding:var(--space-3);font-size:var(--text-sm);color:var(--color-text-muted)">
                ${p.nextAction}</td>
              <td style="padding:var(--space-3);font-family:var(--font-mono);font-size:var(--text-xs);
                color:var(--color-text-faint)">${p.lastTouched}</td>
              <td style="padding:var(--space-3)">${p.tags.map(t=>`<span class="badge badge-active"
                style="margin-right:4px">${t}</span>`).join('')}</td>
              <td style="padding:var(--space-3)"><button onclick="editProject(${p.id})"
                style="background:none;border:none;cursor:pointer;color:var(--color-text-muted);font-size:var(--text-xs)">
                Edit</button></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>`;
}

function renderProjectKanban() {
  const columns = ['active', 'stalled', 'done'];
  const labels  = { active:'Active', stalled:'Stalled', done:'Done' };

  return `
    <div class="dashboard-digest">
      ${columns.map(col => `
        <div class="projects-kanban-column">
          <div class="column-header">
            ${labels[col]}
            <span class="badge badge-active">
              ${STATE.projects.filter(p=>p.status===col).length}
            </span>
          </div>
          ${STATE.projects.filter(p=>p.status===col).map(p => `
            <div class="panel kanban-card" onclick="editProject(${p.id})">
              <div class="kanban-card-title">${p.name}</div>
              <div class="kanban-card-meta">→ ${p.nextAction}</div>
              <div class="kanban-card-tags">
                ${p.tags.map(t=>`<span class="badge badge-active">${t}</span>`).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      `).join('')}
    </div>`;
}

function renderProjectTimeline() {
  const sorted = [...STATE.projects].sort(
    (a,b) => new Date(a.lastTouched) - new Date(b.lastTouched)
  );
  return `
    <div class="panel">
      ${sorted.map(p => {
        const age = Math.floor(
          (new Date() - new Date(p.lastTouched)) / 86400000
        );
        const width = Math.max(5, Math.min(100, 100 - age * 3));
        return `
          <div style="margin-bottom:var(--space-5)">
            <div style="display:flex;justify-content:space-between;
              margin-bottom:var(--space-2)">
              <span style="font-size:var(--text-sm);font-weight:600">
                ${p.name}</span>
              <span style="font-size:var(--text-xs);
                color:var(--color-text-faint);font-family:var(--font-mono)">
                ${p.lastTouched}</span>
            </div>
            <div style="background:var(--color-surface-offset);
              border-radius:var(--radius-full);height:8px;overflow:hidden">
              <div style="width:${width}%;height:100%;
                background:${p.status==='stalled'
                  ? 'var(--color-purple)' : 'var(--color-primary)'};
                border-radius:var(--radius-full);
                transition:width 0.6s ease"></div>
            </div>
            <div style="font-size:var(--text-xs);color:var(--color-text-muted);
              margin-top:var(--space-1)">
              Next: ${p.nextAction} · touched ${age}d ago</div>
          </div>`;
      }).join('')}
    </div>`;
}

window.setProjectView = (view) => {
  projectView = view;
  renderProjects();
};

window.openAddProject = () => alert('Add Project functionality coming soon!');
window.editProject = (id) => alert('Edit Project ' + id + ' coming soon!');
