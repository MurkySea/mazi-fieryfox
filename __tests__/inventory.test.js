/** @jest-environment jsdom */
const { addItem, getInventory } = require('../script.js');

describe('inventory management', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('addItem increments count', () => {
    addItem('Potion');
    addItem('Potion');
    const inv = getInventory();
    expect(inv.Potion).toBe(2);
  });
});
