/** @jest-environment jsdom */
const { addItem, getInventory, performGacha } = require('../script.js');

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

  test('performGacha adds items to inventory', async () => {
    // Stub companion data to avoid network fetch during the test
    global.fetch = jest.fn(() =>
      Promise.resolve({ text: () => Promise.resolve('Name,Rarity\nTest,Common') })
    );

    // Force random values so an item is awarded on the roll
    jest
      .spyOn(Math, 'random')
      .mockReturnValueOnce(0)   // pick first companion
      .mockReturnValueOnce(0.1) // trigger item drop
      .mockReturnValueOnce(0);  // pick first item

    await performGacha(1);
    const inv = getInventory();
    // First item in the pool should have been added
    expect(inv.Potion).toBe(1);

    Math.random.mockRestore();
  });
});
