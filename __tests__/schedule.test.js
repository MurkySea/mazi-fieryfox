/** @jest-environment jsdom */
const { shouldShowTaskToday } = require('../script.js');

describe('shouldShowTaskToday', () => {
  test('daily tasks always show', () => {
    const task = { repeat: 'daily' };
    const date = new Date('2023-08-15');
    expect(shouldShowTaskToday(task, date)).toBe(true);
  });

  test('weekly tasks show on Monday', () => {
    const task = { repeat: 'weekly' };
    const monday = new Date('2023-08-14');
    const tuesday = new Date('2023-08-15');
    expect(shouldShowTaskToday(task, monday)).toBe(true);
    expect(shouldShowTaskToday(task, tuesday)).toBe(false);
  });

  test('monthly tasks show on first of month', () => {
    const task = { repeat: 'monthly' };
    const first = new Date('2023-08-01');
    const second = new Date('2023-08-02');
    expect(shouldShowTaskToday(task, first)).toBe(true);
    expect(shouldShowTaskToday(task, second)).toBe(false);
  });
});
