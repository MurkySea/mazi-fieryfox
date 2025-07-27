// -- CONFIGURATION --
const sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR2wIf1t5R2FnMI5cEcLtz5zDUl584Hi6H-AuvKg5-EJqHXFYLB_JG4XncrjEmQK6lRkYAdZ08MBkX3/pub?output=csv';
const rarityWeights = { "Common": 70, "Rare": 25, "Epic": 5 };
const RANK_UP_THRESHOLD = 3;
const itemPool = ['Potion', 'Elixir', 'Revive'];

let tasks = [];
let loadTasks = () => {};
let saveTasks = () => {};
let createTask = () => {};
let formatRepeat = () => '';
if (typeof window !== 'undefined' && window.TaskManager) {
  ({ tasks, loadTasks, saveTasks, createTask, formatRepeat } = window.TaskManager);
  window.createTask = createTask;
}

// -- XP / Coin Progression --
function getXP() { return parseInt(localStorage.getItem('mazi_xp') || '0'); }
function setXP(xp) { localStorage.setItem('mazi_xp', xp); }
function getCoins() { return parseInt(localStorage.getItem('mazi_coins') || '120'); }
function setCoins(c) { localStorage.setItem('mazi_coins', c); }
function getCompletedTasks() {
  const t = localStorage.getItem('mazi_tasks');
  return t ? JSON.parse(t) : [];
}
function setCompletedTasks(arr) {
  localStorage.setItem('mazi_tasks', JSON.stringify(arr));
}

// -- Companion Data & Selection --
function weightedRandomPick(items, weights) {
  let total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    if (r < weights[i]) return items[i];
    r -= weights[i];
  }
  return items[items.length - 1];
}

function pickRandomByRarity(companions) {
  const weightList = companions.map(c => rarityWeights[c.Rarity?.trim() || 'Common'] || 1);
  return weightedRandomPick(companions, weightList);
}

let allCompanions = [];

function fetchAllCompanions(callback) {
  fetch(sheetUrl)
    .then(res => res.text())
    .then(csvText => {
      const rows = csvText.trim().split('\n').map(r => r.split(','));
      const [header, ...data] = rows;
      const companions = data.map(row => {
        const obj = {};
        header.forEach((col, i) => obj[col.trim()] = row[i] || '');
        return obj;
      });
      const custom = JSON.parse(localStorage.getItem('mazi_custom_companions') || '[]');
      allCompanions = companions.concat(custom);
      if (callback) callback(allCompanions);
    });
}

// -- Progress State --
function getProgress() {
  let prog = JSON.parse(localStorage.getItem('mazi_gacha_progress') || '{}');
  if (!prog.unlocked) prog.unlocked = {};
  if (!prog.stars) prog.stars = {};
  if (!prog.bonds) prog.bonds = {};
  return prog;
}
function setProgress(obj) { localStorage.setItem('mazi_gacha_progress', JSON.stringify(obj)); }

// -- Inventory State --
function getInventory() {
  return JSON.parse(localStorage.getItem('mazi_inventory') || '{}');
}

function setInventory(inv) {
  localStorage.setItem('mazi_inventory', JSON.stringify(inv));
}

function addItem(name, qty = 1) {
  const inv = getInventory();
  inv[name] = (inv[name] || 0) + qty;
  setInventory(inv);
  displayInventory();
}

function displayInventory() {
  const container = document.getElementById('inventoryList');
  if (!container) return;
  const inv = getInventory();
  container.innerHTML = '';
  Object.entries(inv).forEach(([item, count]) => {
    const div = document.createElement('div');
    div.textContent = `${item} x${count}`;
    container.appendChild(div);
  });
}

function ensureInitialUnlock() {
  fetchAllCompanions((companions) => {
    let prog = getProgress();
    if (Object.keys(prog.unlocked).length === 0) {
      const first = pickRandomByRarity(companions);
      const name = first.Name || first['Companion Name'];
      prog.unlocked[name] = true;
      prog.stars[name] = 1;
      setProgress(prog);
      showGachaModal(first, true, 1);
    }
    displayCompanionsUI();
  });
}

