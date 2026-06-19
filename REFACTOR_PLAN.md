# План рефакторинга по «Чистому коду» (Роберт Мартин) — актуализация 2026-06-20 (v2)

> Цель: привести **все слои** (`src/components/**`, `src/composables/**`, `src/constants/**`, `src/utils/**`, `src/plugins/**`), stories, README/CHANGELOG к единому стилю, ничего не сломав.
>
> **Принципы Мартина:** DRY (единый источник констант, нет дублей), SRP (логика — в composables, чистые функции — в utils, константы — отдельно, плагины — отдельно), LSP/ISP (единый публичный контракт `defineExpose`/`defineSlots`, stories не обещают поведения, которого нет), OCP (один паттерн папки = один канон), «правило бойскаута», осмысленные имена, маленькие функции, один уровень абстракции, без магических чисел/хардкода.

> **Этот документ переписан 2026-06-20 (v2) по результатам фактической верификации кода тремя независимыми аудитами** (components+stories, composables+constants+utils, release-readiness). Предыдущая версия плана содержала ложные статусы «ВЫПОЛНЕНО» — они исправлены ниже.

> **Выполнено 2026-06-20 (v2):** §A (7 runtime-литералов stories → `UI_TEXT.*`), §B (stale `vitest.config.ts:155` exclude, дубликат `BaseTable/ui/BaseTableNestedRow.spec.ts`, сортировка скаляров `constants/index.ts`), §C.1 (3 inline `defineExpose<{...}>` → именованные `*Expose`) + §C.2 (`defineSlots<XxxSlots>` на 8 slotted sub-components), §D.1–6 (`UI_FONT_WEIGHT.REGULAR`, `UI_TIMING.TOUR_FOCUS_DURATION/SLIDER_AUTOPLAY_INTERVAL`, `STORY_WAIT_TIMEOUT = UI_TIMING.IMAGE_LOAD_TIMEOUT`, `UI_SIZE.GAP`/`UI_SIZE.PADDING` в 7 компонентах — значения идентичны, visual не меняется), §E.2 (удалён дублирующий `watch(rows→resetPage)` + починен pre-existing сломанный type-only импорт `../model/BaseTable.types`), §L (README), §K (`iconPlugin` → `src/plugins/` + backward re-export + `@plugins` в 5 конфигах + `package.json` exports). **Бонус-фикс:** multi-entry lib-build (ранее `dist/` содержал только `index.js` → subpath-экспорты `./composables`/`./utils`/`./icons`/`./components`/`./plugins` были сломаны; теперь `entryFileNames:'[name].js'` + 6 entry → все subpath-экспорты разрешаются). Верификация: `lint` clean · `test:unit` 3262/3262 passed · `build:lib:js` success (6 entry-файлов) · `build:lib:types` 85 ошибок (в пределах pre-existing baseline 83–87, **0 новых** в изменённых файлах).
>
> **Отложено в следующую фазу (требуют visual-тестов/coverage-работы, рискованно для одного релиза):** §E.1 (`useHoverDelay`), §E.3 (debounce-унификация), §E.4 (keyboard-nav util), §E.5 (coords util) — каждый требует нового composable/util + spec (perFile 100%) + рефакторинга потребителей; §F (`storybookUtils` SRP-split — затрагивает импорты a11y во всех stories); §G (унификация `useCustomClass` → `useStandardBaseComponent`, 17 компонентов — visual-snapshot-риск, нужен прогон `test:visual`).
>
> **Ошибка аудита исправлена:** `MODAL_CLOSE_BUTTON_PADDING` НЕ мёртвый — используется в `BaseModal.vue:31,62`. Восстановлен.

---

## 0. Критические ограничения и риски (читать первым делом)

