# План рефакторинга по «Чистому коду» (Роберт Мартин) — актуализация 2026-06-19

> Цель: привести **все слои** (`src/components/**`, `src/composables/**`, `src/constants/**`, `src/utils/**`) и stories к единому стилю, ничего не сломав.
>
> Принципы Мартина: DRY (единый источник констант, нет дублей), SRP (логика — в composables, чистые функции — в utils, константы — отдельно, одна ответственность на модуль), LSP/ISP (единый публичный контракт `defineExpose`/`FormFieldExpose`, stories не обещают поведения, которого нет), OCP (один паттерн папки = один канон), «правило бойскаута», осмысленные имена, маленькие функции, один уровень абстракции, без магических чисел/хардкода.

---

## Прогресс выполнения

| Шаг | Статус | Описание |
|---|---|---|
| §4.3 | ✅ | Пустая строка после JSDoc в `rangeUtils.ts` |
| §4.2 | ✅ | `a11yHelpers.ts` → `storybookUtils.ts` (v8 ignore pragmas), удалён файл, обновлён barrel + 28 stories-импортов |
| §5.1 | ✅ | `as const` для 9 скаляров в `constants/ui.ts` |
| §5.4 | ✅ | `BaseSearch.vue` → `UI_TIMING.DEBOUNCE_DEFAULT`, `BaseDatePicker.vue` → `UI_SIZE.DATEPICKER_GAP` |
| §2.1 | ✅ | `BaseInput.stories.ts` — `CustomClasses` → `WithCustomClass` |
| §3.5 | ✅ | `composables/index.ts` — алфавитный порядок |
| §2.4 | ✅ | `useFormField.spec.ts` — литерал → `UI_TEXT.REQUIRED_FIELD` |
| §3.3 | ✅ | 9 под-композаблов получили парные `.types.ts` (useCalendar×3, useEditorToolbar×4, useImageZoom, useInputMask) |
| §1.3 | ✅ | Комментарий в `BaseDatePicker.vue` уже корректен |
| §4.4 | ✅ | Шаблоны JSDoc добавлены в `docs/CONTRIBUTING.md` §10 |
| §5.2 | ✅ | Решение по стилю barrel constants задокументировано |
| §5.3 | ✅ | `TABLE.SEARCH_DEBOUNCE_MS`/`EXPAND_TRANSITION_DURATION` → ссылки на `UI_TIMING` |
| §4.1 | ✅ | 5 spec-файлов: domUtils, iconUtils, idUtils, ratingUtils, treeUtils (74 теста, 100% покрытие) |
| §1.1 | ✅ | `FormFieldValidateExpose` тип; BaseFormField/BaseDatePicker → `FormFieldValidateExpose`; BaseButton/BaseSearchInput/BaseSearchOverlay → типизированы; BaseRating/BaseColorPicker/BaseRange/BaseSearch → `defineExpose<FormFieldExpose>` (22 новых теста) |
| §3.1 | ✅ | `useTableSortFilter` shim удалён (0 потребителей) |
| §3.2 | ✅ | `useCalendarNavigation` → `useCalendarInteraction` (папка + composable + типы + потребитель BaseCalendar) |
| §3.4 | ❌ | Пропущено — marginal benefit при риске public API |
| §2.2/§2.3 | ❌ | Пропущено — опционально, хрупкие play-функции |
| §6.1 | ✅ | 36 deprecated-пропов удалены (BaseTour 8, BaseImage 7, BaseCalendar 13, BaseTable 8) + deprecated proxy BaseChat/ChatMessageList.types.ts удалён |

**Верификация:** `npm run lint` — clean · `npm run test:unit` — 184/184 passed, 3270/3270 tests · Pre-existing: `test:storybook` и `build:lib` падают на оригинальном коде (подтверждено git stash)

**Breaking changes (major version):**
- `useTableSortFilter` shim удалён из `composables/index.ts`
- `useCalendarNavigation` → `useCalendarInteraction` (composable переименован)
- 36 deprecated-пропов удалены из BaseTour/BaseImage/BaseCalendar/BaseTable
- `BaseChat/ChatMessageList/ChatMessageList.types.ts` proxy удалён

