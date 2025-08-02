/** @jest-environment jsdom */
const { updateStreak } = require('../script');

describe('streak tracking', () => {
  beforeEach(() => {
    localStorage.clear();
    global.alert = jest.fn();
  });

  test('increments streak and awards xp bonus', () => {
    localStorage.setItem('mazi_xp', '0');
    updateStreak();
    expect(localStorage.getItem('mazi_streak')).toBe('1');
    expect(localStorage.getItem('mazi_xp')).toBe('5');

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    localStorage.setItem('mazi_last_completion_date', yesterday.toDateString());
    updateStreak();
    expect(localStorage.getItem('mazi_streak')).toBe('2');
    expect(localStorage.getItem('mazi_xp')).toBe('15');
  });
});
