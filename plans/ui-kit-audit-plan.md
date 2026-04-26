# Аудит UI-библиотеки — Полный план исправлений

**Дата:** 2026-04-24  
**Стек:** Vue 3, Composition API, Pinia, SCSS + BEM, Vite, TypeScript  
**Скиллы:** component-vue, ui-kit, testing-ui-kit, storybook-vue

---

## Сводка проблем

| Категория              | Критичные | Высокие | Средние | Низкие | Инфо  |
| ---------------------- | --------- | ------- | ------- | ------ | ----- |
| Архитектура            | 4         | 2       | 0       | 0      | 0     |
| Само-переиспользование | 0         | 12      | 0       | 0      | 0     |
| Унификация пропсов     | 0         | 2       | 3       | 1      | 1     |
| Лимиты размеров        | 0         | 2       | 0       | 0      | 0     |
| Тестирование           | 0         | 2       | 4       | 0      | 0     |
| Storybook stories      | 0         | 0       | 2       | 1      | 0     |
| **Итого**              | **4**     | **20**  | **9**   | **2**  | **1** |

---

## 🔴 КРИТИЧНЫЕ — Архитектурные нарушения

### П1. BaseMenu: Прямая зависимость от vue-router

**Файл:** `src/shared/ui/BaseMenu/BaseMenu.vue:27,39`  
**Проблема:** Компонент использует `useRouter()` и `router.push(item.to)` напрямую, нарушая принцип «Не лезь наружу изнутри компонента» (component-vue skill). UI-компонент не должен знать о роутере.  
**Правило:** SRP + чистые границы компонента  
**Решение:** Убрать `useRouter()`. Добавить `BaseMenuEmits` с событием `select`. Родитель сам решает как обрабатывать навигацию.

```typescript
// Было:
const router = useRouter()
function handleItemClick(item: BaseMenuItem): void {
	if (item.to) router.push(item.to)
}

// Стало:
const emit = defineEmits<BaseMenuEmits>()
function handleItemClick(item: BaseMenuItem): void {
	if (item.isDisabled) return
	emit('select', item)
}
```

**Файлы для изменения:**

- `src/shared/ui/BaseMenu/BaseMenu.vue` — убрать useRouter, добавить emit
- `src/shared/ui/BaseMenu/BaseMenu.types.ts` — добавить BaseMenuEmits
- `src/shared/ui/BaseMenu/BaseMenu.spec.ts` — убрать createTestRouter
- `src/shared/ui/BaseMenu/BaseMenu.integration.spec.ts` — убрать createTestRouter
- `src/shared/ui/BaseMenu/BaseMenu.stories.ts` — обновить stories

---

### П2. BaseMenu: Тип `any` в BaseMenuItem.to

**Файл:** `src/shared/ui/BaseMenu/BaseMenu.types.ts:15`  
**Проблема:** `to?: any` — прямое нарушение правила «Не используй any»  
**Правило:** Строгая типизация (component-vue skill)  
**Решение:** Заменить на `string`

```typescript
// Было:
to?: any

// Стало:
to?: string
```

---

### П3. BaseNotification: `Date.now()` в watcher — недетерминированность

**Файл:** `src/shared/ui/BaseNotification/BaseNotification.vue:93`  
**Проблема:** `() => props.title + props.description + Date.now()` — `Date.now()` делает watcher недетерминированным. Каждый тик вызывает повторный `add()`, что приводит к дублированию уведомлений. Также нарушает правила тестирования (testing-ui-kit skill: «Не используй динамические данные: Date.now()»).  
**Правило:** Чистые функции + детерминированность тестов  
**Решение:** Использовать отдельный проп `notificationKey` для принудительного обновления

```typescript
// Было:
watch(
	() => props.title + props.description + Date.now(),
	() => {
		if (props.title) add({ ...props })
	},
)

// Стало: убрать watcher, добавить проп notificationKey
watch(
	() => props.notificationKey,
	() => {
		if (props.title) add({ ...props })
	},
)
```

