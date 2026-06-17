# Roadmap рефакторинга — Этап 2

Документ описывает оставшиеся изменения после завершения основного рефакторинга (см. `REFACTORING_ROADMAP.md`). Сформирован по результатам аудита от 2026-06-15.

---

## Выполнено в текущей сессии (2026-06-15)

### Часть 1 — устранение `any` и типизация

- `useCustomClass.ts` — `computed<any>` и `Record<string, any>` заменены на `Record<string, ClassResultInternal>` с кастом к публичному `Record<string, string | undefined>`.
- `useCustomStyle.ts` — `Record<string, any>` заменён на `Record<string, StyleResultValue>` с type alias.
- `ChatMessageList.vue` (legacy) — 3 `as any` убраны через `defineComponent` + каст props.
- `BaseSideBarNavigation.vue` — удалён дублирующий `/* istanbul ignore next */`.
- `BaseTree.types.ts` — `classes: ComputedRef<Record<string, string>>` → `ComputedRef<Record<string, string | undefined>>`.

### Часть 2 — магические числа и строки ✅

#### 1. Замена магических коэффициентов `0.8` / `0.85` на константы ✅

**Выполнено:** 32 замены в 7 файлах. `UI_SCALE_SMALL` и `UI_SCALE_AUTOCOMPLETE` импортированы из `@constants`.

| Файл | `0.8` | `0.85` | Статус |
|------|-------|--------|--------|
| `src/components/BaseChat/ui/ChatSlideover/ChatSlideover.vue` | 10 | 7 | ✅ |
| `src/components/BaseChat/ChatMessageList/ui/ChatMessageContextMenu.vue` | 5 | 0 | ✅ |
| `src/components/BaseChat/ChatMessageList/ui/ChatMessage.vue` | 3 | 0 | ✅ |
| `src/components/BaseChat/ChatHeader/ChatHeader.vue` | 1 | 2 | ✅ |
| `src/components/BaseChat/ui/ChatPinnedPanel/ChatPinnedPanel.vue` | 2 | 0 | ✅ |
| `src/components/BaseChat/ChatMessageList/ui/ChatMessageList.vue` | 2 | 0 | ✅ |
| `src/components/BaseChat/ChatMessageList/ui/ChatMessageAttachments.vue` | 0 | 1 | ✅ |

#### 2. Замена оставшихся магических чисел ✅

| Файл | Было | Стало | Статус |
|------|------|-------|--------|
| `src/components/BaseDropdown/ui/BaseDropdown.vue` | `'320px'` | `UI_PANEL_MAX_HEIGHT` | ✅ |
| `src/components/BaseMegaMenu/ui/BaseMegaMenu.vue` | `200` | `UI_HOVER_DELAY_MS` | ✅ |
| `src/components/BaseFileUpload/ui/BaseFileUpload.vue` | `200` | `UI_PROGRESS_INTERVAL_MS` | ✅ |
| `src/components/BaseTooltip/ui/BaseTooltip.vue` | `200` | `UI_TRANSITION_DURATION_MS` | ✅ |

Добавлены новые константы в `src/constants/ui.ts`: `UI_HOVER_DELAY_MS`, `UI_TRANSITION_DURATION_MS`, `UI_PROGRESS_INTERVAL_MS`.

### Часть 3 — переименование переменных ✅

#### 3. Переименование коротких переменных в table composables ✅

| Файл | Было | Стало | Статус |
|------|------|-------|--------|
| `src/composables/useTableSort/useTableSort.ts` | `col` | `column` | ✅ |
| `src/composables/useTableSort/useTableSort.ts` | `s` (в findIndex/filter) | `item` | ✅ |
| `src/composables/useTableSort/useTableSort.types.ts` | `col: TableColumn` | `column: TableColumn` | ✅ |
| `src/composables/useTableData/useTableData.ts` | `col` | `column`/`item` | ✅ |
| `src/composables/useTableData/useTableData.types.ts` | `f:` | `filter:` | ✅ |
| `src/composables/useTableFilter/useTableFilter.ts` | `f`, `col`, `c`, `ops` | `filter`, `column`, `item`, `operators` | ✅ |
| `src/composables/useTableFilter/useTableFilter.types.ts` | `f:` | `filter:` | ✅ |

