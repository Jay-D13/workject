# workject

`workject` is my personal workspace for keeping ideas, active projects, and rough plans organized. It is designed for people who want a clean project bank without a backend, accounts, or cloud sync.

Built with Vite, React, and TypeScript, the app runs entirely in the browser and stores your data on your machine. You can use it as a simple browser-only project organizer, or connect a folder for optional filesystem-backed cold storage.

## What `workject` is for

`workject` is meant to be a low-friction place to capture and maintain:

- project ideas you do not want to lose
- projects you are actively building
- implementation notes and markdown plans
- lightweight todo lists tied to each project
- archived projects you want to keep without cluttering the main grid

The goal is simple organization for messy creative and technical work: enough structure to stay clear, without turning the app into a heavy project management system.

## Feature highlights

- Project bank with grid and list views
- Search by title or description
- Status filtering and sorting
- Three project states: `not started`, `in progress`, and `finished`
- Detail view with separate description, plan, and todo tabs
- Markdown editing and preview for descriptions and plans
- Todo add, complete, and remove flows
- Archive and unarchive support
- Optional repository URL per project
- JSON import and export for backups
- Optional cold storage connection to a local folder
- Saved UI preferences for view mode, status filter, and sort order

## Typical workflow

1. Add a project from the main workspace.
2. Give it a title, optional description, optional repository URL, and an initial status.
3. Open the project to maintain:
   - a markdown description
   - a markdown implementation plan
   - a focused todo list
4. Use status updates to move work from `not started` to `in progress` to `finished`.
5. Archive projects when you want to keep them without leaving them in the active grid.
6. Export a JSON backup when you want a portable snapshot, or connect cold storage if you want the data mirrored into a folder on disk.

## Storage and persistence

`workject` is local-first. There is no backend, no remote database, no authentication, and no cloud account.

By default, project data is cached in browser `localStorage`. The app currently uses these browser keys:

- `projstral_projects`: the current project dataset
- `projstral_projects_state`: metadata used to track when the dataset last changed
- `projstral_ui_prefs`: saved UI preferences such as view mode, filter, and sorting

UI preferences are stored separately from project content, so layout and filtering choices persist independently of the projects themselves.

If you never connect cold storage, the app still works fully in browser-only mode.

## Cold storage filesystem format

`workject` can optionally connect to a folder using the File System Access API. When connected, it writes project data into a `.projects` directory inside the folder you chose.

Current cold storage layout:

- `.projects/<project-id>.json`
  Each project is stored in its own JSON file.
- `.projects/.state.json`
  Stores dataset metadata, including the last change timestamp and storage format version.

The app also remembers the selected folder handle in IndexedDB under its cold storage database so it can try to reconnect automatically on later loads.

Cold storage is optional. Browser storage remains the immediate working copy, and cold storage acts as a filesystem-backed mirror when the connection is available.

## Sync and conflict behavior

When the app starts with a valid cold storage connection, it compares the browser dataset and the filesystem dataset.

- If one side is newer, that dataset wins.
- The comparison uses stored change metadata first.
- If metadata is missing or incomplete, project timestamps are used as the fallback signal.
- After resolving the newer dataset, the app writes the resolved version back to both browser storage and cold storage.

If the folder permission is missing, denied, or no longer available, the app falls back to browser-only mode instead of blocking the rest of the app.

## Import, export, and migration

Export creates a JSON array backup of all projects currently loaded in the app.

Import accepts a JSON array of projects and validates each record. Invalid entries are skipped. Legacy statuses are normalized during import and storage parsing:

- `pending` becomes `not-started`
- `started` becomes `in-progress`

Cold storage also supports migration from the older single-file format:

- legacy data may exist as `.projects/projects.json`
- on bootstrap or reconnect, the app still reads that file
- when the dataset is rewritten, the app migrates it into per-project files
- the legacy `projects.json` file is then removed

## Browser support and limitations

Cold storage depends on:

- the File System Access API (`showDirectoryPicker`)
- IndexedDB support

If a browser does not support those APIs, `workject` still works in browser-only mode.

Current limitations:

- no backend or shared multi-user storage
- no automatic cloud sync
- no server-side database
- no authentication or user accounts

## Development

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Lint the project:

```bash
npm run lint
```

Preview the production build:

```bash
npm run preview
```