// -- Companion List Display --
function displayCompanionsUI() {
  const list = document.querySelector('.companion-list');
  if (!list) return;
  list.innerHTML = '';
  fetchAllCompanions(companions => {
    let prog = getProgress();
    companions.forEach(comp => {
      let name = comp.Name || comp['Companion Name'];
      if (prog.unlocked[name]) {
        const rarity = (comp.Rarity || '').toLowerCase();
        const imgUrl = (comp.ImageURL && comp.ImageURL.startsWith("http")) ? comp.ImageURL.trim() : 'companion_placeholder.png';
        const starCount = prog.stars[name] || 1;
        const stars = '⭐️'.repeat(starCount);
        const bondLevel = prog.bonds[name] || 0;

        const card = document.createElement('div');
        card.className = `companion-card ${rarity}`;
        card.innerHTML = `
          <div class="companion-avatar" style="background-image: url('${imgUrl}');"></div>
          <div>
            <span>${name}</span>
            <div style="margin: 0.25em 0 0.3em 0">${stars}</div>
            <span class="rarity-badge">${rarity ? '★ ' + comp.Rarity : ''}</span>
            <div class="bond-level">Bond Lv ${bondLevel}</div>
          </div>
        `;
        card.addEventListener('click', () => {
          showCardFromData(comp, starCount);
        });

        list.appendChild(card);
      }
    });
  });
}

// -- Companion Card Modal Logic --
function showCardFromData(comp, stars = 1) {
  document.getElementById("cardImg").src = (comp.ImageURL && comp.ImageURL.startsWith("http")) ? comp.ImageURL.trim() : 'companion_placeholder.png';
  document.getElementById("cardName").textContent = comp.Name || comp['Companion Name'];
  document.getElementById("cardTitle").textContent = comp.Title || comp['Title'] || '';
  document.getElementById("cardBio").textContent = comp.Bio || comp['Bio'] || '';
  const prog = getProgress();
  const name = comp.Name || comp['Companion Name'];
  const bondLevel = prog.bonds[name] || 0;
  const bondEl = document.getElementById("cardBond");
  if (bondEl) bondEl.textContent = `Bond Lv ${bondLevel}`;
  document.getElementById("companionModal").classList.remove("hidden");
}

function hideCard() {
  document.getElementById("companionModal").classList.add("hidden");
}

function performGacha(count) {
  fetchAllCompanions(companions => {
    let prog = getProgress();
    let results = [];
    let gainedItems = [];
    for (let i = 0; i < count; i++) {
      const companion = pickRandomByRarity(companions);
      let name = companion.Name || companion['Companion Name'];
      let isNew = !prog.unlocked[name];
      if (isNew) {
        prog.unlocked[name] = true;
        prog.stars[name] = 1;
      } else {
        prog.stars[name] = (prog.stars[name] || 1) + 1;
      }
      results.push({ companion, isNew, stars: prog.stars[name] });

      if (Math.random() < 0.3) {
        const item = itemPool[Math.floor(Math.random() * itemPool.length)];
        addItem(item, 1);
        gainedItems.push(item);
      }
    }
    setProgress(prog);
    displayCompanionsUI();
    showGachaModalMulti(results, gainedItems);
  });
}

function showGachaModal(comp, isNew, stars) {
  const modal = document.getElementById('modal-overlay');
  modal.style.display = 'flex';
  const imgUrl = (comp.ImageURL && comp.ImageURL.startsWith("http")) ? comp.ImageURL.trim() : 'companion_placeholder.png';
  modal.innerHTML = `<div class='modal-card' style="text-align:center;">
    <h2 style="color:${isNew ? '#41c75c' : '#cc9933'}">${isNew ? '🎉 NEW COMPANION!' : 'Duplicate!'}</h2>
    <div class='companion-avatar' style="width:90px;height:90px;margin:auto;background-image:url('${imgUrl}');"></div>
    <h3 style="margin:0.7em 0 0.1em 0">${comp.Name}</h3>
    <div style="margin-bottom:0.5em;font-size:1.6em">${'⭐️'.repeat(stars)}</div>
    <div class="rarity-badge">${comp.Rarity ? '★ ' + comp.Rarity : ''}</div>
    <p>${isNew ? 'Unlocked a new companion!' : `Progression: ${stars} ⭐️`}</p>
    <button class='close-modal'>Close</button>
  </div>`;
  modal.querySelector('.close-modal').onclick = () => { modal.style.display = 'none'; };
}