**Файлы для изменения:**

- `src/shared/ui/BaseNotification/BaseNotification.vue` — убрать Date.now()
- `src/shared/ui/BaseNotification/BaseNotification.types.ts` — добавить notificationKey

---

### П4. BaseNotification: Интерфейс внутри .vue вместо .types.ts

**Файл:** `src/shared/ui/BaseNotification/BaseNotification.vue:61-63`  
**Проблема:** `interface NotificationItem extends BaseNotificationProps { id: number }` определён внутри .vue файла. По стандарту (component-vue skill) все типы должны быть в `.types.ts`.  
**Правило:** Структура компонента — типы только в .types.ts  
**Решение:** Перенести `NotificationItem` в `BaseNotification.types.ts`

---

### П5. BaseChat: Критическое превышение лимитов — 386 строк

**Файл:** `src/shared/ui/BaseChat/BaseChat.vue`  
**Проблема:** Компонент содержит 386 строк. Лимит script setup — 100 строк, template — 50 строк. Компонент реализует 7 вариантов (bubble, modern, minimal, support, sidebar, thread, feed) в одном файле.  
**Правило:** Ограничения размеров (component-vue skill)  
**Решение:** Декомпозировать на подкомпоненты:

- `ChatHeader.vue` — заголовок чата
- `ChatMessage.vue` — сообщение (с вариантами bubble/modern/minimal)
- `ChatInput.vue` — поле ввода
- `ChatSupportInput.vue` — поле ввода support-режима с быстрыми ответами
- Основной `BaseChat.vue` — сборка подкомпонентов по variant

---

### П6. BaseInput: Превышение лимита script setup — 224 строки

**Файл:** `src/shared/ui/BaseInput/BaseInput.vue`  
**Проблема:** script setup содержит ~160 строк (лимит 100). Логика маски, пароля, валидации — всё в одном файле.  
**Правило:** Ограничения размеров (component-vue skill)  
**Решение:** Вынести логику в composables:

- `usePasswordVisibility.ts` — переключение видимости пароля
- Логика маски уже в `useInputMask` — оставить
- `PasswordRuleResults` вычисление — оставить как computed (6 строк)

---

## 🟠 ВЫСОКИЕ — Нарушения само-переиспользования

### П7. BaseMenu: Сырой `<span>` вместо BaseText

**Файл:** `src/shared/ui/BaseMenu/BaseMenu.vue:15`  
**Проблема:** `<span class="base-menu__label">{{ item.label }}</span>` — сырой HTML вместо BaseText  
**Правило:** Само-переиспользование компонентов (component-vue + ui-kit skill)  
**Решение:**

```vue
<!-- Было: -->
<span class="base-menu__label">{{ item.label }}</span>

<!-- Стало: -->
<BaseText class="base-menu__label" :size-scale="sizeScale">{{ item.label }}</BaseText>
```

---

### П8. BaseMenu: Сырой `<div>` вместо BaseSeparator

**Файл:** `src/shared/ui/BaseMenu/BaseMenu.vue:17`  
**Проблема:** `<div class="base-menu__divider"></div>` — кастомный разделитель вместо BaseSeparator  
**Правило:** Само-переиспользование компонентов  
**Решение:**

```vue
<!-- Было: -->
<div v-if="gIndex < items.length - 1" class="base-menu__divider"></div>

<!-- Стало: -->
<BaseSeparator v-if="gIndex < items.length - 1" class="base-menu__divider" :size-scale="sizeScale" />
```

---

### П9. BaseNotification: Сырой `<button>` вместо BaseButton

**Файл:** `src/shared/ui/BaseNotification/BaseNotification.vue:23`  
**Проблема:** `<button class="base-notification__close">` — сырой HTML вместо BaseButton  
**Правило:** Само-переиспользование компонентов  
**Решение:**

