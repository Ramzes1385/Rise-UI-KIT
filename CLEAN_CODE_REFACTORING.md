# Clean Code Рефакторинг — Аудит и исправления (2026-06-15)

Документ описывает изменения, выполненные по результатам аудита кодовой базы Rise UI Kit по книге Роберта Мартина «Чистый код: создание, анализ и рефакторинг». Проанализированы **69 Vue-компонентов**, **45+ типовых файлов** и утилиты. Найдено **49 нарушений**: 9 критических, 26 мажорных, 14 минорных.

---

## Выполненные изменения

### 1. `useBaseComponent` composable — устранение DRY-бойлерплейта

**Проблема (DRY, Глава 6):** Каждый из 60+ компонентов повторял одну и ту же цепочку из 4 composable-вызовов:

```typescript
const { sizeScaleStyle } = useSizeScale({ getScale: () => sizeScale.value })
const { variantClass, variantStyle } = useVariant({ block: 'base-xxx', getVariant: () => variant.value })
const { customColorStyle } = useCustomColor({ getColor: () => props.color })
const { classes } = useCustomClass({ getClass: () => props.customClass, elementKeys: [...] })
```

Плюс дублирующиеся computed-обёртки `const variant = computed(() => props.variant ?? 'default')` и `const sizeScale = computed(() => props.sizeScale ?? 100)` в каждом компоненте.

**Решение:**
- Создан `src/composables/useBaseComponent/useBaseComponent.ts` — объединяет 4 composable в один вызов
- Создан `src/composables/useBaseComponent/useBaseComponent.types.ts` — типы `UseBaseComponentOptions` и `BaseComponentProps`
- Создан `src/composables/useBaseComponent/useBaseComponent.spec.ts` — unit-тесты
- Зарегистрирован в `src/composables/index.ts`

**Мигрировано 28 компонентов:**

| Компонент | Было composable-вызовов | Стало |
|---|---|---|
| BaseButton | 4 отдельных | 1 `useBaseComponent` |
| BaseBadge | 4 | 1 |
| BaseAlert | 4 | 1 |
| BaseCard | 4 + usePadding | 1 + usePadding |
| BaseChip | 4 | 1 |
| BaseAvatar | 4 | 1 |
| BaseCheckbox | 4 | 1 |
| BaseFormField | 4 | 1 |
| BaseForm | 4 | 1 |
| BaseRadio | 4 | 1 |
| BaseSwitch | 4 | 1 |
| BaseTextarea | 4 | 1 |
| BaseInput | 4 + useInputMask + usePasswordVisibility | 1 + useInputMask + usePasswordVisibility |
| BaseTooltip | 4 | 1 |
| BaseNotification | 4 | 1 |
| BaseRating | 4 | 1 |
| BaseStepper | 4 | 1 |
| BaseBreadcrumbs | 4 | 1 |
| BaseEmpty | 4 | 1 |
| BaseModal | 4 + usePopup | 1 + usePopup |
| BaseSelect | 4 | 1 |
| BaseDropdown | 4 + usePadding | 1 + usePadding |
| BaseAccordion | 4 | 1 |
| BaseTabs | 4 | 1 |
| BasePin | 4 | 1 |
| BaseEditor | 4 + useEditorToolbar | 1 + useEditorToolbar |
| BaseFileUpload | 4 | 1 |
| BaseRange | 4 | 1 |
| BaseCalendar | 4 | 1 |
| BaseMenu | 4 | 1 |
| BaseSideBar | 4 + usePadding | 1 + usePadding |
| BaseTable | 4 + usePadding + useTableData + useTableSelection | 1 + usePadding + useTableData + useTableSelection |
| BaseMegaMenu | 4 | 1 |
| BaseTree | 4 | 1 |

**Не мигрированы** (используют только часть composables, `useBaseComponent` добавил бы ненужные ветви):

