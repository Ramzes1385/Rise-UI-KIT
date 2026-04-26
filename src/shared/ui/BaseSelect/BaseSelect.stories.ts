/**
 * Stories для компонента BaseSelect.
 * Демонстрирует все вариации, мультивыбор, поиск, ошибки и интерактивные состояния.
 */

import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'

import type { BaseSelectOption } from './BaseSelect.types'
import BaseSelect from './BaseSelect.vue'

/** Демо-опции для stories */
const OPTIONS: BaseSelectOption[] = [
	{ value: 'metal', label: 'Металл' },
	{ value: 'wood', label: 'Дерево' },
	{ value: 'stone', label: 'Камень' },
	{ value: 'glass', label: 'Стекло', description: 'Прозрачный материал' },
	{ value: 'ceramic', label: 'Керамика', isDisabled: true },
]

/** Опции с иконками */
const ICON_OPTIONS: BaseSelectOption[] = [
	{ value: 'steel', label: 'Сталь', icon: '⚙️' },
	{ value: 'bronze', label: 'Бронза', icon: '🥉' },
	{ value: 'copper', label: 'Медь', icon: '🟤' },
	{ value: 'gold', label: 'Золото', icon: '🥇' },
]

/** Много опций для скролла */
const MANY_OPTIONS: BaseSelectOption[] = Array.from({ length: 20 }, (_, i) => ({
	value: `item-${i}`,
	label: `Элемент ${i + 1}`,
}))

const meta: Meta<typeof BaseSelect> = {
	title: 'UI/BaseSelect',
	component: BaseSelect,

	argTypes: {
		variant: {
			control: 'select',
			options: ['default', 'ghost', 'outline', 'shadow', 'soft'],
		},
		color: {
			control: 'object',
			description: 'Кастомный цвет { bg: { base, hover... }, text: { base, hover... } }',
		},
		sizeScale: {
			control: { type: 'range', min: 50, max: 200, step: 10 },
			description: 'Масштаб размера (50–200%, по умолчанию 100)',
		},
		placeholder: { control: 'text' },
		isMultiple: { control: 'boolean' },
		isSearchable: { control: 'boolean' },
		isDisabled: { control: 'boolean' },
		hasError: { control: 'boolean' },
		modelValue: { table: { disable: true } },
		options: { table: { disable: true } },
		'onUpdate:modelValue': { table: { disable: true } },
		onChange: { table: { disable: true } },
	},

	args: {
		options: OPTIONS,
		placeholder: 'Выберите материал...',
		isMultiple: false,
		isSearchable: false,
		isDisabled: false,
		hasError: false,
		variant: 'default',
		sizeScale: 100,
	},
}

export default meta
type Story = StoryObj<typeof BaseSelect>

/** Базовый выбор */
export const Default: Story = {
	render: args => ({
		components: { BaseSelect },
		setup() {
			const value = ref<string | number>('')
			return { args, value }
		},
		template: '<BaseSelect v-model="value" v-bind="args" />',
	}),
}

