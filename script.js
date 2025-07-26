// -- CONFIGURATION --
const sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR2wIf1t5R2FnMI5cEcLtz5zDUl584Hi6H-AuvKg5-EJqHXFYLB_JG4XncrjEmQK6lRkYAdZ08MBkX3/pub?output=csv';
const rarityWeights = { "Common": 70, "Rare": 25, "Epic": 5 };
const RANK_UP_THRESHOLD = 3;
const tasks = [
  { id: 1, text: "Complete daily routine • 🔁 Daily", xp: 25 },
  { id: 2, text: "Tidy up workspace • 🔁 Daily", xp: 15 },
  { id: 3, text: "Drink 2L water • 🔁 Daily", xp: 10 },
  { id: 4, text: "Finish a new quest • 🔂 Weekly", xp: 25 },
  { id: 5, text: "Read for 20 minutes • 📆 Monthly", xp: 20 }
];

function loadTasks() {
  const saved = localStorage.getItem('mazi_custom_tasks');
  if (saved) {
    const parsed = JSON.parse(saved);
    parsed.forEach(t => tasks.push(t));
  }
}

function saveTasks() {
  const custom = tasks.filter(t => t.id >= 1000);
  localStorage.setItem('mazi_custom_tasks', JSON.stringify(custom));
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
      allCompanions = companions;
      if (callback) callback(companions);
    });
}

// -- Progress State --
function getProgress() {
  let prog = JSON.parse(localStorage.getItem('mazi_gacha_progress') || '{}');
  if (!prog.unlocked) prog.unlocked = {};
  if (!prog.stars) prog.stars = {};
  return prog;
}
function setProgress(obj) { localStorage.setItem('mazi_gacha_progress', JSON.stringify(obj)); }

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

        const card = document.createElement('div');
        card.className = `companion-card ${rarity}`;
        card.innerHTML = `
          <div class="companion-avatar" style="background-image: url('${imgUrl}');"></div>
          <div>
            <span>${name}</span>
            <div style="margin: 0.25em 0 0.3em 0">${stars}</div>
            <span class="rarity-badge">${rarity ? '★ ' + comp.Rarity : ''}</span>
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
  document.getElementById("companionModal").classList.remove("hidden");
}

function hideCard() {
  document.getElementById("companionModal").classList.add("hidden");
}

// -- Task Display and Logic --
function displayTasks() {
  const container = document.getElementById('taskList');
  if (!container) return;

  container.innerHTML = '';
  const completed = getCompletedTasks();

  tasks.forEach(t => {
    const div = document.createElement('div');
    div.className = 'task-card' + (completed.includes(t.id) ? ' completed' : '');
    div.innerHTML = `${t.text} <span class="task-xp">+${t.xp} XP</span>`;
    div.onclick = () => {
      if (!completed.includes(t.id)) {
        completed.push(t.id);
        setCompletedTasks(completed);
        div.classList.add('completed');
        addXP(t.xp);
      }
    };
    container.appendChild(div);
  });
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
}

// -- Create Task Logic --
document.getElementById("addTaskBtn").addEventListener("click", () => {
  document.getElementById("taskModal").classList.remove("hidden");
});

function hideTaskModal() {
  document.getElementById("taskModal").classList.add("hidden");
}

function createTask() {
  const name = document.getElementById("taskName").value.trim();
  const xp = parseInt(document.getElementById("taskXP").value.trim(), 10);
  const repeat = document.getElementById("taskRepeat").value;

  if (!name || isNaN(xp)) return;

  const id = Date.now(); // Unique timestamp-based ID
  const newTask = {
    id,
    text: `${name} • ${formatRepeat(repeat)}`,
    xp
  };

  tasks.push(newTask);
  saveTasks();
  displayTasks();

  document.getElementById("taskName").value = "";
  document.getElementById("taskXP").value = "";
  document.getElementById("taskRepeat").value = "daily";
  document.getElementById("taskModal").classList.add("hidden");
}

function formatRepeat(type) {
  switch (type) {
    case "daily": return "🔁 Daily";
    case "weekly": return "🔂 Weekly";
    case "monthly": return "📆 Monthly";
    default: return "";
  }
}

// -- INIT --
document.addEventListener('DOMContentLoaded', function () {
  loadTasks();
  ensureInitialUnlock();
  displayTasks();
  updateXPBar();
  document.getElementById('coinCount').textContent = getCoins();
});