```vue
<!-- Было: -->
<button class="base-notification__close" @click="remove(notification.id)">
  <BaseIcon name="close" size="sm" :size-scale="sizeScale" />
</button>

<!-- Стало: -->
<BaseButton class="base-notification__close" variant="ghost" :size-scale="sizeScale" @click="remove(notification.id)">
  <BaseIcon name="close" size="sm" :size-scale="sizeScale" />
</BaseButton>
```

---

### П10. BasePagination: Сырой текст вместо BaseText

**Файл:** `src/shared/ui/BasePagination/BasePagination.vue:11,33`  
**Проблема:** «Назад» и «Вперед» — сырой текст в слотах BaseButton без BaseText-обёртки. Номера страниц тоже сырой текст.  
**Правило:** Само-переиспользование компонентов — текст всегда через BaseText  
**Решение:**

```vue
<!-- Было: -->
<template v-else>Назад</template>

<!-- Стало: -->
<template v-else>
	<BaseText :size-scale="sizeScale">Назад</BaseText>
</template>
```

---

### П11. BaseInput: Сырой `<button>` для password toggle вместо BaseButton

**Файл:** `src/shared/ui/BaseInput/BaseInput.vue:35-43`  
**Проблема:** `<button v-if="type === 'password'" ...>` — сырой HTML вместо BaseButton  
**Правило:** Само-переиспользование компонентов  
**Решение:** Заменить на `<BaseButton variant="ghost">` с BaseIcon внутри

---

### П12. BaseInput: Сырые `<span>` для prefix/postfix/label/error вместо BaseText

**Файл:** `src/shared/ui/BaseInput/BaseInput.vue:15-22,44-46,63`  
**Проблема:** `<span class="base-input__prefix">`, `<span class="base-input__postfix">`, `<label>`, `<span class="base-input__error-text">` — сырой HTML  
**Правило:** Само-переиспользование компонентов  
**Решение:** Заменить на BaseText с нужными props

---

### П13. BaseTabs: Сырой `<button>` вместо BaseButton

**Файл:** `src/shared/ui/BaseTabs/BaseTabs.vue:7`  
**Проблема:** `<button v-for="item in items">` — сырой HTML вместо BaseButton  
**Правило:** Само-переиспользование компонентов  
**Решение:** Заменить на `<BaseButton>` с variant="ghost"

---

### П14. BaseSlider: Сырые `<button>` для arrows/dots/thumbs вместо BaseButton

**Файл:** `src/shared/ui/BaseSlider/BaseSlider.vue:15-28,78-90`  
**Проблема:** 4 сырых `<button>` для навигации слайдера  
**Правило:** Само-переиспользование компонентов  
**Решение:** Заменить на `<BaseButton variant="ghost">`

---

### П15. BaseMegaMenu: Сырой `<button>` вместо BaseButton

**Файл:** `src/shared/ui/BaseMegaMenu/BaseMegaMenu.vue:106`  
**Проблема:** `<button class="base-mega-menu__nav-link">` — сырой HTML  
**Правило:** Само-переиспользование компонентов  
**Решение:** Заменить на `<BaseButton variant="ghost">`

---

### П16. BaseFileUpload: Сырые `<button>` для remove/close/nav вместо BaseButton

**Файл:** `src/shared/ui/BaseFileUpload/BaseFileUpload.vue:72,82,87,95`  
**Проблема:** 4 сырых `<button>` для удаления, закрытия превью, навигации  
**Правило:** Само-переиспользование компонентов  
**Решение:** Заменить на `<BaseButton variant="ghost">`

---

### П17. BaseSearch: Сырые `<button>` для clear/close/trigger вместо BaseButton

**Файл:** `src/shared/ui/BaseSearch/BaseSearch.vue:4,26,32,71,97,103,167`  
**Проблема:** 7 сырых `<button>` для триггера, очистки, закрытия  
**Правило:** Само-переиспользование компонентов  
**Решение:** Заменить на `<BaseButton variant="ghost">`

