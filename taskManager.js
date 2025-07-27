const tasks = [
  { id: 1, text: "Complete daily routine • 🔁 Daily", xp: 25 },
  { id: 2, text: "Tidy up workspace • 🔁 Daily", xp: 15 },
  { id: 3, text: "Drink 2L water • 🔁 Daily", xp: 10 },
  { id: 4, text: "Finish a new quest • 🔂 Weekly", xp: 25 },
  { id: 5, text: "Read for 20 minutes • 📆 Monthly", xp: 20 }
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
    default:
      return '';
  }
}

function createTask() {
  const nameEl = document.getElementById("taskName");
  const xpEl = document.getElementById("taskXP");
  const repeatEl = document.getElementById("taskRepeat");
  if (!nameEl || !xpEl || !repeatEl) return;

  const name = nameEl.value.trim();
  const xp = parseInt(xpEl.value.trim(), 10);
  const repeat = repeatEl.value;
  if (!name || isNaN(xp)) return;

  const id = Date.now();
  const newTask = { id, text: `${name} • ${formatRepeat(repeat)}`, xp };
  tasks.push(newTask);
  saveTasks();
  if (typeof displayTasks === "function") displayTasks();

  nameEl.value = "";
  xpEl.value = "";
  repeatEl.value = "daily";
  const modal = document.getElementById("taskModal");
  if (modal) modal.classList.add("hidden");
}

const TaskManager = { tasks, saveTasks, loadTasks, formatRepeat, createTask };

if (typeof module !== 'undefined' && module.exports) {
  module.exports = TaskManager;
}
if (typeof window !== 'undefined') {
  window.TaskManager = TaskManager;
}