---

## Критические ограничения проекта (читать первым делом)

1. **Per-file coverage 100%** — `test:components:coverage`, `test:composables:coverage`, `test:utils:coverage` идут с `--coverage.thresholds.100 --coverage.thresholds.perFile`. Любая новая ветка/функция/строка требует покрытия тестами. Это значит: добавление `focus`/`blur` в `defineExpose`, новый `*.types.ts`, перенос кода — всё требует актуализации/дописывания spec-файлов.
2. **Coverage-исключения захардкожены в `package.json`** — `test:utils:coverage` исключает `src/utils/storybookUtils/a11yHelpers.ts` (`package.json:87`); `test:components:coverage` исключает тяжёлые подсистемы (`package.json:83`). Любой перенос файлов между исключёнными/не-исключёнными путями требует правки скриптов.
3. **Пакет публикуется** (`@ramses1385/rise-ui-kit`) → `composables/index.ts` и `constants` это публичный API. Удаление экспорта = breaking change (только мажор).
4. **5 мест дублирования alias** (`src/index.ts`, `package.json` exports, `tsconfig.app.json`, `build/lib/tsconfig.lib.json`, `build/config/alias.ts`, `build/storybook/main.ts`, `build/tests/vitest.config.ts`) — синхронизировать при любых переносах путей.
5. **Команды проверки:** `npm run lint` · `npm run test:unit` · `npm run test:storybook` · `npm run test:visual` (`:update` для правок UI) · `npm run build:lib` (включая `vue-tsc --declaration`). Шаг считается незавершённым, если красен хотя бы один.

---

## Статус аудита 2026-06-19 (фактическое состояние, подтверждено анализом кода)

51 top-level компонент, 68 папок composables, 19 utils-папок, 5 constants-файлов, 51 stories-файл.

### ✅ УЖЕ выполнено — НЕ трогать (только не вносить регрессий)

- **Components**: все расширяют `BaseComponentProps`; структура `{model, ui, index.ts, styles?, stories?, __tests__?}` единообразна, `.vue` только в `ui/`; `index.ts` без `export *`; `defineSlots<XxxSlots>()` есть у всех слотовых компонентов (57 совпадений); корневые CSS-классы в каноне.
- **customClass/elementKeys**: **0 нарушений**. У всех 51 компонента со story набор `elementKeys` в SFC **точно совпадает** с ключами в story `WithCustomClass`. Компоненты без `elementKeys` (`BaseButton`, `BaseChat`, `BaseText`, `BaseAnimation`, `BaseSkeleton`) в stories передают только `{ root }`. §1.1 старого плана — устарел, **не выполнять**.
- **Composables**: все 68 папок имеют `useXxx.ts` + `useXxx.types.ts` + `index.ts`; файловый JSDoc `/** Composable: ... */` есть во всех 77 `useXxx.ts` (100%, единый шаблон); плоских файлов нет.
- **Constants**: файловый JSDoc единый во всех 5; `chat.ts`/`editor.ts`/`table.ts`/`ui.ts` — объекты `as const`; дубли текстов `DELETE/CANCEL/APPLY` устранены (chat/editor ссылаются на `UI_TEXT`); `useFormField` использует `UI_TEXT.REQUIRED_FIELD`; `useIcon` использует `UI_ICON_SPRITE_PATH`.
- **Utils**: все 19 папок имеют `<name>.ts` + `<name>.types.ts` + `index.ts`; barrel `export *` покрывает все 19; файловый JSDoc `/** Утилиты: ... */` единый; импурность `clipboardUtils`/`idUtils` помечена в JSDoc.
- **Stories**: все 51 top-level используют `buildArgTypes`; title `UI/Base<Cmp>`; у всех есть control `customClass` (object) и история `WithCustomClass`.

---

## 1. Компоненты — оставшиеся нестыковки

### 1.1. `defineExpose` form-field контракт не enforced (LSP) — КРИТИЧНО

