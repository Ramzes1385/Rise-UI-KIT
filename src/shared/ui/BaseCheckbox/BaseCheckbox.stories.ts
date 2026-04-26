/**
 * Stories для компонента BaseCheckbox.
 * Демонстрирует все состояния, интерактивные состояния и тёмную тему.
 */

import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'

import BaseCheckbox from './BaseCheckbox.vue'

const meta: Meta<typeof BaseCheckbox> = {
	title: 'UI/BaseCheckbox',
	component: BaseCheckbox,

	argTypes: {
		label: { control: 'text' },
		variant: {
			control: 'select',
			options: ['default', 'ghost', 'outline', 'shadow', 'soft'],
		},
		color: {
			control: 'object',
			description: 'Кастомный цвет { bg: { base, hover... }, text: { base, hover... } }',
		},
		isDisabled: { control: 'boolean' },
		hasError: { control: 'boolean' },
		sizeScale: {
			control: { type: 'range', min: 50, max: 200, step: 10 },
			description: 'Масштаб размера (50–200%, по умолчанию 100)',
		},
		modelValue: { control: 'boolean' },
		'onUpdate:modelValue': { table: { disable: true } },
		onChange: { table: { disable: true } },
		class: { table: { disable: true } },
		style: { table: { disable: true } },
		key: { table: { disable: true } },
		ref: { table: { disable: true } },
	},

	args: {
		label: 'Согласен с условиями',
		variant: 'default',
		isDisabled: false,
		hasError: false,
		sizeScale: 100,
	},
}

export default meta
type Story = StoryObj<typeof BaseCheckbox>

/** Базовый чекбокс */
export const Default: Story = {
	render: args => ({
		components: { BaseCheckbox },
		setup() {
			const value = ref(false)
			return { args, value }
		},
		template: '<BaseCheckbox v-model="value" v-bind="args" />',
	}),
}

/** Выбранный */
export const Checked: Story = {
	render: args => ({
		components: { BaseCheckbox },
		setup() {
			const value = ref(true)
			return { args, value }
		},
		template: '<BaseCheckbox v-model="value" v-bind="args" />',
	}),
}

/** Отключенный */
export const Disabled: Story = {
	args: {
		isDisabled: true,
	},
	render: args => ({
		components: { BaseCheckbox },
		setup() {
			const value = ref(false)
			return { args, value }
		},
		template: '<BaseCheckbox v-model="value" v-bind="args" />',
	}),
}

/** Отключенный выбранный */
export const DisabledChecked: Story = {
	render: () => ({
		components: { BaseCheckbox },
		setup() {
			const value = ref(true)
			return { value }
		},
		template: '<BaseCheckbox v-model="value" label="Отключённый выбранный" is-disabled />',
	}),
}

/** С ошибкой */
export const WithError: Story = {
	args: {
		hasError: true,
	},
	render: args => ({
		components: { BaseCheckbox },
		setup() {
			const value = ref(false)
			return { args, value }
		},
		template: '<BaseCheckbox v-model="value" v-bind="args" />',
	}),
}

/** Без подписи */
export const WithoutLabel: Story = {
	render: () => ({
		components: { BaseCheckbox },
		setup() {
			const value = ref(false)
			return { value }
		},
		template: '<BaseCheckbox v-model="value" />',
	}),
}

