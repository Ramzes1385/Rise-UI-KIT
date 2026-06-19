# План рефакторинга по «Чистому коду» (Роберт Мартин) — актуализация 2026-06

> Цель: привести **все слои** (`src/components/**`, `src/composables/**`, `src/constants/**`, `src/utils/**`) к единому стилю, ничего не сломав, и актуализировать stories.
>
> Принципы Мартина: DRY (единый контракт `BaseComponentProps`, единый источник констант), SRP (логика в composables, чистые функции в utils, константы отдельно), LSP/ISP (единый публичный API), OCP (один паттерн папки = один канон), «правило бойскаута», осмысленные имена, маленькие функции, один уровень абстракции.
>
> **Жёсткие требования (критерии приёмки):**
> 1. **Все тесты проходят успешно** — `npm run lint`, `npm run test:unit`, `npm run test:storybook`, `npm run build:lib` (включая `vue-tsc` генерацию `.d.ts`) — без единой ошибки/падения. Любой шаг, после которого тесты красные, считается незавершённым и не принимается.
> 2. **`customClass` у всех компонентов и его отображение в Storybook** — каждый компонент (через `BaseComponentProps`) обязан поддерживать `customClass`, а его stories — содержать `customClass` в `buildArgTypes` (control `object`) и отдельную story-демонстрацию, покрывающую все `elementKeys` `useCustomClass` (по образцу `BaseTabs`/`BaseSelect`). См. раздел 1.6.

---

## Статус: предыдущая итерация в основном выполнена

Ниже зафиксировано, что уже приведено к канону (подтверждено анализом кода). Эти пункты **повторно не трогать** — только не вносить регрессий.

- **Components**
  - Все 51 компонент расширяют `BaseComponentProps<V>` (`extends BaseComponentProps` — 54 совпадения, включая sub-типы).
  - `defineSlots<XxxSlots>()` проставлен в 50 SFC (все основные + sub-компоненты).
  - `withDefaults(defineProps<>(), {...})` используется в 59 SFC.
  - Все `index.ts` экспортируют токены (`XXX_VARIANTS`/`XXX_TYPES`/`XXX_SHAPES`/`XXX_POSITIONS`) — 36 файлов.
  - Внутри компонентных `index.ts` нет `export *` (явные именованные экспорты).
  - Корневые CSS-классы переименованы к канону: `base-radio`, `base-side-bar`, `base-tooltip`, `base-notification` (старые `*-group`/`*-wrapper`/`*-container` исчезли).
  - Handlers переименованы: `BaseColorPicker` → `handlePointerMove`/`handlePointerUp`.
  - `ChatMessageList.vue` мигрировал с `defineComponent`+render на `<script setup>`.
  - Sub-компоненты `BaseChat` (`ChatHeader`, `ChatInput`, `ChatSlideover`, `ChatPinnedPanel`, `ChatSelectionToolbar`) перенесены в `ui/`.
  - `BaseFormField/index.ts` — `BaseFormField` как default, `FormFieldError`/`FormFieldLabel` как именованные.
- **Stories**: все 51 stories используют `buildArgTypes` с импортом токенов из `model/`; sub-stories `DatePickerField`/`DatePickerPanel` имеют единый title `UI/BaseDatePicker/<Sub>`.
- **Constants**: `src/constants/index.ts` очищен от `@deprecated` плоских реэкспортов (23 строки); `table.ts` создан, константы таблицы перенесены из utils; все объекты `as const` с файловым JSDoc.
- **Composables**: 66 сущностей в папочном паттерне; `useTableSortFilter` → `useTableComposition`; `useChatState` импортирует сиблингов через `@composables/*`; плоские файлы переведены в папки; `export *` остался только в корневом barrel (допустимо).
- **Utils**: доменный паттерн `xxxUtils/` (`Base*.utils.ts` → `iconUtils/`/`ratingUtils/`/`treeUtils/`); `editorDomInspect` → `editorDomUtils`; корневой barrel на `export *`; utils — только чистые функции.

---

## 1. Оставшиеся нестыковки — компоненты

### 1.1. `BaseChat/ChatMessageList/` — структура вне канона (SRP/OCP)
`BaseChat/ui/` уже содержит sub-компоненты в канонических подпапках, но `ChatMessageList/` остался на верхнем уровне компонента (`BaseChat/ChatMessageList/{index.ts,model,ui,styles,__tests__}`), а не в `ui/`.

