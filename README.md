# MaZi FieryFox RPG

MaZi FieryFox is a lightweight browser RPG prototype. It features a simple task list, companions that can be unlocked via a gacha system, a basic XP and coin economy, and a level system that increases as you complete tasks. Tasks can now be scheduled to appear daily, weekly or monthly.

## Getting Started

Open the `index.html` file in any modern web browser. You can double-click the file or serve the folder locally with a simple HTTP server:

```bash
npx http-server
```

Then navigate to the provided local URL.

## OpenAI Chat Setup

The chat feature uses the OpenAI API. Before chatting, store your API key in the
browser by opening the console and running:

```javascript
localStorage.setItem('openaiKey', 'YOUR_OPENAI_KEY');
```

Replace `YOUR_OPENAI_KEY` with your actual key. With an API key set,
chat messages are sent to ChatGPT so each companion can reply in real time.

## Saving Progress

The game uses the browser's local storage to persist data. Custom tasks, completed tasks, earned XP, coins and unlocked companions are all stored locally so your progress remains even after refreshing or closing the tab.

## Task Scheduling

Tasks can be set to repeat on a daily, weekly or monthly cycle. Only tasks that are due for the current day will be displayed in the task list.

## Chat Menu

The Chat tab now displays a split layout with your unlocked companions listed on the left and the conversation on the right. Select a companion from the list to open the chat window and continue chatting.
