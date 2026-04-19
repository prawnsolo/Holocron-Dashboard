const STATE = {
  // --- TASKS / ADMIN ---
  tasks: [
    { id: 1, text: "Write OB1 weekly capture routine", dueDate: "2026-04-19",
      status: "todo", priority: "high", project: "OB1" },
    { id: 2, text: "Review Claude Code extension setup", dueDate: "2026-04-17",
      status: "todo", priority: "high", project: "OB1" },
    { id: 3, text: "Follow up with Alex on collab idea", dueDate: "2026-04-20",
      status: "todo", priority: "medium", project: "People" },
  ],

  // --- PROJECTS ---
  projects: [
    { id: 1, name: "OB1 Holocron Dashboard", status: "active",
      nextAction: "Build Memory tab", lastTouched: "2026-04-19",
      tags: ["build", "ai"], notes: "" },
    { id: 2, name: "Content Pipeline", status: "active",
      nextAction: "Draft next Substack post", lastTouched: "2026-04-15",
      tags: ["content"], notes: "" },
    { id: 3, name: "Client Proposal — XYZ", status: "stalled",
      nextAction: "Send revised scope doc", lastTouched: "2026-04-10",
      tags: ["client", "work"], notes: "" },
  ],

  // --- PEOPLE ---
  people: [
    { id: 1, name: "Alex Rivera", followUp: "Discuss collab on AI tools series",
      lastContact: "2026-04-10" },
    { id: 2, name: "Jordan Lee", followUp: "Send portfolio link",
      lastContact: "2026-04-05" },
  ],

  // --- MEMORIES ---
  memories: [
    { id: 1, content: "OB1 uses Supabase pgvector for semantic search",
      category: "technical", source: "Claude", date: "2026-04-18" },
    { id: 2, content: "Best GTD capture habit: process inbox at 9am daily",
      category: "productivity", source: "Slack", date: "2026-04-17" },
    { id: 3, content: "Holocron dashboard should feel like a Jedi Archive",
      category: "ideas", source: "ChatGPT", date: "2026-04-19" },
  ],

  // --- MEMORY STATS ---
  memoryStats: {
    total: 247,
    thisWeek: 18,
    lastWeek: 12,
    categories: {
      technical: 89, productivity: 64, ideas: 52,
      people: 28, other: 14
    },
    extensions: [
      { name: "Slack", status: "active", lastSync: "2 min ago", count: 142 },
      { name: "Claude / Claude Code", status: "active", lastSync: "1 hr ago", count: 67 },
      { name: "ChatGPT", status: "active", lastSync: "3 hrs ago", count: 38 },
    ]
  },

  // --- WEEKLY ---
  weekly: {
    wins: "",
    completedThisWeek: ["Finished OB1 initial setup", "Wrote 3 Substack drafts"],
    openLoops: ["Client proposal still pending", "OB1 Memory tab not built yet"],
    blocked: ["Waiting on API keys from client"],
    nextWeekPriorities: ["Ship Holocron dashboard", "Send client proposal"],
    memoryGrowth: [8, 12, 9, 15, 11, 18, 14], // last 7 days
  }
};

// Helper: today's date string
const TODAY = new Date().toISOString().split('T')[0];

// Helper: is a task overdue?
function isOverdue(task) {
  return task.dueDate < TODAY && task.status !== 'done';
}

// Helper: is a task due today?
function isDueToday(task) {
  return task.dueDate === TODAY && task.status !== 'done';
}

// Helper: get top 3 priority tasks
function getTopActions() {
  return STATE.tasks
    .filter(t => t.status !== 'done')
    .sort((a, b) => {
      const score = t => (isOverdue(t) ? 3 : isDueToday(t) ? 2 : 1) +
                         (t.priority === 'high' ? 1 : 0);
      return score(b) - score(a);
    })
    .slice(0, 3);
}