/** Несколько чекбоксов */
export const Group: Story = {
	render: () => ({
		components: { BaseCheckbox },
		setup() {
			const opt1 = ref(true)
			const opt2 = ref(false)
			const opt3 = ref(true)
			return { opt1, opt2, opt3 }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:12px;">
				<BaseCheckbox v-model="opt1" label="Металл" />
				<BaseCheckbox v-model="opt2" label="Дерево" />
				<BaseCheckbox v-model="opt3" label="Камень" />
			</div>
		`,
	}),
}

// ── Интерактивные состояния (hover / focus) ──

export const Variants: Story = {
	render: args => ({
		components: { BaseCheckbox },
		setup() {
			const value = ref(false)
			return { args, value }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:12px;">
				<BaseCheckbox v-for="v in ['default','ghost','outline','shadow','soft']"
					:key="v"
					v-model="value"
					v-bind="args"
					:variant="v"
					:label="'Variant: ' + v"
				/>
			</div>
		`,
	}),
}

export const HoverState: Story = {
	render: () => ({
		components: { BaseCheckbox },
		template: `
			<div style="display:flex;flex-direction:column;gap:12px;">
				<BaseCheckbox label="Hover (unchecked)" class="base-checkbox--hover" />
				<BaseCheckbox label="Hover (checked)" class="base-checkbox--hover" :model-value="true" />
			</div>
		`,
	}),
}

export const FocusState: Story = {
	render: () => ({
		components: { BaseCheckbox },
		template: `
			<div style="display:flex;flex-direction:column;gap:12px;">
				<BaseCheckbox label="Focus (unchecked)" class="base-checkbox--focus" />
				<BaseCheckbox label="Focus (checked)" class="base-checkbox--focus" :model-value="true" />
			</div>
		`,
	}),
}

/** Все интерактивные состояния рядом */
export const InteractiveStates: Story = {
	render: () => ({
		components: { BaseCheckbox },
		template: `
			<div style="display:flex;flex-direction:column;gap:12px;">
				<BaseCheckbox label="Normal" />
				<BaseCheckbox label="Hover" class="base-checkbox--hover" />
				<BaseCheckbox label="Focus" class="base-checkbox--focus" />
				<BaseCheckbox label="Checked" :model-value="true" />
				<BaseCheckbox label="Error" has-error />
				<BaseCheckbox label="Disabled" is-disabled />
				<BaseCheckbox label="Disabled checked" is-disabled :model-value="true" />
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
		components: { BaseCheckbox },
		setup() {
			const val1 = ref(false)
			const val2 = ref(true)
			return { val1, val2 }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:12px;">
				<BaseCheckbox v-model="val1" label="Не выбран" />
				<BaseCheckbox v-model="val2" label="Выбран" />
				<BaseCheckbox label="С ошибкой" has-error />
				<BaseCheckbox label="Отключён" is-disabled />
			</div>
		`,
	}),
}

/** Масштабирование размера */
export const SizeScale: Story = {
	render: () => ({
		components: { BaseCheckbox },
		setup() {
			const v1 = ref(false)
			const v2 = ref(false)
			const v3 = ref(false)
			const v4 = ref(false)
			return { v1, v2, v3, v4 }
		},
		template: `
			<div style="display: flex; flex-direction: column; gap: 16px;">
				<div style="display: flex; gap: 16px; align-items: center;">
					<span style="width: 60px; font-size: 12px; color: var(--color-text-muted);">0.75×</span>
					<BaseCheckbox v-model="v1" label="Маленький" :size-scale="75" />
				</div>
				<div style="display: flex; gap: 16px; align-items: center;">
					<span style="width: 60px; font-size: 12px; color: var(--color-text-muted);">1×</span>
					<BaseCheckbox v-model="v2" label="Стандартный" />
				</div>
				<div style="display: flex; gap: 16px; align-items: center;">
					<span style="width: 60px; font-size: 12px; color: var(--color-text-muted);">1.25×</span>
					<BaseCheckbox v-model="v3" label="Увеличенный" :size-scale="125" />
				</div>
				<div style="display: flex; gap: 16px; align-items: center;">
					<span style="width: 60px; font-size: 12px; color: var(--color-text-muted);">1.5×</span>
					<BaseCheckbox v-model="v4" label="Большой" :size-scale="150" />
				</div>
			</div>
		`,
	}),
}

/** Интерактивный */
export const Interactive: Story = {
	render: args => ({
		components: { BaseCheckbox },
		setup() {
			const value = ref(false)
			return { args, value }
		},
		template: `
			<div>
				<BaseCheckbox v-model="value" v-bind="args" />
				<p style="margin-top:8px;color:var(--color-text-muted);">Выбрано: {{ value }}</p>
			</div>
		`,
	}),
}
