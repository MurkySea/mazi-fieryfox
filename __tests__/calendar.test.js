/** @jest-environment jsdom */
const { tasksToICS } = require('../taskManager.js');

describe('tasksToICS', () => {
  test('generates ICS for dated task', () => {
    const tasks = [
      { id: 1, text: 'Meet NPC • 🕑 One Time', date: '2023-08-15', exactTime: '09:30' }
    ];
    const ics = tasksToICS(tasks);
    expect(ics).toContain('BEGIN:VEVENT');
    expect(ics).toContain('DTSTART:20230815T093000');
    expect(ics).toContain('SUMMARY:Meet NPC');
  });
});