- BaseIcon — `useCustomClass` + `useSizeScale`
- BaseText — `useCustomClass` + `useSizeScale` + `useCustomColor`
- BaseLoader — `useCustomClass` + `useCustomColor` + `useSizeScale`
- BaseSkeleton — `useCustomClass`
- BasePopover — `useCustomClass`
- BaseAnimation — `useCustomClass`
- BaseProgress — `useCustomClass` + `useSizeScale` + `useCustomColor`
- BaseSeparator — `useCustomClass` + `useSizeScale` + `useCustomColor`
- BaseSlideover — `useCustomClass`
- BaseColorPicker — `useCustomClass`
- BaseTour — `useCustomClass`
- BaseImage — `useCustomClass` + `useSizeScale` + `useCustomColor`
- BaseSlider — `useCustomClass` + `useSizeScale`
- BasePagination — `useCustomClass` + `useSizeScale` + `useCustomColor`

**Результат:** ~240 строк бойлерплейта убрано из компонентов, удалены дублирующиеся `variant`/`sizeScale` computed-обёртки.

---

### 2. Удаление WHAT-комментариев (Глава 4)

**Проблема:** ~120+ JSDoc-комментариев, которые повторяли то, что уже очевидно из имени функции/переменной:

```typescript
/** Обработка клика */          // → function handleClick уже говорит это
/** Есть ли footer */           // → hasFooter уже говорит это
/** Итоговые классы */          // → rootClasses уже говорит это
```

**Решение:** Удалены redundant-комментарии из всех мигрированных компонентов. Оставлены только WHY-комментарии (объясняющие архитектурные решения) и `/* istanbul ignore next */` директивы.

**Затронутые файлы:** BaseButton, BaseChip, BaseCard, BaseAlert, BaseAvatar, BaseCheckbox, BaseInput, BaseModal, BaseDropdown, BaseTooltip, BaseNotification, BaseRating, BaseStepper, BaseBreadcrumbs, BaseEmpty, BaseTextarea, BaseFormField, BaseForm, BaseRadio, BaseSwitch, BasePin, BaseEditor, BaseFileUpload, BaseRange, BaseCalendar, BaseMenu, BaseSideBar, BaseTable, BaseMegaMenu, BaseMegaMenuNode, BaseTree, BaseTreeNode, BaseTabs, ChatMessageList.

---

### 3. Удаление мёртвого кода (Глава 5)

**Проблема:** `BaseTablePagination.vue` (71 строка) — компонент был определён, но нигде не использовался. Пагинация рендерится инлайново в `BaseTable.vue`.

**Решение:**
- Удалён `src/components/BaseTable/ui/BaseTablePagination.vue`
- Удалён `src/components/BaseTable/ui/BaseTablePagination.spec.ts`

---

### 4. `navigateAndEmit` утилита — устранение дублирования (DRY, Глава 6)

**Проблема:** Идентичная логика навигации дублировалась в 3 компонентах:

```typescript
if (href) {
    if (target === '_self') { window.location.href = href }
    else { openExternalUrl(href) }
    emit('navigate', href)
} else if (to) {
    emit('navigate', to)
}
```

**Решение:**
- Добавлена `navigateAndEmit(options, emitFn)` в `src/utils/navigationUtils/navigationUtils.ts`
- Зарегистрирована в `src/utils/navigationUtils/index.ts`
- Обновлены тестовые моки в `BaseMegaMenu.spec.ts` и `BaseMegaMenu.integration.spec.ts`
- Мигрированы: `BaseMegaMenu.vue`, `BaseMegaMenuNode.vue`, `BaseBreadcrumbs.vue`

---

### 5. Обработка ошибок (Глава 7)

| Файл | Было | Стало |
|---|---|---|
| `ChatMessageList.vue:238` | Пустой `catch {}` — молча проглатывает ошибку clipboard | `catch (e) { console.debug('[BaseChat] Clipboard write failed:', e) }` |
| `BaseTreeNode.vue:117` | `throw new Error('Контекст дерева не найден')` | `throw new Error('BaseTreeNode: TreeContext not found. Ensure BaseTreeNode is rendered inside BaseTree.')` |
| `BaseTreeChildren.vue:62` | `throw new Error('Контекст дерева не найден')` | `throw new Error('BaseTreeChildren: TreeContext not found. Ensure BaseTreeChildren is rendered inside BaseTree.')` |

---

### 6. Обновление тестов

- Добавлен `src/composables/useBaseComponent/useBaseComponent.spec.ts` — 8 тестов
- Обновлены моки в `BaseMegaMenu/__tests__/BaseMegaMenu.spec.ts` — мок `navigateAndEmit`
- Обновлены моки в `BaseMegaMenu/__tests__/BaseMegaMenu.integration.spec.ts`
- Обновлены ожидания ошибок в `BaseTree/__tests__/BaseTreeChildren.spec.ts`
- Обновлён `BaseTableNestedRow.spec.ts` — provide для `TABLE_EXPAND_TRANSITION_KEY`

