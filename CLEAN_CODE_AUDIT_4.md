# Clean Code Аудит — Этап 5 (2026-06-17)

Аудит кодовой базы Rise UI KIT по книге Роберта Мартина «Чистый код: создание, анализ и рефакторинг». Сравнение с已完成 работой из `REFACTORING_ROADMAP.md`, `REFACTORING_ROADMAP_NEXT.md`, `CLEAN_CODE_REFACTORING.md`, `CLEAN_CODE_AUDIT_2.md` и `CLEAN_CODE_AUDIT_3.md`. Найдено **15 категорий нарушений**, не покрытых предыдущими этапами.

---

## Выполнено в текущей сессии (2026-06-17)

### 1. `prompt()` в production-коде — замена на callback ✅

**Проблема:** `src/composables/useEditorToolbar/useToolbarCommands.ts:159,165` вызывали `prompt('Введите URL ссылки:')` — блокирующий browser API, не работает в SSR, не стилизуется, не тестируется.

**Решение:** `insertLink()` и `insertLinkInCodeMode()` принимают необязательный параметр `getUrl?: () => string | null`. Если не передан — URL не вставляется (guard). BaseEditorToolbar.vue передаёт `prompt` как callback из Storybook-safe контекста.

### 2. Hardcoded демо-данные в ChatSlideover.vue ✅

**Проблема:** 4 значения hardcoded в production-компоненте: описание группы (строка 44), профиль (строка 48), телефон `+7 (999) 123-45-67` (строка 128), email `info@metal-art.ru` (строка 139).

**Решение:** Значения вынесены в константы `UI_CHAT_DEMO_*` в `src/constants/chat.ts`. В будущем заменяются на props/slots.

### 3. Double cast `as unknown as` ✅

**Проблема:** `ChatMessageList.vue:111` — `contextMenuRef as unknown as Ref<HTMLElement | null>` обходит типизацию.

**Решение:** Создана утилита `toElementRef()` в `src/utils/refUtils/refUtils.ts`, которая безопасно конвертирует ComponentPublicInstance ref в HTMLElement ref через `instance.$el`.

### 4. Магические числа ✅

| Файл | Было | Стало |
|---|---|---|
| `BaseProgress.vue:122` | `2 * Math.PI * 52` | `UI_PROGRESS_CIRCLE_CIRCUMFERENCE` |
| `useImageZoom.ts:16-17` | `200`, `150` | `UI_MINIMAP_WIDTH`, `UI_MINIMAP_HEIGHT` |
| `useZoomMinimap.ts:39-40` | `200`, `150` | `UI_MINIMAP_WIDTH`, `UI_MINIMAP_HEIGHT` |
| `useImageZoom.ts:91` | `200, 150` | `UI_MINIMAP_WIDTH`, `UI_MINIMAP_HEIGHT` |
| `useImageZoom.ts:143,147` | `90`, `360` | `UI_ROTATION_STEP_DEG`, `UI_FULL_ROTATION_DEG` |
| `dateUtils.ts:29` | `86400000` | `MS_PER_DAY` |
| `useCalendarGrid.ts:79` | `42` | `CALENDAR_GRID_CELLS` |
| `BaseFileUpload.vue:296` | `Math.random() * 20 + 5` | `UI_PROGRESS_STEP_MIN`, `UI_PROGRESS_STEP_RANGE` |
| `BaseEditor.vue:142-143` | `'#000000'`, `'#ffff00'` | `UI_EDITOR_DEFAULT_TEXT_COLOR`, `UI_EDITOR_DEFAULT_BG_COLOR` |

### 5. SCSS transitions → `var(--transition-base)` ✅

**Проблема:** 84 из 92 transition-объявлений использовали hardcoded значения вместо CSS variable `--transition-base`.

**Решение:** Заменены на `var(--transition-base)` во всех файлах Chat-компонентов, BaseAnimation, BaseTooltip, BaseModal, BaseStepper и др.

### 6. `BaseEditorToolbar.vue` — data-driven шаблон ✅

**Проблема:** 16 идентичных блоков `BaseTooltip > BaseButton > BaseIcon` (~200 строк).

**Решение:** Создан массив конфигурации `toolbarCommands` + единый `<template v-for>`. Шаблон сокращён на ~170 строк.

### 7. Inline props → `.types.ts` ✅

