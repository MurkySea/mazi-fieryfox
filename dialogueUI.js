import { getCompanion } from './companions.js';
import { fetchAIResponse } from './dialogueEngine.js';

const modal = document.getElementById('dialogueModal');
const historyEl = document.getElementById('dialogueHistory');
const nameEl = document.getElementById('dialogueCompanionName');
const textArea = document.getElementById('playerMessage');
const promptsEl = document.getElementById('promptButtons');
const sendBtn = document.getElementById('sendDialogueBtn');
const closeBtn = document.getElementById('closeDialogueBtn');

const PROMPTS = [
  'Ask about her past',
  'Say something flirty',
  'Invite her on an adventure'
];

let currentId = null;
let history = [];

function renderPrompts() {
  promptsEl.innerHTML = '';
  PROMPTS.forEach(p => {
    const btn = document.createElement('button');
    btn.className = 'prompt-btn';
    btn.textContent = p;
    btn.addEventListener('click', () => {
      sendMessage(p);
    });
    promptsEl.appendChild(btn);
  });
}

function loadHistory(id) {
  return JSON.parse(localStorage.getItem(`dialogue_history_${id}`) || '[]');
}

function saveHistory(id) {
  localStorage.setItem(`dialogue_history_${id}`, JSON.stringify(history.slice(-5)));
}

function renderHistory() {
  historyEl.innerHTML = '';
  const comp = getCompanion(currentId);
  history.forEach(pair => {
    const p1 = document.createElement('p');
    p1.textContent = `You: ${pair.player}`;
    historyEl.appendChild(p1);
    const p2 = document.createElement('p');
    p2.textContent = `${comp.name}: ${pair.ai}`;
    historyEl.appendChild(p2);
  });
}

async function sendMessage(msg) {
  if (!msg || !currentId) return;
  const reply = await fetchAIResponse(currentId, msg);
  history.push({ player: msg, ai: reply });
  if (history.length > 5) history.shift();
  saveHistory(currentId);
  renderHistory();
}

export function openDialogueModal(id) {
  const comp = getCompanion(id);
  if (!comp) return;
  currentId = id;
  nameEl.textContent = comp.name;
  history = loadHistory(id);
  renderPrompts();
  renderHistory();
  modal.classList.remove('hidden');
}

function closeDialogueModal() {
  modal.classList.add('hidden');
}

sendBtn.addEventListener('click', () => {
  const msg = textArea.value.trim();
  textArea.value = '';
  sendMessage(msg);
});

closeBtn.addEventListener('click', closeDialogueModal);

window.openDialogueModal = openDialogueModal;
