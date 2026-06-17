# Анализ кода по «Чистый код» — этап 6 (сессия от 2026-06-17)

> Объект анализа: компоненты BaseButton, BaseBadge, BaseAvatar, BaseAlert, BaseCheckbox, BaseInput, BaseModal, BaseSelect, BaseEditor и сопутствующие composables/константы
> Базовый коммит: `3664dd3`
> Ревью: 2 раунда локального код-ревью (security/performance/business-logic/deploy-safety/duplication/dead-code) с исправлениями всех найденных замечаний

---

## Сводная таблица выполненных правок

| # | Проблема | Глава Мартин | Файлы | Статус |
|---|----------|--------------|-------|--------|
| 1 | Дубль-импорт `SIZE_SCALE_DEFAULT` в BaseButton | G5/G11 | BaseButton | ✅ |
| 2 | Несогласованный контракт `click` (BaseBadge без payload) | F1/LSP | BaseBadge + types | ✅ |
| 3 | DRY: `selectedLabel` независимо от `selectedOption` | G28/DRY | BaseSelect | ✅ |
| 4 | Баг: удаление тегов по label вместо value (N3) | N1/N3 | BaseSelect | ✅ |
| 5 | Дедупликация фильтра `selectedItems`/`selectedLabels` | DRY | BaseSelect | ✅ |
| 6 | Магические числа → константы (G25) | G25 | constants, BaseAlert, BaseModal | ✅ |
| 7 | Асимметричное имя `resetBackgroundColorState` | N4 | BaseEditor | ✅ |
| 8 | Несогласованный `defineExpose` (LSP) | LSP | BaseButton, BaseSelect | ✅ |
| 9 | `rootStyles`/`rootClasses` через Object.assign vs массив | F1 | BaseModal | ✅ |
| 10 | `initials` без guard от пустых сегментов (G28) | G28 | BaseAvatar | ✅ |
| 11 | Orphan-файлы (мёртвый код) | G16 | 3 файла удалены | ✅ |
| 12 | FormFieldError/FormFieldLabel не подключены | G29 | 7 потребителей | ✅ |
| 13 | Обратная совместимость `#tag` slot `:remove` | — | BaseSelect | ✅ |

---

## Подробности по пунктам

### 1. BaseButton — дубль-импорт (G5/G11)
`SIZE_SCALE_DEFAULT` импортировался 4 раза (строки 31/33/36/39). Импорты приведены к единому блоку.
Guard в `handleClick` оставлен: тесты доказали, что он защитный (программный `.click()` на disabled-кнопке срабатывает), переписан в early-return.

### 2. Единый контракт `click` (F1/LSP)
`BaseBadgeEmits.click` теперь эмитит `MouseEvent` (ранее без payload) — соответствует `BaseButton`/`BaseAvatar`.

### 3-5. BaseSelect — рефакторинг тегов и выводов
- `selectedLabel` выводится из `selectedOption` (ранее независимый `find` — DRY)
- Теги рендерятся по `item.value` (`:key="item.value"`), `removeValue(item.value)` — реально удаляет по value
- `removeValue(value)` с обратной совместимостью: `resolveOptionValue()` матчит `option.value`, при промахе fallback на `option.label` (для потребителей слота `#tag`, передающих label)
- `selectedItems` (filter) + `selectedLabels` (map из `selectedItems`) — фильтр в одном месте, дрейф исключён
- Слот `#tag` дополнительно получает `:items` (value+label)

### 6. Магические числа → константы (G25)
Новые константы в `constants/ui.ts` + реэкспорт `constants/index.ts`:
- `SIZE_SCALE_DEFAULT = 100` (замена `sizeScale: 100` в ~50 компонентах)
- `DEFAULT_VARIANT = 'default'` (замена `variant: 'default'`)
- `MODAL_CLOSE_BUTTON_PADDING = 2` (BaseModal `:padding="2"`)
- `SIZE_SCALE_OFFSET = 10` (BaseAlert `props.sizeScale - 10`, 2 вхождения)

### 7. BaseEditor — симметричное именование (N4)
Пара `resetTextColor` / `resetBackgroundColor` (было `resetBackgroundColorState`). Деструктурированные функции алиасованы `resetColorFn`/`resetBackgroundColorFn` для устранения коллизии имён.

### 8. Единый `defineExpose` (LSP)
- `BaseButton`: `defineExpose({ buttonRef, focus, blur })` — добавлен `buttonRef` + ref на `<button>`
- `BaseSelect`: `defineExpose({ selectRef, focus, blur, validate, reset })` — добавлен `selectRef` (ref перенесён на фокусируемый `.base-select__trigger`), `focus`/`blur`
- Заодно исправлен **висячий template-ref**: `selectRef` использовался в шаблоне, но не был объявлен в `<script setup>`

