loadMode---
name: storybook-vue
description: >-
  Создание Storybook stories для Vue 3 компонентов — полные вариации,
  интерактивные контролы, документация пропсов/событий/слотов.
  Следует принципам проекта: БЭМ, темизация, TypeScript strict.
modeSlugs:
  - code
  - vue-component
  - debug
---

# Storybook Vue — Stories для компонентов

## Instructions

Ты создаёшь Storybook stories для Vue 3 компонентов проекта.
Язык общения — русский. Комментарии в коде — на русском.
Stories размещаются рядом с компонентом в его папке.

### Обязательные composables в каждом компоненте

Каждый компонент UI Kit использует три обязательных composables:

1. **`useSizeScale`** — проп `sizeScale` (вместо `size`, по умолчанию `100`). Управляет масштабированием через CSS-переменную `--size-scale`. В stories добавляй `sizeScale` в `argTypes` как `control: { type: 'range', min: 50, max: 200, step: 10 }`.
2. **`useCustomColor`** — проп `color` (тип `CustomColor`, по умолчанию установлен для всех компонентов). Кастомизация цветов фона и текста с состояниями hover/active/focus. В stories добавляй `color` в `argTypes` с `description`, поясняющим что именно передаётся в `CustomColor` (какие поля объекта и за что они отвечают).
3. **`useVariant`** — проп `variant`. БЭМ-модификатор + CSS-переменная `--variant` для рекурсивного наследования варианта дочерними компонентами. В stories добавляй `variant` в `argTypes` с `options` из `const`-массива из `.types.ts`.

> **Важно:** Используй `sizeScale` вместо `size`. Проп `sizeScale` — это число-процент (100 = 100%, 150 = 150%, 75 = 75%), а не union-перечисление. Проп `color` имеет значение по умолчанию — его не обязательно передавать явно, но в stories он должен быть доступен для интерактивного тестирования через Controls.

> **Исключения из обязательных composables:**
> - `BaseText` — не использует `useVariant` (текст не имеет визуальных вариантов, только начертание через `weight`). В stories не добавляй `variant` в `argTypes`.
> - `BaseSkeleton` — не использует `useVariant` и `useCustomColor` (скелетон — неинтерактивный элемент-заглушка, цвет фона задаётся строкой через проп `color`). В stories добавляй `color` как `control: 'color'` (не `control: 'object'`), `variant` не добавляй.

Эти пропсы есть в каждом компоненте и должны быть доступны через Controls для интерактивного тестирования.

---

## Структура файлов stories

```text
ComponentName/
├── ComponentName.vue
├── ComponentName.types.ts
├── ComponentName.style.scss
├── ComponentName.stories.ts    ← stories с вариациями + autodocs
└── index.ts

**Один файл на компонент:**
1. `.stories.ts` — все вариации, состояния, интерактивные контролы

> **MDX не используется.** Storybook 10 не поддерживает индексацию `.mdx` без дополнительного плагина.
> Документация полностью покрывается через `autodocs` + JSDoc в `.types.ts`.

**Не создавай отдельные stories-файлы для каждой вариации.**

### Правило: autodocs через preview.ts

- `tags: ['autodocs']` задан глобально в `.storybook/preview.ts`
- **Не добавляй** `tags: ['autodocs']` в отдельные `.stories.ts` файлы
- Документация генерируется автоматически из JSDoc-комментариев в `.types.ts`

---

## Правила именования

| Сущность | Формат | Пример |
|---|---|---|
| Файл stories | PascalCase + `.stories.ts` | `BaseButton.stories.ts` |
| Meta export | `meta` | `export default meta` |
| Story name | PascalCase | `Primary`, `Secondary`, `Disabled` |
| Story export | camelCase | `primary`, `secondary`, `disabled` |

---

## Обязательные элементы каждой stories

### 1. Meta-объект

Используй `buildArgTypes` из `@/shared/utils/storybookUtils` и `const`-массивы из `.types.ts` — это единый источник истины для вариантов. При изменении типов в `.types.ts` argTypes обновляются автоматически.

```typescript
import type { Meta, StoryObj } from '@storybook/vue3'

import { buildArgTypes } from '@/shared/utils/storybookUtils'

import { BUTTON_TYPES, BUTTON_VARIANTS } from './BaseButton.types'
import BaseButton from './BaseButton.vue'

const meta: Meta<typeof BaseButton> = {
	title: 'UI/BaseButton',
	component: BaseButton,
	argTypes: buildArgTypes({
		props: {
			type: {
				control: 'inline-radio',
				options: BUTTON_TYPES,
			},
			variant: {
				control: 'select',
				options: BUTTON_VARIANTS,
			},
			isLoading: { control: 'boolean' },
			isDisabled: { control: 'boolean' },
			sizeScale: {
				control: { type: 'range', min: 50, max: 200, step: 10 },
				description: 'Масштаб размера (50–200%, по умолчанию 100)',
			},
			onClick: { table: { disable: true } },
		},
	}),
	args: {
		type: 'button',
		variant: 'primary',
		isLoading: false,
		isDisabled: false,
		sizeScale: 100,
	},
}