---

### П18. BaseImage: Сырые `<button>` для zoom toolbar вместо BaseButton

**Файл:** `src/shared/ui/BaseImage/BaseImage.vue:61-72`  
**Проблема:** 6 сырых `<button>` для зум-панели (приблизить, отдалить, сбросить, повернуть, закрыть)  
**Правило:** Само-переиспользование компонентов  
**Решение:** Заменить на `<BaseButton variant="ghost">`

---

### П19. BaseEditor: 14 сырых `<button>` вместо BaseButton

**Файл:** `src/shared/ui/BaseEditor/BaseEditor.vue` (строки 18-211)  
**Проблема:** Все кнопки панели форматирования — сырые `<button>` с inline SVG  
**Правило:** Само-переиспользование компонентов  
**Решение:** Заменить на `<BaseButton variant="ghost">` с BaseIcon внутри. SVG иконки вынести в спрайт.

---

### П20. BaseChip: Сырой `<span>` для badge content вместо BaseText

**Файл:** `src/shared/ui/BaseChip/BaseChip.vue:4-10`  
**Проблема:** `<span class="base-chip__badge">` с `{{ displayContent }}` — сырой HTML  
**Правило:** Само-переиспользование компонентов  
**Решение:** Заменить внутренний `<span>` на `<BaseText>`

---

## 🟠 ВЫСОКИЕ — Унификация пропсов

### П21. BaseChip, BaseRange: Запрещённый проп `size` вместо `sizeScale`

**Файлы:**

- `src/shared/ui/BaseChip/BaseChip.types.ts:19` — `size?: 'sm' | 'md' | 'lg'`
- `src/shared/ui/BaseRange/BaseRange.types.ts:33` — `size?: 'sm' | 'md' | 'lg'`

**Проблема:** ui-kit skill: «Проп size запрещён. Вместо него используется sizeScale для гибкого масштабирования.»  
**Решение:** Убрать проп `size`, оставить только `sizeScale`. Стили размеров переписать через `sz()` функцию с `--size-scale`.

> **Примечание:** BaseIcon имеет `size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'` — это обоснованное исключение, т.к. SVG-иконки требуют дискретных размеров для корректного рендеринга. Сам ui-kit skill документирует BaseIcon с пропом `size`.

---

### П22. BaseInput: variant не соответствует унифицированному набору

**Файл:** `src/shared/ui/BaseInput/BaseInput.types.ts:4`  
**Проблема:** `INPUT_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft']` — но в ui-kit skill для BaseInput указаны варианты `outline | filled | underline`. При этом унифицированное правило требует `default | ghost | outline | shadow | soft`.  
**Решение:** Привести к унифицированному набору. Вариант `filled` реализовать через `default`, `underline` через `soft` или добавить как легальное расширение.

---

## 🟡 СРЕДНИЕ — Унификация пропсов (частичные несоответствия)

### П23. BaseAccordion: variant 'bordered' не в унифицированном наборе

**Файл:** `src/shared/ui/BaseAccordion/BaseAccordion.types.ts`  
**Проблема:** Вариант `bordered` не входит в унифицированный набор `default | ghost | outline | shadow | soft`  
**Решение:** Заменить `bordered` на `outline` (визуально ближайший)

---

### П24. BaseCard: variant 'elevated' не в унифицированном наборе

**Файл:** `src/shared/ui/BaseCard/BaseCard.types.ts`  
**Проблема:** Вариант `elevated` не входит в унифицированный набор  
**Решение:** Заменить `elevated` на `shadow` (визуально ближайший — поднятая тень)

---

### П25. BaseModal: Две системы вариантов — путаница

**Файл:** `src/shared/ui/BaseModal/BaseModal.types.ts:4,14`  
**Проблема:** Одновременно `MODAL_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft']` (для стилизации) и `ModalVariant = 'default' | 'confirm' | 'form' | 'info'` (для семантики). В шаблоне используется `variant` из MODAL_VARIANTS. Тип `ModalVariant` не используется.  
**Решение:** Удалить неиспользуемый тип `ModalVariant`. Оставить только унифицированный `variant` из MODAL_VARIANTS.