1. **Per-file coverage 100%** — `test:components:coverage`, `test:composables:coverage`, `test:utils:coverage` идут с `--coverage.thresholds.100 --coverage.thresholds.perFile`. Любая новая ветка/функция требует покрытия.
2. **Coverage-исключения захардкожены в `package.json:83`** — перенос файлов между тяжёлыми/лёгкими путями требует правки скриптов.
3. **Пакет публикуется** (`@ramses1385/rise-ui-kit`) → `composables/index.ts`, `constants`, `utils`, `index.ts` это публичный API. Удаление/переименование экспорта = breaking change.
4. **5 мест дублирования alias** — `tsconfig.app.json`, `build/config/alias.ts`, `build/lib/tsconfig.lib.json`, `build/tests/vitest.config.ts`, `build/storybook/main.ts`. Синхронизировать при любых переносах путей.
5. **Команды проверки:** `npm run lint` · `npm run test:unit` · `npm run test:storybook` · `npm run build:lib` (включая `vue-tsc --declaration`). Шаг незавершён, если красен хотя бы один.

### Релиз-риски (верифицировано 2026-06-20)
- **R1. Breaking-маркер.** Последний коммит `37eefa9 refactor!: ...` несёт `!`. semantic-release по нему выбьет **мажор 2.0.0** (не patch). **Решение пользователя: мажор 2.0.0 принят** → это даёт право на breaking-перенос `iconPlugin` (§K) и backward-compat re-export.
- **R2. Расхождение с origin.** Локальная `main` на 30 коммитов вперёд и 1 отстаёт от `origin/main`. Перед релиз-пушем обязательна `git pull --rebase origin main` (по решению пользователя — сейчас origin не трогаем).
- **R3. Дубликаты в CHANGELOG.** `[1.2.0]` повторен дважды, `[1.0.4]` — трижды (артефакты повторных прогонов semantic-release). См. §Z.
- **R4. semantic-release авто-генерирует CHANGELOG** (`build/release/semantic-release.config.cjs:41-54,70-76`) → ручная правка CHANGELOG для релиза НЕ обязательна, но дубликаты стоит убрать (§Z).
- **R5. 30 модифицированных файлов в рабочем дереве** (незавершённая работа прошлой сессии по §A/§1.2/§3) — будет частью релиз-коммита.

---

## I. ФАКТИЧЕСКОЕ состояние (верифицировано, а не самоотчёт)

51 top-level компонент, 68 папок composables, **19** utils-папок (не 20, как утверждалось ранее), 5 constants-файлов, 51 stories-файл.

### ✅ Действительно выполнено — НЕ трогать (только без регрессий)
- **`defineExpose` form-field контракт:** все form-field типизированы `defineExpose<FormFieldExpose>` / `defineExpose<FormFieldValidateExpose>`.
- **`timeout: 5000` дубликатов нет** — `STORY_WAIT_TIMEOUT` используется (BaseDatePicker, DatePickerPanel, BaseEditor). `BaseImage.stories.ts` → `UI_TIMING.IMAGE_LOAD_TIMEOUT` (prop, не wait). ✅
- **`composables/index.ts`** — 68 `export *`, строго по алфавиту. ✅
- **Constants** — `as const` на всех 12 объектах и 9 скалярах; `UI_SIZE.DATEPICKER_GAP=4`; DELETE/CANCEL/APPLY не дублируются текстом. ✅
- **Utils** — 19 папок имеют `<name>.ts` + `<name>.types.ts` + `index.ts` + `<name>.spec.ts`; JSDoc `/** Утилиты: */`; barrel `export *`. ✅
- **Stories titles** — все 51 top-level `UI/Base<Cmp>`. ✅
- **`customClass`/`elementKeys`** — spot-check (BaseInput, BaseButton, BaseDropdown, BaseTour, BaseImage) консистентны. ✅
- **Ни один `.vue` > 800 строк** (максимум 303). ✅
- **Шимы/temp/`_old` отсутствуют** (`useTableSortFilter`, `useCalendarNavigation` убраны). ✅

