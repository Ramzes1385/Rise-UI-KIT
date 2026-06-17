# План работ — продолжение Clean Code рефакторинга

> Создано: 2026-06-17
> Базовый коммит: `e82d1ca` (этап 6 завершён)
> Предыдущий отчёт: `CLEAN_CODE_ANALYSIS_6.md`

---

## Быстрый старт для новой сессии

Прочитать контекст:
1. `CLEAN_CODE_ANALYSIS_6.md` — что сделано на этапе 6
2. `CLEAN_CODE_ANALYSIS.md` — история этапов 1-5
3. Этот файл — что осталось

Контекст по коду:
- Kit: Vue 3 + TypeScript, 51+ компонентов, CSS-переменные дизайн-система
- Команда unit-тестов: `npx vitest run --config build/tests/vitest.config.ts --project unit-integration <путь>`
- Линтер: `npx eslint "<путь>"`
- Сборка типов: `npx vue-tsc -b tsconfig.app.json`

---

## Задача 0: Warning в FormFieldLabel.vue (быстрая, 5 мин)

**Файл:** `src/components/BaseFormField/ui/FormFieldLabel.vue:18-22`

ESLint выдаёт 5 warnings `vue/require-default-prop` на опциональных пропсах (`className`, `customClass`, `requiredClassName`, `requiredCustomClass`, `sizeScale`). Коммит прошёл (warnings не блокируют), но стоит почистить.

**Варианты:**
- A) Добавить `withDefaults` с `undefined`-дефолтами для всех опциональных пропсов (соответствует паттерну FormFieldError, где `defineProps` без дефолтов и warnings нет — проверить почему)
- B) Отключить правило `vue/require-default-prop` локально в файле

**Рекомендация:** Вариант A — привести к тому же виду, что FormFieldError (там warnings нет). Сравнить два файла и унифицировать.

**Проверка:** `npx eslint "src/components/BaseFormField/ui/FormFieldLabel.vue"` → 0 warnings

---

## Задача 1: Крупный рефакторинг — вынос useSelect composable (SRP, G33)

**Проблема:** `BaseSelect.vue` ~317 строк совмещает: фильтрацию, выбор, multi-select, рендер тегов, поиск, валидацию. Нарушение Single Responsibility.

**Цель:** Вынести логику в `useSelect` composable по аналогии с `useEditorToolbar`.

**План:**
1. Создать `src/components/BaseSelect/composables/useSelect.ts`
2. Перенести:
   - `selectedOption`, `selectedLabel`, `selectedItems`, `selectedLabels` (computed)
   - `filteredOptions` (computed)
   - `toggleDropdown`, `handleClose`, `isSelected`, `isOptionDisabled`
   - `handleSelect`, `removeValue`, `resolveOptionValue`
   - `isOpen`, `searchQuery` (состояние)
3. `BaseSelect.vue` оставить: шаблон, `useFormField`, `useStandardBaseComponent`, `defineExpose`, эмит-связки
4. Цель: ~150 строк в `.vue`, остальное в composable

**Риски:** Изменение реактивности computed при переносе в composable. Тщательно тестировать multi-select и tag-removal.

**Верификация:**
- `npx vitest run --config build/tests/vitest.config.ts --project unit-integration src/components/BaseSelect`
- 34 теста должны пройти
- `npx eslint "src/components/BaseSelect/**/*.ts" "src/components/BaseSelect/**/*.vue"`

**Эталон:** `useEditorToolbar` в `src/composables/useEditorToolbar` — паттерн возврата деструктурированных функций.

---

## Задача 2: Крупный рефакторинг — устранить временное связывание в BaseEditor (G30, Stepdown Rule)

**Проблема:** В `BaseEditor.vue` `handleInput` (строка ~134) использует `isCodeMode`, `codeContent`, `convertInlineHtml`, `updateActiveStates`, которые объявлены **ниже** через деструктуризацию `useEditorToolbar` (строки ~147-179). Читатель вынужден прокручивать вверх-вниз. Циклическая зависимость через `onInput`-колбэк.

**Цель:** Нисходящее чтение (функции зависят только от того, что объявлено выше).

**План:**
1. Вынести состояние фокуса/пустоты/цвета в `useEditorState` composable:
   - `isFocused`, `isEmpty`, `checkEmpty`
   - `textColor`, `backgroundColor`, `isTextColorActive`, `isBackgroundColorActive`
   - `handleTextColor`, `handleBackgroundColor`, `resetTextColor`, `resetBackgroundColor`
2. Перестроить `BaseEditor.vue` так, чтобы:
   - Объявления composables шли ДО `handleInput`
   - `handleInput` зависел только от уже объявленных функций
3. Альтернатива: передать `onInput` как factory, вызываемую после инициализации

**Риски:** Логика contenteditable чувствительна к порядку инициализации. Тестировать:
- Ввод текста (визуальный режим)
- Переключение в code-режим и обратно
- Сброс форматирования (текст/фон)
- Autofocus

**Верификация:**
- `npx vitest run --config build/tests/vitest.config.ts --project unit-integration src/components/BaseEditor`
- Ручная проверка в storybook (`npm run storybook`)

---

