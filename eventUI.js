// eventUI.js - Handles DOM interactions for story events
import { EventEngine } from './eventEngine.js';

// Sample companion data for demo purposes
const companion = {
  id: 'ayla',
  name: 'Ayla',
  relationshipLevel: 3,
  affection: 0
};

// Initialize engine
const engine = new EventEngine();

// --------- UI Elements ---------
const openViewerBtn = document.getElementById('openEventViewerBtn');
const eventListModal = document.getElementById('eventListModal');
const eventList = document.getElementById('eventList');
const closeEventListBtn = document.getElementById('closeEventListBtn');

const storyEventModal = document.getElementById('storyEventModal');
const eventBackground = document.getElementById('eventBackground');
const eventPortrait = document.getElementById('eventPortrait');
const eventDialogue = document.getElementById('eventDialogue');
const eventChoices = document.getElementById('eventChoices');
const nextDialogueBtn = document.getElementById('nextDialogueBtn');

// Utility: generate placeholder image URL based on prompt
function generateAIImage(prompt) {
  return `https://placehold.co/800x600?text=${encodeURIComponent(prompt)}`;
}

// Open event list modal showing unlocked events
openViewerBtn?.addEventListener('click', () => {
  renderEventList();
  eventListModal.classList.remove('hidden');
});
closeEventListBtn?.addEventListener('click', () => {
  eventListModal.classList.add('hidden');
});

// Render list of unlocked events
function renderEventList() {
  eventList.innerHTML = '';
  const unlocked = engine.getUnlockedEvents(companion.id, companion.relationshipLevel);
  unlocked.forEach(evt => {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.textContent = evt.title + (engine.isEventCompleted(companion.id, evt.id) ? ' ✓' : '');
    btn.addEventListener('click', () => {
      eventListModal.classList.add('hidden');
      playEvent(evt);
    });
    li.appendChild(btn);
    eventList.appendChild(li);
  });
}

// Play through an event's dialogue and choices
function playEvent(evt) {
  // Generate images
  eventBackground.src = generateAIImage(evt.backgroundPrompt);
  eventPortrait.src = generateAIImage(evt.imagePrompt);

  let dialogueIndex = 0;
  eventDialogue.textContent = '';
  eventChoices.innerHTML = '';
  nextDialogueBtn.classList.remove('hidden');

  function showNextLine() {
    if (dialogueIndex < evt.dialogue.length) {
      typeLine(evt.dialogue[dialogueIndex], eventDialogue, () => {
        dialogueIndex++;
      });
    } else {
      nextDialogueBtn.classList.add('hidden');
      showChoices();
    }
  }

  nextDialogueBtn.onclick = showNextLine;
  showNextLine();
  storyEventModal.classList.remove('hidden');

  function showChoices() {
    evt.choices.forEach(choice => {
      const btn = document.createElement('button');
      btn.textContent = choice.text;
      btn.addEventListener('click', () => {
        engine.applyChoiceEffect(companion, choice.effect);
        engine.completeEvent(companion.id, evt.id);
        storyEventModal.classList.add('hidden');
      });
      eventChoices.appendChild(btn);
    });
  }
}

// Simple typewriter animation
function typeLine(text, element, callback) {
  element.textContent = '';
  let i = 0;
  const interval = setInterval(() => {
    element.textContent += text.charAt(i);
    i++;
    if (i >= text.length) {
      clearInterval(interval);
      callback();
    }
  }, 40);
}