**Действие:** перенести `BaseChat/ChatMessageList/` → `BaseChat/ui/ChatMessageList/` (как подпапку рядом с `ChatHeader/` и т.д.). Обновить импорт в `BaseChat/ui/BaseChat.vue` и в `BaseChat/index.ts`. Прогнать `lint` + `test:unit` + stories `BaseChat`.
> ⚠️ Меняет путь импорта; проверить, что `ChatMessageList` не импортируется извне компонента (через barrel `@components/BaseChat`). Если импортируется — оставить re-export в `BaseChat/index.ts` для обратной совместимости.

### 1.2. `BaseEditor` — остаток mutable holder (SRP / «имя должно отражать суть»)
`BaseEditor.vue:215` всё ещё использует `inputCallbackRef.fn = handleInput` (объект-обёртка для проброса колбэка в `useEditorToolbar`), хотя `handleInput` уже выделен. Это workaround вместо прямого проброса.

**Действие:** убрать `inputCallbackRef`; передавать `handleInput` в `useEditorToolbar` напрямую (или через `() => handleInput()`), если порядок объявления позволяет. Если порядок мешает — вынести `handleInput` в composable `useEditorState`/`useEditorToolbar`. Сохранить поведение ввода и тесты `BaseEditor`.

### 1.3. `BaseCalendar` / `BaseDatePicker` — дефолты через composable, а не `withDefaults`
Оба не используют `withDefaults`; дефолты резолвятся через `useCalendarResolvedProps` (`resolvedProps.value.*`). Это осознанный паттерн (нужно `wasPropPassed`-обнаружение), но нарушает единообразие SFC-контракта.

**Действие (верификация, не обязательная правка):** подтвердить, что `useCalendarResolvedProps` действительно требует отложенного резолва (например для `undefined` vs default). Если да — задокументировать как легитимное исключение в комментарии над `defineProps`. Если нет — перенести «безусловные» дефолты в `withDefaults`, оставив в composable только conditional-логику. Низкий приоритет.

### 1.4. `defineExpose` контракт form-field семейства (LSP)
Form-field компоненты экспонируют разные наборы: `BaseInput`/`BaseSelect` → `{ *Ref, focus, blur, validate, reset }`; `BaseCheckbox`/`BaseSwitch`/`BaseRadio`/`BasePin`/`BaseFileUpload`/`BaseTextarea`/`BaseFormField`/`BaseDatePicker` → подмножества (`{ validate, reset }` и т.п.). Нет единого контракта.

**Действие:** ввести общий тип `FormFieldExpose = { rootRef, focus, blur, validate, reset }` в `src/composables/useFormField/useFormField.types.ts`; привести все form-field `defineExpose` к нему (добавить недостающие `focus`/`blur`/`rootRef` там, где их нет, или задокументировать причину отсутствия). Низкий/средний риск — сверять с тестами каждого.

### 1.5. `BaseIcon/index.ts` реэкспортирует utils (SRP-расположение)
`BaseIcon/index.ts:2-3` реэкспортирует `calcIconScale`, `ICON_SCALE`, `IconScale` из `@utils/iconUtils`. Компонентный barrel не должен быть каналом экспорта utils.

**Действие:** убрать реэкспорт utils из `BaseIcon/index.ts`; проверить потребителей `calcIconScale`/`ICON_SCALE` — они должны импортировать из `@utils/iconUtils` (или `@utils`) напрямую. Низкий риск.

### 1.6. `customClass` — единая поддержка и отражение в Storybook (LSP/ISP)
`customClass` уже входит в `BaseComponentProps` (`src/types/base.types.ts:9`), поэтому **тип** есть у всех компонентов через `extends BaseComponentProps`. Однако в stories отражено **непоследовательно**: из 51 компонента `customClass` в `buildArgTypes`/отдельной story присутствует лишь у части (`BaseTabs`, `BaseSelect`, `BaseBreadcrumbs`, `BaseModal`, `BasePin`, `BaseRange`, `BaseFileUpload`, `BaseSlideover`, `BaseMegaMenu` и др.); у остальных он либо отсутствует в argTypes, либо нет демонстрационной story.

Эталон реализации — `BaseTabs`/`BaseSelect`: `customClass` в `buildArgTypes({ props: { customClass: { control: 'object' } } })` + отдельная story «customClass — покрытие всех elementKeys», где `customClass` передаётся объектом со всеми ключами `elementKeys` из `useCustomClass` соответствующего компонента.

**Действие (для каждого компонента, где `customClass` не отражён):**
1. Убедиться, что `useCustomClass` в SFC вызывается с полным набором `elementKeys` (корневой + именованные элементы). При отсутствии `elementKeys` — добавить (иначе `customClass` как объект не применится к элементам).
2. В `stories/<Cmp>.stories.ts`:
   - добавить `customClass: { control: 'object', description: 'Кастомные классы для элементов.' }` в `buildArgTypes({ props })`;
   - добавить отдельную story `CustomClass`, в `args.customClass` передать объект со всеми `elementKeys` (значения — осмысленные demo-классы, видимые визуально, например фон/обводка).