---

## 🟡 СРЕДНИЕ — Проблемы тестирования

### П26. BaseChip + BaseCalendar: Полное отсутствие тестов

**Файлы:** `src/shared/ui/BaseChip/`, `src/shared/ui/BaseCalendar/`  
**Проблема:** Нет ни `spec.ts`, ни `integration.spec.ts`  
**Правило:** testing-ui-kit skill — «Для каждого публичного компонента есть unit-тесты базового поведения»  
**Решение:** Создать:

- `BaseChip.spec.ts` — рендер, видимость, displayContent, isHiddenOnZero
- `BaseChip.integration.spec.ts` — click-badge emit
- `BaseCalendar.spec.ts` — рендер, навигация месяцев, выбор даты
- `BaseCalendar.integration.spec.ts` — v-model, selectionMode

---

### П27. 18 компонентов без integration-тестов

**Проблема:** Следующие компоненты имеют только unit-тесты, но нет integration-тестов:

| Компонент     | Есть v-model/emits? | Нужен integration?     |
| ------------- | ------------------- | ---------------------- |
| BaseAnimation | show prop, emits    | Да                     |
| BaseAvatar    | нет v-model         | Нет (низкий приоритет) |
| BaseBadge     | click emit          | Да                     |
| BaseCard      | слоты               | Да                     |
| BaseChat      | messages, emits     | Да                     |
| BaseEditor    | v-model             | Да                     |
| BaseFormField | v-model             | Да                     |
| BaseIcon      | —                   | Нет                    |
| BaseImage     | —                   | Нет                    |
| BaseLoader    | —                   | Нет                    |
| BaseMegaMenu  | emits               | Да                     |
| BaseProgress  | —                   | Нет                    |
| BaseRange     | v-model             | Да                     |
| BaseSearch    | v-model, emits      | Да                     |
| BaseSeparator | —                   | Нет                    |
| BaseSkeleton  | —                   | Нет                    |
| BaseTable     | emits               | Да                     |
| BaseText      | —                   | Нет                    |

**Приоритет создания integration-тестов (по критичности):**

1. BaseRange (v-model + rangeValue)
2. BaseSearch (v-model + debounce + results)
3. BaseEditor (v-model HTML)
4. BaseBadge (click emit)
5. BaseChat (messages + emits)
6. BaseCard (слоты)
7. BaseFormField (v-model + error)
8. BaseMegaMenu (навигация)
9. BaseTable (сортировка + пагинация)
10. BaseAnimation (show + transition)

---

### П28. Composables без тестов

**Проблема:** Из ~15 composables тесты есть только у 2:

| Composable          | Есть тест? | Приоритет |
| ------------------- | ---------- | --------- |
| useSizeScale        | ✅         | —         |
| useCustomColor      | ✅         | —         |
| useVariant          | ❌         | Высокий   |
| useAutoScroll       | ❌         | Средний   |
| useClickOutside     | ❌         | Высокий   |
| useDebounce         | ❌         | Высокий   |
| useDropdownPosition | ❌         | Средний   |
| useEscapeKey        | ❌         | Высокий   |
| useIcon             | ❌         | Средний   |
| useImageZoom        | ❌         | Низкий    |
| useInputMask        | ❌         | Высокий   |
| useListNavigation   | ❌         | Средний   |
| usePopup            | ❌         | Средний   |
| useScrollLock       | ❌         | Средний   |
| useSwipe            | ❌         | Низкий    |
| useTableData        | ❌         | Средний   |

**Приоритет:** Сначала чистые функции (useVariant, useInputMask, useListNavigation, useTableData) — они не требуют DOM-моков.

---

### П29. Visual-тесты нарушают правила стабильности