export default meta
type Story = StoryObj<typeof BaseButton>
```

#### Паттерн: const-массивы в .types.ts

Каждый union-тип пропса должен быть определён через `const`-массив с `as const`, а тип пропса — через `(typeof ARRAY)[number]`. Это гарантирует единый источник истины.

```typescript
// BaseButton.types.ts
export const BUTTON_VARIANTS = ['primary', 'secondary', 'outline', 'ghost'] as const

export interface BaseButtonProps {
	variant?: (typeof BUTTON_VARIANTS)[number]
}
```

```typescript
// BaseButton.stories.ts
import { BUTTON_VARIANTS } from './BaseButton.types'
import { buildArgTypes } from '@/shared/utils/storybookUtils'

argTypes: buildArgTypes({
	props: {
		variant: { control: 'select', options: BUTTON_VARIANTS },
	},
})
```

> **Важно:** `buildArgTypes` автоматически скрывает технические Vue-пропсы (`class`, `style`, `key`, `ref`). Не добавляй их вручную.

### 2. Базовая story (Default)

```typescript
export const Default: Story = {
	args: {
		default: 'Кнопка',
	},
}
```

### 3. Все вариации пропсов-объединений (variant, type)

Для каждого union-пропса создаётся отдельная story с `render`:

> **Примечание:** `sizeScale` не является union-пропсом — это число (range 50–200). Для демонстрации `sizeScale` создавай отдельную story `SizeScale` (см. раздел «sizeScale в stories»).

```typescript
export const Variants: Story = {
	render: (args) => ({
		components: { BaseButton },
		setup() {
			return { args }
		},
		template: `
			<div style="display: flex; gap: 12px; align-items: center;">
				<BaseButton v-for="v in ['primary', 'secondary', 'outline', 'ghost']"
					:key="v"
					v-bind="args"
					variant="v"
				>
					{{ v }}
				</BaseButton>
			</div>
		`,
	}),
}
```

### 4. Состояния (disabled, loading, error)

```typescript
export const Disabled: Story = {
	args: {
		isDisabled: true,
		default: 'Отключена',
	},
}

export const Loading: Story = {
	args: {
		isLoading: true,
		default: 'Загрузка',
	},
}
```

---

## Правила создания stories

### Правило: setup() в render-функциях

Если `render` использует данные в `template` (массивы, переменные), **обязательно** возвращай их из `setup()`:

```typescript
// ❌ Ошибка — items не доступна в template
export const HoverState: Story = {
	render: () => ({
		components: { BaseAccordion },
		template: `<BaseAccordion :items="items" class="base-accordion--hover" />`,
	}),
}

