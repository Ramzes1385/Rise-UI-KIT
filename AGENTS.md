# AGENTS.md

## Stack

Vue 3 + TypeScript (strict) + Vite 8 + Pinia + Vue Router + SCSS. No ESLint/Prettier configured.

## Commands

- `npm run dev` — dev server (port 3000)
- `npm run build` — `vue-tsc -b && vite build` (typecheck runs first)
- `npm run test:unit` — vitest unit tests (jsdom, `src/**/*.spec.ts`)
- `npm run test:integration` — vitest integration tests (jsdom, `src/**/*.integration.spec.ts`)
- `npm run test:storybook` — vitest browser tests via Storybook + Playwright
- `npm run test:vitest` — all vitest projects + coverage
- `npm run test:e2e` — Playwright e2e on preview server (port 4173)
- `npm run test:visual` — Playwright screenshot tests on Storybook (port 6006)
- `npm run test:visual:update` — update visual baselines (review before committing)
- `npm run test:all` — vitest + e2e + visual (e2e/visual require `npm run build` first)

## Architecture: Feature-Sliced Design

```
src/
  app/       ← providers, layouts, middleware, global styles
  pages/     ← one slice per route, composition only, no business logic
  widgets/   ← self-contained UI blocks
  features/  ← user actions/scenarios
  entities/  ← business entities
  shared/    ← reusable code (ui/, api/, lib/, composables/, utils/, assets/)
```

**Import rule**: upper layers import from lower only. Slices on the same layer never import each other. Every slice exports only through `index.ts` (public API).

## Path Aliases — three places must stay in sync

`build/config/alias.ts` ↔ `tsconfig.json` (paths) ↔ `vitest.config.ts` (ALIASES)

| Alias | Target |
|-------|--------|
| `@` | `src/` |
| `@app` | `src/app/` |
| `@pages` | `src/pages/` |
| `@widgets` | `src/widgets/` |
| `@features` | `src/features/` |
| `@entities` | `src/entities/` |
| `@shared` | `src/shared/` |
| `@assets` | `src/shared/assets/` |
| `@styles` | `src/shared/assets/styles/` |
| `@images` | `src/shared/assets/images/` |
| `@ui` | `src/shared/ui/` |
| `@lib` | `src/shared/lib/` |
| `@api` | `src/shared/api/` |

## Build Config — modular in `build/`

`vite.config.ts` is a thin delegator. All logic lives in `build/`:
- `config/` — alias.ts, css.ts, build.ts, server.ts, resolve.ts
- `plugins/` — vue.ts, svg.ts, images.ts, compression.ts, sprite.ts, index.ts
- `constants.ts`, `utils/helpers.ts`

Do not inline config back into `vite.config.ts`.

## Component Conventions

Each component is a folder under `src/shared/ui/ComponentName/`:

```
ComponentName/
  ComponentName.vue          ← <script setup lang="ts"> only
  ComponentName.types.ts     ← Props, Emits, Slots interfaces
  ComponentName.style.scss   ← styles (NEVER <style> inside .vue)
  ComponentName.stories.ts   ← Storybook stories
  ComponentName.spec.ts      ← unit tests
  index.ts                   ← re-exports
```

### Critical UI Kit rules

- **Only px** for sizes — no `rem`, `em`, or other relative units
- **BEM** strictly: flat elements (`&__name`), modifiers (`&--mod`), no nested BEM (`&__header { &__title }` is forbidden)
- **Self-reuse**: UI Kit components must use other UI Kit components internally (BaseText instead of `<span>`, BaseIcon instead of raw `<svg>`, BaseButton instead of `<button>`, etc.)
- **Required composables** in every UI Kit component: `useSizeScale` (prop `sizeScale`, not `size`), `useCustomColor` (prop `color`), `useVariant` (prop `variant`). Exceptions: BaseText (no useVariant), BaseSkeleton (no useVariant or useCustomColor)
- `useVariant` skips `'default'` — variant `default` styles go in the base BEM block, not `&--default`
- **Variant values**: `default`, `ghost`, `outline`, `shadow`, `soft` unless component defines its own (e.g. BaseTabs: `underline`/`pills`/`rounded`/`arc`)
- Union types in `.types.ts` must use `const` arrays with `as const`, types derived via `(typeof ARRAY)[number]`
- Error validation prop: `error: string`, not `hasError: boolean`
- Boolean props prefixed: `is*`, `has*`, `can*`, `should*`
- No `any`, no `enum` — use union types
- Functions via `function`, not `const fn = () =>`
- Max 20 lines per function, max 100 lines per `<script setup>`, max 3 arguments

## SCSS

- Global SCSS files (`_variables.scss`, `_mixins.scss`, `_functions.scss`) are auto-injected via `additionalData` — do not import them manually in components
- These global files must NOT import themselves (the `additionalData` callback skips them)
- Dark theme: `[data-theme='dark']` selector (can be on any element, not just `<html>`)
- Interactive state mixins: `@include interactive`, `@include hover { }`, `@include active { }`, `@include focus { }`
- Do not use `@include interactive using ($state)` — not supported by current Sass version

## Pinia Stores

- **Options API only** — never `defineStore('id', () => {...})`
- Each store in its own folder: `storeName.store.ts`, `storeName.types.ts`, `index.ts`
- `state` returns typed object: `(): StoreState => ({...})`
- Always `isLoading: boolean` and `error: string` (empty string = no error)
- Async actions: `async/await` + `try/catch/finally` pattern
- Actions don't return data — they write to state

## Storybook

- `tags: ['autodocs']` set globally in `.storybook/preview.ts` — do not add to individual stories
- No `.stories.mdx` files (Storybook 10 doesn't index them without a plugin)
- Use `buildArgTypes` from `@/shared/utils/storybookUtils` + `const` arrays from `.types.ts`
- Dark theme stories: wrap with `<div data-theme="dark">` decorator — never set `data-theme` on `document.documentElement`
- Forced CSS states for stories: `.storybook/forced-states.scss` provides `--hover`, `--active`, `--focus` classes
- `render` functions with data in `template` must return that data from `setup()`
- Every `render` story must have `parameters.docs.source.code`

## Testing

- **Vitest**: two projects — `unit-integration` (jsdom) and `storybook` (browser via Playwright)
- **Playwright**: `e2e-chromium` (preview server, port 4173) and `visual-chromium` (Storybook, port 6006)
- E2E/visual tests auto-start their web servers
- Coverage thresholds: lines 80%, functions 80%, branches 70%, statements 80%
- `tests/setup-vitest.ts` handles cleanup and mock restore; `jest-dom/vitest` imported per test file, not globally
- When testing components that use other UI Kit components, register them via `global.components` or `global.stubs`
- Screenshot tests: fixed viewport, `animations: 'disabled'`, `caret: 'hide'`, target `#storybook-root`
- DOM-dependent composables need mocking in jsdom (useClickOutside, useEscapeKey, useScrollLock, usePopup, useDropdownPosition, etc.)

## Existing Instruction Sources

Detailed conventions live in `.roo/skills/` (FSD architecture, component creation, UI Kit spec, testing strategy, Storybook patterns, Vite bundle config). Consult these when working on specific areas.