## Задача 3: Ревизия недавно добавленных untracked-файлов (опционально)

В коммите `e82d1ca` добавлены файлы, которые были в рабочем дереве до этапа 6. Проверить качество и подключённость:

**Проверить (были до сессии, закоммичены вместе):**
- `src/components/BaseTable/model/BaseTableBody.types.ts` и 4 других `BaseTable/model/*.types.ts` — используются соответствующими `.vue` (проверено: импортируются)
- `src/components/Base*__tests__/*.e2e.spec.ts` (8 файлов) — e2e-тесты, проверить, что они запускаются и не падают
- `src/components/BaseTable/__tests__/BaseTableNestedRow.spec.ts` — unit-тест

**Действия:**
1. Прогнать: `npx vitest run --config build/tests/vitest.config.ts --project unit-integration src/components/BaseTable`
2. Прогнать e2e (если есть команда): проверить `package.json` scripts на `test:e2e` или подобное
3. Если файлы orphan/битые — исправить или удалить

---

## Задача 4: Единый стиль props. в шаблонах (косметика, опционально)

**Проблема:** F1 — одни компоненты используют `props.sizeScale` в шаблоне, другие `sizeScale`. Каждый файл внутренне консистентен, нарушение только между файлами.

**Подход через codemod (рекомендуется вместо ручной правки):**
1. Написать скрипт `scripts/uniform-props-prefix.mjs`:
   - Парсит `.vue` файлы
   - В шаблоне приводит к единому стилю (выбрать: с `props.` или без)
   - Не трогает `<script setup>` (там оба варианта эквивалентны)
2. Прогнать на всём `src/components/`
3. Проверить visual/storybook-тесты

**Рекомендация:** Выбрать стиль **без `props.`** в шаблоне (более лаконичный, мажоритарный в kit). Оставить `props.` только где необходимо для различения.

**Риски:** Visual-тесты (snapshot) могут поймать изменения, хотя рантайм-поведение идентично.

---

## Задача 5: Единый порядок импортов (косметика, опционально)

**Проблема:** F1 — порядок блоков (type/value/style) разнится от файла к файлу.

**Подход:** Добавить eslint-правило сортировки импортов в `eslint.config.js`:
- `eslint-plugin-import` с правилом `import/order` ИЛИ
- `eslint-plugin-perfectionist` с `sort-imports`

**План:**
1. Установить плагин: `npm i -D eslint-plugin-import`
2. Настроить `import/order` в `eslint.config.js` с группами:
   - external (`vue`, `@components/*`, `@composables/*`, `@constants`, `@utils/*`)
   - parent/sibling (relative)
   - style (`*.scss`)
   - type (`import type`)
3. Прогнать `npx eslint "src/**/*.{ts,vue}" --fix`
4. Проверить, что autofix не сломал ничего

**Рекомендация:** Это автофикс, низкий риск. Сделать отдельным коммитом после рефакторингов (задачи 1-2), чтобы diff был чистым.

---

## Приоритеты

| Приоритет | Задача | Трудозатраты | Риск |
|-----------|--------|--------------|------|
| 🔴 Высокий | 0 (warnings) | 5 мин | Нет |
| 🔴 Высокий | 1 (useSelect) | 1-2 ч | Средний |
| 🟡 Средний | 2 (useEditor stepdown) | 2-3 ч | Высокий |
| 🟢 Низкий | 3 (ревизия untracked) | 30 мин | Низкий |
| 🟢 Низкий | 4 (props. стиль) | 1 ч (codemod) | Низкий |
| 🟢 Низкий | 5 (порядок импортов) | 30 мин (autofix) | Низкий |

**Рекомендуемый порядок:** 0 → 1 → 2 → 3 → 5 → 4

---

## Чек-лист перед каждым коммитом

- [ ] `npx eslint "<изменённые файлы>"` — 0 ошибок
- [ ] `npx vitest run --config build/tests/vitest.config.ts --project unit-integration <затронутые>` — все тесты пройдены
- [ ] Для крупного рефакторинга (задачи 1-2): `npx vue-tsc -b tsconfig.app.json` — 0 ошибок типов
- [ ] Коммит-сообщение по конвенции: `refactor: Clean Code этап N — <кратко>`
- [ ] Не коммитить без явного запроса пользователя

---

## Архитектурные заметки для контекста

- `useStandardBaseComponent(block, props, elementKeys?)` — стандартный bootstrap для UI-компонента (variant, sizeScale, color, classes). Используется в ~30 компонентах.
- `useFormField({ value, error, isRequired })` — валидация, возвращает `{ error, validate, reset, onBlur }`. Экспонируется через `defineExpose`.
- Composable-паттерн: возвращает объект с деструктурируемыми computed/функциями (см. `useEditorToolbar` как эталон).
- Константы: группированные объекты (`UI_TEXT`, `UI_ARIA`) в `constants/ui.ts`, реэкспорт в `constants/index.ts`. Плоские `@deprecated` алиасы для обратной совместимости.
- Тяжёлые компоненты (BaseChat, BaseEditor, BaseDatePicker, BaseCalendar, BaseTable, BaseFileUpload) загружаются через `defineAsyncComponent` в `plugin.ts`.