// ✅ Правильно — данные возвращены из setup()
export const HoverState: Story = {
	render: () => ({
		components: { BaseAccordion },
		setup() {
			return { items: ITEMS }
		},
		template: `<BaseAccordion :items="items" class="base-accordion--hover" />`,
	}),
}
```

### Покрытие — все вариации

Каждая story должна демонстрировать **все допустимые значения** пропсов-объединений:

- `variant` → отдельная story со всеми вариантами в ряд
- `sizeScale` → отдельная story `SizeScale` с демонстрацией масштабирования (см. раздел «sizeScale в stories»)
- `type` (для input) → отдельная story со всеми типами
- Boolean-пропсы → отдельные stories для `true`-состояния

### Порядок stories

1. `Default` — базовое состояние с дефолтными пропсами
2. `Variants` — все варианты variant в ряд
3. `SizeScale` — демонстрация масштабирования (50%, 100%, 150%)
4. `Disabled` — отключенное состояние
5. `Loading` — состояние загрузки (если есть)
6. `WithError` — состояние с ошибкой (если есть)
7. `WithSlotContent` / `WithMedia` — слоты, медиа-контент (если есть)
8. `HoverState` — принудительное hover-состояние
9. `ActiveState` — принудительное active-состояние
10. `FocusState` — принудительное focus-состояние
11. `InteractiveStates` — все CSS-состояния рядом
12. `DarkTheme` — тёмная тема через декоратор с `data-theme`
13. `Interactive` — story с полными контролами для ручного тестирования

### Интерактивная story

Всегда добавляй `Interactive` story с полными контролами:

```typescript
export const Interactive: Story = {
	args: {
		default: 'Интерактивная кнопка',
	},
}
```

Эта story не фиксирует пропсы — пользователь меняет их через панель Controls.

---

## Компоненты с v-model

Для компонентов с `modelValue` используй `update:modelValue` в `argTypes`:

```typescript
argTypes: {
	modelValue: {
		control: 'text',
	},
	'onUpdate:modelValue': {
		table: {
			disable: true,
		},
	},
},
```

В story с `v-model` обёрни компонент в `setup`:

```typescript
export const WithValue: Story = {
	render: (args) => ({
		components: { BaseInput },
		setup() {
			const value = ref('')
			return { args, value }
		},
		template: `
			<BaseInput
				v-model="value"
				v-bind="args"
			/>
			<p style="margin-top: 8px;">Значение: {{ value }}</p>
		`,
	}),
}
```

---

## Слоты

Документируй слоты через `argTypes`:

```typescript
argTypes: {
	default: {
		control: 'text',
		description: 'Контент кнопки',
	},
	prefix: {
		table: { disable: true },
	},
},
```

Для демонстрации слотов создавай отдельные stories:

```typescript
export const WithSlotPrefix: Story = {
	render: (args) => ({
		components: { BaseInput },
		setup() {
			return { args }
		},
		template: `
			<BaseInput v-bind="args" placeholder="Поиск...">
				<template #prefix>🔍</template>
			</BaseInput>
		`,
	}),
}
```

---

## Темизация

Все stories должны корректно отображаться в обеих темах.

Не задавай инлайн-цвета в stories — компоненты используют CSS-переменные.

### Правило: селектор тёмной темы

CSS-переменные тёмной темы определены через `[data-theme='dark']` (не `:root[data-theme='dark']`).
Это позволяет использовать `data-theme` на любом элементе, а не только на `<html>`.

### Декоратор DarkTheme

Для проверки тёмной темы добавляй декоратор с `data-theme` на обёртку `<div>`:

```typescript
export const DarkTheme: Story = {
	decorators: [
		() => ({
			template: '<div data-theme="dark" style="padding: 16px; background: var(--color-bg);"><story /></div>',
		}),
	],
	args: {
		default: 'Тёмная тема',
	},
}
```

**Запрещено** ставить `data-theme` на `document.documentElement` через `onMounted` — это вызывает утечку тёмной темы в другие stories при переключении.

---

## argTypes — правила

### Управление контролами

| Тип пропса | control | Пример |
|---|---|---|
| `string` | `'text'` | `label: { control: 'text' }` |
| `number` | `'number'` | `count: { control: 'number' }` |
| `boolean` | `'boolean'` | `isDisabled: { control: 'boolean' }` |
| `union` (перечисление) | `'select'` + `options` | `variant: { control: 'select', options: ['a', 'b'] }` |
| `union` (variant) | `'radio'` + `options` | `variant: { control: 'radio', options: ['default', 'ghost', 'outline'] }` |
| `union` (inline) | `'inline-radio'` + `options` | `type: { control: 'inline-radio', options: ['text', 'password'] }` |
| `sizeScale` (масштаб) | `'range'` + min/max/step | `sizeScale: { control: { type: 'range', min: 50, max: 200, step: 10 } }` |
| `color` (CustomColor) | `'object'` + description | `color: { control: 'object', description: 'Объект CustomColor: bg, text и их состояния hover/active/focus' }` |
| Функция / emit | `disable: true` | `'onClick': { table: { disable: true } }` |

### Скрытие технических пропсов

`buildArgTypes` автоматически скрывает `class`, `style`, `key`, `ref`. Не добавляй их вручную.

### Show Code — явный исходный код

Storybook не может автоматически извлечь исходный код из `render`-функций с `template`. Для таких stories **обязательно** указывай `parameters.docs.source.code` — это то, что пользователь увидит при нажатии "Show Code":

```typescript
export const Variants: Story = {
	parameters: {
		docs: {
			source: {
				code: `<BaseAccordion v-for="v in ['default', 'ghost', 'outline', 'shadow', 'soft']" :key="v" :variant="v" />`,
			},
		},
	},
	render: (args) => ({
		components: { BaseAccordion },
		setup() {
			return { args, variants: ACCORDION_VARIANTS }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:24px;">
				<BaseAccordion v-for="v in variants" :key="v" v-bind="args" :variant="v" />
			</div>
		`,
	}),
}
```

> **Правило:** Каждая story с `render` должна иметь `parameters.docs.source.code`. Код должен быть минимальным и демонстрационным — без обёрточных `<div>`, стилей и служебных элементов. Показывай только суть использования компонента.

---

## Шаблон stories файла

```typescript
/**
 * Stories для компонента ComponentName.
 * Демонстрирует все вариации, состояния, слоты и CSS-состояния.
 */

import type { Meta, StoryObj } from '@storybook/vue3'

import ComponentName from './ComponentName.vue'

const meta: Meta<typeof ComponentName> = {
	title: 'UI/ComponentName',
	component: ComponentName,
	argTypes: {
		sizeScale: {
			control: { type: 'range', min: 50, max: 200, step: 10 },
			description: 'Масштаб размера (50–200%, по умолчанию 100)',
		},
		color: {
			control: 'object',
			description: 'Объект CustomColor: bg (фоновый цвет), text (цвет текста) и их состояния hover/active/focus. Пример: { bg: "#fff", bgHover: "#eee", text: "#333" }',
		},
		class: { table: { disable: true } },
		style: { table: { disable: true } },
		key: { table: { disable: true } },
		ref: { table: { disable: true } },
	},
	args: {
		sizeScale: 100,
	},
}

export default meta
type Story = StoryObj<typeof ComponentName>

export const Default: Story = {}

export const Variants: Story = {
	render: (args) => ({
		components: { ComponentName },
		setup() {
			return { args }
		},
		template: `...`,
	}),
}

export const HoverState: Story = {
	render: () => ({
		components: { ComponentName },
		setup() {
			return { args: {} }
		},
		template: `<ComponentName v-bind="args" class="component-name--hover" />`,
	}),
}

export const ActiveState: Story = {
	render: () => ({
		components: { ComponentName },
		setup() {
			return { args: {} }
		},
		template: `<ComponentName v-bind="args" class="component-name--active" />`,
	}),
}

export const FocusState: Story = {
	render: () => ({
		components: { ComponentName },
		setup() {
			return { args: {} }
		},
		template: `<ComponentName v-bind="args" class="component-name--focus" />`,
	}),
}

export const InteractiveStates: Story = {
	render: () => ({
		components: { ComponentName },
		setup() {
			return { args: {} }
		},
		template: `
			<div style="display: grid; gap: 12px;">
				<ComponentName v-bind="args" />
				<ComponentName v-bind="args" class="component-name--hover" />
				<ComponentName v-bind="args" class="component-name--active" />
				<ComponentName v-bind="args" class="component-name--focus" />
			</div>
		`,
	}),
}

export const DarkTheme: Story = {
	decorators: [
		() => ({
			template: '<div data-theme="dark" style="padding: 16px; background: var(--color-bg);"><story /></div>',
		}),
	],
}

export const Interactive: Story = {}
```

---

## Документация

Документация генерируется автоматически через `autodocs` из JSDoc-комментариев в `.types.ts`.

**MDX-файлы не используются.** Storybook 10 не поддерживает индексацию `.stories.mdx` без плагина `@storybook/addon-mdx`.
Если в будущем плагин будет добавлен — MDX можно будет создать по стандартной структуре.

---

## Интерактивные состояния (hover / active / focus)

Для каждого интерактивного компонента создавай stories с визуальными состояниями:

### Обязательные stories

1. **HoverState** — принудительное hover-состояние через CSS-класс
2. **ActiveState** — принудительное active-состояние (для кнопок)
3. **FocusState** — принудительное focus-состояние
4. **InteractiveStates** — все состояния рядом для сравнения

### CSS-классы для принудительных состояний

Глобальные классы определены в `.storybook/forced-states.scss` и подключены через `.storybook/preview.ts`.

| Компонент | Hover | Active | Focus |
|---|---|---|---|
| BaseButton | `base-button--hover` | `base-button--active` | `base-button--focus` |
| BaseInput | `base-input--hover` | — | `base-input--focus` |
| BaseSelect | `base-select--hover` | — | `base-select--focus` |
| BaseTextarea | `base-textarea--hover` | — | `base-textarea--focus` |
| BaseCheckbox | `base-checkbox--hover` | — | `base-checkbox--focus` |
| BaseRadio | `base-radio--hover` | — | `base-radio--focus` |
| BaseSwitch | `base-switch--hover` | — | `base-switch--focus` |
| BasePin | `base-pin--hover` | — | `base-pin--focus` |
| BaseRange | `base-range--hover` | — | `base-range--focus` |
| BaseSearch | `base-search--hover` | — | `base-search--focus` |
| BaseAccordion | `base-accordion--hover` | — | `base-accordion--focus` |
| BaseMenu | `base-menu--hover` | — | `base-menu--focus` |
| BaseMegaMenu | `base-mega-menu--hover` | — | `base-mega-menu--focus` |
| BaseTabs | `base-tabs--hover` | — | `base-tabs--focus` |
| BaseBreadcrumbs | `base-breadcrumbs--hover` | — | `base-breadcrumbs--focus` |
| BaseSlider | `base-slider--hover` | — | `base-slider--focus` |
| BaseStepper | `base-stepper--hover` | — | `base-stepper--focus` |
| BasePagination | `base-pagination--hover` | — | `base-pagination--focus` |
| BaseCard | `base-card--hover` | — | `base-card--focus` |
| BaseAvatar | `base-avatar--hover` | — | `base-avatar--focus` |
| BaseBadge | `base-badge--hover` | — | `base-badge--focus` |
| BaseChip | `base-chip--hover` | — | `base-chip--focus` |
| BaseIcon | `base-icon--hover` | — | `base-icon--focus` |
| BaseImage | `base-image--hover` | — | `base-image--focus` |
| BaseLoader | `base-loader--hover` | — | `base-loader--focus` |
| BaseProgress | `base-progress--hover` | — | `base-progress--focus` |
| BaseSeparator | `base-separator--hover` | — | `base-separator--focus` |
| BaseText | `base-text--hover` | — | `base-text--focus` |
| BaseDropdown | `base-dropdown--hover` | — | `base-dropdown--focus` |
| BaseEditor | `base-editor--hover` | — | `base-editor--focus` |
| BaseFileUpload | `base-file-upload--hover` | — | `base-file-upload--focus` |
| BaseTable | `base-table--hover` | — | `base-table--focus` |
| BaseCalendar | `base-calendar--hover` | — | `base-calendar--focus` |
| BaseChat | `base-chat--hover` | — | `base-chat--focus` |

### Пример

```typescript
export const InteractiveStates: Story = {
	render: () => ({
		components: { BaseButton },
		template: `
			<div style="display: flex; flex-direction: column; gap: 16px;">
				<div style="display: flex; gap: 12px;">
					<span style="width: 60px;">Normal</span>
					<BaseButton v-for="v in ['primary', 'secondary']" :key="v" :variant="v">{{ v }}</BaseButton>
				</div>
				<div style="display: flex; gap: 12px;">
					<span style="width: 60px;">Hover</span>
					<BaseButton v-for="v in ['primary', 'secondary']" :key="'h-'+v" :variant="v" class="base-button--hover">{{ v }}</BaseButton>
				</div>
				<div style="display: flex; gap: 12px;">
					<span style="width: 60px;">Focus</span>
					<BaseButton v-for="v in ['primary', 'secondary']" :key="'f-'+v" :variant="v" class="base-button--focus">{{ v }}</BaseButton>
				</div>
			</div>
		`,
	}),
}
```

---

## Popup-компоненты (Modal, Popover, Slideover, Dropdown)

### Паттерн v-model:isOpen

Все popup-компоненты используют `v-model:is-open` для управления видимостью:

```typescript
// Типы — обязательно добавлять update:isOpen
export interface BaseModalEmits {
	(event: 'update:isOpen', value: boolean): void
	(event: 'close'): void
}
```

```vue
<!-- Компонент -->
<BaseModal v-model:is-open="isOpen" title="Заголовок">
	<p>Контент</p>
</BaseModal>
```

### Правила stories для popup

1. **Кнопка-триггер** — всегда добавляй кнопку для открытия
2. **v-model:is-open** — используй `v-model:is-open` вместо `:is-open`
3. **Начальное состояние** — `isOpen = ref(false)`, не `true`
4. **emit update:isOpen** — добавляй в `argTypes` с `table: { disable: true }`

```typescript
argTypes: {
	isOpen: { control: 'boolean' },
	'onUpdate:isOpen': { table: { disable: true } },
	onClose: { table: { disable: true } },
},
```

### Popup-компоненты в проекте

| Компонент | Пропс видимости | Позиционирование | Особенности |
|---|---|---|---|
| BaseModal | `v-model:is-open` | Центр экрана (Teleport) | Оверлей, закрытие по Escape/оверлею |
| BasePopover | `v-model:is-open` | Относительно триггера | Клик вне = закрытие |
| BaseSlideover | `v-model:is-open` | Слева/справа | Сторона через `side`, ширина через `width` |
| BaseDropdown | `:is-open` | 12 позиций через `position` | Обёртка для popover-паттернов, `@close` emit |

---

## sizeScale в stories

Проп `sizeScale` используется **вместо `size`** во всех компонентах UI Kit. Это число-процент (100 = 100%, 150 = 150%, 75 = 75%), а не union-перечисление.

### argTypes для sizeScale

```typescript
sizeScale: {
	control: { type: 'range', min: 50, max: 200, step: 10 },
	description: 'Масштаб размера (50–200%, по умолчанию 100)',
},
```

### Story SizeScale — демонстрация масштабирования

Для каждого компонента создавай story `SizeScale`, показывающую компонент в разных масштабах:

```typescript
/** Масштабирование sizeScale */
export const SizeScale: Story = {
	render: (args) => ({
		components: { ComponentName },
		setup() {
			return { args }
		},
		template: `
			<div style="display: flex; gap: 24px; flex-wrap: wrap; align-items: flex-start;">
				<div v-for="scale in [75, 100, 150]" :key="scale">
					<p style="margin-bottom: 8px; font-size: 13px; color: var(--color-text-muted);">{{ scale }}%</p>
					<ComponentName v-bind="args" :size-scale="scale" />
				</div>
			</div>
		`,
	}),
}
```

### Значение по умолчанию

В `args` meta-объекта всегда указывай `sizeScale: 100` — это значение по умолчанию для всех компонентов.

---

## color (CustomColor) в stories

Проп `color` имеет значение по умолчанию во всех компонентах — его не обязательно передавать явно. В stories он должен быть доступен для интерактивного тестирования.

### argTypes для color

```typescript
color: {
	control: 'object',
	description: 'Объект CustomColor: bg (фоновый цвет), text (цвет текста) и их состояния hover/active/focus. Пример: { bg: "#fff", bgHover: "#eee", text: "#333" }',
},
```

### Description для color

В `description` пропа `color` обязательно поясняй, **что именно передаётся в `CustomColor`** — какие поля объекта и за что они отвечают. Это помогает пользователю понять структуру объекта без просмотра исходного кода.

Поля `CustomColor`:
- `bg` — основной фоновый цвет
- `bgHover` — фоновый цвет при наведении
- `bgActive` — фоновый цвет при нажатии
- `bgFocus` — фоновый цвет при фокусе
- `text` — основной цвет текста
- `textHover` — цвет текста при наведении
- `textActive` — цвет текста при нажатии
- `textFocus` — цвет текста при фокусе

---

## Composables (утилиты)

### useSizeScale

Масштабирование размера компонента через CSS-переменную `--size-scale`. Используется во всех компонентах UI Kit через проп `sizeScale` (вместо `size`). По умолчанию `100`.

```ts
import { useSizeScale } from '@/shared/composables/useSizeScale'

const { sizeScaleStyle } = useSizeScale({ getScale: () => props.sizeScale })
```

В stories: `sizeScale` добавляй как `control: { type: 'range', min: 50, max: 200, step: 10 }` и создавай story `SizeScale` для демонстрации.

### useCustomColor

Кастомный цвет компонента: background и text раздельно, каждое со своими состояниями hover, active, focus. Проп `color` установлен по умолчанию для всех компонентов.

```ts
import { useCustomColor } from '@/shared/composables/useCustomColor'
import type { CustomColor } from '@/shared/composables/useCustomColor'

const { customColorStyle } = useCustomColor({ getColor: () => props.color })
```

В stories: `color` доступен как проп в компонентах, поддерживающих кастомизацию (BaseAccordion, BaseButton, BaseText и др.).

### useIcon

Composable для работы с SVG-иконками из спрайта.

```ts
import { useIcon } from '@/shared/composables/useIcon'

const { spritePath, getIconUrl, isIconExists, getIconNames } = useIcon()
```

Доступные иконки: `arrow-left`, `arrow-right`, `attach`, `check`, `chevron-down`, `chevron-left`, `chevron-right`, `chevron-up`, `close`, `menu`, `mic`, `pause`, `play`, `reply`, `search`, `send`, `sort-down`, `sort-up`, `sort`, `x-mark`.

Плагин `createIconPlugin` для глобальной регистрации BaseIcon:
```ts
import { createIconPlugin } from '@/shared/composables/useIcon'
app.use(createIconPlugin())
```

### useAutoScroll

Автопрокрутка контейнера к низу при изменении данных. Используется в BaseChat.

```ts
import { useAutoScroll } from '@/shared/composables/useAutoScroll'
```

| Параметр | Тип | Описание |
|----------|-----|----------|
| `container` | `Ref<HTMLElement \| null>` | Ref на контейнер |
| `enabled` | `() => boolean` | Включена ли автопрокрутка |
| `watchSource` | `() => unknown` | Источник данных для отслеживания |

Возвращает `{ scrollToBottom }`.

### useClickOutside

Отслеживание клика вне элемента. Используется в BaseDropdown, BasePopover, BaseSelect.

```ts
import { useClickOutside } from '@/shared/composables/useClickOutside'
```

| Параметр | Тип | Описание |
|----------|-----|----------|
| `targets` | `Ref<HTMLElement \| null>[]` | Отслеживаемые элементы |
| `callback` | `() => void` | Callback при клике вне |
| `isCapture` | `boolean?` | Capture-фаза (по умолчанию false) |
| `isActive` | `() => boolean?` | Активен ли слушатель |

### useDebounce / useDebounceFn

Дебаунс значения или функции. Используется в BaseSearch, BaseTable.

```ts
import { useDebounce, useDebounceFn } from '@/shared/composables/useDebounce'
```

| Функция | Описание |
|---------|----------|
| `useDebounce<T>(value, delay)` | Ref, обновляющийся с задержкой |
| `useDebounceFn<A>(fn, delay)` | Обёрнутая функция с задержкой |

### useDropdownPosition

Позиционирование выпадающей панели. Используется в BaseDropdown.

```ts
import { useDropdownPosition } from '@/shared/composables/useDropdownPosition'
```

Возвращает `{ panelStyle, updatePosition }`.

### useEscapeKey

Закрытие по Escape. Используется в BaseModal, BaseSlideover, BasePopover.

```ts
import { useEscapeKey } from '@/shared/composables/useEscapeKey'
```

| Параметр | Тип | Описание |
|----------|-----|----------|
| `isActive` | `() => boolean` | Активен ли слушатель |
| `callback` | `() => void` | Callback при нажатии Escape |

### useImageZoom

Зум изображения. Используется в BaseImage.

```ts
import { useImageZoom } from '@/shared/composables/useImageZoom'
```

Возвращает `{ isZoomOpen, currentScale, scalePercent, isMinScale, isMaxScale, rotation, zoomImageStyle, minimapViewportStyle, minimapImageStyle, openZoom, closeZoom, zoomIn, zoomOut, resetZoom, rotateLeft, rotateRight, handleOverlayClick, handleImageMouseDown, handleImageMouseMove, handleImageMouseUp }`.

### useInputMask

Маска ввода. Используется в BaseInput.

```ts
import { useInputMask } from '@/shared/composables/useInputMask'
```

Токены: `#` (цифра), `@` (буква), `*` (любой), `N` (цифры+), `A` (буквы+), `X` (буквоцифры+).

### useListNavigation

Навигация по списку клавишами. Используется в BaseSelect, BaseSearch.

```ts
import { useListNavigation } from '@/shared/composables/useListNavigation'
```

Возвращает `{ highlightedIndex, handleKeydown, reset }`.

### usePopup

Паттерн popup (оверлей + Escape + scroll lock). Используется в BaseModal, BaseSlideover.

```ts
import { usePopup } from '@/shared/composables/usePopup'
```

Возвращает `{ handleOverlayClick, close }`.

### useScrollLock

Блокировка скролла body. Используется в BaseModal, BaseSlideover.

```ts
import { useScrollLock } from '@/shared/composables/useScrollLock'
```

Возвращает `{ lock, unlock }`.

### useSwipe

Свайп и перетаскивание (touch + mouse). Используется в BaseSlider.

```ts
import { useSwipe } from '@/shared/composables/useSwipe'
```

Возвращает `{ isDragging, dragOffset, onTouchStart, onTouchMove, onTouchEnd, onDragStart }`.

### useTableData

Сортировка, фильтрация, пагинация, инкрементальная подгрузка таблицы. Используется в BaseTable.

```ts
import { useTableData } from '@/shared/composables/useTableData'
```

Возвращает `{ searchQuery, sortStates, activeFilters, processedRows, displayedRows, currentPage, totalPages, visiblePages, getSortDirection, handleSort, handleSearchInput, addFilter, removeFilter }`.

---

## Утилиты (utils)

Чистые функции из `@/shared/utils/`. Используются внутри компонентов.

### dateUtils

```ts
import { isSameDay, toDateOnly, daysInMonth, getWeekday, getWeekNumber, buildDateWithTime, isToday, isDateInRange } from '@/shared/utils/dateUtils'
```

Используется в: BaseCalendar.

### fileUtils

```ts
import { getExtension, formatFileSize, getFileIcon, validateFile, formatAcceptHint, createImagePreview } from '@/shared/utils/fileUtils'
```

Используется в: BaseFileUpload.

### formatUtils

```ts
import { formatMessageStatus, formatUrl, formatDateLong, formatCellValue } from '@/shared/utils/formatUtils'
```

Используется в: BaseChat, BaseTable, BaseTooltip.

### imageUtils

```ts
import { isExternalImage, replaceExtension, buildOptimizedSrc, buildSrcset } from '@/shared/utils/imageUtils'
```

Используется в: BaseImage.

### navigationUtils

```ts
import { openExternalUrl, resolveNavigation } from '@/shared/utils/navigationUtils'
```

Используется в: BaseBreadcrumbs, BaseMenu.

### paginationUtils

```ts
import { calcTotalPages, calcVisiblePages, calcPageInfo } from '@/shared/utils/paginationUtils'
```

Используется в: BasePagination, BaseTable.

### rangeUtils

```ts
import { toPercent, snapToStep, calcFillStyle, calcThumbStyle } from '@/shared/utils/rangeUtils'
```

Используется в: BaseRange.

### schemaUtils

```ts
import { buildBreadcrumbsSchema } from '@/shared/utils/schemaUtils'
```

Используется в: BaseBreadcrumbs.

### tableUtils

```ts
import { calcRowNumber, getColumnStyle, calcTotalColumns, calcColumnWidths } from '@/shared/utils/tableUtils'
```

Используется в: BaseTable.

### tooltipUtils

```ts
import { calcTooltipPosition, getTooltipTransition } from '@/shared/utils/tooltipUtils'
```

Используется в: BaseTooltip.

---

## Само-переиспользование компонентов в stories

Компоненты UI Kit обязаны переиспользовать друг друга вплоть до текста. Это правило отражается и в stories.

### Правило

При создании stories учитывай, что каждый визуальный элемент внутри компонента реализован через другой компонент UI Kit:

| Элемент | Компонент UI Kit |
|---------|-----------------|
| Текст (заголовок, подпись, описание) | `BaseText` |
| Иконка | `BaseIcon` |
| Изображение | `BaseImage` |
| Кнопка | `BaseButton` |
| Разделитель | `BaseSeparator` |
| Загрузка | `BaseLoader` |
| Бейдж | `BaseBadge` |
| Аватар | `BaseAvatar` |
| Анимация | `BaseAnimation` |
| Подсказка | `BaseTooltip` |
| Карточка | `BaseCard` |

### Импорты внутренних компонентов

Если компонент использует другие компоненты UI Kit внутри себя, эти компоненты должны быть импортированы в stories для корректной работы `setup()`:

```typescript
// ❌ Внутренний компонент не импортирован — story сломается
import BaseCard from './BaseCard.vue'

export const Default: Story = {
	render: () => ({
		components: { BaseCard },
		template: `<BaseCard title="Заголовок" />`,
	}),
}

// ✅ Все внутренние компоненты импортированы
import BaseCard from './BaseCard.vue'
import BaseText from '@/shared/ui/BaseText/BaseText.vue'
import BaseButton from '@/shared/ui/BaseButton/BaseButton.vue'
import BaseImage from '@/shared/ui/BaseImage/BaseImage.vue'

export const Default: Story = {
	render: () => ({
		components: { BaseCard, BaseText, BaseButton, BaseImage },
		template: `<BaseCard title="Заголовок" />`,
	}),
}
```

### Демонстрация переиспользования в stories

Создавай stories, которые показывают внутреннее переиспользование компонентов — это помогает документировать архитектуру UI Kit:

```typescript
/** Демонстрация внутренних компонентов BaseCard */
export const InnerComponents: Story = {
	render: () => ({
		components: { BaseCard, BaseText, BaseImage, BaseButton },
		setup() {
			return { args: {} }
		},
		template: `
			<div style="display: flex; flex-direction: column; gap: 16px;">
				<p>BaseCard использует внутри: BaseText, BaseImage, BaseButton</p>
				<BaseCard
					title="Карточка товара"
					subtitle="Описание товара"
					image="https://picsum.photos/400/200"
					image-alt="Товар"
					is-hoverable
				>
					<template #footer>
						<BaseButton variant="primary">Купить</BaseButton>
					</template>
				</BaseCard>
			</div>
		`,
	}),
}
```

---

## Запрещено

- ❌ Использовать `any` в типах stories
- ❌ Создавать stories вне папки компонента
- ❌ Импортировать типы через `import type` из `@storybook/vue3` — только `import type { Meta, StoryObj }`
- ❌ Задавать инлайн-стили с цветами (используй CSS-переменные)
- ❌ Оставлять пустые stories без `args`
- ❌ Дублировать дефолтные значения из компонента — указывай только переопределения
- ❌ Использовать `Template.bind({})` — устаревший паттерн, используй `StoryObj`
- ❌ Ставить `data-theme` на `document.documentElement` — только через обёртку `<div data-theme="dark">`
- ❌ Ссылаться на внешние переменные в `template` render-функции без возврата из `setup()`
- ❌ Создавать `.stories.mdx` файлы — Storybook 10 не поддерживает без плагина `@storybook/addon-mdx`
- ❌ Добавлять `tags: ['autodocs']` в отдельные stories — задано глобально в `preview.ts`
- ❌ Использовать сырой HTML (span, p, h1–h6, img, button, hr) внутри stories для визуальных элементов — только компоненты UI Kit

---

## Порционное добавление

Stories добавляются порционно — по 3–5 компонентов за раз.

Порядок добавления (по категориям UI Kit):

1. **Ввод данных**: BaseButton, BaseInput, BaseTextarea, BaseSelect, BaseCheckbox
2. **Ввод данных (продолжение)**: BaseRadio, BaseSwitch, BasePin, BaseFileUpload, BaseRange
3. **Ввод данных (поиск и редактор)**: BaseSearch, BaseEditor
4. **Отображение**: BaseCard, BaseAvatar, BaseBadge, BaseChip, BaseSkeleton, BaseTooltip
5. **Отображение (иконки и изображения)**: BaseIcon, BaseImage, BaseLoader, BaseProgress, BaseSeparator
6. **Навигация**: BaseAccordion, BaseMenu, BaseMegaMenu, BaseStepper, BasePagination
7. **Навигация (продолжение)**: BaseTabs, BaseBreadcrumbs, BaseSlider
8. **Структура и Overlay**: BaseForm, BaseFormField, BaseModal, BasePopover, BaseSlideover, BaseDropdown
9. **Текст и анимации**: BaseText, BaseAnimation, BaseNotification
10. **Данные и контент**: BaseTable, BaseCalendar, BaseChat

После каждой порции — подтверждение пользователем.

---

## Проверка перед завершением

Перед тем как считать stories готовыми, проверь:

1. [ ] Все union-пропсы покрыты отдельными stories
2. [ ] Все boolean-пропсы показаны в true-состоянии
3. [ ] Слоты задокументированы и продемонстрированы (включая медиа-контент: картинки, видео)
4. [ ] v-model работает интерактивно (если есть)
5. [ ] Нет инлайн-цветов — только CSS-переменные
6. [ ] Story запускается без ошибок в консоли
7. [ ] Компонент корректно отображается в обеих темах (DarkTheme story с декоратором `<div data-theme="dark">`)
8. [ ] Интерактивные состояния (hover/active/focus) продемонстрированы
9. [ ] Popup-компоненты используют v-model:is-open и закрываются корректно
10. [ ] В render-функциях все данные возвращаются из `setup()` — нет ссылок на внешние переменные в template
11. [ ] Технические пропсы скрыты: `class`, `style`, `key`, `ref`
12. [ ] Тёмная тема НЕ ставится на `document.documentElement` — только через обёртку `<div data-theme="dark">`
