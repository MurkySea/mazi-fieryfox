# MaZi FieryFox RPG

MaZi FieryFox is a lightweight browser RPG prototype. It features a simple task list, companions that can be unlocked via a gacha system, a basic XP and coin economy, and a level system that increases as you complete tasks. Tasks can now be scheduled to appear daily, weekly or monthly.

## Getting Started

You can open `index.html` directly in your browser or run the included server:

```bash
npm install
npm start
```

The server serves the site on `http://localhost:8080` and restricts access to the IP specified in `.env`.
Copy `.env.example` to `.env` and add your OpenAI key and allowed IP.


## Saving Progress

The game uses the browser's local storage to persist data. Custom tasks, completed tasks, earned XP, coins and unlocked companions are all stored locally so your progress remains even after refreshing or closing the tab.

## Task Scheduling

Tasks can be set to repeat on a daily, weekly, monthly or **one time** cycle. Only tasks that are due for the current day will be displayed in the task list.
You can also use the **Easy Add** button to quickly create a one-time task from a short description like "Take out the trash tomorrow morning" or pick **One Time** from the task creation dialog and specify a date.

## OpenAI Features

Some options such as AI quest and story generation use the OpenAI API. Provide your key either in `.env` as `OPENAI_API_KEY` or enter it through the **API Key** button in the game. When entered through the UI it is saved to local storage under `openaiKey`. These features require an active internet connection and will now show clearer error messages if the API cannot be reached.
## AI Character Generator

With an API key set, you can create entirely new companions complete with backstory, personality, a short story hook and a custom quest. Click **Generate AI Character** on the gacha tab to summon one. An image is produced using the DALL·E API and the generated quest is added to your task list automatically.
With a key set you can:
 - Generate AI quests from the Tasks tab.
 - Generate AI companions from the Gacha tab.
 - Generate an AI story from the Map tab.