function showGachaModalMulti(results, items = []) {
  const modal = document.getElementById('modal-overlay');
  modal.style.display = 'flex';
  let html = `<div class='modal-card' style="text-align:center;"><h2>Summon Results</h2>`;
  results.forEach(({ companion, isNew, stars }) => {
    const imgUrl = (companion.ImageURL && companion.ImageURL.startsWith("http")) ? companion.ImageURL.trim() : 'companion_placeholder.png';
    html += `
      <div style="display:flex;align-items:center;gap:1em;justify-content:center;margin:1em 0;">
        <div class='companion-avatar' style="width:48px;height:48px;background-image:url('${imgUrl}');"></div>
        <div style="text-align:left;">
          <span style="font-weight:bold">${companion.Name}</span><br>
          <span style="font-size:1.4em;">${'⭐️'.repeat(stars)}</span>
          <span class="rarity-badge">${companion.Rarity ? '★ ' + companion.Rarity : ''}</span>
          <span style="color:${isNew ? '#41c75c' : '#cc9933'};font-weight:bold;margin-left:0.5em;">${isNew ? 'New!' : 'Dup.'}</span>
        </div>
      </div>`;
  });
  if (items.length) {
    html += `<div style="margin-top:1em">Items: ${items.join(', ')}</div>`;
  }
  html += `<button class='close-modal'>Close</button></div>`;
  modal.innerHTML = html;
  modal.querySelector('.close-modal').onclick = () => { modal.style.display = 'none'; };
}

function displayTasks() {
  const container = document.getElementById('taskList');
  if (!container) return;

  container.innerHTML = '';
  const completed = getCompletedTasks();

  tasks.forEach(t => {
    if (!shouldShowTaskToday(t)) return;

    const div = document.createElement('div');
    div.className = 'task-card' + (completed.includes(t.id) ? ' completed' : '');
    const textSpan = document.createElement('span');
    textSpan.textContent = t.text;
    const xpSpan = document.createElement('span');
    xpSpan.className = 'task-xp';
    xpSpan.textContent = `+${t.xp} XP`;
    div.appendChild(textSpan);
    div.appendChild(xpSpan);
    div.onclick = () => {
      if (!completed.includes(t.id)) {
        completed.push(t.id);
        setCompletedTasks(completed);
        div.classList.add('completed');
        addXP(t.xp);
        handleTaskCompletion();
      }
    };
    container.appendChild(div);
  });
}

function shouldShowTaskToday(task, today = new Date()) {
  const rep = task.repeat || 'daily';
  switch (rep) {
    case 'daily':
      return true;
    case 'weekly':
      return today.getDay() === 1; // Monday
    case 'monthly':
      return today.getDate() === 1;
    default:
      return true;
  }
}

function addXP(xp) {
  let cur = getXP();
  let newXP = cur + xp;
  setXP(newXP);
  updateXPBar();
}

function updateXPBar() {
  const bar = document.getElementById('xpFill');
  if (!bar) return;
  const xp = getXP();
  const pct = Math.min(100, (xp % 100));
  bar.style.width = pct + '%';

  const levelEl = document.getElementById('playerLevel');
  if (levelEl) {
    const level = Math.floor(xp / 100) + 1;
    levelEl.textContent = level;
  }
}

function updateMilestoneDisplay() {
  const span = document.getElementById('taskMilestone');
  if (span) {
    const count = parseInt(localStorage.getItem('mazi_total_tasks_completed') || '0');
    span.textContent = count;
  }
}

function increaseRandomCompanionBond() {
  const prog = getProgress();
  const names = Object.keys(prog.unlocked);
  if (names.length) {
    const name = names[Math.floor(Math.random() * names.length)];
    prog.bonds[name] = (prog.bonds[name] || 0) + 1;
    setProgress(prog);
  }
}

function handleTaskCompletion() {
  let count = parseInt(localStorage.getItem('mazi_total_tasks_completed') || '0');
  count += 1;
  localStorage.setItem('mazi_total_tasks_completed', count);
  increaseRandomCompanionBond();
  if (document.querySelector('.companion-list')) {
    displayCompanionsUI();
  }
  if (count % 10 === 0) {
    const bonus = 20;
    setCoins(getCoins() + bonus);
    alert(`Milestone! ${count} tasks completed. +${bonus} coins`);
    const coinEl = document.getElementById('coinCount');
    if (coinEl) coinEl.textContent = getCoins();
  }
  updateMilestoneDisplay();
}