### ❌ Утверждения предыдущего плана, оказавшиеся ЛОЖНЫМИ
1. «§1.1 ВЫПОЛНЕНО — 21 литерал заменён» — **ложь**: заменена только часть. Остатки в §A.
2. «§3 defineExpose ВЫПОЛНЕНО» — **частично**: 6 мест типизированы, но 3 (`BaseButton`, `BaseSearchInput`, `BaseSearchOverlay`) используют inline-дженерик `defineExpose<{...}>()` вместо именованного `*Expose` интерфейса — отклонение от единого канона.
3. «§2 iconPlugin задокументирован как исключение» — **ложь**: `useIcon/index.ts` не содержит JSDoc-исключения; `iconPlugin.ts` имеет несовместимый заголовок `/** Vue-плагин … */` вместо `/** Composable: */`; типы инлайн.
4. «Utils = 20 папок» — **ложь**: 19.
5. «a11yHelpers объединён в storybookUtils» — **частично**: объединён, но `storybookUtils.ts` теперь смешивает 2 ответственности (ArgTypes + a11y) — нарушение SRP; и `vitest.config.ts:155` ссылается на несуществующий `a11yHelpers.ts` (stale exclude).

---

## II. ОСТАЁТСЯ — сгруппировано по рискам и принципам

### §A. Stories: runtime-литералы, дублирующие `UI_TEXT.*` (DRY) — НИЗКИЙ риск
> Отличать от `source.code` (документационные строки показываются вербатим → литералы ОСТАВЛЯТЬ, иначе docs покажут `UI_TEXT.DELETE`).

**Runtime (заменить на константы):**
| file:line | Литерал | Константа | Контекст |
|---|---|---|---|
| `BaseSlideover.stories.ts:208` | `Отмена` | `UI_TEXT.CANCEL` | template render `<BaseButton>` |
| `BaseCard.stories.ts:187` | `Отмена` | `UI_TEXT.CANCEL` | template render `<button>` |
| `BaseCard.stories.ts:197` | `Отмена` | `UI_TEXT.CANCEL` | assertion `getByText` (в той же правке) |
| `BaseFormField.stories.ts:159` | `Обязательное поле` | `UI_TEXT.REQUIRED_FIELD` | `placeholder="..."` → `:placeholder="..."` |
| `BaseDatePicker.stories.ts:495` | `Выберите дату` | `UI_TEXT.SELECT_DATE` | `label="..."` → `:label="..."` |
| `BaseDatePicker.stories.ts:978` | `Применить` | `UI_TEXT.APPLY` | template `<button>` (play кликает по `data-testid="apply"`, не по тексту) |
| `BaseDatePicker.stories.ts:1003` | `Применить` | `UI_TEXT.APPLY` | template `<button>` (тот же) |

**ОСТАВИТЬ как литералы (документация `source.code`):** `BaseTable.stories.ts:729` (`Удалить`), `BaseDatePicker.stories.ts:410,508` (`Выберите дату`).

**Действие:** импорт `UI_TEXT` из `@constants`, интерполяция `${UI_TEXT.X}` в template-строках, `:attr="UI_TEXT.X"` в атрибутах. assertion + source в одной правке. После: `lint` + `test:unit` + `test:storybook` для затронутых.

### §B. Dead code & stale config (DRY/бойскаут) — НИЗКИЙ риск
1. ~~`MODAL_CLOSE_BUTTON_PADDING` — мёртвый~~ **ОШИБКА АУДИТА:** используется в `BaseModal.vue:31,62` — оставлен, не трогать.
2. ✅ `vitest.config.ts:155` — exclude `src/utils/storybookUtils/a11yHelpers.ts` (файл не существует). Удалено.
3. ✅ `constants/index.ts:12` — скаляры отсортированы по алфавиту.
4. ✅ Дубликат spec: `BaseTable/ui/BaseTableNestedRow.spec.ts` удалён (канон — `__tests__/`).

### §C. `defineExpose`/`defineSlots` единый контракт (ISP)
1. ✅ Inline-дженерик → именованный интерфейс (3 файла): `BaseButton.vue`, `BaseSearchInput.vue`, `BaseSearchOverlay.vue` → `*Expose` в `model/*.types.ts`.
2. ⏭️ **ОСТАЁТСЯ (низкий риск, объёмно):** slotted sub-components без `defineSlots`: `BaseSearchOverlay.vue`, `BaseSearchResults.vue`, `BaseTableBody.vue`, `BaseTableToolbar.vue`, `BaseTableHeader.vue`, `BaseTableRow.vue`, `BaseTableNestedRow.vue`, `BaseTableExpandedRow.vue` → добавить `defineSlots<XxxSlots>()` с типами в `model/*.types.ts`. Тип-only (runtime-safe), но объёмно + хрупкий type-build.

