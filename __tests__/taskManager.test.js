/** @jest-environment jsdom */
const {createTask, tasks} = require('../taskManager.js');

describe('createTask', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <input id="taskName" />
      <input id="taskXP" />
      <select id="taskRepeat">
        <option value="daily">Daily</option>
        <option value="weekly">Weekly</option>
        <option value="monthly">Monthly</option>
      </select>
    `;
    localStorage.clear();
    tasks.length = 0;
  });

  test('adds a task and saves to localStorage', () => {
    document.getElementById('taskName').value = 'Test Task';
    document.getElementById('taskXP').value = '5';
    document.getElementById('taskRepeat').value = 'daily';

    createTask();

    expect(tasks.length).toBe(1);
    const saved = JSON.parse(localStorage.getItem('mazi_custom_tasks'));
    expect(saved.length).toBe(1);
    expect(saved[0].text).toContain('Test Task');
    expect(saved[0].repeat).toBe('daily');
  });
});