**Файл:** `tests/visual/base-menu.visual.spec.ts` (и аналогичные)  
**Проблема:** Visual-тесты не следуют правилам testing-ui-kit skill:

1. Не устанавливают фиксированный viewport (`setViewportSize`)
2. Не отключают анимации (`animations: 'disabled'`)
3. Не скрывают каретку (`caret: 'hide'`)
4. Не используют `scale: 'css'`

**Решение:** Обновить все visual-тесты по шаблону:

```typescript
test(`BaseMenu — ${story}`, async ({ page }) => {
	await page.goto(`/iframe.html?id=${COMPONENT}--${story}&viewMode=story`)
	await page.setViewportSize({ width: 800, height: 400 })
	const root = page.locator('.base-menu')
	await expect(root).toHaveScreenshot(`base-menu--${story}.png`, {
		animations: 'disabled',
		caret: 'hide',
		scale: 'css',
	})
})
```

---

## 🟡 СРЕДНИЕ — Storybook stories

### П30. sizeScale control: 'number' вместо 'range'

**Файл:** `src/shared/ui/BaseButton/BaseButton.stories.ts:38`  
**Проблема:** `sizeScale: { control: 'number' }` — но storybook-vue skill требует `{ type: 'range', min: 50, max: 200, step: 10 }`  
**Решение:**

```typescript
// Было:
sizeScale: {
	control: 'number',
	description: 'Масштаб размера (100 = 100%, 150 = 150%, 75 = 75%)',
},

// Стало:
sizeScale: {
	control: { type: 'range', min: 50, max: 200, step: 10 },
	description: 'Масштаб размера (50–200%, по умолчанию 100)',
},
```

**Затронутые файлы:** Проверить все `*.stories.ts` — исправить у всех компонентов где `sizeScale` control = 'number'.

---

### П31. Отсутствие DarkTheme stories

**Проблема:** Ни у одного компонента нет story с тёмной темой. testing-ui-kit требует: «Есть screenshot baseline для критичных состояний (default, disabled, focus, dark)». storybook-vue требует DarkTheme story.  
**Решение:** Добавить `DarkTheme` story для каждого компонента:

```typescript
export const DarkTheme: Story = {
	parameters: {
		backgrounds: { default: 'dark' },
	},
	decorators: [
		Story => ({
			components: { Story },
			template: `<div data-theme="dark"><Story /></div>`,
		}),
	],
}
```

---

## 🟢 НИЗКИЕ — Консистентность и стиль

### П32. BaseChip: variantClass/customColorStyle не применены к корню

**Файл:** `src/shared/ui/BaseChip/BaseChip.vue:2`  
**Проблема:** Корневой `<div>` имеет только `sizeScaleStyle`, но не `variantClass`, `variantStyle`, `customColorStyle`. Composables вызываются, но результат не используется на корневом элементе.  
**Решение:**

```vue
<!-- Было: -->
<div class="base-chip" :style="sizeScaleStyle">

<!-- Стало: -->
<div class="base-chip" :class="[variantClass]" :style="[sizeScaleStyle, variantStyle, customColorStyle]">
```

---

### П33. BasePopover: variantClass не применён к шаблону

**Файл:** `src/shared/ui/BasePopover/BasePopover.vue`  
**Проблема:** `variantClass` вычисляется через `useVariant`, но не используется в `:class` шаблона. Вариант применяется только через CSS-переменную `variantStyle` и через `panelClasses` на панели.  
**Решение:** Добавить `variantClass` в корневой элемент или убрать неиспользуемую переменную.

---

### П34. BaseNotification: variantClass не применён к шаблону

**Файл:** `src/shared/ui/BaseNotification/BaseNotification.vue`  
**Проблема:** Аналогично П33 — `variantClass` вычисляется, но не используется. Модификаторы варианта применяются через тип уведомления (`--success`, `--error`), а не через variant.  
**Решение:** Либо применить variantClass, либо убрать неиспользуемый composable результат.

