/**
 * Stories для компонента BaseRadio.
 * Демонстрирует все вариации, состояния и интерактивные состояния.
 */

import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'

import type { BaseRadioOption } from './BaseRadio.types'
import BaseRadio from './BaseRadio.vue'

const OPTIONS: BaseRadioOption[] = [
	{ value: 'metal', label: 'Металл' },
	{ value: 'wood', label: 'Дерево' },
	{ value: 'stone', label: 'Камень' },
	{ value: 'glass', label: 'Стекло', isDisabled: true },
]

const MATERIAL_OPTIONS: BaseRadioOption[] = [
	{ value: 'steel', label: 'Сталь' },
	{ value: 'bronze', label: 'Бронза' },
	{ value: 'copper', label: 'Медь' },
	{ value: 'iron', label: 'Железо' },
]

const SIZE_OPTIONS: BaseRadioOption[] = [
	{ value: 'sm', label: 'Маленький' },
	{ value: 'md', label: 'Средний' },
	{ value: 'lg', label: 'Большой' },
]

const meta: Meta<typeof BaseRadio> = {
	title: 'UI/BaseRadio',
	component: BaseRadio,

	argTypes: {
		name: { control: 'text' },
		variant: {
			control: 'select',
			options: ['default', 'ghost', 'outline', 'shadow', 'soft'],
		},
		color: {
			control: 'object',
			description: 'Кастомный цвет { bg: { base, hover... }, text: { base, hover... } }',
		},
		isVertical: { control: 'boolean' },
		hasError: { control: 'boolean' },
		sizeScale: {
			control: { type: 'range', min: 50, max: 200, step: 10 },
			description: 'Масштаб размера (50–200%, по умолчанию 100)',
		},
		modelValue: { table: { disable: true } },
		options: { table: { disable: true } },
		'onUpdate:modelValue': { table: { disable: true } },
		onChange: { table: { disable: true } },
	},

	args: {
		name: 'material',
		options: OPTIONS,
		isVertical: false,
		variant: 'default',
		hasError: false,
		sizeScale: 100,
	},
}

export default meta
type Story = StoryObj<typeof BaseRadio>

/** Горизонтальная группа */
export const Default: Story = {
	render: args => ({
		components: { BaseRadio },
		setup() {
			const value = ref<string | number>('metal')
			return { args, value }
		},
		template: '<BaseRadio v-model="value" v-bind="args" />',
	}),
}

/** Вертикальная группа */
export const Vertical: Story = {
	args: {
		isVertical: true,
	},
	render: args => ({
		components: { BaseRadio },
		setup() {
			const value = ref<string | number>('metal')
			return { args, value }
		},
		template: '<BaseRadio v-model="value" v-bind="args" />',
	}),
}

/** С ошибкой */
export const WithError: Story = {
	args: {
		hasError: true,
	},
	render: args => ({
		components: { BaseRadio },
		setup() {
			const value = ref<string | number>('')
			return { args, value }
		},
		template: `
			<div>
				<BaseRadio v-model="value" v-bind="args" />
				<p style="margin-top:4px;color:var(--color-error, #ef4444);font-size:12px;">Выберите материал</p>
			</div>
		`,
	}),
}

/** С отключенной опцией */
export const WithDisabledOption: Story = {
	render: () => ({
		components: { BaseRadio },
		setup() {
			const value = ref<string | number>('metal')
			const options = OPTIONS
			return { value, options }
		},
		template: '<BaseRadio v-model="value" :options="options" name="disabled-opt" />',
	}),
}

/** Другой набор опций */
export const MaterialOptions: Story = {
	args: {
		options: MATERIAL_OPTIONS,
		name: 'material-type',
	},
	render: args => ({
		components: { BaseRadio },
		setup() {
			const value = ref<string | number>('steel')
			return { args, value }
		},
		template: '<BaseRadio v-model="value" v-bind="args" />',
	}),
}