#### 4. Переименование `msg` → `message` в DOM id ✅

| Файл | Было | Стало | Статус |
|------|------|-------|--------|
| `src/components/BaseChat/ChatMessageList/ui/ChatMessage.vue` | `` `msg-${message.id}` `` | `` `message-${message.id}` `` | ✅ |
| `src/components/BaseChat/ChatMessageList/ui/ChatMessageList.vue` | `` `#msg-${messageId}` `` | `` `#message-${messageId}` `` | ✅ |

#### 5. Переименование прочих коротких переменных ✅

| Файл | Было | Стало | Статус |
|------|------|-------|--------|
| `src/components/BaseChat/composables/useChatState.ts` | `msg =>` | `message =>` | ✅ |
| `src/components/BaseCalendar/ui/BaseCalendar.vue` | `const h =` (2 места) | `const hour =` / `const currentHour =` | ✅ |
| `src/components/BaseImage/ui/BaseImage.vue` | `const w`, `const h` | `const widthValue`, `const heightValue` | ✅ |
| `src/composables/useImageZoom/useImageZoom.ts` | `w`, `h`, `c` + return type | `width`, `height`, `contained` | ✅ |
| `src/components/BaseRange/ui/BaseRange.vue` | `const p =` | `const percentValue =` | ✅ |
| `src/composables/useDropdownPosition/useDropdownPosition.ts` | `const g =` | `const gapValue =` | ✅ |
| `src/composables/useCalendar/useCalendar.ts` | `d`, `dTs` | `dateOnly`/`item`, `dateTs` | ✅ |

### Часть 4 — DRY и конфигурация ✅

#### 6. Устранение дублирования утилит ✅

| Функция | Решение | Статус |
|---------|---------|--------|
| `isObject()` | Вынесена в `src/utils/typeUtils/typeUtils.ts` + unit-тесты | ✅ |
| `hasElementKeys()` | Вынесена в `src/utils/typeUtils/typeUtils.ts` + unit-тесты | ✅ |
| `clamp()` | Экспортирована из `src/utils/colorUtils/colorUtils.ts`, импортирована в `useColorPicker` | ✅ |

Изменённые файлы: `useCustomClass.ts`, `useCustomStyle.ts`, `useColorPicker.ts`, `colorUtils/index.ts`.

#### 7. Удаление дублирующего `sass` из dependencies ✅

`"sass": "^1.100.0"` удалён из `dependencies` в `package.json`. Оставлен `sass-embedded` в `devDependencies`.

#### 8. Обновление `REFACTORING_ROADMAP.md` ✅

Секция «Оставшиеся `any`» (строки 333-337) обновлена — отмечено что `useCustomClass.ts`, `useCustomStyle.ts` и `ChatMessageList.vue` legacy-обёртка больше не содержат `any`.

#### 9. Извлечение `downloadFile` в utility ✅

`document.createElement('a')` + `appendChild` + `click` + `removeChild` из `BaseChat.vue` вынесены в `src/utils/fileUtils/fileUtils.ts` → функция `downloadFile(url, filename)`.

---

## Критерии приёмки — все выполнены ✅

- `npm run lint` — 0 ошибок.
- `npm run test:unit` — 3149/3149 passed.
- `npm run build:lib:types` — 0 ошибок.
- Публичный API сохранён.

---

## Итоговая статистика

| Показатель | Значение |
|------------|----------|
| Файлов изменено | ~30 |
| Замен магических чисел | 36 |
| Замен коротких имён | ~50 |
| Устранено дублирования функций | 3 |
| Новых unit-тестов | 7 (typeUtils) |
| Новых констант | 3 (`UI_HOVER_DELAY_MS`, `UI_TRANSITION_DURATION_MS`, `UI_PROGRESS_INTERVAL_MS`) |
| Новых утилит | 2 (`isObject`/`hasElementKeys` в typeUtils, `downloadFile` в fileUtils) |

---

## Следующие этапы

См. `CLEAN_CODE_REFACTORING.md` (этап 2), `CLEAN_CODE_AUDIT_2.md` (этап 3), `CLEAN_CODE_AUDIT_3.md` (этап 4), `CLEAN_CODE_AUDIT_4.md` (этап 5).
