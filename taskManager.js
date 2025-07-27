const tasks = [
  { id: 1, text: "Complete daily routine • 🔁 Daily", xp: 25, repeat: 'daily', time: 'morning' },
  { id: 2, text: "Tidy up workspace • 🔁 Daily", xp: 15, repeat: 'daily', time: 'afternoon' },
  { id: 3, text: "Drink 2L water • 🔁 Daily", xp: 10, repeat: 'daily', time: 'evening' },
  { id: 4, text: "Finish a new quest • 🔂 Weekly", xp: 25, repeat: 'weekly', time: 'afternoon' },
  { id: 5, text: "Read for 20 minutes • 📆 Monthly", xp: 20, repeat: 'monthly', time: 'evening' }
];

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
    case 'once':
      return '';
    default:
      return '';
  }
}

function parseNaturalTask(text) {
  const lower = text.toLowerCase();
  let time = 'morning';
  if (lower.includes('afternoon')) time = 'afternoon';
  else if (lower.includes('evening') || lower.includes('night')) time = 'evening';

  let exactTime = '';
  const timeMatch = lower.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);
  if (timeMatch) {
    let h = parseInt(timeMatch[1], 10);
    const m = parseInt(timeMatch[2] || '0', 10);
    const mer = timeMatch[3];
    if (mer) {
      if (mer === 'pm' && h < 12) h += 12;
      if (mer === 'am' && h === 12) h = 0;
    }
    exactTime = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  let date = new Date();
  if (lower.includes('tomorrow')) date.setDate(date.getDate() + 1);
  const dateStr = date.toISOString().split('T')[0];

  const name = text.replace(/\b(today|tomorrow|morning|afternoon|evening|night)\b/gi, '').trim();

  return { name: name || text, time, date: dateStr, exactTime };
}

function createTaskFromText(text) {
  const parsed = parseNaturalTask(text);
  const id = Date.now();
  const xp = 10;
  const newTask = {
    id,
    text: parsed.name,
    xp,
    repeat: 'once',
    time: parsed.time,
    date: parsed.date,
    exactTime: parsed.exactTime,
    reminder: false
  };
  tasks.push(newTask);
  saveTasks();
  if (typeof displayTasks === 'function') displayTasks();
  return newTask;
}

function createTask() {
  const nameEl = document.getElementById("taskName");
  const xpEl = document.getElementById("taskXP");
  const repeatEl = document.getElementById("taskRepeat");
  const timeEl = document.getElementById("taskTime");
  const exactEl = document.getElementById("taskExactTime");
  const reminderEl = document.getElementById("taskReminder");
  const dateEl = document.getElementById("taskDate");
  if (!nameEl || !xpEl || !repeatEl || !timeEl) return;

  const name = nameEl.value.trim();
  const xp = parseInt(xpEl.value.trim(), 10);
  const repeat = repeatEl.value;
  const time = timeEl.value;
  const exactTime = exactEl ? exactEl.value : '';
  const reminder = reminderEl ? reminderEl.checked : false;
  const date = dateEl ? dateEl.value : '';
  if (!name || isNaN(xp)) return;

  const id = Date.now();
  const newTask = { id, text: `${name} • ${formatRepeat(repeat)}`, xp, repeat, time, exactTime, reminder };
  if (repeat === 'once') {
    newTask.date = date || new Date().toISOString().split('T')[0];
  }
  tasks.push(newTask);
  saveTasks();
  if (typeof displayTasks === "function") displayTasks();

  nameEl.value = "";
  xpEl.value = "";
  repeatEl.value = "daily";
  timeEl.value = "morning";
  if (exactEl) exactEl.value = "";
  if (reminderEl) reminderEl.checked = false;
  if (dateEl) dateEl.value = "";
  const modal = document.getElementById("taskModal");
  if (modal) modal.classList.add("hidden");
}

const TaskManager = {
  tasks,
  saveTasks,
  loadTasks,
  formatRepeat,
  createTask,
  parseNaturalTask,
  createTaskFromText
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = TaskManager;
}
if (typeof window !== 'undefined') {
  window.TaskManager = TaskManager;
}