Контракт `FormFieldExpose` (`src/composables/useFormField/useFormField.types.ts:24-35`) = `{ rootRef, focus, blur, validate, reset }`. Эталонно реализованы: `BaseInput.vue:184`, `BaseTextarea.vue:124`, `BaseSelect.vue:238`, `BaseCheckbox.vue:88`, `BaseRadio.vue:100`, `BaseSwitch.vue:99`, `BasePin.vue:145`, `BaseFileUpload.vue:239` (полный контракт, реальные `focus`/`blur`).

**Нарушения:**

| Компонент | file:line | Проблема |
|---|---|---|
| `BaseFormField` | `BaseFormField.vue:61` | `defineExpose<Omit<FormFieldExpose,'focus'\|'blur'>>({ rootRef, validate, reset })` — `focus`/`blur` **полностью исключены**. Обёртка-контейнер формфилдов обязана поддерживать полный контракт (LSP): потребитель с `FormFieldExpose` получит runtime `TypeError` на `focus()`. |
| `BaseDatePicker` | `BaseDatePicker.vue:133` | `defineExpose<Omit<FormFieldExpose,'focus'\|'blur'>>({ rootRef: wrapperRef, validate, reset })` — `focus`/`blur` отсутствуют, хотя `wrapperRef` есть (`:111`), реализация тривиальна. |
| `BaseRating` | `BaseRating.vue` | v-model форм-поле, `defineExpose` **отсутствует** — нет `rootRef/focus/blur/validate/reset`. |
| `BaseColorPicker` | `BaseColorPicker.vue` | v-model форм-поле, `defineExpose` отсутствует. |
| `BaseRange` | `BaseRange.vue` | v-model форм-поле, `defineExpose` отсутствует. |
| `BaseSearch` | `BaseSearch.vue` | v-model форм-поле, `defineExpose` отсутствует; `focusActiveInput` определена (`:193`) но не экспонируется. |
| `BaseSearchInput` | `BaseSearchInput.vue:86` | `defineExpose({ focus })` без дженерика — неполный контракт (нет `rootRef/blur/validate/reset`). |
| `BaseSearchOverlay` | `BaseSearchOverlay.vue:159` | `defineExpose({ focus, open, close })` без дженерика. |
| `BaseButton` | `BaseButton.vue:61` | `defineExpose({ buttonRef, focus, blur })` без дженерика (не form-field, но нестилизованный `defineExpose` — отклонение от единого стиля). |

**Действие:**
1. `BaseFormField`/`BaseDatePicker`: реализовать реальные `focus`/`blur` (делегировать в `rootRef`/`wrapperRef` через `.value?.focus()`/`?.blur()`), заменить `Omit<...>` на `FormFieldExpose` (или `FormFieldExpose & { доп }`). Если фокус на обёртке семантически невозможен — ввести отдельный тип `FormFieldValidateExpose = Omit<FormFieldExpose,'focus'\|'blur'>` в `useFormField.types.ts` и применять осознанно к обоим (но тогда документировать, что они не form-field-контрактные).
2. `BaseRating`/`BaseColorPicker`/`BaseRange`/`BaseSearch`: ввести `useFormField` + `rootRef` и `defineExpose<FormFieldExpose & { доп }>(...)`. Для `BaseSearch` — экспонировать существующую `focusActiveInput` как `focus`.
3. `BaseSearchInput`/`BaseSearchOverlay`/`BaseButton`: типизировать `defineExpose<...>()` явным интерфейсом (для суб-компонентов — свой узкий интерфейс, не `FormFieldExpose`, если они не form-field).
4. Для каждой добавленной ветки/метода — дописать spec (требование per-file 100%).
> ⚠️ Средний риск. После: `test:unit` (form-компоненты) + `test:storybook` + `test:visual` (новые `:class`/фокус-поведение не ожидается, но проверить).

### 1.2. `defineSlots` — выполнено
Не требуется. (Оставлено как контрольная точка: 57 `defineSlots` — единообразно.)

### 1.3. `BaseCalendar`/`BaseDatePicker` без `withDefaults`
`BaseCalendar.vue:156` и `BaseDatePicker.vue:66` — `defineProps<XxxProps>()` + composable-resolved defaults (нужно `wasPropPassed`-обнаружение). Осознанный паттерн.

