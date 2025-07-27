/** @jest-environment jsdom */
const fs = require('fs');
const path = require('path');
const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');

describe('navigation tabs', () => {
  beforeEach(() => {
    document.documentElement.innerHTML = html;
    jest.resetModules();
    // stub fetch to avoid network calls during init
    global.fetch = jest.fn(() =>
      Promise.resolve({ text: () => Promise.resolve('Name,Rarity\nTest,Common') })
    );
    // load taskManager and script after DOM is ready
    require('../taskManager.js');
    require('../script.js');
  });

  test('clicking nav buttons switches active section', () => {
    const navButtons = document.querySelectorAll('#bottom-nav button');
    const sections = document.querySelectorAll('.main-section');
    expect(navButtons.length).toBeGreaterThan(1);
    // Initially map-section is active
    expect(document.getElementById('map-section').classList.contains('active')).toBe(true);
    navButtons[1].click();
    expect(document.getElementById('tasks-section').classList.contains('active')).toBe(true);
    navButtons[2].click();
    expect(document.getElementById('chat-section').classList.contains('active')).toBe(true);
    navButtons[0].click();
    expect(document.getElementById('map-section').classList.contains('active')).toBe(true);
  });
});