// -- Create Task Logic --
function hideTaskModal() {
  document.getElementById("taskModal").classList.add("hidden");
}

function applyDarkMode(enabled) {
  document.body.classList.toggle('dark-mode', enabled);
  const toggleBtn = document.getElementById('darkModeToggle');
  if (toggleBtn) {
    toggleBtn.textContent = enabled ? '☀️ Light Mode' : '🌙 Dark Mode';
  }
  localStorage.setItem('mazi_dark_mode', enabled);
}

function initDarkMode() {
  const enabled = localStorage.getItem('mazi_dark_mode') === 'true';
  applyDarkMode(enabled);
  const toggleBtn = document.getElementById('darkModeToggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      applyDarkMode(!document.body.classList.contains('dark-mode'));
    });
  }
}


const companionBonds = {
  selene: { name: "Selene Graytail", bond: 0 },
  nyx: { name: "Nyx Shadowtail", bond: 0 },
  lilith: { name: "Lilith Flamesworn", bond: 0 },
  felina: { name: "Felina Moonshade", bond: 0 },
};

const bondQuotes = {
  selene: [
    "You've been amazing lately... want to slip away and watch the stars with me?",
    "You always make me feel safe... and maybe a little hot under the collar too.",
    "Your dedication turns me on more than I’d like to admit."
  ],
  nyx: [
    "Keep looking at me like that and I might do something reckless.",
    "You’ve earned more than a reward tonight… how about a little mischief?",
    "I might be your shadow, but I’d rather be your secret."
  ],
  lilith: [
    "Power is seductive… but you're dangerously addictive.",
    "Burning passion suits you... want me to show you how I really feel?",
    "If you keep this up, I won’t behave myself."
  ],
  felina: [
    "You're the calm to my storm. Want to curl up together and purr?",
    "Soft touches… long nights… I could get used to this.",
    "Your gentle side drives me wild."
  ]
};

// -- Chatting with Companions --
async function sendMessageToChatGPT(companionId, message) {
  const apiKey = localStorage.getItem('openaiKey');
  if (!apiKey) {
    alert('OpenAI API key not found');
    return '';
  }

  const compData = companionBonds[companionId] || { name: companionId };
  const persona = `You are ${compData.name}, a companion in the MaZi FieryFox RPG. Respond concisely and stay in character.`;

  const payload = {
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: persona },
      { role: 'user', content: message }
    ]
  };

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || '';
  } catch (err) {
    console.error(err);
    return '';
  }
}

async function generateQuestWithAI() {
  const apiKey = localStorage.getItem('openaiKey');
  if (!apiKey) {
    alert('OpenAI API key not found');
    return;
  }
  const prompt = 'Create a short quest description for a fantasy RPG in one sentence.';
  const payload = {
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }]
  };
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content?.trim();
    if (text) {
      const id = Date.now();
      tasks.push({ id, text, xp: 20 });
      saveTasks();
      displayTasks();
    }
  } catch (err) {
    console.error(err);
  }
}

async function generateCompanionWithAI() {
  const apiKey = localStorage.getItem('openaiKey');
  if (!apiKey) {
    alert('OpenAI API key not found');
    return;
  }
  const prompt = 'Create a JSON object with Name, Title, Bio, Personality for a new fantasy companion.';
  const payload = {
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }]
  };
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    let text = data.choices?.[0]?.message?.content?.trim() || '{}';
    text = text.replace(/```json|```/g, '');
    const comp = JSON.parse(text);
    comp.ImageURL = 'companion_placeholder.png';
    comp.Rarity = 'Epic';
    const custom = JSON.parse(localStorage.getItem('mazi_custom_companions') || '[]');
    custom.push(comp);
    localStorage.setItem('mazi_custom_companions', JSON.stringify(custom));
    fetchAllCompanions(() => {});
    let prog = getProgress();
    prog.unlocked[comp.Name] = true;
    prog.stars[comp.Name] = 1;
    setProgress(prog);
    displayCompanionsUI();
    showGachaModal(comp, true, 1);
  } catch (err) {
    console.error(err);
  }
}


function increaseBond(companionId, amount = 1) {
  if (!companionBonds[companionId]) return;

  companionBonds[companionId].bond += amount;

  if (companionBonds[companionId].bond % 10 === 0) {
    triggerBondEvent(companionId);
  }
}

