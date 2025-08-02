export const TASKS_KEY = 'quest_tasks';
export const tasks = [];

export function loadTasks() {
  if (typeof localStorage === 'undefined') return;
  const raw = localStorage.getItem(TASKS_KEY);
  const data = raw ? JSON.parse(raw) : [];
  tasks.splice(0, tasks.length, ...data);
}

export function saveTasks() {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

export function createTask(data) {
  const rewardTable = {
    high: { xp: 30, coins: 3 },
    medium: { xp: 20, coins: 2 },
    low: { xp: 10, coins: 1 }
  };
  const rewards = rewardTable[data.priority] || rewardTable.low;
  return {
    id: Date.now(),
    title: data.title,
    description: data.description || '',
    priority: data.priority || 'low',
    category: data.category || 'general',
    dueDate: data.dueDate || '',
    completed: false,
    isRecurring: data.isRecurring || false,
    recurrence: data.recurrence || null,
    companionId: data.companionId || '',
    xp: rewards.xp,
    coins: rewards.coins
  };
}