---

### 7. Разбивка длинных функций (SRP, Глава 3)

**Проблема:** Две функции превышали 50 строк и делали несколько вещей одновременно.

**`BaseInput.vue` — `handleKeydown` (52 строки → 3 функции):**

| Функция | Строк | Ответственность |
|---|---|---|
| `handleKeydown` | ~15 | Делегирует по `e.key` |
| `handleMaskedBackspace` | ~15 | Удаление символа перед курсором + позиция |
| `handleMaskedDelete` | ~15 | Удаление символа после курсором + позиция |

**`BaseFileUpload.vue` — `addFiles` (55 строк → 3 функции):**

| Функция | Строк | Ответственность |
|---|---|---|
| `addFiles` | ~18 | Валидация, вызов `createUploadItem` в цикле |
| `createUploadItem` | ~16 | Создание одного элемента + превью |
| `simulateUploadProgress` | ~14 | `setInterval` с прогрессом для одного элемента |

---

### 8. `BreadcrumbsSeparator` подкомпонент (DRY, Глава 6)

**Проблема:** Логика рендера сепаратора (chevron/slash/dot → BaseIcon или BaseText) была скопирована 3 раза в шаблоне `BaseBreadcrumbs.vue`.

**Решение:**
- Создан `src/components/BaseBreadcrumbs/ui/BreadcrumbsSeparator.vue` (32 строки)
- Props: `separator`, `sizeScale`, `separatorIconClass`, `separatorTextClass`
- `BaseBreadcrumbs.vue` сокращён на 37 строк

---

### 9. `BaseSideBarNavigation` — slot-props (DRY, Глава 6)

**Проблема:** 7-полярный объект `{ item, level, isActive, isCurrent, isCollapsed, hasChildren, onClick }` инлайново создавался 6 раз в `<slot>` привязках.

**Решение:** Добавлена `getSlotProps(item)` функция, заменены все 6 инлайновых конструкций на `v-bind="getSlotProps(item)"`. −24 строки.

---

### 10. `BaseComponentProps<V>` — общий тип (DRY, Глава 6)

**Проблема:** 4 поля (`variant`, `sizeScale`, `color`, `customClass`) дублировались в 37+ интерфейсах `BaseXxxProps`.

**Решение:**
- Создан `src/types/base.types.ts`:
  ```typescript
  export interface BaseComponentProps<V extends string = string> {
    variant?: V
    sizeScale?: number
    color?: CustomColor
    customClass?: CustomClassProp
  }
  ```
- 37 types-файлов обновлены: `interface BaseXxxProps extends BaseComponentProps<VariantType>`
- Удалены дублирующиеся поля и их JSDoc из каждого интерфейса
- Удалены отдельные импорты `CustomClassProp` и `CustomColor` (идут через `BaseComponentProps`)

---

### 11. `useExplicitPropDetection` composable (Naming, Глава 2)

**Проблема:** 4 компонента (BaseDropdown, BaseAnimation, BaseSkeleton, BaseCalendar) использовали `rawProps = getCurrentInstance()?.vnode.props` — fragile Vue internal API с расплывчатым именем.

**Решение:**
- Создан `src/composables/useExplicitPropDetection/useExplicitPropDetection.ts`
- `wasPropPassed(propName)` — инкапсулирует проверку `propName in vnode.props`
- Заменён `rawProps` паттерн во всех 4 компонентах
- В BaseCalendar: `resolveBooleanPropDefault` переписан без параметра `rawProps`

---

### 12. `provide/inject` для transition callbacks (DRY + Props, Главы 3, 6)

**Проблема:** 6 функций transition callbacks (onExpandBeforeEnter, onExpandEnter, и т.д.) прокидывались через 3 уровня компонентов как props: BaseTable → BaseTableBody → BaseTableExpandedRow/BaseTableNestedRow. Итого 18 prop-объявлений и 18 prop-привязок.