function triggerBondEvent(companionId) {
  const companion = companionBonds[companionId];
  const name = companion.name;
  const imagePath = `images/${companionId}.png`;
  const quotePool = bondQuotes[companionId] || ["You’re amazing."];

  const randomQuote = quotePool[Math.floor(Math.random() * quotePool.length)];

  document.getElementById("bondPortrait").src = imagePath;
  document.getElementById("bondName").textContent = name;
  document.getElementById("bondDialogue").textContent = randomQuote;

  document.getElementById("bondEventModal").classList.remove("hidden");
}

function closeBondModal() {
  document.getElementById("bondEventModal").classList.add("hidden");
}

let currentChatCompanion = null;
let chatLogs = JSON.parse(localStorage.getItem('mazi_chat_logs') || '{}');

function displayChatMenu() {
  const menu = document.getElementById('chatMenu');
  const windowEl = document.getElementById('chatWindow');
  if (!menu || !windowEl) return;
  menu.style.display = 'block';
  windowEl.classList.add('hidden');
  menu.innerHTML = '';
  fetchAllCompanions(comps => {
    const prog = getProgress();
    const unlocked = comps.filter(c => prog.unlocked[c.Name || c['Companion Name']]);
    if (unlocked.length === 0) {
      menu.textContent = 'No companions unlocked yet.';
      return;
    }
    unlocked.forEach(c => {
      const name = c.Name || c['Companion Name'];
      const log = chatLogs[name] || [];
      const preview = log.length ? log[log.length - 1].t : '';
      const imgUrl = (c.ImageURL && c.ImageURL.startsWith('http')) ? c.ImageURL.trim() : 'companion_placeholder.png';
      const div = document.createElement('div');
      div.className = 'chat-contact';
      div.innerHTML = `
        <div class="chat-avatar" style="background-image:url('${imgUrl}')"></div>
        <div class="contact-info">
          <span class="contact-name">${name}</span>
          <span class="contact-preview">${preview}</span>
        </div>`;
      div.onclick = () => openChat(c);
      menu.appendChild(div);
    });
  });
}

function openChat(comp) {
  currentChatCompanion = comp;
  const menu = document.getElementById('chatMenu');
  const windowEl = document.getElementById('chatWindow');
  const history = document.getElementById('chatHistory');
  if (!menu || !windowEl || !history) return;
  menu.style.display = 'none';
  windowEl.classList.remove('hidden');
  history.innerHTML = '';
  const key = comp.Name || comp['Companion Name'];
  const log = chatLogs[key] || [];
  if (log.length === 0) {
    const greet = `Hello, I'm ${comp.Name}. ${comp.Personality}`;
    log.push({ s: comp.Name, t: greet });
  }
  log.forEach(entry => addChatMessage(entry.s, entry.t));
}

function closeChat() {
  const menu = document.getElementById('chatMenu');
  const windowEl = document.getElementById('chatWindow');
  if (currentChatCompanion) {
    const key = currentChatCompanion.Name || currentChatCompanion['Companion Name'];
    chatLogs[key] = Array.from(document.querySelectorAll('#chatHistory .chat-msg')).map(el => ({
      s: el.classList.contains('from-player') ? 'You' : key,
      t: el.textContent
    }));
    localStorage.setItem('mazi_chat_logs', JSON.stringify(chatLogs));
  }
  currentChatCompanion = null;
  if (menu) menu.style.display = 'block';
  if (windowEl) windowEl.classList.add('hidden');
}

function addChatMessage(sender, text) {
  const history = document.getElementById('chatHistory');
  if (!history) return;
  const div = document.createElement('div');
  div.className = 'chat-msg ' + (sender === 'You' ? 'from-player' : 'from-companion');
  div.textContent = text;
  history.appendChild(div);
  history.scrollTop = history.scrollHeight;
  if (currentChatCompanion) {
    const key = currentChatCompanion.Name || currentChatCompanion['Companion Name'];
    if (!chatLogs[key]) chatLogs[key] = [];
    chatLogs[key].push({ s: sender, t: text });
  }
}