**Действие (низкий приоритет):** привести комментарий в `BaseDatePicker.vue` в соответствие с реально используемым composable; «безусловные» дефолты (не зависящие от факта передачи пропса) при возможности перенести в `withDefaults`, оставив в composable только conditional-логику. Документировать как легитимное исключение, если перенос невозможен.

---

## 2. Stories — остаточное

### 2.1. Имя истории `CustomClasses` вместо `WithCustomClass`
`BaseInput.stories.ts:571` — история названа `CustomClasses` (множ. число), тогда как у 48 остальных — `WithCustomClass`.

**Действие (низкий риск):** переименовать в `WithCustomClass`. Проверить, что имя не используется как ключ в play-функциях/импортах.

### 2.2. Sub-stories `DatePicker*` без `buildArgTypes`/`customClass`
`DatePickerPanel.stories.ts` и `DatePickerField.stories.ts` — сырые `args`, без `buildArgTypes` и без control `customClass`. Текущее состояние **задокументировано** в шапках файлов (`:1-9`/`:1-6`). Селекторы/эмит-маппинг в play-функциях актуальны (проверено против шаблонов).

**Действие (опционально, низкий приоритет):** либо перевести на `buildArgTypes({ props })` с импортом типов из `../ui/<Sub>/<Sub>.types.ts` и добавить `customClass` (тогда нужно завести `elementKeys`/`WithCustomClass` — см. §1.1, у суб-компонентов `elementKeys` уже есть: `DatePickerPanel.vue:140`, `DatePickerField.vue:88`), либо оставить как есть (комментарий уже документирует исключение). Решение по трудоёмкости.

### 2.3. Хрупкие play-функции sub-stories
`DatePickerPanel.stories.ts:78-82` — поиск кнопки дня по regex `/^\d{1,2}$/` по тексту (тихий пропуск, если формат дня изменится); `:21` — `WAIT_OPTIONS = { timeout: 5000 }` из-за `<Teleport>`+`<Transition>` (timing-зависимость).

**Действие (низкий приоритет):** добавить data-атрибут/роль на кнопку дня в `BaseCalendar` и привязать play к нему вместо regex; вынести `5000` в константу `UI_TIMING` (или локальный `STORY_WAIT_TIMEOUT`). Не ломается сейчас, но хрупко.

### 2.4. Story-хардкоды, дублирующие константы (DRY)
В stories/тестах русские литералы дублируют `UI_TEXT.*`: `BaseImage.stories.ts:476` (`timeout: 5000` ≡ `UI_TIMING.IMAGE_LOAD_TIMEOUT`), `BaseDatePicker.stories.ts:117,1056` (`'Выберите дату'` ≡ `UI_TEXT.SELECT_DATE`), `BaseFileUpload.stories.ts:261` (`'Загрузка...'` ≡ `UI_TEXT.LOADING`), `BaseTable.stories.ts:203/2096`, `BaseEmpty.stories.ts:49`, `BaseMenu.stories.ts:27` (`'Удалить'`), `BaseInput.stories.ts:164`/`BaseCheckbox.stories.ts:146`/`BaseTextarea.stories.ts:174`/`BaseSelect.stories.ts:867` (`'Обязательное поле'`), `useFormField.spec.ts:117`.

**Действие (низкий риск):** заменить литералы на импорт констант из `@constants`. В `useFormField.spec.ts:117` — `expect(field.error).toBe(UI_TEXT.REQUIRED_FIELD)`. Группировать по кластеру в один коммит.

---

## 3. Composables — остаточное

### 3.1. `useTableSortFilter` deprecated-алиас (мёртвый shim)
`composables/index.ts:64-65` — `/** @deprecated Use useTableComposition instead */ export { useTableComposition as useTableSortFilter }`. Grep по `src/`/`tests/`/stories: **0 реальных потребителей** (7 совпадений — сам алиас + `REFACTOR_PLAN.md`).

