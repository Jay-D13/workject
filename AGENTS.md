# AGENTS.md

## Project Overview
- `projstral` is a Vite + React + TypeScript single-page app.
- Styling is handled with Tailwind CSS v4 utility classes in component markup plus global styles in `src/index.css`.
- Animations use `framer-motion`.
- Project data is stored entirely in browser `localStorage`; there is no backend, database, or API layer in this repo.

## Commands
- Install deps: `npm install`
- Start dev server: `npm run dev`
- Build for production: `npm run build`
- Lint: `npm run lint`
- Preview production build: `npm run preview`

## Source Map
- `src/App.tsx`: top-level view state and composition of grid/detail flows.
- `src/hooks/useProjects.ts`: primary project CRUD logic and persistence trigger points.
- `src/lib/storage.ts`: `localStorage` read/write, import/export, and UI preference persistence.
- `src/types.ts`: shared domain types for projects, todos, and UI preferences.
- `src/components/`: UI building blocks for grid, detail view, modal flows, and tabs.

## Data Model
- A `Project` contains `title`, `description`, `plan`, `todos`, `status`, `repoUrl`, `archived`, `createdAt`, and `updatedAt`.
- Status is currently limited to `'started'` and `'pending'`.
- UI preferences persist separately from project data under a dedicated storage key.

## Working Rules
- Preserve the local-first architecture. Do not introduce remote persistence, authentication, or API calls unless explicitly requested.
- Treat `src/hooks/useProjects.ts` and `src/lib/storage.ts` as the source of truth for persistence behavior.
- Keep TypeScript types aligned with any schema changes. If the `Project` shape changes, update all related storage and UI code together.
- Favor small, consistent React function components and existing code style: no semicolons, single quotes, and concise hooks usage.
- Reuse existing components and patterns before introducing new abstractions.
- When changing UI behavior, consider both grid and detail flows because state is coordinated from `src/App.tsx`.
- Avoid breaking existing `localStorage` keys unless the task explicitly includes a migration plan.

## Verification
- For code changes, run `npm run build` at minimum when feasible.
- Run `npm run lint` for changes that touch TypeScript, React, or configuration.
- For persistence changes, manually verify create/edit/delete, archive toggle, todo operations, and page reload behavior in the browser.
- For import/export changes, verify invalid or partial data handling before considering the work complete.

## Known Repo Notes
- The current `README.md` is still the default Vite template and does not describe the app accurately.
- The `dist/` directory is build output and should not be treated as the source of truth.
- There is no automated test suite in the repo at the moment.