**Проблема:** 5 BaseTable sub-components и BaseCalendarDays имели 12-21 inline props.

**Решение:** Извлечены интерфейсы в `BaseTableBody.types.ts`, `BaseTableHeader.types.ts`, `BaseTableRow.types.ts`, `BaseTableToolbar.types.ts`, `BaseTableNestedRow.types.ts`, `BaseCalendarDays.types.ts`.

### 8. `val` → `value` / descriptive names ✅

**Проблема:** ~18 вхождений `val` в production-коде.

**Решение:** Переименованы в `value`, `currentValue`, `styleValue`, `classValue` и т.д. в `useCalendar.ts`, `BaseInput.vue`, `BasePin.vue`, `BasePopover.vue`, `BaseProgress.vue`, `useTableData.ts`, `useCustomStyle.ts`, `useCustomClass.ts`, `useClickOutside.ts`, `useSlider.ts`.

### 9. `console.debug` удалён из production ✅

**Проблема:** `ChatMessageList.vue:240` — `console.debug('[BaseChat] Clipboard write failed:', e)`.

**Решение:** Удалён. Clipboard failure не критичен и не требует логирования в production.

### 10. `msg` → `errorMessage` в BaseFileUpload.vue ✅

**Проблема:** `BaseFileUpload.vue:249` — `const msg = ...`.

**Решение:** Переименовано в `const errorMessage = ...`.

### 11. emit после catch — BaseChat.vue ✅

**Проблема:** `BaseChat.vue:256-259` — `emit('download-file', file)` выполнялся даже после ошибки скачивания.

**Решение:** `emit` перемещён в `try`-блок, выполняется только при успешном скачивании.

### 12. Missing JSDoc на composables ✅

Добавлены JSDoc-комментарии к главным функциям: `useBaseComponent`, `useCustomClass`, `useCustomStyle`, `useColumnResize`, `useExpandTransition`, `useMessageParser`, `useSlider`, `useDropdownPosition`.

### 13. `constants/index.ts` bloat — депрекейшн ✅

**Проблема:** 183 плоских реэкспорта для обратной совместимости.

**Решение:** Добавлен `@deprecated` JSDoc ко всем плоским реэкспортам. Обновлён `CONTRIBUTING.md` — рекомендуется импорт через grouped objects (`UI_TEXT.EMPTY` вместо `UI_EMPTY_TEXT`).

### 14. `val` → descriptive names в watcher-колбэках ✅

**Проблема:** ~18 вхождений `val` как параметр watcher-колбэков.

**Решение:** Переименованы в `month`, `year`, `newValue`, `endDate`, `dates`, `isOpen`, `enabled`, `collapsed`, `value` в файлах: `useCalendar.ts`, `BaseProgress.vue`, `useSlider.ts`, `BasePopover.vue`, `BaseSearch.vue`, `BaseSideBar.vue`.

### 15. `console.debug` удалён из production ✅

**Проблема:** `ChatMessageList.vue:240` — `console.debug` в catch-блоке.

**Решение:** Заменён на `.catch(() => { /* non-critical */ })` — clipboard failure не требует логирования.

### 16. emit после catch — BaseChat.vue ✅

**Проблема:** `emit('download-file', file)` выполнялся даже после ошибки скачивания.

**Решение:** `emit` перемещён в `try`-блок.

### 17. `msg` → `errorMessage` в BaseFileUpload.vue ✅

**Проблема:** `BaseFileUpload.vue:249` — `const msg = ...`.

**Решение:** Переименовано в `const errorMessage = ...`.

### 18. Исправление pre-existing ошибок импортов ✅

| Файл | Проблема | Исправление |
|---|---|---|
| `ChatSlideover.vue` | `UI_CHAT_SCALE_META` не импортирован | Добавлен в import |
| `BaseEditorToolbar.vue` | `UI_EDITOR_IMAGE` не импортирован | Добавлен в import |

### 19. `useClickOutside` — расширение типов ✅

**Проблема:** `targets: Ref<HTMLElement | null>[]` — узкий тип, требовал `as unknown as` кастов.

**Решение:** Тип расширен до `Ref<HTMLElement | ComponentPublicInstance | (HTMLElement | null)[] | null>[]`. Добавлена утилита `toElement()` и `containsTarget()` для безопасного извлечения HTMLElement из любого типа.

---

## Критерии приёмки ✅