**Решение:**
- Создан `TABLE_EXPAND_TRANSITION_KEY` (InjectionKey) в `BaseTable.types.ts`
- `BaseTable.vue`: `provide(TABLE_EXPAND_TRANSITION_KEY, { ...6 callbacks })`
- `BaseTableExpandedRow.vue` / `BaseTableNestedRow.vue`: `inject(TABLE_EXPAND_TRANSITION_KEY)`
- Удалено 6 props из `BaseTableBody`, 6 из `BaseTableExpandedRow`, 6 из `BaseTableNestedRow`
- Удалено 12 prop-привязок из шаблона `BaseTableBody`

---

### 13. Группировка props (Chapter 3 — Function Arguments)

**Проблема:** Слишком много индивидуальных props: BaseCalendar (27), BaseImage (22), BaseTour (18).

**Решение:**

| Компонент | Группа | Props |
|---|---|---|
| BaseCalendar | `timeConfig` | `showTime`, `showSeconds`, `is24Hour` |
| BaseCalendar | `constraints` | `minDate`, `maxDate`, `disabledDates`, `disabledWeekdays`, `disableFrom`, `disableTo` |
| BaseCalendar | `displayConfig` | `showNavigation`, `canSwitchView`, `showTodayButton`, `showYear`, `showWeekNumber` |
| BaseImage | `zoomConfig` | `hasZoom`, `closeOnOverlay`, `initialScale`, `zoomStep`, `minScale`, `maxScale`, `showMinimap` |
| BaseTour | `labels` | `next`, `prev`, `finish`, `skip` |
| BaseTour | `behavior` | `closeOnOverlayClick`, `closeOnEscape`, `lockScroll`, `scrollIntoView` |

Обратная совместимость: индивидуальные props сохранены с `@deprecated`. Группированные props имеют приоритет.

---

### 14. Исправление форматирования (Chapter 5)

| Файл | Проблема | Исправление |
|---|---|---|
| `BaseCalendar.vue:1-2` | Двойной отступ `\t\t<BaseCard` | Одинарный `\t<BaseCard` |
| `BaseTable.vue:54` | `ref` последний атрибут | `ref` первый атрибут |
| 11 types-файлов | `CustomClassProp` импорт отдельно от основного блока | Объединён в верхний блок импортов |

---

## Статус тестов

| Этап | Результат |
|---|---|
| `npm run test:unit` | **177 файлов, 3153 теста — все pass** |
| `npm run test:components:coverage` | Lines 100%, Statements 100%, Functions 100% |
| `npm run test:e2e` | Порт 6006 занят (pre-existing Storybook) |
| `npm run test:all` | Coverage pass, e2e не запускается из-за окружения |
| Lint | 0 errors, 0 warnings |

---

## Git-коммиты

| Коммит | Описание |
|---|---|
| `0622c56` | useBaseComponent, DRY, dead code, error handling |
| `2f7e381` | SRP, DRY, props grouping, provide/inject, naming |
| `411acb4` | fix: remove unused vars in BaseTour |
| `2ee10c7` | docs: update CLEAN_CODE_REFACTORING.md |

---

## Оставшиеся нарушения (не выполнено)

### Critical — нарушение SRP (God-компоненты)

| Компонент | Строк | Ответственностей | Рекомендация |
|---|---|---|---|
| `BaseTable.vue` | 615 | ~15 | Извлечь `useTableFilters`, `useTablePagination`, `useTableColumns`, `useTableExpand` → целевая длина <200 строк |
| `BaseCalendar.vue` | 564 | ~7 | Извлечь `BaseCalendarTime`, `BaseCalendarDays`, `BaseCalendarMonths` |
| `BaseEditor.vue` | 502 | ~6 | Извлечь `BaseEditorToolbar`, `BaseEditorMediaMenu` |
| `BaseImage.vue` | 479 | ~8 | Извлечь `BaseImageZoom` + `useImageGallery` composable |
| `BaseRange.vue` | 408 | 5+ | Извлечь `useRangeDrag`, `BaseRangeMarks` |
| `BaseTour.vue` | 357 | 8 | Извлечь `BaseTourSpotlight`, `BaseTourCard` |
| `BaseFileUpload.vue` | 355 | 6 | Извлечь `BaseFileUploadList`, `BaseFileUploadDropzone`, `useUploadSimulation` |
| `BaseSlider.vue` | 271 | 7 | Извлечь `BaseSliderNavigation`, `BaseSliderArrows` |