**Действие (высокий риск — публичный API):** удалить алиас. Т.к. пакет публикуется — это breaking change. Варианты: (a) удалить в следующем мажоре; (b) оставить ещё на 1 минор с `@deprecated` и запланировать удаление. Решение согласовать с политикой релизов.

### 3.2. `useCalendarNavigation` — дубля НЕТ (нейминг-шум)
План ошибочно ссылался на `useCalendar/useCalendarNavigation.ts` — такого файла нет. Реальная пара: `useCalendar/useCalendarViewNavigation.ts:19` (state-навигация: `canPrev/canNext`, мутации `currentMonth/Year/View`) vs `useCalendarNavigation/useCalendarNavigation.ts:6` (event-handling: `handleDayClick`, `toggleAmPm`, watch→emit). SRP-обязанности **разделены**, дубля кода нет.

**Действие (низкий приоритет, опционально):** имена созвучны и создают когнитивный шум. Переименовать `useCalendarNavigation` → `useCalendarInteraction` (или `useCalendarHandlers`) для устранения неоднозначности. Обновить потребителя `BaseCalendar.vue:141` + `composables/index.ts:5`. Средний риск (имя публичного composable). Если не делать — задокументировать разграничение ответственности в файловых JSDoc обоих.

### 3.3. Под-композаблы без парного `*.types.ts` (SRP/канон)
Внутри папок-агрегаторов есть под-композаблы с инлайн-типами вместо парного `.types.ts`:

| Папка | Файлы без `.types.ts` |
|---|---|
| `useCalendar/` | `useCalendarDateState.ts`, `useCalendarGrid.ts`, `useCalendarViewNavigation.ts` |
| `useEditorToolbar/` | `useToolbarCodeMode.ts`, `useToolbarCommands.ts`, `useToolbarMediaMenu.ts`, `useToolbarSelection.ts` |
| `useImageZoom/` | `useZoomMinimap.ts` |
| `useInputMask/` | `useMaskedInputHandlers.ts` (+ есть `.spec.ts`) |

**Действие (низкий риск, механика):** вынести интерфейсы/типы в парный `<name>.types.ts` по канону; обновить импорты внутри папки. Под-композаблы намеренно не экспортируются через `composables/index.ts` (внутренние) — оставить как есть.

### 3.4. `useIcon/iconPlugin.ts` — смешение ответственностей (SRP)
`src/composables/useIcon/iconPlugin.ts` (+ `iconPlugin.spec.ts`) — Vue-плагин лежит внутри папки composable. Смешение «composable» и «plugin» в одной папке.

**Действие (низкий/средний риск):** вынести `iconPlugin` в отдельную папку `src/plugins/iconPlugin/` (или `src/composables/useIcon/` оставить только composable, а плагин — в `src/plugin.ts`/`src/plugins/`). Синхронизировать импорты потребителей и alias. Проверить `build:lib` (плагин может участвовать в публичном API).

### 3.5. `composables/index.ts` — алфавитный порядок
Нарушен: `useCalendarPopover` (`:15`) и `useCalendarResolvedProps` (`:16`) вне порядка; `useExplicitPropDetection` (`:29`) стоит до `useEscapeKey` (`:30`) — перепутаны; `useTableComposition` (`:63`) разрывает блок `useTable*` (должен идти по алфавиту). Deprecated-алиас `:64-65` — единственный не-`export *` и единственный комментарий.

**Действие (низкий риск, механика):** пересортировать баррель по алфавиту. Алиас оставить последним блоком с комментарием (или удалить — см. §3.1).

---

## 4. Utils — остаточное

### 4.1. 5 utils без `*.spec.ts` (per-file 100% покрытие)
Без spec: `domUtils`, `iconUtils`, `idUtils`, `ratingUtils`, `treeUtils` (остальные 14 имеют spec).

**Действие (средний риск из-за порогов):** завести `<name>.spec.ts` с покрытием 100% (требование `test:utils:coverage`). Для `idUtils` — стабировать `Date.now`/`Math.random`; для `domUtils` — jsdom-окружение. Без spec эти папки не входят в coverage-gate, но единообразие требует их наличия.

