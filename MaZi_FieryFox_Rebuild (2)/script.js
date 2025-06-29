
let coins = 10;
let callCount = 0;
const callGoal = 25;

const gachaPool = [
  { name: "Elf Archer", rarity: "Common" },
  { name: "Neko Girl", rarity: "Common" },
  { name: "Succubus", rarity: "Rare" },
  { name: "Dragonkin", rarity: "Epic" },
  { name: "Slimeborn", rarity: "Legendary" }
];

function startGame() {
  document.getElementById('main-menu').style.display = 'none';
  document.getElementById('game-screen').style.display = 'block';
  checkDailyReset();
  updateCoinDisplay();
  updateCallCounter();
}

function showCredits() {
  alert("Created by you and your AI companion. More to come!");
}

function openSection(section) {
  const sections = ['map', 'tasks', 'companions'];
  sections.forEach(id => {
    document.getElementById(`${id}-section`).style.display = id === section ? 'block' : 'none';
  });
}

function updateCoinDisplay() {
  const coinDisplay = document.getElementById('coin-count');
  if (coinDisplay) {
    coinDisplay.textContent = coins;
  }
}

function doGachaPull() {
  if (coins <= 0) {
    alert("Not enough coins!");
    return;
  }
  coins--;
  updateCoinDisplay();
  const roll = Math.random();
  let result;
  if (roll < 0.5) result = gachaPool[0];
  else if (roll < 0.75) result = gachaPool[1];
  else if (roll < 0.9) result = gachaPool[2];
  else if (roll < 0.98) result = gachaPool[3];
  else result = gachaPool[4];
  displayGachaResult(result);
}

function displayGachaResult(result) {
  const resultBox = document.getElementById("gacha-result");
  if (resultBox) {
    resultBox.innerHTML = `<h4>You summoned: ${result.name}</h4><p>Rarity: ${result.rarity}</p>`;
  }
}

function completeTask(amount) {
  coins += amount;
  updateCoinDisplay();
  alert(`Task completed! You earned ${amount} coin${amount > 1 ? 's' : ''}.`);
}

function addCustomTask() {
  const taskName = document.getElementById('task-name').value.trim();
  const taskReward = parseInt(document.getElementById('task-reward').value);
  if (!taskName || isNaN(taskReward) || taskReward <= 0) {
    alert("Please enter a valid task and reward.");
    return;
  }
  const list = document.getElementById('custom-task-list');
  const item = document.createElement('li');
  item.innerHTML = `<button onclick="completeTask(${taskReward})">${taskName} (+${taskReward} Coin${taskReward > 1 ? 's' : ''})</button>`;
  list.appendChild(item);
  document.getElementById('task-name').value = '';
  document.getElementById('task-reward').value = '';
}

function makeClientCall() {
  if (callCount < callGoal) {
    callCount++;
    updateCallCounter();
    if (callCount === callGoal) {
      coins += 10;
      updateCoinDisplay();
      alert("✅ You've completed all 25 calls! (+10 Coins)");
    }
  } else {
    alert("You've already completed 25 calls today.");
  }
}

function updateCallCounter() {
  const display = document.getElementById("call-counter-display");
  if (display) {
    display.textContent = `Calls made: ${callCount} / ${callGoal}`;
  }
}

function checkDailyReset() {
  const lastReset = localStorage.getItem("lastReset");
  const today = new Date().toDateString();
  if (lastReset !== today) {
    callCount = 0;
    updateCallCounter();
    localStorage.setItem("lastReset", today);
  }
}
