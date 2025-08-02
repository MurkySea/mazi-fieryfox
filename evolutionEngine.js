import { evolutionData } from './evolutionData.js';
import { showEvolutionSequence } from './evolutionUI.js';

const STORAGE_KEY = 'mazi_companion_forms';

function loadFormState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch (e) {
    return {};
  }
}

function saveFormState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function getCurrentForm(companionId) {
  const state = loadFormState();
  return state[companionId] || 0;
}

export function setCurrentForm(companionId, index) {
  const state = loadFormState();
  state[companionId] = index;
  saveFormState(state);
}

export function applyStoredForm(companion) {
  const forms = evolutionData[companion.id];
  if (!forms) return;
  const idx = getCurrentForm(companion.id);
  const form = forms[idx];
  if (form) {
    companion.title = form.title;
    companion.image = form.image;
    if (form.bonus) companion.bonus = form.bonus;
  }
}

function evolve(companion, form, nextIndex) {
  setCurrentForm(companion.id, nextIndex);
  companion.title = form.title;
  companion.image = form.image;
  if (form.bonus) companion.bonus = form.bonus;
  showEvolutionSequence(companion, form);
}

export function checkForEvolution(companion) {
  const forms = evolutionData[companion.id];
  if (!forms) return false;
  const currentIndex = getCurrentForm(companion.id);
  const nextForm = forms[currentIndex + 1];
  if (!nextForm) return false;
  if ((companion.relationshipLevel || 0) >= nextForm.minLevel) {
    evolve(companion, nextForm, currentIndex + 1);
    return true;
  }
  return false;
}

if (typeof module !== 'undefined') {
  module.exports = {
    loadFormState,
    saveFormState,
    getCurrentForm,
    setCurrentForm,
    applyStoredForm,
    checkForEvolution
  };
}
