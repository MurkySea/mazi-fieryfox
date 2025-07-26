const tasks = [];

function saveTasks() {
  const custom = tasks.filter(t => t.id >= 1000);
  localStorage.setItem('mazi_custom_tasks', JSON.stringify(custom));
}

function loadTasks() {
  const saved = localStorage.getItem('mazi_custom_tasks');
  if (saved) {
    const parsed = JSON.parse(saved);
    parsed.forEach(t => tasks.push(t));
  }
}

function formatRepeat(type) {
  switch (type) {
    case 'daily':
      return '🔁 Daily';
    case 'weekly':
      return '🔂 Weekly';
    case 'monthly':
      return '📆 Monthly';
    default:
      return '';
  }
}

function createTask() {
  const nameEl = document.getElementById('taskName');
  const xpEl = document.getElementById('taskXP');
  const repeatEl = document.getElementById('taskRepeat');
  if (!nameEl || !xpEl || !repeatEl) return;

  const name = nameEl.value.trim();
  const xp = parseInt(xpEl.value.trim(), 10);
  const repeat = repeatEl.value;

  if (!name || isNaN(xp)) return;

  const id = Date.now();
  const newTask = {
    id,
    text: `${name} • ${formatRepeat(repeat)}`,
    xp,
  };

  tasks.push(newTask);
  saveTasks();
}

module.exports = { tasks, saveTasks, loadTasks, formatRepeat, createTask };