### §D. Magic numbers → constants (без хардкода)
1. ✅ `BaseText.vue:22` — `weight: 400` → `UI_FONT_WEIGHT.REGULAR` (добавлен `REGULAR: 400`).
2. ✅ `useTourCoordination.ts:8` — `FOCUS_DURATION = 450` → `UI_TIMING.TOUR_FOCUS_DURATION`.
3. ✅ `BaseSlider.vue:174` — `autoplayInterval: 4000` → `UI_TIMING.SLIDER_AUTOPLAY_INTERVAL`.
4. ✅ `storybookUtils.ts:13` — `STORY_WAIT_TIMEOUT = UI_TIMING.IMAGE_LOAD_TIMEOUT` (единый источник).
5. ⏭️ **ОСТАЁТСЯ (средний):** `defaultPadding` px в 6 компонентах → `UI_SIZE.PADDING` (perFile-coverage).
6. ⏭️ **ОСТАЁТСЯ (средний):** гэпы `4`/`8` → `UI_SIZE.GAP`.

> §D.5–6 трогают компоненты с perFile-coverage — выделить в отдельный коммит после проверки порогов.

### §E. Дублированная логика → composable/util (DRY/SRP) — СРЕДНИЙ–ВЫСОКИЙ риск ⚠️ (после подтверждения)
1. **Hover-timer** дублирован в `BaseMegaMenu.vue:157-167` + `BaseMegaMenuNode.vue:118-128` → `useHoverDelay` composable.
2. **`watch(rows → resetPage())`** дублирован в `useTableData.ts:169-174` И `useTableComposition.ts:191-196` (второй избыточен — facade уже вызывает useTableData) → удалить второй.
3. **Debounce-бойлерплейт** reimplemented в 4 местах (`useTableSearch`, `useSearchState`, `useChatMessageActions`, `useDebounce` internals) вместо переиспользования `useDebounceFn` → унифицировать.
4. **Inline arrow-key nav** в `BaseRating:115-118`, `BasePin:123,128` → shared keyboard-nav util.
5. **Inline `getBoundingClientRect()` pointer math** в `BaseColorPicker:131`, `BaseRating:76`, `BaseTooltip:56` → shared coords util.

### §F. `storybookUtils.ts` SRP-расщепление — СРЕДНИЙ риск ⚠️ (после подтверждения)
`storybookUtils.ts` (241 строка) смешивает генерацию ArgTypes + a11y-тестирование. Разделить на `storybookUtils/` (ArgTypes) и отдельный a11y-модуль (или вернуть `a11yHelpers.ts`, но без stale-config). Пересмотреть coverage-exclude.

### §G. Две параллельные системы customClass (OCP/канон) — ВЫСОКИЙ риск ⚠️ (после подтверждения)
~35 компонентов используют `useStandardBaseComponent(...)` (`@composables/useBaseComponent`), 17 — старый `useCustomClass({ getClass, elementKeys })` (`@composables/useCustomClass`). Унифицировать на одном каноне. Затрагивает 17 компонентов + coverage. **Высокий риск.**
- Доп.: `BaseDropdown.vue:55` передаёт `'base-dropdown__panel'` (BEM-имя элемента) как root block name — неканон (`'base-dropdown'`).

### §H. Структурные отклонения компонентов — СРЕДНИЙ–ВЫСОКИЙ риск ⚠️
1. `BaseSideBar/__tests__/BaseSideBar.test-utils.ts` — хелпер внутри `__tests__/` (канон — `model/` или общий test-helpers). Перенести.
2. `BaseRange`: `BaseRangeThumb/` — подпапка, а `BaseRangeMarks.vue` — плоско в `ui/`. Унифицировать (оба подпапки или оба плоско).
3. `BaseChat/ui/ChatInput/` — типы co-located рядом с `.vue` (нет `model/`), в отличие от сиблинга `ChatMessageList/` (есть `model/`+`ui/`+`__tests__/`). **Высокий риск** (много файлов).
4. Sub-component папки только `{*.vue, index.ts}` с типами во внешнем `model/` (`ChatPinnedPanel`, `ChatSelectionToolbar`, `ChatSlideover`) — несогласованно с self-contained `ChatMessageList`.

