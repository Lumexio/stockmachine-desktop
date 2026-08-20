# STOCKMACHINE Desktop Agent Guide

## Project overview

This repository is the Electron + Vue desktop inventory client. It supports authenticated online use and local IndexedDB-backed offline operation, then synchronizes queued changes to the backend.

## Structure

- `src/main.js`, `src/preload.js`, `src/background.js`: Electron main/preload security boundary.
- `src/views/`: dashboard, inventory, profile, settings, and auth views.
- `src/components/generics/`: reusable CRUD UI.
- `src/api/`: authenticated HTTP and IndexedDB access.
- `src/store/`: Pinia state, auth, settings, and localization.
- `src/router/index.js`, `src/constants/navigation.js`: route and menu registration.
- `src/locales/`: `en`, `es`, `fr`, `ja`, and `ru` translations.
- `tests/`: Vitest coverage for stores, IndexedDB, and sync.

## Commands

```bash
npm ci
npm start
npm test
npm run package-linux
npm run make-linux
```

Use Node 22, matching the release workflow.

## Conventions

- Keep `contextIsolation` enabled and `nodeIntegration` disabled.
- Expose only narrow, allow-listed APIs through `src/preload.js`; never expose raw `ipcRenderer`.
- Use `src/api/indexeddb.js` for local data and preserve the sync queue/id-map behavior.
- Route all backend requests through `src/api/custom-fetch.js`; connectivity checks use `/health`.
- Add CRUD views through `GenericTableCrud`, then update routes, navigation, and all locale files.
- Preserve all eight theme schemes and offline navigation behavior.

## Testing and releases

Run `npm test` for local logic. Packaging is platform-specific through Electron Forge; releases are tag-triggered by `.github/workflows/release-desktop.yml`. No separate docs site is needed.

## Pitfalls

- A change can work online while breaking offline replay or local IDs.
- Electron main, preload, and renderer changes must stay synchronized.
- User-facing strings must be added to all five locales.