/** Размеры */
export const SizeOptions: Story = {
	args: {
		options: SIZE_OPTIONS,
		name: 'size',
	},
	render: args => ({
		components: { BaseRadio },
		setup() {
			const value = ref<string | number>('md')
			return { args, value }
		},
		template: `
			<div>
				<BaseRadio v-model="value" v-bind="args" />
				<p style="margin-top:8px;color:var(--color-text-muted);">Выбрано: {{ value }}</p>
			</div>
		`,
	}),
}

/** Вертикальная + ошибка */
export const VerticalWithError: Story = {
	args: {
		isVertical: true,
		hasError: true,
	},
	render: args => ({
		components: { BaseRadio },
		setup() {
			const value = ref<string | number>('')
			return { args, value }
		},
		template: '<BaseRadio v-model="value" v-bind="args" />',
	}),
}

/** Все варианты */
export const Variants: Story = {
	render: args => ({
		components: { BaseRadio },
		setup() {
			const value = ref<string | number>('metal')
			return { args, value }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:24px;">
				<div v-for="v in ['default','ghost','outline','shadow','soft']" :key="v">
					<p style="margin-bottom:8px;font-size:12px;color:var(--color-text-muted);">Variant: {{ v }}</p>
					<BaseRadio v-model="value" v-bind="args" :variant="v" :name="'variant-' + v" />
				</div>
			</div>
		`,
	}),
}

// ── Интерактивные состояния (hover / focus) ──

export const HoverState: Story = {
	render: () => ({
		components: { BaseRadio },
		setup() {
			const value = ref('metal')
			const options = OPTIONS
			return { value, options }
		},
		template: `
			<div class="base-radio-group--hover">
				<BaseRadio v-model="value" :options="options" name="hover" />
			</div>
		`,
	}),
}

export const FocusState: Story = {
	render: () => ({
		components: { BaseRadio },
		setup() {
			const value = ref('metal')
			const options = OPTIONS
			return { value, options }
		},
		template: `
			<div class="base-radio-group--focus">
				<BaseRadio v-model="value" :options="options" name="focus" />
			</div>
		`,
	}),
}

/** Все интерактивные состояния рядом */
export const InteractiveStates: Story = {
	render: () => ({
		components: { BaseRadio },
		setup() {
			const normal = ref('metal')
			const hover = ref('metal')
			const focus = ref('metal')
			const error = ref('')
			const disabled = ref('metal')
			const options = OPTIONS
			return { normal, hover, focus, error, disabled, options }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:16px;">
				<div>
					<span style="font-size:12px;color:var(--color-text-muted);">Normal</span>
					<BaseRadio v-model="normal" :options="options" name="normal" />
				</div>
				<div class="base-radio-group--hover">
					<span style="font-size:12px;color:var(--color-text-muted);">Hover</span>
					<BaseRadio v-model="hover" :options="options" name="hover" />
				</div>
				<div class="base-radio-group--focus">
					<span style="font-size:12px;color:var(--color-text-muted);">Focus</span>
					<BaseRadio v-model="focus" :options="options" name="focus" />
				</div>
				<div>
					<span style="font-size:12px;color:var(--color-text-muted);">Error</span>
					<BaseRadio v-model="error" :options="options" name="error" has-error />
				</div>
				<div>
					<span style="font-size:12px;color:var(--color-text-muted);">Disabled option</span>
					<BaseRadio v-model="disabled" :options="options" name="disabled" />
				</div>
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
		components: { BaseRadio },
		setup() {
			const value = ref<string | number>('metal')
			const error = ref<string | number>('')
			const options = OPTIONS
			return { value, error, options }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:16px;">
				<BaseRadio v-model="value" :options="options" name="dark" />
				<BaseRadio v-model="error" :options="options" name="dark-error" has-error />
			</div>
		`,
	}),
}

/** Интерактивная */
export const Interactive: Story = {
	render: args => ({
		components: { BaseRadio },
		setup() {
			const value = ref<string | number>('metal')
			return { args, value }
		},
		template: `
			<div>
				<BaseRadio v-model="value" v-bind="args" />
				<p style="margin-top:8px;color:var(--color-text-muted);">Выбрано: {{ value }}</p>
			</div>
		`,
	}),
}