/** Все варианты отображения */
export const Variants: Story = {
	render: args => ({
		components: { BaseSelect },
		setup() {
			const outline = ref<string | number>('')
			const ghost = ref<string | number>('')
			const underline = ref<string | number>('')
			return { args, outline, ghost, underline }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:16px;max-width:320px;">
				<BaseSelect v-for="v in ['default','ghost','outline','shadow','soft']"
					:key="v"
					v-model="outline"
					v-bind="args"
					:variant="v"
					:placeholder="'Variant: ' + v"
				/>
			</div>
		`,
	}),
}

/** Мультивыбор */
export const Multiple: Story = {
	args: {
		isMultiple: true,
	},
	render: args => ({
		components: { BaseSelect },
		setup() {
			const value = ref<(string | number)[]>([])
			return { args, value }
		},
		template: `
			<div>
				<BaseSelect v-model="value" v-bind="args" />
				<p style="margin-top:8px;color:var(--color-text-muted);font-size:12px;">Выбрано: {{ value }}</p>
			</div>
		`,
	}),
}

/** С поиском */
export const Searchable: Story = {
	args: {
		isSearchable: true,
	},
	render: args => ({
		components: { BaseSelect },
		setup() {
			const value = ref<string | number>('')
			return { args, value }
		},
		template: '<BaseSelect v-model="value" v-bind="args" />',
	}),
}

/** Мультивыбор + поиск */
export const MultipleSearchable: Story = {
	args: {
		isMultiple: true,
		isSearchable: true,
	},
	render: args => ({
		components: { BaseSelect },
		setup() {
			const value = ref<(string | number)[]>([])
			return { args, value }
		},
		template: `
			<div>
				<BaseSelect v-model="value" v-bind="args" />
				<p style="margin-top:8px;color:var(--color-text-muted);font-size:12px;">Выбрано: {{ value }}</p>
			</div>
		`,
	}),
}

/** С ошибкой */
export const WithError: Story = {
	args: {
		hasError: true,
	},
	render: args => ({
		components: { BaseSelect },
		setup() {
			const value = ref<string | number>('')
			return { args, value }
		},
		template: '<BaseSelect v-model="value" v-bind="args" />',
	}),
}

/** Ошибка во всех вариантах */
export const ErrorVariants: Story = {
	render: args => ({
		components: { BaseSelect },
		setup() {
			const outline = ref<string | number>('')
			const ghost = ref<string | number>('')
			const underline = ref<string | number>('')
			const options = OPTIONS
			return { args, outline, ghost, underline, options }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:16px;max-width:320px;">
				<BaseSelect v-model="outline" :options="options" variant="default" has-error />
				<BaseSelect v-model="ghost" :options="options" variant="ghost" has-error />
				<BaseSelect v-model="underline" :options="options" variant="outline" has-error />
			</div>
		`,
	}),
}

/** С ошибкой и сообщением */
export const ErrorWithMessage: Story = {
	render: args => ({
		components: { BaseSelect },
		setup() {
			const value = ref<string | number>('')
			const options = OPTIONS
			return { args, value, options }
		},
		template: `
			<div style="max-width:320px;">
				<BaseSelect v-model="value" :options="options" has-error placeholder="Выберите материал" />
				<p style="margin-top:4px;color:var(--color-error, #ef4444);font-size:12px;">Выберите обязательный материал</p>
			</div>
		`,
	}),
}

/** Отключенный */
export const Disabled: Story = {
	args: {
		isDisabled: true,
	},
	render: args => ({
		components: { BaseSelect },
		setup() {
			const value = ref<string | number>('')
			return { args, value }
		},
		template: '<BaseSelect v-model="value" v-bind="args" />',
	}),
}

/** С иконками */
export const WithIcons: Story = {
	args: {
		options: ICON_OPTIONS,
		placeholder: 'Выберите металл...',
	},
	render: args => ({
		components: { BaseSelect },
		setup() {
			const value = ref<string | number>('')
			return { args, value }
		},
		template: '<BaseSelect v-model="value" v-bind="args" />',
	}),
}

/** С описаниями опций */
export const WithDescriptions: Story = {
	render: args => ({
		components: { BaseSelect },
		setup() {
			const value = ref<string | number>('')
			const options = OPTIONS
			return { args, value, options }
		},
		template: '<BaseSelect v-model="value" :options="options" v-bind="args" />',
	}),
}

/** С отключенной опцией */
export const WithDisabledOption: Story = {
	render: args => ({
		components: { BaseSelect },
		setup() {
			const value = ref<string | number>('')
			return { args, value }
		},
		template: '<BaseSelect v-model="value" v-bind="args" />',
	}),
}

/** Много опций */
export const ManyOptions: Story = {
	args: {
		options: MANY_OPTIONS,
		placeholder: 'Выберите элемент...',
	},
	render: args => ({
		components: { BaseSelect },
		setup() {
			const value = ref<string | number>('')
			return { args, value }
		},
		template: '<BaseSelect v-model="value" v-bind="args" />',
	}),
}

// ── Интерактивные состояния (hover / active / focus) ──

export const HoverState: Story = {
	render: () => ({
		components: { BaseSelect },
		setup() {
			const v1 = ref<string | number>('')
			const v2 = ref<string | number>('')
			const v3 = ref<string | number>('')
			const options = OPTIONS
			return { v1, v2, v3, options }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:16px;max-width:320px;">
				<BaseSelect v-model="v1" variant="default" placeholder="default (hover)" class="base-select--hover" :options="options" />
				<BaseSelect v-model="v2" variant="ghost" placeholder="ghost (hover)" class="base-select--hover" :options="options" />
				<BaseSelect v-model="v3" variant="outline" placeholder="outline (hover)" class="base-select--hover" :options="options" />
			</div>
		`,
	}),
}

export const ActiveState: Story = {
	render: () => ({
		components: { BaseSelect },
		setup() {
			const v1 = ref<string | number>('')
			const v2 = ref<string | number>('')
			const v3 = ref<string | number>('')
			const options = OPTIONS
			return { v1, v2, v3, options }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:16px;max-width:320px;">
				<BaseSelect v-model="v1" variant="default" placeholder="default (active)" class="base-select--active" :options="options" />
				<BaseSelect v-model="v2" variant="ghost" placeholder="ghost (active)" class="base-select--active" :options="options" />
				<BaseSelect v-model="v3" variant="outline" placeholder="outline (active)" class="base-select--active" :options="options" />
			</div>
		`,
	}),
}

export const FocusState: Story = {
	render: () => ({
		components: { BaseSelect },
		setup() {
			const v1 = ref<string | number>('')
			const v2 = ref<string | number>('')
			const v3 = ref<string | number>('')
			const options = OPTIONS
			return { v1, v2, v3, options }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:16px;max-width:320px;">
				<BaseSelect v-model="v1" variant="default" placeholder="default (focus)" class="base-select--focus" :options="options" />
				<BaseSelect v-model="v2" variant="ghost" placeholder="ghost (focus)" class="base-select--focus" :options="options" />
				<BaseSelect v-model="v3" variant="outline" placeholder="outline (focus)" class="base-select--focus" :options="options" />
			</div>
		`,
	}),
}

/** Все интерактивные состояния рядом */
export const InteractiveStates: Story = {
	render: () => ({
		components: { BaseSelect },
		setup() {
			const v1 = ref<string | number>('')
			const v2 = ref<string | number>('')
			const v3 = ref<string | number>('')
			const v4 = ref<string | number>('')
			const v5 = ref<string | number>('')
			const v6 = ref<string | number>('')
			const options = OPTIONS
			return { v1, v2, v3, v4, v5, v6, options }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:16px;max-width:320px;">
				<BaseSelect v-model="v1" variant="default" placeholder="Normal" :options="options" />
				<BaseSelect v-model="v2" variant="default" placeholder="Hover" class="base-select--hover" :options="options" />
				<BaseSelect v-model="v3" variant="default" placeholder="Active" class="base-select--active" :options="options" />
				<BaseSelect v-model="v4" variant="default" placeholder="Focus" class="base-select--focus" :options="options" />
				<BaseSelect v-model="v5" variant="default" placeholder="Error" has-error :options="options" />
				<BaseSelect v-model="v6" variant="default" placeholder="Disabled" is-disabled :options="options" />
			</div>
		`,
	}),
}

/** Тёмная тема */
export const DarkTheme: Story = {
	decorators: [
		() => ({
			template: '<div data-theme="dark" style="padding: 16px; background: var(--color-bg);"><story /></div>',
		}),
	],
	render: () => ({
		components: { BaseSelect },
		setup() {
			const value = ref<string | number>('')
			const options = OPTIONS
			return { value, options }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:16px;max-width:320px;">
				<BaseSelect v-model="value" variant="default" :options="options" placeholder="Тёмная тема" />
			</div>
		`,
	}),
}

/** Интерактивный */
export const Interactive: Story = {
	render: args => ({
		components: { BaseSelect },
		setup() {
			const value = ref<string | number>('')
			return { args, value }
		},
		template: '<BaseSelect v-model="value" v-bind="args" />',
	}),
}