3. Для sub-компонентов (`BaseRadio`, `BaseRange`-thumb, `BaseSideBarNavigation` и т.д.), где `customClass` наследуется или проксируется от родителя — задокументировать в JSDoc пропса, как класс пробрасывается, и покрыть демонстрацией в stories родителя.

**Проверка:** в Storybook у каждого компонента должен быть виден контрол `customClass` (object) и preview, где изменение объекта классов визуально применяется к корню и элементам. Добавить/обновить visual-snapshot-тесты (`npm run test:visual`) для новых `CustomClass` stories.

> ⚠️ Не дублировать `customClass` в `model/*.types.ts` — он уже в `BaseComponentProps`; переопределение вручную (как в `FormFieldLabel.types.ts`/`FormFieldError.types.ts` через `string | Record<...>`) — исключение для суб-компонентов без `extends BaseComponentProps`; задокументировать либо унифицировать на `CustomClassProp`.

---

## 2. Stories — остаточное

### 2.1. Sub-stories `DatePickerField` / `DatePickerPanel` без `buildArgTypes`
Оба файла (`BaseDatePicker/stories/DatePicker*.stories.ts`) используют сырые `args` без `buildArgTypes`. Это внутренние sub-компонентные stories для coverage.

**Действие (опционально):** либо перевести на `buildArgTypes({ props: {...} })` с импортом типов из `../ui/<Sub>/...types`, либо оставить и задокументировать как внутренние (без контроля через args-таблицу). Решение принять по трудоёмкости; приоритет низкий.

---

## 3. Composables — остаточное

### 3.1. `useTableSortFilter` deprecated re-export
`src/composables/index.ts:64-65` ещё содержит `/** @deprecated */ export { useTableComposition as useTableSortFilter }`. Переименование выполнено, остался переходный shim.

**Действие:** проверить отсутствие внешних потребителей `useTableSortFilter` (`rg "useTableSortFilter"` по `src/`, `tests/`, stories). Если есть внутренние — мигрировать. После удаления shim — breaking change публичного API; если пакет публикуется (`@ramses1389/rise-ui-kit`) — оставить shim ещё на 1 минор-релиз с `@deprecated`, иначе удалить.

### 3.2. 4 composables без `*.types.ts` (SRP)
Без отдельного файла типов: `useChatReply`, `useExplicitPropDetection`, `useIcon`, `useScrollLock` (типы инлайн в основном файле).

**Действие:** вынести интерфейсы/типы в `<use>/*.types.ts` по канону; обновить `index.ts` папки (`export type { ... } from './<use>.types'`). Низкий риск.

### 3.3. JSDoc на главной функции — аудит
Не проверено исчерпывающе наличие `/** ... */` перед `function useXxx` во всех 66 реализациях.

**Действие:** прогнать `rg -L` / ручной проход: для каждого `use*.ts` убедиться, что есть функциональный JSDoc (что делает, что возвращает). Дополнить отсутствующие. Низкий риск.

---

## 4. Utils — остаточное

### 4.1. 9 utils-модулей без `*.types.ts` (SRP)
Без отдельного файла типов: `clipboardUtils`, `domUtils`, `editorDomUtils`, `iconUtils`, `idUtils`, `imageUtils`, `ratingUtils`, `treeUtils`, `typeUtils` (инлайн-типы в основном файле).

**Действие:** вынести интерфейсы в `xxxUtils.types.ts` по канону (`tableUtils.ts` уже инлайнит `RowNumberOptions`/`ColumnStyleOptions` — в том числе проверить). Низкий риск.

### 4.2. Файловые JSDoc-заголовки — аудит
Не проверено исчерпывающе наличие `/** Домен: ... */` в начале каждого `xxxUtils.ts`.

**Действие:** проход по всем utils-файлам, добавить файловый JSDoc там, где отсутствует. Низкий риск.

---

## 5. Порядок выполнения (безопасные инкременты)

Каждый шаг = отдельный коммит. После каждого: `npm run lint` + `npm run test:unit`; для затронутых компонентов — `npm run test:storybook` (и `npm run test:visual` для UI-изменений). **Коммит принимается только если все затронутые тесты зелёные.**

