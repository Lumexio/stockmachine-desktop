# Copilot instructions

## Architecture and conventions

- This is an Electron Forge application with a Vue 3/Vuetify renderer.
- Preserve the main/preload/renderer security boundary and the fuses in `forge.config.mjs`.
- Use `src/api/indexeddb.js` instead of direct IndexedDB calls and maintain queue/id mapping for offline sync.
- Use `src/api/custom-fetch.js` for backend calls and `/health` for reachability checks.
- Follow the generic CRUD pattern in `src/views/products/products-main.vue`.
- Keep all visible text aligned across `src/locales/en.js`, `es.js`, `fr.js`, `ja.js`, and `ru.js`.
- Preserve the eight schemes in `src/plugins/themes/theme.js`.

No merged pull-request review history was available to mine; repository and family conventions are authoritative.

## Testing and style

- Run `npm test`; tests use Vitest with `fake-indexeddb`.
- Run `npm run package-linux` to verify the Electron application packages.
- Match existing JavaScript/Vue formatting; the current `lint` script is only a placeholder.

## Maintenance matrix

| When changing | Also update or verify |
| --- | --- |
| Inventory entity or CRUD view | View config, `GenericTableCrud`, `src/router/index.js`, `src/constants/navigation.js`, IndexedDB stores, sync endpoints, and five locales |
| Backend route or payload | `src/api/custom-fetch.js` callers, auth/location headers, offline queue replay in `src/utils/sync-service.js`, and relevant tests |
| IndexedDB schema or queue | `src/api/indexeddb.js` version upgrade, sync service, dashboard/offline reads, and `tests/indexeddb.test.js`/`tests/sync-service.test.js` |
| Electron IPC | Main handler, `src/preload.js` allow-list, renderer caller/listener, CSP, and packaging smoke check |
| Route or navigation item | `src/router/index.js`, `src/constants/navigation.js`, header/drawer UI, auth/offline guard, and locale keys |
| User-facing text | All five files in `src/locales/` |
| Theme or appearance | `src/plugins/themes/theme.js`, settings store/view, dark-mode scheme pairs, and `tests/store.test.js` |
| Packaging or release | `package.json` version/scripts, `forge.config.mjs`, icons/manifest, and `.github/workflows/release-desktop.yml` |
| Shared workflow or pricing | Backend contract plus corresponding web/mobile clients and marketing SPA |
