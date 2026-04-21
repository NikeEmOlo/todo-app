# ToDayList

A clean, project-based task manager built with vanilla JavaScript — no frameworks, no libraries, just well-structured ES modules and a focus on real usability.

## Features

- **Task management** — Create tasks with a title, description, due date, and project assignment
- **Projects** — Organise tasks into colour-coded projects; rename or delete them inline
- **Three views** — Tasks (active), Projects (grouped), and Completed
- **Persistent storage** — Everything saves to `localStorage`; your data survives page refreshes
- **Live counts** — Sidebar and project cards show accurate incomplete task counts, updated instantly
- **Expandable cards** — Click any project card to see its tasks in-place; click a task to expand its description
- **Smart dates** — Due dates display as "Today" or "Tomorrow" when relevant

## Tech Stack

| Concern | Choice |
|---|---|
| Language | Vanilla JavaScript (ES Modules) |
| Bundler | Webpack 5 |
| Styling | Plain CSS (CSS nesting, custom properties) |
| Typography | Satoshi variable font |
| Persistence | `localStorage` |

No UI framework. No CSS framework. No state management library.

## Architecture

The codebase is split across three modules:

- **`tasks.js`** — Data layer. Owns all task and project state, `localStorage` reads/writes, and the `Task` class.
- **`display.js`** — UI layer. Builds DOM elements using a small class-based element factory (`Element`, `Div`, `Button`, etc.) and wires up all event handlers.
- **`storage.js`** — Thin `localStorage` wrapper.

`display.js` imports from `tasks.js` but not vice versa — the data layer has no knowledge of the DOM.


## What I Learned

This project was built as part of [The Odin Project](https://www.theodinproject.com/) curriculum, with a focus on applying SOLID principles to a vanilla JS codebase.

Key takeaways:

- **ES module live bindings** behave differently from CommonJS exports — mutations to exported arrays are visible across modules, but reassignment is not.
- **Class-based DOM construction** (`new TaskCard(task)`) keeps element creation and event binding co-located, making the UI layer much easier to reason about than scattered `querySelector` calls.
- **State/storage sync** needs to be deliberate — any method that mutates state must also persist it, otherwise computed views (like project counts) will read stale data from storage.
- **CSS nesting** (now baseline in modern browsers) keeps component styles scoped and readable without a preprocessor.

## Project Structure

```
src/
├── assets/
│   ├── fonts/          # Satoshi variable font (woff/woff2)
│   └── images/         # SVG icons
├── display.js          # All DOM rendering and event handling
├── tasks.js            # Task/project data model and storage
├── storage.js          # localStorage helpers
├── index.html
├── index.css           # Global styles, layout, modals
├── tasks.css           # Task card and list styles
└── projects.css        # Project card styles
```

---

CSS reset by [Josh Comeau](https://www.joshwcomeau.com/css/custom-css-reset/).
