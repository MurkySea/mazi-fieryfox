// -- CONFIGURATION --
const sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR2wIf1t5R2FnMI5cEcLtz5zDUl584Hi6H-AuvKg5-EJqHXFYLB_JG4XncrjEmQK6lRkYAdZ08MBkX3/pub?output=csv';
const rarityWeights = { "Common": 70, "Rare": 25, "Epic": 5 };
const RANK_UP_THRESHOLD = 3;
const tasks = [
  { id: 1, text: "Complete daily routine", xp: 25 },
  { id: 2, text: "Tidy up workspace", xp: 15 },
  { id: 3, text: "Drink 2L water", xp: 10 },
  { id: 4, text: "Finish a new quest", xp: 25 },
  { id: 5, text: "Read for 20 minutes", xp: 20 }
];
// -- XP/coins progression logic --
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
// Weighted random pick
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
// -- UI display --
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
        list.appendChild(card);
      }
    });
  });
}
// -- TASKS --
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
        // Animate
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
function resetTasksDaily() {
  setCompletedTasks([]);
  displayTasks();
}
// -- Gacha logic --
function performGacha(count) {
  fetchAllCompanions(companions => {
    let prog = getProgress();
    let results = [];
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
      results.push({companion, isNew, stars: prog.stars[name]});
    }
    setProgress(prog);
    displayCompanionsUI();
    showGachaModalMulti(results);
  });
}
function showGachaModal(comp, isNew, stars) {
  const modal = document.getElementById('modal-overlay');
  modal.style.display = 'flex';
  const imgUrl = (comp.ImageURL && comp.ImageURL.startsWith("http")) ? comp.ImageURL.trim() : 'companion_placeholder.png';
  modal.innerHTML = `<div class='modal-card' style="text-align:center;">
    <h2 style="color:${isNew ? '#41c75c' : '#cc9933'}">${isNew ? '🎉 NEW COMPANION!' : 'Duplicate!'}</h2>
    <div class='companion-avatar' style="width:90px;height:90px;margin:auto;background-image:url('${imgUrl}');"></div>
    <h3 style="margin:0.7em 0 0.1em 0">${comp.Name || comp['Companion Name']}</h3>
    <div style="margin-bottom:0.5em;font-size:1.6em">${'⭐️'.repeat(stars)}</div>
    <div class="rarity-badge" style="display:inline-block">${comp.Rarity ? '★ ' + comp.Rarity : ''}</div>
    <p style="margin-top:0.5em">${isNew ? 'Unlocked a new companion!' : `Progression: ${stars} ⭐️`}</p>
    <button class='close-modal'>Close</button>
  </div>`;
  modal.querySelector('.close-modal').focus();
  modal.querySelector('.close-modal').onclick = () => { modal.style.display = 'none'; };
}
function showGachaModalMulti(results) {
  const modal = document.getElementById('modal-overlay');
  modal.style.display = 'flex';
  let html = `<div class='modal-card' style="text-align:center;"><h2>Summon Results</h2>`;
  results.forEach(({companion, isNew, stars}) => {
    const imgUrl = (companion.ImageURL && companion.ImageURL.startsWith("http")) ? companion.ImageURL.trim() : 'companion_placeholder.png';
    html += `
      <div style="display:flex;align-items:center;gap:1em;justify-content:center;margin:1em 0;">
        <div class='companion-avatar' style="width:48px;height:48px;background-image:url('${imgUrl}');"></div>
        <div style="text-align:left;">
          <span style="font-weight:bold">${companion.Name || companion['Companion Name']}</span><br>
          <span style="font-size:1.4em;">${'⭐️'.repeat(stars)}</span>
          <span class="rarity-badge" style="display:inline-block">${companion.Rarity ? '★ ' + companion.Rarity : ''}</span>
          <span style="color:${isNew ? '#41c75c' : '#cc9933'};font-weight:bold;margin-left:0.5em;">${isNew ? 'New!' : 'Dup.'}</span>
        </div>
      </div>`;
  });
  html += `<button class='close-modal'>Close</button></div>`;
  modal.innerHTML = html;
  modal.querySelector('.close-modal').focus();
  modal.querySelector('.close-modal').onclick = () => { modal.style.display = 'none'; };
}
// -- NAVIGATION --
document.addEventListener('DOMContentLoaded', function () {
  // Tabs
  const navButtons = document.querySelectorAll('#bottom-nav button');
  const sections = document.querySelectorAll('.main-section');
  navButtons.forEach(btn => {
    btn.addEventListener('click', function () {
      navButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const secId = btn.dataset.section;
      sections.forEach(sec => sec.classList.remove('active'));
      document.getElementById(secId).classList.add('active');
      if (secId === 'companions-section') displayCompanionsUI();
      if (secId === 'tasks-section') displayTasks();
    });
  });
  // Ripple
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
  // Gacha with coins fix
  document.querySelectorAll('.gacha-button').forEach(btn => {
    btn.addEventListener('click', function() {
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
  // XP bar and coins
  updateXPBar();
  document.getElementById('coinCount').textContent = getCoins();
  // Reset
  document.getElementById('resetBtn').onclick = function() {
    localStorage.removeItem('mazi_gacha_progress');
    localStorage.removeItem('mazi_xp');
    localStorage.removeItem('mazi_coins');
    localStorage.removeItem('mazi_tasks');
    setTimeout(() => location.reload(), 250);
  };
  // First time setup
  ensureInitialUnlock();
  displayTasks();
});