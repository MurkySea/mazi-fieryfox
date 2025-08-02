// eventEngine.js - Logic for unlocking and handling story events
import { events } from './events.js';

/**
 * EventEngine manages unlocked/complete events and applies choice effects.
 */
export class EventEngine {
  constructor(storageKey = 'completedEvents') {
    this.events = events;
    this.storageKey = storageKey;
    this.completed = this.loadCompleted();
  }

  // Load completion data from localStorage
  loadCompleted() {
    try {
      return JSON.parse(localStorage.getItem(this.storageKey)) || {};
    } catch (e) {
      return {};
    }
  }

  // Persist completion data
  saveCompleted() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.completed));
  }

  // Retrieve all unlocked events for a companion based on relationship level
  getUnlockedEvents(companionId, level) {
    const all = this.events[companionId] || [];
    return all.filter(evt => evt.unlockLevel <= level);
  }

  // Check if a specific event has been completed
  isEventCompleted(companionId, eventId) {
    return (this.completed[companionId] || []).includes(eventId);
  }

  // Mark event as completed
  completeEvent(companionId, eventId) {
    if (!this.completed[companionId]) this.completed[companionId] = [];
    if (!this.completed[companionId].includes(eventId)) {
      this.completed[companionId].push(eventId);
      this.saveCompleted();
    }
  }

  // Apply a choice effect (simple affection update parser)
  applyChoiceEffect(companion, effect) {
    const match = /affection([+-]\d+)/.exec(effect);
    if (match) {
      companion.affection = (companion.affection || 0) + parseInt(match[1], 10);
    }
  }
}
