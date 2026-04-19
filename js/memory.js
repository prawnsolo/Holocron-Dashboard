function renderMemory() {
  const panel = document.getElementById('tab-memory');
  const stats = STATE.memoryStats;

  panel.innerHTML = `
    <!-- Search -->
    <div class="capture-box" style="margin-bottom:var(--space-6)">
      <i data-lucide="search" style="color:var(--color-text-faint);flex-shrink:0"></i>
      <input class="capture-input" id="memorySearch"
        placeholder="Search your memories..."
        oninput="filterMemories(this.value)" />
    </div>

    <!-- Stats Row -->
    <div class="kpi-grid" style="margin-bottom:var(--space-6)">
      ${kpiCard("Total Memories", stats.total, "brain", "")}
      ${kpiCard("This Week", `+${stats.thisWeek}`, "trending-up",
        `vs +${stats.lastWeek} last week`, false)}
      ${kpiCard("Categories", Object.keys(stats.categories).length, "tag", "")}
      ${kpiCard("Extensions", stats.extensions.length, "plug", "All active")}
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-6)">

      <!-- Category Cloud -->
      <div class="panel">
        <div class="panel-header">
          <span class="panel-title">MEMORY MAP</span>
        </div>
        ${Object.entries(stats.categories)
          .sort((a,b) => b[1]-a[1])
          .map(([cat, count]) => {
            const pct = Math.round(count / stats.total * 100);
            return `
              <div style="margin-bottom:var(--space-3)">
                <div style="display:flex;justify-content:space-between;
                  margin-bottom:var(--space-1)">
                  <span style="font-size:var(--text-sm); text-transform: capitalize;">${cat}</span>
                  <span style="font-family:var(--font-mono);
                    font-size:var(--text-xs);color:var(--color-text-muted)">
                    ${count}</span>
                </div>
                <div style="background:var(--color-surface-offset);
                  border-radius:var(--radius-full);height:6px">
                  <div style="width:${pct}%;height:100%;
                    background:var(--color-primary);
                    border-radius:var(--radius-full)"></div>
                </div>
              </div>`;
          }).join('')}
      </div>

      <!-- Extensions -->
      <div class="panel">
        <div class="panel-header">
          <span class="panel-title">EXTENSIONS</span>
        </div>
        ${stats.extensions.map(ext => `
          <div class="task-item">
            <div style="width:8px;height:8px;border-radius:50%;
              background:var(--color-success);flex-shrink:0;margin-top:6px"></div>
            <div style="flex:1">
              <div class="task-text">${ext.name}</div>
              <div class="task-meta">
                ${ext.count} memories · Last sync: ${ext.lastSync}</div>
            </div>
          </div>`).join('')}
      </div>

    </div>

    <!-- Recent Memories Feed -->
    <div class="panel" style="margin-top:var(--space-6)">
      <div class="panel-header">
        <span class="panel-title">RECENT MEMORIES</span>
        <button onclick="openAddMemory()"
          style="background:none;border:none;cursor:pointer;color:var(--color-primary);font-size:var(--text-xs)">+ Add</button>
      </div>
      <div id="memoryFeed">
        ${STATE.memories.slice(0,10).map(m => memoryRow(m)).join('')}
      </div>
    </div>

    <!-- Agent Activity Log -->
    <div class="panel" style="margin-top:var(--space-6)">
      <div class="panel-header">
        <span class="panel-title">AGENT ACTIVITY</span>
      </div>
      ${agentLog()}
    </div>
  `;

  lucide.createIcons();
}

function memoryRow(m) {
  return `
    <div class="task-item">
      <span class="badge badge-active" style="flex-shrink:0; height: fit-content;">${m.source}</span>
      <div style="flex:1">
        <div class="task-text">${m.content}</div>
        <div class="task-meta">${m.category} · ${m.date}</div>
      </div>
    </div>`;
}

function agentLog() {
  // Mock activity — wire to real logs later
  const log = [
    { agent:"Claude Code", action:"read", count:3, time:"1hr ago" },
    { agent:"ChatGPT",     action:"wrote", count:1, time:"3hr ago" },
    { agent:"Slack",       action:"wrote", count:5, time:"2min ago" },
  ];
  return log.map(l => `
    <div class="task-item">
      <i data-lucide="${l.action==='read'?'eye':'pen-line'}"
        style="color:var(--color-text-faint);flex-shrink:0"></i>
      <div class="task-text">
        <strong>${l.agent}</strong> ${l.action} ${l.count} memor${l.count>1?'ies':'y'}
        <span style="color:var(--color-text-faint);
          font-family:var(--font-mono);font-size:var(--text-xs)">
          · ${l.time}</span>
      </div>
    </div>`).join('');
}

function filterMemories(query) {
  const results = query
    ? STATE.memories.filter(m =>
        m.content.toLowerCase().includes(query.toLowerCase()) ||
        m.category.toLowerCase().includes(query.toLowerCase()))
    : STATE.memories.slice(0, 10);

  const feed = document.getElementById('memoryFeed');
  if (feed) {
    feed.innerHTML =
      results.map(m => memoryRow(m)).join('') ||
      `<p style="color:var(--color-text-muted);font-size:var(--text-sm)">
         No memories found.</p>`;
    lucide.createIcons();
  }
}

window.openAddMemory = () => alert('Add Memory functionality coming soon!');
window.filterMemories = filterMemories;