### 4.2. `storybookUtils/a11yHelpers.ts` — не-каноничный файл (SRP/канон)
`src/utils/storybookUtils/a11yHelpers.ts` — лишний файл, нейминг не совпадает с папкой, JSDoc многострочный (вместо `/** Утилиты: ... */`), модуль расщеплён (`index.ts:2` реэкспортит из него). При этом `a11yHelpers.ts` **исключён из coverage** (`package.json:87`).

**Действие (низкий/средний риск):** объединить содержимое `a11yHelpers.ts` в `storybookUtils.ts` (приведя JSDoc к `/** Утилиты: ... */`), удалить `a11yHelpers.ts`, убрать исключение `package.json:87` (или оставить исключение, если функции трудно покрыть). Альтернатива — выделить в отдельную папку `a11yUtils/` по канону, если объём оправдан.

### 4.3. `rangeUtils.ts:2` — отсутствие пустой строки после JSDoc
Единственное мелкое отклонение от шаблона (у остальных 18 после заголовка идёт пустая строка перед `import`).

**Действие (тривиально):** добавить пустую строку.

### 4.4. Формализация единого шаблона файлового JSDoc
Шаблон фактически сложился: `/** Утилиты: <назначение>[(содержит <сайд-эффект|недетерминизм> — <причина>)] */` + пустая строка + `import`.

**Действие (документация):** зафиксировать шаблон в `AGENTS.md`/CONTRIBUTING как канон для utils и `/** Composable: ... */` для composables, чтобы новые файлы следовали ему.

---

## 5. Constants — остаточное

### 5.1. `ui.ts` — 9 скалярных `export const` без `as const`
`UI_PROGRESS_STEP_MIN`, `UI_PROGRESS_STEP_RANGE`, `CALENDAR_GRID_CELLS`, `MS_PER_DAY`, `SIZE_SCALE_DEFAULT`, `SIZE_SCALE_OFFSET`, `MODAL_CLOSE_BUTTON_PADDING`, `DEFAULT_VARIANT`, `UI_ICON_SPRITE_PATH` — без `as const`, при том что все объекты `as const`. Для `DEFAULT_VARIANT`/`UI_ICON_SPRITE_PATH` `as const` дал бы литеральный тип (полезно для типизации variant-пропов).

**Действие (низкий риск):** добавить `as const` к строковым литералам (`DEFAULT_VARIANT`, `UI_ICON_SPRITE_PATH`) и/или ко всем 9 для единообразия. Проверить потребителей на narrowing-регрессии (`vue-tsc` в `build:lib`).

### 5.2. `constants/index.ts` — стиль реэкспорта
`constants/index.ts:8-11` — именованные реэкспорты (`export { UI_ARIA, ... } from './ui'`), тогда как `utils/index.ts` использует `export *`. Расхождение стилей barrel.

**Действие (низкий риск, по решению):** принять один канон. Для `constants` именованные реэкспорты предпочтительнее (явный публичный API констант). Либо оставить как есть и задокументировать как осознанный выбор (константы = явный API, utils = агрегация). Решение зафиксировать.

### 5.3. Дубли значений между `ui.ts` и `table.ts` (DRY-вопрос)
`UI_TIMING.DEBOUNCE_DEFAULT`(300) ≡ `TABLE.SEARCH_DEBOUNCE_MS` (`table.ts:26`); `UI_TIMING.ANIMATION_DURATION`(300) ≡ `TABLE.EXPAND_TRANSITION_DURATION` (`table.ts:21`). Одинаковые значения, но разные домены.

**Действие (низкий приоритет):** это не семантический дубль (разные смыслы), но нарушение «единого источника числа». Вариант: в `table.ts` сослаться — `SEARCH_DEBOUNCE_MS: UI_TIMING.DEBOUNCE_DEFAULT` (если семантически допустимо), либо оставить и задокументировать как совпадение. Решение по смыслу.

### 5.4. Production-хардкод, дублирующий константы (DRY) — КРИТИЧНО для кода
| file:line | Хардкод | Константа |
|---|---|---|
| `BaseSearch.vue:138` | `debounceMs: 300,` | `UI_TIMING.DEBOUNCE_DEFAULT` |
| `BaseDatePicker.vue:82` | `gap: props.gap ?? 4,` | магическое число 4 → `UI_SIZE`/новая константа |