### 9. BaseModal — унификация стилей (F1)
`rootClasses`/`rootStyles` (через `Object.assign` + `filter(Boolean)`) заменены на единый массивный `:class`/`:style` как во всём kit. Убраны 2 лишних computed.

### 10. BaseAvatar — guard initials (G28)
`initials` устойчив к пустым сегментам имени: `n[0] ?? ''`, `.filter(Boolean)`, fallback `|| '?''`. Имя из одних пробелов даёт `?` вместо пустоты.

### 11. Удаление orphan-файлов (G16)
- `BaseEditorContextMenu.vue` — context menu инлайнен в BaseEditor
- `BaseTableFooterBar.vue` — footer инлайнен в BaseTable
- `BaseCalendar/model/BaseCalendarDays.types.ts` — дубликат `ui/`-версии
- `CLEAN_CODE_ANALYSIS_5.md`, `CLEAN_CODE_ANALYSIS_6.md` — транзитные доки

### 12. Подключение FormFieldError/FormFieldLabel (G29)
- Barrel `BaseFormField/index.ts` — добавлены экспорты
- `FormFieldLabel` — добавлен проп `tag` (по умолчанию `'label'`) для поддержки `tag="span"` (BaseCheckbox/Radio/Switch)
- 7 потребителей переведены с инлайн-рендеринга на компоненты: BaseInput, BaseSelect, BaseCheckbox, BaseTextarea, BaseRadio, BaseSwitch, BasePin
- Убраны неиспользуемые импорты `BaseText` из 4 файлов

### 13. Обратная совместимость `#tag` slot `:remove`
Выявлено в код-ревью: контракт слота `:remove` изменился с label→value. `resolveOptionValue()` обеспечивает обратную совместимость (fallback на label).

---

## Результаты код-ревью

### Раунд 1 (после первой волны правок)
| Severity | Файл:Line | Замечание | Статус |
|----------|-----------|-----------|--------|
| WARNING | BaseSelect:52 | Breaking `#tag` slot `:remove` (label→value) | ✅ Fixed (resolveOptionValue) |
| SUGGESTION | BaseSelect:240 | Дублирование фильтра selectedItems/selectedLabels | ✅ Fixed (derive) |
| SUGGESTION | constants/ui.ts:149 | `SIZE_SCALE_OFFSET` не использован | ✅ Fixed (wired в BaseAlert) |

### Раунд 2 (после второй волны правок)
| Severity | Файл:Line | Замечание | Статус |
|----------|-----------|-----------|--------|
| WARNING | BaseSelect:11 | `selectRef` на не-фокусируемой обёртке → focus()/blur() no-op | ✅ Fixed (ref на .base-select__trigger) |

---

## Отложено (с обоснованием)

| # | Проблема | Причина |
|---|----------|---------|
| A | Единый стиль `props.` в шаблонах (F1) | Kit-wide sweep ~50 файлов, нулевая функциональная ценность, высокий churn, риск visual-тестов. Каждый файл внутренне консистентен. |
| B | Единый порядок импортов (type/value/style) (F1) | Аналогично. eslint-правил сортировки нет. |
| C | BaseEditor: временное связывание `handleInput` (G30, Stepdown Rule) | Циклическое по природе (onInput-колбэк), требует выноса `useEditor` composable — крупный рефакторинг с риском регрессий в contenteditable-логике. |
| D | BaseSelect: SRP (G33), ~315 строк | Кандидат на вынос `useSelect` composable по аналогии с `useEditorToolbar`. Крупный рефакторинг. |

Пункты C-D рекомендовано выполнять отдельной веткой с полным тест-раном.

---

## Верификация

| Проверка | Результат |
|----------|-----------|
| `eslint` (изменённые файлы) | ✅ 0 ошибок, 0 warnings |
| `vitest` unit (затронутые компоненты) | ✅ 284+ тестов пройдены |

---

## Изменённые файлы (57 отслеживаемых)

- `src/constants/ui.ts`, `src/constants/index.ts` — новые константы + реэкспорт
- `src/composables/useBaseComponent/*`, `src/composables/useSizeScale/*` — `SIZE_SCALE_DEFAULT`
- `src/components/BaseFormField/index.ts` — экспорт FormFieldError/FormFieldLabel
- `src/components/BaseFormField/ui/FormFieldError.vue`, `FormFieldLabel.vue` — `tag` проп (новые файлы в рабочем дереве)
- 7 потребителей FormField: BaseInput, BaseSelect, BaseCheckbox, BaseTextarea, BaseRadio, BaseSwitch, BasePin
- BaseButton, BaseBadge (+types), BaseAvatar, BaseAlert, BaseModal, BaseEditor — точечные правки
- ~40 компонентов — замена `sizeScale: 100` → `SIZE_SCALE_DEFAULT`, `variant: 'default'` → `DEFAULT_VARIANT`
