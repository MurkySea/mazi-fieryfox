import { tasks, loadTasks } from './taskData.js';
import { addTask, completeTask, getActiveTasks, getCompletedTasks } from './taskEngine.js';
import { generateQuest } from './aiTasks.js';
import { companions } from './companions.js';

let currentCategory = 'all';

function init() {
  if (typeof document === 'undefined') return;
  loadTasks();
  populateCompanionOptions();
  initFilters();
  render();

  document.getElementById('addQuestBtn').addEventListener('click', () => openModal());
  document.getElementById('aiQuestBtn').addEventListener('click', () => {
    const q = generateQuest();
    openModal(q);
  });
  document.getElementById('cancelQuestBtn').addEventListener('click', closeModal);
  document.getElementById('questForm').addEventListener('submit', saveQuest);
  document.getElementById('questRecurring').addEventListener('change', e => {
    document.getElementById('questRecurrence').classList.toggle('hidden', !e.target.checked);
  });
  updateRewardDisplay();
}

document.addEventListener('DOMContentLoaded', init);

function populateCompanionOptions() {
  const select = document.getElementById('questCompanion');
  Object.values(companions).forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = c.name;
    select.appendChild(opt);
  });
}

function initFilters() {
  const container = document.getElementById('categoryFilters');
  const cats = ['all', 'health', 'productivity', 'relationship', 'discipline'];
  cats.forEach(cat => {
    const btn = document.createElement('button');
    btn.textContent = cat[0].toUpperCase() + cat.slice(1);
    btn.dataset.category = cat;
    if (cat === 'all') btn.classList.add('active');
    btn.addEventListener('click', () => {
      currentCategory = cat;
      container.querySelectorAll('button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      render();
    });
    container.appendChild(btn);
  });
}

function render() {
  const list = document.getElementById('questList');
  const comp = document.getElementById('completedList');
  list.innerHTML = '';
  comp.innerHTML = '';

  const active = getActiveTasks(currentCategory);
  const done = getCompletedTasks();

  active.forEach(task => list.appendChild(createCard(task)));
  done.forEach(task => comp.appendChild(createCard(task, true)));
}

function createCard(task, isCompleted = false) {
  const card = document.createElement('div');
  card.className = 'quest-card' + (isCompleted ? ' completed' : '');
  card.dataset.id = task.id;

  const title = document.createElement('h4');
  title.className = 'quest-title typewriter';
  typeText(title, task.title);

  const desc = document.createElement('p');
  desc.className = 'quest-desc typewriter';
  typeText(desc, task.description);

  const meta = document.createElement('div');
  const badge = document.createElement('span');
  badge.className = 'badge priority-' + task.priority;
  badge.textContent = task.priority;
  meta.appendChild(badge);
  if (task.dueDate) {
    const due = document.createElement('span');
    due.className = 'due-date';
    due.textContent = '🗓 ' + task.dueDate;
    meta.appendChild(due);
  }
  if (task.companionId) {
    const comp = companions[task.companionId];
    if (comp) {
      const cspan = document.createElement('span');
      cspan.textContent = `👥 ${comp.name}`;
      meta.appendChild(cspan);
    }
  }
  card.appendChild(title);
  card.appendChild(desc);
  card.appendChild(meta);

  if (!isCompleted) {
    const btn = document.createElement('button');
    btn.className = 'complete-btn';
    btn.textContent = 'Complete';
    btn.addEventListener('click', () => completeHandler(task, card));
    card.appendChild(btn);
  }
  return card;
}

function completeHandler(task, card) {
  card.classList.add('completed');
  spawnParticles(card);
  const updated = completeTask(task.id);
  if (window.addXP) window.addXP(task.xp);
  if (window.getCoins && window.setCoins) {
    const coins = window.getCoins() + task.coins;
    window.setCoins(coins);
    if (document.getElementById('coinCount'))
      document.getElementById('coinCount').textContent = coins;
  }
  if (window.updateXPBar) window.updateXPBar();
  updateRewardDisplay();
  setTimeout(render, 500);
}

function spawnParticles(card) {
  for (let i = 0; i < 10; i++) {
    const p = document.createElement('span');
    p.className = 'particle';
    const angle = Math.random() * Math.PI * 2;
    const distance = 40 * Math.random();
    p.style.setProperty('--x', Math.cos(angle) * distance + 'px');
    p.style.setProperty('--y', Math.sin(angle) * distance + 'px');
    card.appendChild(p);
    setTimeout(() => p.remove(), 600);
  }
}

function openModal(prefill = null) {
  const modal = document.getElementById('questModal');
  modal.classList.remove('hidden');
  document.getElementById('modalTitle').textContent = prefill ? 'Edit Quest' : 'New Quest';
  document.getElementById('questTitle').value = prefill?.title || '';
  document.getElementById('questDesc').value = prefill?.description || '';
  document.getElementById('questPriority').value = prefill?.priority || 'medium';
  document.getElementById('questCategory').value = prefill?.category || 'health';
  document.getElementById('questDue').value = prefill?.dueDate || '';
  document.getElementById('questRecurring').checked = prefill?.isRecurring || false;
  document.getElementById('questRecurrence').classList.toggle('hidden', !(prefill?.isRecurring));
  document.getElementById('questRecurrence').value = prefill?.recurrence || 'daily';
  document.getElementById('questCompanion').value = prefill?.companionId || '';
  modal.dataset.editId = prefill && prefill.id ? prefill.id : '';
}

function closeModal() {
  const modal = document.getElementById('questModal');
  modal.classList.add('hidden');
  modal.dataset.editId = '';
  document.getElementById('questForm').reset();
  document.getElementById('questRecurrence').classList.add('hidden');
}

function saveQuest(e) {
  e.preventDefault();
  const modal = document.getElementById('questModal');
  const data = {
    title: document.getElementById('questTitle').value.trim(),
    description: document.getElementById('questDesc').value.trim(),
    priority: document.getElementById('questPriority').value,
    category: document.getElementById('questCategory').value,
    dueDate: document.getElementById('questDue').value,
    isRecurring: document.getElementById('questRecurring').checked,
    recurrence: document.getElementById('questRecurrence').value,
    companionId: document.getElementById('questCompanion').value
  };
  addTask(data);
  closeModal();
  render();
}

function updateRewardDisplay() {
  if (window.getXP) {
    document.getElementById('questXP').textContent = window.getXP() + ' XP';
  }
  if (window.getCoins) {
    document.getElementById('questCoins').textContent = window.getCoins() + ' 🪙';
  }
}

function typeText(el, text) {
  el.textContent = '';
  let i = 0;
  const interval = setInterval(() => {
    el.textContent += text.charAt(i);
    i++;
    if (i >= text.length) clearInterval(interval);
  }, 20);
}

export { render };