function generateChatReply(comp) {
  const pers = comp.Personality || '';
  const traits = comp['Character Traits'] || comp.CharacterTraits || '';
  const opts = [
    `As someone who's ${pers.toLowerCase()}, I can relate.`,
    `My ${traits.toLowerCase()} often help in times like these.`,
    `I'm feeling ${pers.split(',')[0].toLowerCase()} today.`,
    `Those ${traits.split(',')[0].toLowerCase()} skills might come in handy.`
  ];
  return opts[Math.floor(Math.random() * opts.length)];
}

function sendChat() {
  const input = document.getElementById('chatInput');
  if (!input) return;
  const msg = input.value.trim();
  if (!msg) return;
  addChatMessage('You', msg);
  input.value = '';
  if (currentChatCompanion) {
    const reply = generateChatReply(currentChatCompanion);
    setTimeout(() => {
      addChatMessage(currentChatCompanion.Name, reply);
      localStorage.setItem('mazi_chat_logs', JSON.stringify(chatLogs));
    }, 500);
  }
}

function init() {
  const nav = document.getElementById('bottom-nav');
  const sections = document.querySelectorAll('.main-section');

  nav.addEventListener('click', e => {
    const btn = e.target.closest('button[data-section]');
    if (!btn) return;

    nav.querySelectorAll('button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const secId = btn.dataset.section;
    sections.forEach(sec => {
      sec.classList.toggle('active', sec.id === secId);
    });

    if (secId === 'companions-section') displayCompanionsUI();
    if (secId === 'tasks-section') displayTasks();
    if (secId === 'chat-section') displayChatMenu();
    if (secId === 'inventory-section') displayInventory();
  });

  // Ripple effect
  document.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', function (e) {
      let circle = document.createElement('span');
      circle.className = 'ripple';
      let rect = btn.getBoundingClientRect();
      circle.style.left = (e.clientX - rect.left) + 'px';
      circle.style.top = (e.clientY - rect.top) + 'px';
      btn.appendChild(circle);
      setTimeout(() => circle.remove(), 700);
    });
  });

  // Gacha buttons
  document.querySelectorAll('.gacha-button').forEach(btn => {
    btn.addEventListener('click', function () {
      const cnt = parseInt(btn.getAttribute('data-count'), 10) || 1;
      const cost = cnt * 10;
      let coins = getCoins();
      if (coins < cost) {
        alert("Not enough coins!");
        return;
      }
      setCoins(coins - cost);
      document.getElementById('coinCount').textContent = getCoins();
      performGacha(cnt);
    });
  });

  const questBtn = document.getElementById('generateQuestBtn');
  if (questBtn) questBtn.addEventListener('click', generateQuestWithAI);

  const compBtn = document.getElementById('generateCompanionBtn');
  if (compBtn) compBtn.addEventListener('click', generateCompanionWithAI);

  // Chat send button
  // Add Task Button
  document.getElementById("addTaskBtn").addEventListener("click", () => {
    document.getElementById("taskModal").classList.remove("hidden");
  });

  const sendBtn = document.getElementById('sendChatBtn');
  const closeBtn = document.getElementById('closeChatBtn');
  if (sendBtn) sendBtn.addEventListener('click', sendChat);
  if (closeBtn) closeBtn.addEventListener('click', closeChat);
  const chatInput = document.getElementById('chatInput');
  if (chatInput) chatInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendChat();
    }
  });

  // Reset Button
  document.getElementById('resetBtn').onclick = function () {
    localStorage.removeItem('mazi_gacha_progress');
    localStorage.removeItem('mazi_xp');
    localStorage.removeItem('mazi_coins');
    localStorage.removeItem('mazi_tasks');
    localStorage.removeItem('mazi_custom_tasks');
    setTimeout(() => location.reload(), 250);
  };

  // Initial setup
  loadTasks();               // Load saved custom tasks
  ensureInitialUnlock();     // Unlock a starting companion
  initDarkMode();            // Apply saved theme
  updateXPBar();             // Fill XP bar
  updateMilestoneDisplay();  // Show completed tasks
  document.getElementById('coinCount').textContent = getCoins(); // Init coins
  displayTasks();            // Display tasks
  displayChatMenu();         // Prepare chat menu
  displayInventory();        // Show inventory
}

if (typeof window !== 'undefined' && document.getElementById('bottom-nav')) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}

if (typeof module !== 'undefined') {
  module.exports = { addItem, getInventory, shouldShowTaskToday };
}
