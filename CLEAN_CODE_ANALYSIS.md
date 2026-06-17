# Анализ кода по «Чистый код» Роберта Мартина

> Дата: 2026-06-17
> Объект анализа: 51 компонент, composables, типы, константы Rise-UI-KIT

---

## Сводная таблица

| # | Проблема | Severity | Статус | Глава |
|---|----------|----------|--------|-------|
| 1 | God-компоненты (Select, Input, Calendar, Chat) | 🔴 High | ✅ Уменьшены | Ch.3, Ch.10 |
| 2 | Мёртвый код (deprecated props в Calendar) | 🟡 Medium | ⏳ Major version | Ch.16 |
| 3 | Несогласованная структура файлов | 🟡 Medium | ✅ Исправлено | Ch.5 |
| 4 | Нарушение DRY (BaseSlideover/BaseChat vs BaseComponentProps) | 🟡 Medium | ⏭ Пропущено | Ch.16 |
| 5 | Нереактивные hasHeader/hasFooter (баг) | 🔴 High | ✅ Исправлено | Ch.4 |
| 6 | Бойлерплейт useBaseComponent (51 копия) | 🟡 Medium | ✅ Исправлено | Ch.16 |
| 7 | Boolean trap в пропсах | 🟡 Medium | ✅ Подготовлено | Ch.3 |
| 8 | Магические числа | 🟢 Low | ⏭ Пропущено | Ch.2 |
| 9 | Несогласованный экспорт констант | 🟢 Low | ✅ Исправлено | Ch.5 |
| 10 | Oversized type files (Table, Calendar) | 🟡 Medium | ⏭ Пропущено | Ch.5, Ch.10 |
| 11 | God-computed `resolvedProps` в Calendar | 🟡 Medium | ✅ Исправлено | Ch.3 |
| 12 | Нет единого паттерна валидации | 🟡 Medium | ✅ Исправлено | Ch.6 |

---

## ✅ Исправлено

### 1. God-компоненты — декомпозированы

| Компонент | Было | Стало | Что сделано |
|-----------|------|-------|-------------|
| `BaseInput` | 274 строки | ~190 строк | Mask handlers → `useMaskedInputHandlers` |
| `BaseCalendar` | 400 строк | 356 строк | resolvedProps → `useCalendarResolvedProps` |
| `BaseSelect` | 351 строка | ~280 строк | Dropdown → `BaseSelectDropdown.vue` |
| `BaseChat` | 340 строк | ~280 строк | Delete flow → `useChatDeleteConfirm` |

---

### 3. Структура файлов → все по `model/ui/styles`

| Компонент | Было |
|-----------|------|
| `BaseSearch` | Плоская → `model/`, `ui/`, `styles/`, `__tests__/`, `stories/` |
| `BaseDatePicker` | Гибрид → `model/`, `ui/`, `styles/`, `__tests__/`, `stories/` |
| `BaseChat` | Плоская → `model/`, `ui/`, `styles/`, `__tests__/`, `stories/` |

---

### 5. Нереактивные `hasHeader` / `hasFooter` (баг)

`BaseModal`, `BaseSlideover` → `computed(() => Boolean(slots.footer))`

---

### 6. Бойлерплейт → `useStandardBaseComponent`

30 компонентов мигрированы с `useBaseComponent({...})` на `useStandardBaseComponent('block', props, [...])`.

---

### 7. Boolean trap → подготовлено к v2

Добавлены `TableFeaturesConfig`, `TableBehaviorConfig` типы и `@deprecated` JSDoc на boolean-пропсах `BaseTable`. Контракт для миграции при мажорном релизе.

---

### 9. Константы → групповые объекты

37 `.vue` файлов мигрированы: `UI_FONT_WEIGHT.SEMIBOLD`, `UI_TEXT.LOADING`, `UI_ARIA.CLOSE`, `UI_TIMING.*`, `UI_SCALE.*`.

---

### 11. `useCalendarResolvedProps`

44 строки логики разрешения deprecated → config пропсов извлечены из `BaseCalendar.vue`.

---

### 12. `useFormField` — единый паттерн валидации

10 компонентов интегрированы: BaseInput, BaseSelect, BaseTextarea, BaseCheckbox, BaseSwitch, BaseRadio, BasePin, BaseFileUpload, BaseFormField, BaseDatePicker. Все имеют `validate()` и `reset()` через `defineExpose`.

---

## Созданные composable и подкомпоненты

| Создан | Файл | Назначение |
|--------|------|------------|
| `useStandardBaseComponent` | `src/composables/useBaseComponent/useBaseComponent.ts` | Устраняет бойлерплейт (30 миграций) |
| `useCalendarResolvedProps` | `src/components/BaseCalendar/model/useCalendarResolvedProps.ts` | Разрешение deprecated → config пропсов |
| `useFormField` | `src/composables/useFormField/` | Единый паттерн валидации (10 миграций) |
| `useMaskedInputHandlers` | `src/composables/useInputMask/useMaskedInputHandlers.ts` | Обработчики маски из BaseInput |
| `useChatDeleteConfirm` | `src/components/BaseChat/composables/useChatDeleteConfirm.ts` | Логика удаления из BaseChat |
| `BaseSelectDropdown.vue` | `src/components/BaseSelect/ui/BaseSelectDropdown.vue` | Dropdown content из BaseSelect |
| `TableFeaturesConfig` | `src/components/BaseTable/model/BaseTable.types.ts` | Типы для config-объектов (v2) |
| `TableBehaviorConfig` | `src/components/BaseTable/model/BaseTable.types.ts` | Типы для config-объектов (v2) |

---

## ⏭ Пропущено (с обоснованием)

| # | Проблема | Причина |
|---|----------|---------|
| 4 | `BaseSlideover`/`BaseChat` не extends `BaseComponentProps` | Layout-контейнер и кастомные варианты |
| 8 | Магические числа | `sizeScale: 100` — конвенция, padding — компонент-специфичные дефолты |
| 10 | Разделение `BaseTable.types.ts` | 260 строк когерентных типов, единая точка импорта |

---

## ⏳ Осталось (major version)

| # | Что | Подготовка |
|---|-----|-----------|
| 2 | Удалить deprecated props Calendar | `@deprecated` JSDoc уже на месте |
| 7 | Boolean trap → config-объекты Table | `TableFeaturesConfig`, `TableBehaviorConfig` типы готовы |

---

## Верификация

| Проверка | Результат |
|----------|-----------|
| `vue-tsc --noEmit` | ✅ 0 ошибок |
| `eslint` | ✅ 0 ошибок |
| `vitest run` | ✅ 231 файл, 4314 тестов — все пройдены |
