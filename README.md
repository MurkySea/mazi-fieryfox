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

## OpenAI Features

Some options such as AI quest generation use the OpenAI API. To enable these features, provide your own API key:

1. Open the game in your browser and click the **API Key** button in the top bar.
2. Enter your OpenAI API key when prompted. The key is saved to local storage under `openaiKey`.

You can clear the key at any time by removing `openaiKey` from your browser's local storage.