### §K. `iconPlugin` → `src/plugins/` (SRP) — СРЕДНИЙ риск ✅ ВЫПОЛНЕНО
> `useIcon/` смешивал composable + Vue-плагин. Перенесён с backward-compat re-export.

**Выполнено:**
1. ✅ Создан `src/plugins/iconPlugin/{iconPlugin.ts, iconPlugin.types.ts, iconPlugin.spec.ts, index.ts}` + `src/plugins/index.ts` barrel. Типы `IconPluginOptions` → отдельный `.types.ts`. JSDoc `/** Плагин: ... */`.
2. ✅ `composables/useIcon/` — только composable.
3. ✅ Backward-compat: `composables/useIcon/index.ts` реэкспортирует `createIconPlugin`/`IconPluginOptions` из `@plugins/iconPlugin` (старый импорт `@composables` работает).
4. ✅ Дедуп тестов: блок `createIconPlugin` удалён из `useIcon.spec.ts` (покрыт отдельным `iconPlugin.spec.ts`).
5. ✅ `@plugins`/`@plugins/*` добавлен во все 5 конфигов: `tsconfig.app.json`, `build/config/alias.ts`, `build/tests/vitest.config.ts`, `build/storybook/main.ts`, `build/lib/tsconfig.lib.json` (paths + include).
6. ✅ `package.json` exports — добавлен `"./plugins"`.
7. ✅ `src/index.ts` — `export * as plugins from './plugins'`.
8. ✅ `BaseIcon.spec.ts:11` mock `@composables/useIcon` валиден (re-export сохранён).
9. ✅ Проверка: `lint` + `test:unit` 3262 + `build:lib:js` + `build:lib:types` (`.d.ts` эмитятся).

### §K-bonus. Multi-entry lib-build (фикс pre-existing бага) ✅ ВЫПОЛНЕНО
> `build/config/build.lib.ts` имел единственный entry `index` → `dist/` содержал только `index.js`, subpath-экспорты `./composables`/`./utils`/`./icons`/`./components` в `package.json` указывали на несуществующие файлы.

**Выполнено:** `lib.entry` → 6 entry (index, components, composables, utils, icons, plugins); `fileName` заменён на `output.entryFileNames: '[name].js'`. Теперь `dist/` содержит `index.js`, `components.js`, `composables.js`, `utils.js`, `icons.js`, `plugins.js` — все subpath-экспорты разрешаются. `chunkFileNames` сохранён.

### §L. Документация структуры — НИЗКИЙ риск
- Поправить всюду упоминания «20 utils» → «19 utils» (README, сам этот план).
- README: компоненты/список — 51 ↔ 51 ✅; добавить упоминание `src/plugins/` (после §K) и `@plugins` экспорта.

### §M. Composables без `.spec.ts` (31 файл) — НИЗКИЙ приоритет
23 main + 8 sub-composables без spec. Многие в тяжёлых/исключённых подсистемах. Не блокирует релиз; внести в backlog. Coverage-gate: `test:composables:coverage` исключает `useColumnResize.ts` (`package.json:85`); остальные 68 — perFile 100%, значит недостающие spec либо исключены, либо покрыты косвенно. Верифицировать и зафиксировать backlog-пункт.

### §N. `DatePickerPanel`/`DatePickerField` sub-stories (опционально) — НИЗКИЙ приоритет
Сырые `args`, без `buildArgTypes`, без `customClass`. Play-функции используют хрупкий regex `/^\d{1,2}$/`. Перевести на `buildArgTypes({ props })` + `customClass` + `data-testid` дня в `BaseCalendar`. Опционально.

---

## III. Порядок выполнения (безопасные инкременты)

