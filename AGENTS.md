# AGENTS.md

## Project Overview
- `workject` is a Vite + React + TypeScript single-page app.
- Styling is handled with Tailwind CSS v4 utility classes in component markup plus global styles in `src/index.css`.
- Animations use `framer-motion`.
- The app is still local-first and has no backend, API, auth, or cloud sync.
- Project data is always cached in browser storage and can optionally sync to a user-selected local folder via the File System Access API.

## Commands
- Install deps: `npm install`
- Start dev server: `npm run dev`
- Build for production: `npm run build`
- Lint: `npm run lint`
- Preview production build: `npm run preview`

## Source Map
- `src/App.tsx`: top-level view state and composition of grid/detail flows.
- `src/hooks/useProjects.ts`: primary project CRUD logic, cold storage connection flow, and persistence trigger points.
- `src/lib/storage.ts`: browser storage, cold storage filesystem sync, import/export parsing, migration handling, and UI preference persistence.
- `src/lib/projectStatus.ts`: canonical status values, labels, legacy normalization, and UI style helpers.
- `src/types.ts`: shared domain types for projects, todos, and UI preferences.
- `src/components/`: UI building blocks for grid, detail view, modal flows, and tabs.

## Data Model
- A `Project` contains `title`, `description`, `plan`, `todos`, `status`, `repoUrl`, `archived`, `createdAt`, and `updatedAt`.
- Status is currently limited to `'not-started'`, `'in-progress'`, and `'finished'`.
- Legacy status values `'pending'` and `'started'` are normalized in storage/import code and should be considered migration compatibility paths.
- UI preferences persist separately from project data under a dedicated storage key.
- Project dataset metadata also persists separately and is used for conflict resolution between browser storage and cold storage.

## Storage Model
- Browser storage keys are currently `projstral_projects`, `projstral_projects_state`, and `projstral_ui_prefs`.
- Optional cold storage writes to `.projects/` inside a user-selected folder.
- Current cold storage format is one file per project at `.projects/<project-id>.json` plus `.projects/.state.json`.
- The selected folder handle is persisted in IndexedDB so the app can attempt reconnect on later loads.
- Legacy cold storage `.projects/projects.json` is still read and migrated forward to the per-project format.
- When browser and filesystem datasets differ, `src/lib/storage.ts` resolves the newer dataset using `lastChangedAt` metadata with project timestamps as fallback.

## Working Rules
- Preserve the local-first architecture. Do not introduce remote persistence, authentication, or API calls unless explicitly requested.
- Treat `src/hooks/useProjects.ts` and `src/lib/storage.ts` as the source of truth for persistence behavior.
- Keep TypeScript types aligned with any schema changes. If the `Project` shape changes, update all related storage and UI code together.
- If status options change, update `src/types.ts`, `src/lib/projectStatus.ts`, storage normalization, filters, badges, and any status selectors together.
- Favor small, consistent React function components and existing code style: no semicolons, single quotes, and concise hooks usage.
- Reuse existing components and patterns before introducing new abstractions.
- When changing UI behavior, consider both grid and detail flows because state is coordinated from `src/App.tsx`.
- Avoid breaking existing `localStorage` keys unless the task explicitly includes a migration plan.
- Avoid breaking the `.projects` cold storage format unless the task explicitly includes compatibility or migration handling.

## Verification
- For code changes, run `npm run build` at minimum when feasible.
- Run `npm run lint` for changes that touch TypeScript, React, or configuration.
- For persistence changes, manually verify create/edit/delete, archive toggle, todo operations, page reload behavior, and cold storage reconnect/fallback behavior in the browser.
- For cold storage changes, verify `.projects/<project-id>.json` writes, `.projects/.state.json` updates, and legacy `.projects/projects.json` migration behavior when relevant.
- For import/export changes, verify invalid or partial data handling, plus legacy status normalization, before considering the work complete.

## Known Repo Notes
- `README.md` has been rewritten to describe the current product and storage behavior; use it as a product-level reference, but defer to code when details conflict.
- The `dist/` directory is build output and should not be treated as the source of truth.
- There is no automated test suite in the repo at the moment.
