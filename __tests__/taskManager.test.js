/** @jest-environment jsdom */
const {createTask, tasks} = require('../taskManager.js');

describe('createTask', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <input id="taskName" />
      <input id="taskXP" />
      <select id="taskTime">
        <option value="morning">Morning</option>
        <option value="afternoon">Afternoon</option>
        <option value="evening">Evening</option>
      </select>
      <input id="taskExactTime" />
      <input id="taskReminder" type="checkbox" />
      <input id="taskDate" />
      <select id="taskRepeat">
        <option value="daily">Daily</option>
        <option value="weekly">Weekly</option>
        <option value="monthly">Monthly</option>
        <option value="once">Once</option>
      </select>
    `;
    localStorage.clear();
    tasks.length = 0;
  });

  test('adds a task and saves to localStorage', () => {
    document.getElementById('taskName').value = 'Test Task';
    document.getElementById('taskXP').value = '5';
    document.getElementById('taskTime').value = 'morning';
    document.getElementById('taskRepeat').value = 'daily';

    createTask();

    expect(tasks.length).toBe(1);
    const saved = JSON.parse(localStorage.getItem('mazi_custom_tasks'));
    expect(saved.length).toBe(1);
    expect(saved[0].text).toContain('Test Task');
    expect(saved[0].repeat).toBe('daily');
  });

  test('adds a one time task with date', () => {
    document.getElementById('taskName').value = 'One Time';
    document.getElementById('taskXP').value = '3';
    document.getElementById('taskTime').value = 'evening';
    document.getElementById('taskRepeat').value = 'once';
    document.getElementById('taskDate').value = '2023-08-15';

    createTask();

    expect(tasks.length).toBe(1);
    expect(tasks[0].repeat).toBe('once');
    expect(tasks[0].date).toBe('2023-08-15');
  });

  test('handles exact time and reminder', () => {
    document.getElementById('taskName').value = 'Timed Task';
    document.getElementById('taskXP').value = '8';
    document.getElementById('taskTime').value = 'morning';
    document.getElementById('taskRepeat').value = 'daily';
    document.getElementById('taskExactTime').value = '09:30';
    document.getElementById('taskReminder').checked = true;

    createTask();

    expect(tasks[0].exactTime).toBe('09:30');
    expect(tasks[0].reminder).toBe(true);
  });
});