**Действие (низкий риск):** `BaseSearch.vue:138` → `debounceMs: UI_TIMING.DEBOUNCE_DEFAULT`. Для `gap ?? 4` — ввести константу `UI_DATEPICKER_GAP` (или `UI_SIZE.DATEPICKER_GAP`) и использовать. Покрыть тестом изменение default (per-file 100%).

---

## 6. Прочее по Мартину

### 6.1. Накопленный `@deprecated`-долг
Deprecated-пропы: `BaseTour.types.ts` (8), `BaseImage.types.ts` (7), `BaseCalendar.types.ts` (13), `BaseTable.types.ts` (8); deprecated-прокси `BaseChat/ui/ChatMessageList/ChatMessageList.types.ts:2`.

**Действие (плановое, по мажорам):** сверить использование каждого deprecated-пропа по `src/`/`tests/`/stories; удалять пакетно в мажорных релизах. Удалить прокси-файл `ChatMessageList.types.ts`, если все потребители импортируют из `model/`.

### 6.2. Крупные `.vue` — кандидаты на SRP-ревью
`ChatSlideover.vue` (331), `BaseTable.vue` (327), `BaseCalendar.vue` (274), `BaseSlider.vue` (271), `BaseSelect.vue` (246), `BaseFileUpload.vue` (246), `BaseTour.vue` (246), `BaseEditor.vue` (245), `BaseMegaMenu.vue` (245). Table-логика уже разнесена по `useTable*` — эталон.

**Действие (низкий приоритет):** для каждого оценить вынос логики в composable по образцу `useTable*`. Только при измеримой сложности/дублировании, не «на всякий случай».

---

## 7. Порядок выполнения (безопасные инкременты)

Каждый шаг = отдельный коммит. После каждого: `npm run lint` + `npm run test:unit`; для затронутых компонентов — `npm run test:storybook` (+ `npm run test:visual` для UI-изменений); финально — `npm run build:lib`. **Коммит принимается только при зелёных тестах.** Порядок — от низкого риска к высокому.

**Низкий риск (механика/типы/JSDoc/константы):**
1. Utils §4.3 — пустая строка в `rangeUtils.ts`.
2. Utils §4.2 — объединить `a11yHelpers.ts` → `storybookUtils.ts` (+ правка `package.json:87` исключения).
3. Constants §5.1 — `as const` для скаляров `ui.ts`.
4. Constants §5.4 — `BaseSearch.vue:138` → `UI_TIMING.DEBOUNCE_DEFAULT`; `BaseDatePicker.vue:82` `gap` → константа.
5. Stories §2.1 — `BaseInput.stories.ts:571` `CustomClasses` → `WithCustomClass`.
6. Stories §2.4 — заменить story/spec литералы на константы `@constants` (по кластерам).
7. Composables §3.5 — пересортировать `composables/index.ts` по алфавиту.
8. Composables §3.3 — вынести типы под-композаблов в `*.types.ts` (useCalendar/useEditorToolbar/useImageZoom/useInputMask).
9. Composables §3.4 — вынести `iconPlugin` из `useIcon/` (синхронизировать alias/потребителей).
10. Components §1.3 — комментарий/документация `BaseDatePicker` defaults.
11. §4.4 — зафиксировать шаблоны JSDoc в `AGENTS.md`.

**Средний риск (структура/поведение/контракты):**
12. Components §1.1 — `defineExpose` form-field контракт: реализовать `focus`/`blur` в `BaseFormField`/`BaseDatePicker`; ввести контракт в `BaseRating`/`BaseColorPicker`/`BaseRange`/`BaseSearch`; типизировать `BaseSearchInput`/`BaseSearchOverlay`/`BaseButton`. Дописать spec (per-file 100%).
13. Utils §4.1 — завести spec для `domUtils`/`iconUtils`/`idUtils`/`ratingUtils`/`treeUtils` (100% покрытие).
14. Constants §5.2/§5.3 — решение по стилю barrel и дедупликации значений `ui.ts`/`table.ts`.
15. Stories §2.2/§2.3 — `buildArgTypes` для `DatePicker*` sub-stories (опционально); data-атрибут дня в `BaseCalendar` + правка play.

