/** @jest-environment jsdom */
const fs = require('fs');
const path = require('path');
const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');

describe('dark mode toggle', () => {
  beforeEach(() => {
    document.documentElement.innerHTML = html;
    jest.resetModules();
    // stub fetch to avoid network calls
    global.fetch = jest.fn(() => Promise.resolve({ text: () => Promise.resolve('Name,Rarity\nTest,Common') }));
    require('../taskManager.js');
    require('../script.js');
    document.dispatchEvent(new Event('DOMContentLoaded', { bubbles: true }));
  });

  test('clicking dark mode toggles class on body', () => {
    const btn = document.getElementById('darkModeToggle');
    expect(document.body.classList.contains('dark-mode')).toBe(false);
    btn.click();
    expect(document.body.classList.contains('dark-mode')).toBe(true);
    btn.click();
    expect(document.body.classList.contains('dark-mode')).toBe(false);
  });
});
