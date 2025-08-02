// events.js - Sample companion story events
// Each companion ID maps to an array of milestone-based events.
export const events = {
  ayla: [
    {
      id: 'ayla-1',
      unlockLevel: 1,
      title: 'First Meeting',
      backgroundPrompt: 'sunny meadow with flowers',
      imagePrompt: 'friendly archer girl named Ayla smiling',
      dialogue: [
        'You finally showed up!',
        'Ready for an adventure together?'
      ],
      choices: [
        { text: 'Absolutely!', effect: 'affection+10' },
        { text: 'Maybe later...', effect: 'affection-5' }
      ]
    },
    {
      id: 'ayla-2',
      unlockLevel: 3,
      title: 'Under the Moon',
      backgroundPrompt: 'quiet forest clearing at night, moonlight',
      imagePrompt: 'ayla looking thoughtful under the moon',
      dialogue: [
        'The night is calm. It reminds me of my home.',
        'Thanks for being here with me.'
      ],
      choices: [
        { text: 'Anytime, Ayla.', effect: 'affection+15' },
        { text: 'It is getting late.', effect: 'affection-5' }
      ]
    }
  ]
};
