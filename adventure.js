const storyNodes = {
  start: {
    text: 'You stand at the entrance of a forgotten dungeon. Paths lead north and east.',
    choices: [
      { text: 'Go North', next: 'goblinFight' },
      { text: 'Go East', next: 'treasureRoom' }
    ]
  },
  goblinFight: {
    text: 'A goblin leaps from the shadows!',
    combat: { enemy: 'Goblin', hp: 5 },
    next: 'crossroads'
  },
  treasureRoom: {
    text: 'You find a small chest of coins. +10 coins.',
    effect: () => { if (typeof setCoins === 'function' && typeof getCoins === 'function') { setCoins(getCoins() + 10); const coinEl = document.getElementById('coinCount'); if (coinEl) coinEl.textContent = getCoins(); } },
    choices: [ { text: 'Continue', next: 'crossroads' } ]
  },
  crossroads: {
    text: 'Two ancient doors stand before you.',
    choices: [
      { text: 'Left Door', next: 'orcFight' },
      { text: 'Right Door', next: 'exit' }
    ]
  },
  orcFight: {
    text: 'A towering orc blocks your way!',
    combat: { enemy: 'Orc', hp: 8 },
    next: 'exit'
  },
  exit: {
    text: 'Sunlight pours in as you escape victorious!',
    choices: [ { text: 'Restart Adventure', next: 'start' } ]
  }
};

let currentNode = 'start';
let playerHP = 10;
let enemyHP = 0;
let nextAfterCombat = null;

function showNode(id) {
  currentNode = id;
  const node = storyNodes[id];
  const textEl = document.getElementById('storyText');
  const choiceEl = document.getElementById('choiceButtons');
  const combatEl = document.getElementById('combatUI');
  if (!node || !textEl || !choiceEl || !combatEl) return;
  textEl.textContent = node.text;
  choiceEl.innerHTML = '';
  if (node.effect) node.effect();
  if (node.combat) {
    nextAfterCombat = node.next;
    startCombat(node.combat);
    return;
  }
  combatEl.classList.add('hidden');
  node.choices.forEach(opt => {
    const btn = document.createElement('button');
    btn.textContent = opt.text;
    btn.onclick = () => showNode(opt.next);
    choiceEl.appendChild(btn);
  });
}

function startCombat(info) {
  enemyHP = info.hp;
  const combatEl = document.getElementById('combatUI');
  const playerHpEl = document.getElementById('playerHpDisplay');
  const enemyHpEl = document.getElementById('enemyHpDisplay');
  const attackBtn = document.getElementById('attackBtn');
  if (!combatEl || !playerHpEl || !enemyHpEl || !attackBtn) return;
  playerHpEl.textContent = playerHP;
  enemyHpEl.textContent = enemyHP;
  combatEl.classList.remove('hidden');
  attackBtn.onclick = () => {
    enemyHP -= Math.ceil(Math.random() * 3);
    if (enemyHP < 0) enemyHP = 0;
    enemyHpEl.textContent = enemyHP;
    if (enemyHP <= 0) {
      combatEl.classList.add('hidden');
      showNode(nextAfterCombat);
      return;
    }
    playerHP -= Math.ceil(Math.random() * 2);
    if (playerHP < 0) playerHP = 0;
    playerHpEl.textContent = playerHP;
    if (playerHP <= 0) {
      combatEl.classList.add('hidden');
      const choiceEl = document.getElementById('choiceButtons');
      const textEl = document.getElementById('storyText');
      if (textEl) textEl.textContent = `You were defeated by the ${info.enemy}!`;
      if (choiceEl) {
        choiceEl.innerHTML = '';
        const btn = document.createElement('button');
        btn.textContent = 'Restart';
        btn.onclick = startAdventure;
        choiceEl.appendChild(btn);
      }
    }
  };
}

function startAdventure() {
  playerHP = 10;
  showNode('start');
}

async function generateStoryWithAI() {
  const prompt = 'Write a short two sentence hook for a fantasy adventure.';
  const payload = {
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }]
  };
  const data = await callOpenAI('chat/completions', payload);
  const text = data?.choices?.[0]?.message?.content?.trim();
  if (text) {
    const storyEl = document.getElementById('storyText');
    const choiceEl = document.getElementById('choiceButtons');
    if (storyEl) storyEl.textContent = text;
    if (choiceEl) {
      choiceEl.innerHTML = '';
      const btn = document.createElement('button');
      btn.textContent = 'Play Preset Adventure';
      btn.onclick = startAdventure;
      choiceEl.appendChild(btn);
    }
  }
}

if (typeof window !== 'undefined') {
  window.startAdventure = startAdventure;
  window.generateStoryWithAI = generateStoryWithAI;
}

if (typeof module !== 'undefined') {
  module.exports = { storyNodes, showNode, startAdventure, generateStoryWithAI };
}
