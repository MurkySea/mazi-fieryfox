# MaZi FieryFox RPG

MaZi FieryFox is a lightweight browser RPG prototype. It features a simple task list, companions that can be unlocked via a gacha system, a basic XP and coin economy, and a level system that increases as you complete tasks. Tasks can now be scheduled to appear daily, weekly or monthly.

## Getting Started

Open the `index.html` file in any modern web browser. You can double-click the file or serve the folder locally with a simple HTTP server:

```bash
npx http-server
```

Then navigate to the provided local URL.


## Saving Progress

The game uses the browser's local storage to persist data. Custom tasks, completed tasks, earned XP, coins and unlocked companions are all stored locally so your progress remains even after refreshing or closing the tab.

## Task Scheduling

Tasks can be set to repeat on a daily, weekly or monthly cycle. Only tasks that are due for the current day will be displayed in the task list.
You can also use the **Easy Add** button to quickly create a one-time task from a short description like "Take out the trash tomorrow morning".

## OpenAI Features

Some options such as AI quest and story generation use the OpenAI API. To enable these features, provide your own API key:

1. Open the game in your browser and click the **API Key** button in the top bar.
2. Enter your OpenAI API key when prompted. The key is saved to local storage under `openaiKey`.

You can clear the key at any time by removing `openaiKey` from your browser's local storage.
## AI Character Generator

With an API key set, you can create entirely new companions complete with backstory, personality, a short story hook and a custom quest. Click **Generate AI Character** on the gacha tab to summon one. An image is produced using the DALL·E API and the generated quest is added to your task list automatically.
With a key set you can:
 - Generate AI quests from the Tasks tab.
 - Generate AI companions from the Gacha tab.
 - Generate an AI story from the Map tab.