1. **`BaseIcon/index.ts`** (п. 1.5): убрать реэкспорт utils, мигрировать потребителей. — низкий риск.
2. **Composables `*.types.ts`** (п. 3.2): `useChatReply`, `useExplicitPropDetection`, `useIcon`, `useScrollLock`. — низкий риск, чисто типы.
3. **Utils `*.types.ts`** (п. 4.1): 9 модулей. — низкий риск, чисто типы.
4. **JSDoc-аудит** (п. 3.3, 4.2): composables + utils. — низкий риск.
5. **`useTableSortFilter` shim** (п. 3.1): проверить потребителей → удалить (или оставить на релиз). — средний риск (публичный API).
6. **`BaseEditor` mutable holder** (п. 1.2): убрать `inputCallbackRef`. — средний риск (поведение ввода).
7. **`BaseChat/ChatMessageList` перенос** (п. 1.1): в `ui/ChatMessageList/`, обновить импорты. — средний риск (пути).
8. **`defineExpose` контракт form-field** (п. 1.4): ввести `FormFieldExpose`, унифицировать. — средний риск.
9. **`BaseCalendar`/`BaseDatePicker` defaults** (п. 1.3): верифицировать паттерн, задокументировать либо частично мигрировать. — низкий/средний.
10. **Sub-stories `DatePicker*`** (п. 2.1): `buildArgTypes` или документирование исключения. — низкий.
11. **`customClass` во всех stories** (п. 1.6): по компонентам добавить `customClass` в `buildArgTypes` + демонстрационную story `CustomClass` (покрытие всех `elementKeys`); обновить visual-snapshot-тесты. — средний риск (визуальные изменения).

> Порядок по рискам: сначала типы/JSDoc/реэкспорты (низкий), затем поведенческие/структурные (средний).

---

## 6. Критерий готовности (остаточный)

**Тесты (обязательно все зелёные):**
- `npm run lint` — без ошибок.
- `npm run test:unit` — зелёный (все unit/integration тесты проходят).
- `npm run test:storybook` — зелёный (все stories-тесты, включая play-функции и coverage).
- `npm run test:visual` — зелёный (visual-snapshots актуальны, при изменении UI — обновить через `npm run test:visual:update`).
- `npm run build:lib` — собирается, типы генерируются (`vue-tsc` без ошибок, `.d.ts` формируются).

**Структурные критерии:**
- `BaseChat` — все sub-компоненты (включая `ChatMessageList`) в `ui/`.
- `BaseIcon/index.ts` — не реэкспортирует utils.
- `BaseEditor` — нет `inputCallbackRef`.
- Все composables имеют `*.types.ts` и JSDoc на главной функции; нет `useTableSortFilter` shim (или он задокументирован как переходный).
- Все utils-модули имеют `*.types.ts` и файловый JSDoc.
- Form-field семейство — единый `defineExpose` контракт.

**`customClass` (обязательно):**
- Каждый компонент поддерживает `customClass` через `BaseComponentProps` (нет ручных переопределений, кроме задокументированных sub-исключений).
- В каждом `stories/<Cmp>.stories.ts`: `customClass` присутствует в `buildArgTypes({ props })` (control `object`) и есть отдельная story `CustomClass`, покрывающая все `elementKeys` `useCustomClass` данного компонента.
- В Storybook контрол `customClass` виден и визуально применяется к корню/элементам.

---

## 7. Риски и контроль

- **Перенос `ChatMessageList`** (п. 1.1) и **удаление `useTableSortFilter` shim** (п. 3.1) — меняют пути/публичный API. Перед изменением сверить `src/index.ts`, `package.json` exports, алиасы в `tsconfig.app.json`, `build/lib/tsconfig.lib.json`, `build/config/alias.ts`, `build/storybook/main.ts`, `build/tests/vitest.config.ts` (5 мест дублирования alias — синхронизировать при необходимости).
- **`BaseEditor` input-логика** (п. 1.2) — высокочувствительна к порядку инициализации; обязательно прогнать coverage-тесты редактора.
- **`defineExpose` унификация** (п. 1.4) — добавление `focus`/`blur` требует реальных ref'ов; не вводить «заглушки».
- **`customClass` в stories** (п. 1.6) — новые демонстрационные stories меняют визуальный output; обязательно обновлять visual-snapshots (`npm run test:visual:update`), иначе `test:visual` упадёт. Следить, чтобы `elementKeys` в `useCustomClass` соответствовали реально существующим элементам шаблона.
- **Полный прогон тестов перед merge** — ни один шаг не считается завершённым, если красный хотя бы один из `lint`/`test:unit`/`test:storybook`/`build:lib`. Особенно следить за `test:storybook` (play-функции чувствительны к структуре DOM после правок шаблонов) и `build:lib` (`vue-tsc` ловит несоответствия типов, невидимые для ESLint).
- Все «аудит»-пункты (JSDoc, types) — механические, но объёмные; выполнять группами по коммиту на кластер (chat / table / calendar / utils).