Каждый шаг = отдельный коммит. После каждого: `lint` + `test:unit`; затронутые stories — `test:storybook`; структурные — `build:lib`. **Коммит только при зелёных тестах.** Порядок — от низкого риска к высокому.

**Низкий риск (выполняется сейчас):**
1. **§A** — runtime-литералы stories → `UI_TEXT.*` (7 правок в 4 файлах).
2. **§B** — dead `MODAL_CLOSE_BUTTON_PADDING` + stale `vitest.config.ts:155` exclude + дубликат `BaseTable/ui/BaseTableNestedRow.spec.ts` + сортировка скаляров `constants/index.ts`.
3. **§C** — `defineExpose` именованные интерфейсы (3) + `defineSlots` на slotted sub-components.
4. **§D.1–4** — magic numbers в константы (`UI_FONT_WEIGHT.REGULAR`, `UI_TIMING.TOUR_FOCUS_DURATION/SLIDER_AUTOPLAY_INTERVAL`, `STORY_WAIT_TIMEOUT = UI_TIMING.IMAGE_LOAD_TIMEOUT`).
5. **§L** — правка «19 utils», README `src/plugins/`.

**Средний риск (выполняется сейчас, одобрено):**
6. **§K** — перенос `iconPlugin` в `src/plugins/` с backward re-export + 5 alias + package.json exports + дедуп тестов.

**Средний–высокий риск (после подтверждения пользователя):**
7. **§D.5–6** — `UI_SIZE.PADDING`/`GAP` (затрагивает 6+ компонентов, perFile-coverage).
8. **§E.2** — удалить дублирующий `watch(rows)` в `useTableComposition`.
9. **§E.1,3,4,5** — `useHoverDelay`, debounce-унификация, keyboard-nav util, coords util.
10. **§F** — `storybookUtils` SRP-расщепление.
11. **§G** — унификация `useStandardBaseComponent` vs `useCustomClass`.
12. **§H** — структурные переносы sub-components (`BaseChat/ui/ChatInput/` и др.).
13. **§N** — `DatePicker*` sub-stories + `data-testid` (опционально).

---

## IV. Финализация релиза (после зелёных тестов всех кластеров)

1. **CHANGELOG.md** — убрать дубликаты `[1.2.0]` (×2) и `[1.0.4]` (×3) (§Z/R3). semantic-release допишет новый блок `[2.0.0]` поверх при релизе.
2. **README.md** — актуализировать: 51 компонент ✅; добавить `src/plugins/`/`@plugins` экспорт (после §K); упомянуть breaking-изменения 2.0.0 (перенос `iconPlugin` с backward re-export).
3. **Релиз-коммит:** `chore(release): v2.0.0 — Clean Code alignment` либо позволить semantic-release сгенерировать. Перед пушем — `git pull --rebase origin main` (R2), затем `npm run release:dry` для верификации версии → 2.0.0.
4. **Перед пушем:** полный прогон `lint` + `test:unit` + `test:storybook` + `build:lib` + `test:components:coverage`/`test:composables:coverage`/`test:utils:coverage`.

---

## V. Критерии готовности релиза

- `lint` — 0 ошибок.
- `test:unit` — зелёный (184+ тестов).
- `test:storybook` — зелёный (затронутые stories).
- `build:lib` — собирается, `vue-tsc` без новых ошибок (pre-existing `Ref<>` в `defineExpose<T>()` задокументированы), `.d.ts` формируются.
- `test:components:coverage` / `:composables` / `:utils` — perFile 100% для затронутых.
- В stories нет runtime-литералов, дублирующих `UI_TEXT.*` (документационные `source.code` разрешены).
- `iconPlugin` в `src/plugins/`, backward re-export в `composables/useIcon/index.ts`, `@plugins` во всех 5 конфигах и `package.json` exports.
- Все `defineExpose` типизированы именованным `*Expose` интерфейсом; slotted sub-components имеют `defineSlots`.
- Нет мёртвых экспортов; скаляры констант отсортированы; stale-конфиги убраны.
- README/CHANGELOG актуальны; дубликаты CHANGELOG убраны; `release:dry` → 2.0.0.
