// Handles animations, overlays, and cutscene triggers for evolutions

function ensureModal() {
  if (typeof document === 'undefined') return null;
  let modal = document.getElementById('evolutionModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'evolutionModal';
    modal.className = 'modal hidden';
    modal.innerHTML = `
      <div class="modal-box evolution-box">
        <img id="evolutionImage" class="evolution-img" />
        <h3 id="evolutionTitle"></h3>
        <p id="evolutionBonus" class="evolution-bonus"></p>
      </div>`;
    document.body.appendChild(modal);

    const style = document.createElement('style');
    style.textContent = `
      .evolution-img { max-width: 100%; }
      .evolution-box { text-align: center; }
      .evolution-anim { animation: evoFlash 1s ease-in-out; }
      @keyframes evoFlash { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
    `;
    document.head.appendChild(style);
  }
  return modal;
}

export function showEvolutionSequence(companion, form) {
  const modal = ensureModal();
  if (!modal) return;
  const img = modal.querySelector('#evolutionImage');
  const title = modal.querySelector('#evolutionTitle');
  const bonus = modal.querySelector('#evolutionBonus');

  img.src = form.image;
  title.textContent = `${companion.name} evolved into ${form.title}!`;
  if (form.bonus) {
    bonus.textContent = `Unlocked: ${form.bonus}`;
    bonus.style.display = 'block';
  } else {
    bonus.textContent = '';
    bonus.style.display = 'none';
  }

  img.classList.add('evolution-anim');
  setTimeout(() => img.classList.remove('evolution-anim'), 1000);

  modal.classList.remove('hidden');
  modal.addEventListener('click', hideModal);

  updateCardDisplay(companion, form);
}

function hideModal() {
  const modal = document.getElementById('evolutionModal');
  if (!modal) return;
  modal.classList.add('hidden');
  modal.removeEventListener('click', hideModal);
}

function updateCardDisplay(companion, form) {
  if (typeof document === 'undefined') return;
  const cardModal = document.getElementById('companionModal');
  const cardName = document.getElementById('cardName');
  if (cardModal && !cardModal.classList.contains('hidden') && cardName && cardName.textContent === companion.name) {
    const img = document.getElementById('cardImg');
    const title = document.getElementById('cardTitle');
    if (img) {
      img.src = form.image;
      if (form.aura) img.classList.add(form.aura); else img.classList.remove(form.aura);
    }
    if (title) title.textContent = form.title;
  }
  // Refresh companion list if available
  if (typeof window !== 'undefined' && typeof window.displayCompanionsUI === 'function') {
    window.displayCompanionsUI();
  }
}

if (typeof module !== 'undefined') {
  module.exports = { showEvolutionSequence };
}