---

### П35. BaseCalendar: Нестандартный файл useCalendar.ts

**Файл:** `src/shared/ui/BaseCalendar/useCalendar.ts`  
**Проблема:** Файл composable находится внутри папки компонента, а не в `src/shared/composables/`. Нарушает консистентность структуры проекта.  
**Решение:** Перенести в `src/shared/composables/useCalendar/` или задокументировать как исключение (calendar-специфичная логика).

---

## ℹ️ ИНФО — Противоречие в ui-kit skill

### П36. Противоречие: «size запрещён» но компоненты описаны с size

**Проблема:** ui-kit skill содержит два противоречащих правила:

1. «Проп size запрещён. Вместо него используется sizeScale» (секция «Унификация пропсов»)
2. Индивидуальные спецификации компонентов описывают `size` проп (BaseInput, BaseChip, BaseLoader, BaseIcon, BaseTable, BaseCalendar, BaseCard, BaseRange, BaseBreadcrumbs)

**Решение:** Уточнить в skill:

- `sizeScale` — для масштабирования (процентное изменение)
- `size` — для дискретных размеров где `sizeScale` неприменим (BaseIcon SVG, BaseLoader анимации)
- Компоненты где `size` можно заменить на `sizeScale` — должны быть мигрированы

---

## Порядок исправлений

### Фаза 1: Критичные (архитектура) — 6 задач

| #   | Задача                                                        | Файлы                                                                | Режим |
| --- | ------------------------------------------------------------- | -------------------------------------------------------------------- | ----- |
| 1   | П1: BaseMenu — убрать useRouter, добавить emit                | BaseMenu.vue, .types.ts, .spec.ts, .integration.spec.ts, .stories.ts | Code  |
| 2   | П2: BaseMenu — заменить `any` на `string`                     | BaseMenu.types.ts                                                    | Code  |
| 3   | П3: BaseNotification — убрать Date.now()                      | BaseNotification.vue, .types.ts                                      | Code  |
| 4   | П4: BaseNotification — перенести NotificationItem в .types.ts | BaseNotification.vue, .types.ts                                      | Code  |
| 5   | П5: BaseChat — декомпозировать на подкомпоненты               | BaseChat.vue → ChatHeader, ChatMessage, ChatInput, ChatSupportInput  | Code  |
| 6   | П6: BaseInput — вынести логику в composables                  | BaseChat.vue → usePasswordVisibility                                 | Code  |

### Фаза 2: Высокие (само-переиспользование) — 14 задач

| #   | Задача                                          | Файлы                     | Режим |
| --- | ----------------------------------------------- | ------------------------- | ----- |
| 7   | П7: BaseMenu — BaseText вместо span             | BaseMenu.vue              | Code  |
| 8   | П8: BaseMenu — BaseSeparator вместо div         | BaseMenu.vue, .style.scss | Code  |
| 9   | П9: BaseNotification — BaseButton вместо button | BaseNotification.vue      | Code  |
| 10  | П10: BasePagination — BaseText для текста       | BasePagination.vue        | Code  |
| 11  | П11: BaseInput — BaseButton для password toggle | BaseInput.vue             | Code  |
| 12  | П12: BaseInput — BaseText для prefix/postfix    | BaseInput.vue             | Code  |
| 13  | П13: BaseTabs — BaseButton вместо button        | BaseTabs.vue              | Code  |
| 14  | П14: BaseSlider — BaseButton для навигации      | BaseSlider.vue            | Code  |
| 15  | П15: BaseMegaMenu — BaseButton вместо button    | BaseMegaMenu.vue          | Code  |
| 16  | П16: BaseFileUpload — BaseButton вместо button  | BaseFileUpload.vue        | Code  |
| 17  | П17: BaseSearch — BaseButton вместо button      | BaseSearch.vue            | Code  |
| 18  | П18: BaseImage — BaseButton для zoom toolbar    | BaseImage.vue             | Code  |
| 19  | П19: BaseEditor — BaseButton + BaseIcon         | BaseEditor.vue            | Code  |
| 20  | П20: BaseChip — BaseText вместо span            | BaseChip.vue              | Code  |