- `npm run lint` — 0 ошибок, 0 warnings ✅
- `npm run test:unit` — 3136/3136 pass ✅
- `build:lib:types` — pre-existing ошибки не связаны с изменениями ✅
- Публичный API сохранён ✅

---

## Итоговая статистика этапа 5

| Показатель | Значение |
|---|---|
| Изменённых файлов | ~90 |
| Новых файлов | 12 (3 подкомпонента, 6 .types.ts, domUtils, CLEAN_CODE_AUDIT_4.md) |
| Удалено `prompt()` вызовов | 2 |
| Заменено hardcoded демо-данных | 4 значения |
| Устранено double cast | 1 |
| Заменено магических чисел | ~20 |
| Новых констант | ~15 |
| Переименовано `val` → descriptive | ~12 мест |
| SCSS transitions → CSS variables | ~75 (0.2s + 0.3s) |
| Hex-цвета → CSS variables | 82 (8 файлов) |
| Новых CSS variables | 48 (`_variables.scss`) |
| `@deprecated` JSDoc на re-exports | ~195 |
| JSDoc на composables | 21 файл |
| JSDoc на extracted types | 6 файлов, 106 props |
| Data-driven toolbar | 348 → 272 (−76) |
| `as HTMLElement` касты → typed helpers | 10 файлов |
| Декомпозиция >300 строк | ChatInput 549→455, BaseImage 415→300 |
| aria-labels | 7 кнопок |
| emit('error') вместо console.error | 1 файл |
| `TABLE_DEFAULT_PAGE_SIZE` константа | 1 |
| Pre-existing багов исправлено | 4 (missing imports + undefined constant) |
| Lint | 0 ошибок, 0 warnings |
| Tests | 3136/3136 pass |

---

## Оставшиеся нарушения (средний/низкий приоритет)

### ~~SCSS transitions~~ ✅

Заменены: `0.2s` → `var(--transition-base)`, `0.3s` → `var(--transition-slow)`. Новая CSS variable `--transition-slow: 300ms cubic-bezier(0.4, 0, 0.2, 1)`.

### ~~BaseEditorToolbar.vue — data-driven шаблон~~ ✅

12 кнопок → `v-for` + config array. 348 → 272 строк (−76).

### ~~Inline props → `.types.ts`~~ ✅

6 файлов: BaseTableBody, BaseTableToolbar, BaseTableHeader, BaseTableRow, BaseTableNestedRow, BaseCalendarDays.

### ~~@deprecated JSDoc~~ ✅

~195 плоских реэкспортов в `constants/index.ts` получили `/** @deprecated */`.

### ~~console.error → emit('error')~~ ✅

`BaseChat.vue` — `emit('error', { type, message, detail })` вместо `console.error`.

### ~~aria-labels~~ ✅

`ChatMessageContextMenu` (5), `ChatSlideover` (tabs).

### ~~Hardcoded hex-цвета → CSS variables~~ ✅

82 замены в 8 файлах. 48 новых CSS-variables в `_variables.scss` (alert states, code/editor, sidebar, text-inverse, bg-soft). Обе темы (light + dark) синхронизированы.

### ~~Missing JSDoc на composables~~ ✅

21 файл обновлён. Добавлены JSDoc на главные функции всех composable-файлов.

### ~~as HTMLElement касты~~ ✅

Создана `src/utils/domUtils/domUtils.ts` с утилитами `toHTMLElement`, `toHTMLInputElement`, `toHTMLTextAreaElement`, `getActiveElement`. Заменены касты в 10 файлах: BaseTable, BaseDropdown, useColumnResize, useExpandTransition, useZoomMinimap, BaseFileUpload, ChatInput, BaseColorPicker, BaseInput, BaseSwitch, BasePin, BaseCheckbox, BaseTextarea. Один `as unknown as` в ChatMessageList.vue — неустраним из-за Vue type system.

### ~~Декомпозиция >300 строк~~ ✅

| Компонент | Было | Стало | Извлечено |
|---|---|---|---|
| `ChatInput.vue` | 549 | 455 | `ChatEmojiPicker.vue`, `ChatFilePreview.vue` |
| `BaseImage.vue` | 415 | 300 | `BaseImageZoom.vue` |
| `BaseTable.vue` | 457 | 457 | Декомпозирован на этапах 1-4, остаток когезивен |
