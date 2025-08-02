export function generateQuest() {
  const today = new Date().toISOString().split('T')[0];
  const quests = [
    {
      title: 'The Hydration Trial',
      description: 'Drink 64oz of water today to replenish your inner wellspring.',
      priority: 'medium',
      category: 'health',
      dueDate: today,
      isRecurring: false
    },
    {
      title: 'Meditation of the Mindforge',
      description: 'Spend 10 minutes in stillness to sharpen your mental blade.',
      priority: 'low',
      category: 'discipline',
      dueDate: today,
      isRecurring: true,
      recurrence: 'daily'
    },
    {
      title: 'The Trial of Focus',
      description: 'Work uninterrupted on a single task for 25 minutes.',
      priority: 'high',
      category: 'productivity',
      dueDate: today,
      isRecurring: false
    },
    {
      title: 'Bond of the Hearth',
      description: 'Send a heartfelt message to a loved one.',
      priority: 'medium',
      category: 'relationship',
      dueDate: today,
      isRecurring: false
    }
  ];
  return quests[Math.floor(Math.random() * quests.length)];
}