### Фаза 2b: Высокие (унификация пропсов) — 2 задачи

| #   | Задача                                 | Файлы                  | Режим |
| --- | -------------------------------------- | ---------------------- | ----- |
| 21  | П21: BaseChip, BaseRange — убрать size | .types.ts, .vue, .scss | Code  |
| 22  | П22: BaseInput — унифицировать variant | BaseInput.types.ts     | Code  |

### Фаза 3: Средние (унификация + тестирование + stories) — 9 задач

| #   | Задача                                                      | Файлы                               | Режим |
| --- | ----------------------------------------------------------- | ----------------------------------- | ----- |
| 23  | П23: BaseAccordion — bordered → outline                     | BaseAccordion.types.ts, .vue, .scss | Code  |
| 24  | П24: BaseCard — elevated → shadow                           | BaseCard.types.ts, .vue, .scss      | Code  |
| 25  | П25: BaseModal — убрать ModalVariant                        | BaseModal.types.ts                  | Code  |
| 26  | П26: BaseChip + BaseCalendar — создать тесты                | .spec.ts, .integration.spec.ts      | Code  |
| 27  | П27: Добавить integration-тесты для 10 компонентов          | \*.integration.spec.ts              | Code  |
| 28  | П28: Добавить тесты для composables                         | \*.spec.ts в composables            | Code  |
| 29  | П29: Исправить visual-тесты (viewport, animations, caret)   | tests/visual/\*.spec.ts             | Code  |
| 30  | П30: sizeScale control — 'number' → 'range' во всех stories | \*.stories.ts                       | Code  |
| 31  | П31: Добавить DarkTheme stories для всех компонентов        | \*.stories.ts                       | Code  |

### Фаза 4: Низкие (консистентность) — 4 задачи

| #   | Задача                                                    | Файлы                        | Режим |
| --- | --------------------------------------------------------- | ---------------------------- | ----- |
| 32  | П32: BaseChip — применить variantClass/customColorStyle   | BaseChip.vue                 | Code  |
| 33  | П33: BasePopover — применить или убрать variantClass      | BasePopover.vue              | Code  |
| 34  | П34: BaseNotification — применить или убрать variantClass | BaseNotification.vue         | Code  |
| 35  | П35: BaseCalendar — перенести useCalendar.ts              | useCalendar.ts → composables | Code  |
| 37  | П37: BaseInput — рефакторинг handleInput/handleKeydown    | BaseInput.vue                | Code  |
| 38  | П38: BaseTable — декомпозиция на подкомпоненты            | BaseTable.vue                | Code  |
| 39  | П39: BaseBreadcrumbs — BaseText для разделителей          | BaseBreadcrumbs.vue          | Code  |

---

## Чеклист после исправлений

- [ ] `npm run test:unit` — все unit-тесты проходят
- [ ] `npm run test:integration` — все integration-тесты проходят
- [ ] `npm run test:visual` — все visual-тесты проходят
- [ ] `npm run storybook` — все stories рендерятся корректно
- [ ] `vue-tsc --noEmit` — нет ошибок типизации
- [ ] Ни один компонент не импортирует vue-router напрямую
- [ ] Ни один .types.ts не содержит `any`
- [ ] Все компоненты используют BaseText/BaseButton/BaseSeparator внутри
- [ ] Все visual-тесты имеют viewport, animations:disabled, caret:hide
- [ ] Все stories имеют sizeScale control type: 'range'
- [ ] Ни один компонент не превышает лимиты (template: 50, script: 100)
- [ ] Все пропы `size` заменены на `sizeScale` (кроме BaseIcon)
- [ ] Все variant соответствуют унифицированному набору
