import { tasks, saveTasks, createTask } from './taskData.js';
import { addRecentEvent } from './companions.js';

export function addTask(data) {
  const task = createTask(data);
  tasks.push(task);
  saveTasks();
  return task;
}

export function completeTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return null;
  if (task.isRecurring && task.recurrence) {
    const d = task.dueDate ? new Date(task.dueDate) : new Date();
    if (task.recurrence === 'daily') d.setDate(d.getDate() + 1);
    else if (task.recurrence === 'weekly') d.setDate(d.getDate() + 7);
    else if (task.recurrence === 'monthly') d.setMonth(d.getMonth() + 1);
    task.dueDate = d.toISOString().split('T')[0];
  } else {
    task.completed = true;
    if (task.companionId) {
      addRecentEvent(task.companionId, `Guided you through "${task.title}"`);
    }
  }
  saveTasks();
  return task;
}

export function assignCompanion(id, companionId) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  task.companionId = companionId;
  saveTasks();
}

export function getActiveTasks(category = 'all') {
  let list = tasks.filter(t => !t.completed);
  if (category !== 'all') list = list.filter(t => t.category === category);
  return sortTasks(list);
}

export function getCompletedTasks() {
  return tasks.filter(t => t.completed);
}

export function sortTasks(list) {
  const order = { high: 0, medium: 1, low: 2 };
  return list.sort((a, b) => order[a.priority] - order[b.priority]);
}