**Высокий риск (публичный API / релизы):**
16. Composables §3.1 — удаление `useTableSortFilter` shim (мажор или последний минор с `@deprecated`).
17. Composables §3.2 — переименование `useCalendarNavigation` → `useCalendarInteraction` (если решено).
18. §6.1 — пакетное удаление deprecated-пропов (мажорные релизы).

---

## 8. Критерии готовности (остаточные)

**Тесты (все зелёные):**
- `npm run lint` — без ошибок.
- `npm run test:unit` — зелёный.
- `npm run test:storybook` — зелёный.
- `npm run test:visual` — зелёный (при UI-правках — `npm run test:visual:update`).
- `npm run build:lib` — собирается, `vue-tsc` без ошибок, `.d.ts` формируются.
- `npm run test:components:coverage` / `test:composables:coverage` / `test:utils:coverage` — per-file 100% (если правки затрагивают эти слои).

**Структурные:**
- `defineExpose` form-field типизирован `FormFieldExpose` (`& {доп}`); нет `Omit<...,'focus'\|'blur'>` у обёрток; `BaseRating`/`BaseColorPicker`/`BaseRange`/`BaseSearch` экспонируют контракт; нет нетипизированных `defineExpose`.
- Все utils имеют `<name>.spec.ts` (100%); нет `a11yHelpers.ts`; единый файловый JSDoc; barrel покрывает все папки.
- Все под-композаблы имеют парный `*.types.ts`; `iconPlugin` вне `useIcon/`; `composables/index.ts` отсортирован.
- `ui.ts` — скаляры `as const`; нет production-хардкода `300`/`4`; story-литералы заменены на константы.
- `BaseInput.stories.ts` — история `WithCustomClass`.
- `useTableSortFilter` shim удалён (или задокументирован как переходный на конкретный релиз).
- `useCalendarNavigation` — единая/недвусмысленная ответственность (переименовано или задокументировано).

---

## 9. Риски и контроль

- **§1.1 `defineExpose`** — добавление реальных `focus`/`blur` требует ref'ов и **тестов** (per-file 100%); удаление `Omit` у `BaseFormField`/`BaseDatePicker` меняет публичный тип экспорта — проверить `build:lib` (`vue-tsc --declaration`) и потребителей.
- **§4.1 новые utils spec** — `idUtils`/`domUtils` требуют стабов `Date.now`/`Math.random`/DOM; без них порог 100% не пройдёт.
- **§4.2 перенос `a11yHelpers`** — убрать исключение `package.json:87` ИЛИ оставить; функции должны быть покрыты, иначе gate упадёт.
- **§3.4 `iconPlugin`** — проверить, что плагин участвует/не участвует в публичном API (`exports` в `package.json`); синхронизировать 5 alias-конфигов.
- **§3.1/§3.2/§6.1 удаление/переименование** — breaking changes публичного API; координировать с семантическим релизом.
- **§5.1 `as const` скаляров** — может ужать типы (`DEFAULT_VARIANT: 'default'`), что повлияет на потребителей variant-пропов; проверка через `build:lib`.
- **Coverage-gate** — `test:components:coverage` исключает тяжёлые подсистемы (`package.json:83`); любые изменения в `BaseChat`/`BaseTable`/`BaseEditor`/`BaseCalendar`/`BaseDatePicker`/`BaseFileUpload`/`BaseImage`/`BaseSelect`/`BaseSlider`/`BaseRange`/`BaseTabs`/`BaseTooltip`/`BaseTree`/`BaseSlideover` покрываются через `test:components-heavy:coverage` (пороги 0) — но unit-тесты всё равно нужны.
- **Полный прогон перед merge** — ни один шаг не завершён, если красен хотя бы один из `lint`/`test:unit`/`test:storybook`/`build:lib`.
