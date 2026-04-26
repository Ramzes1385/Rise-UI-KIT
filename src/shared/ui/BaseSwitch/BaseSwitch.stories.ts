/**
 * Stories для компонента BaseSwitch.
 * Демонстрирует все вариации, состояния, слоты и CSS-состояния.
 */

import type { Meta, StoryObj } from '@storybook/vue3'

import { ref } from 'vue'

import { buildArgTypes } from '@/shared/utils/storybookUtils'

import { SWITCH_VARIANTS } from './BaseSwitch.types'
import BaseSwitch from './BaseSwitch.vue'

const meta: Meta<typeof BaseSwitch> = {
	title: 'UI/BaseSwitch',
	component: BaseSwitch,
	argTypes: buildArgTypes({
		props: {
			label: { control: 'text' },
			error: { control: 'text' },
			isRequired: { control: 'boolean' },
			isDisabled: { control: 'boolean' },
			reverse: { control: 'boolean' },
			variant: {
				control: 'select',
				options: SWITCH_VARIANTS,
			},
			color: {
				control: 'object',
				description: 'Объект CustomColor: bg (фоновый цвет), text (цвет текста) и их состояния hover/active/focus',
			},
			sizeScale: {
				control: { type: 'range', min: 50, max: 200, step: 10 },
				description: 'Масштаб размера (50–200%, по умолчанию 100)',
			},
			modelValue: { control: 'boolean' },
			'onUpdate:modelValue': { table: { disable: true } },
			onChange: { table: { disable: true } },
		},
	}),
	args: {
		label: 'Уведомления',
		variant: 'default',
		isDisabled: false,
		isRequired: false,
		reverse: false,
		sizeScale: 100,
	},
}

export default meta
type Story = StoryObj<typeof BaseSwitch>

/** Базовый переключатель */
export const Default: Story = {
	render: args => ({
		components: { BaseSwitch },
		setup() {
			const value = ref(false)
			return { args, value }
		},
		template: '<BaseSwitch v-model="value" v-bind="args" />',
	}),
}

/** Включенный */
export const Checked: Story = {
	render: args => ({
		components: { BaseSwitch },
		setup() {
			const value = ref(true)
			return { args, value }
		},
		template: '<BaseSwitch v-model="value" v-bind="args" />',
	}),
}

/** Все варианты */
export const Variants: Story = {
	parameters: {
		docs: {
			source: {
				code: `<BaseSwitch v-for="v in ['default', 'outline', 'shadow']" :key="v" :variant="v" :label="'Variant: ' + v" />`,
			},
		},
	},
	render: args => ({
		components: { BaseSwitch },
		setup() {
			const value = ref(false)
			const variants = SWITCH_VARIANTS
			return { args, value, variants }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:12px;">
				<BaseSwitch v-for="v in variants" :key="v" v-model="value" v-bind="args" :variant="v" :label="'Variant: ' + v" />
			</div>
		`,
	}),
}

/** Масштабирование sizeScale */
export const SizeScale: Story = {
	parameters: {
		docs: {
			source: {
				code: `<BaseSwitch v-for="scale in [75, 100, 150]" :key="scale" :size-scale="scale" label="Уведомления" />`,
			},
		},
	},
	render: args => ({
		components: { BaseSwitch },
		setup() {
			const scales = [75, 100, 150]
			return { args, scales }
		},
		template: `
			<div style="display:flex;gap:24px;flex-wrap:wrap;align-items:flex-start;">
				<div v-for="scale in scales" :key="scale">
					<p style="margin-bottom:8px;font-size:13px;color:var(--color-text-muted);">{{ scale }}%</p>
					<BaseSwitch v-bind="args" :size-scale="scale" label="Уведомления" />
				</div>
			</div>
		`,
	}),
}

/** Обязательное поле */
export const Required: Story = {
	args: {
		isRequired: true,
	},
	render: args => ({
		components: { BaseSwitch },
		setup() {
			const value = ref(false)
			return { args, value }
		},
		template: '<BaseSwitch v-model="value" v-bind="args" />',
	}),
}

/** С ошибкой */
export const WithError: Story = {
	args: {
		error: 'Необходимо включить уведомления',
	},
	render: args => ({
		components: { BaseSwitch },
		setup() {
			const value = ref(false)
			return { args, value }
		},
		template: '<BaseSwitch v-model="value" v-bind="args" />',
	}),
}

/** Обратный порядок */
export const Reverse: Story = {
	args: {
		reverse: true,
	},
	render: args => ({
		components: { BaseSwitch },
		setup() {
			const value = ref(false)
			return { args, value }
		},
		template: '<BaseSwitch v-model="value" v-bind="args" />',
	}),
}

/** Отключенный */
export const Disabled: Story = {
	args: {
		isDisabled: true,
	},
	render: args => ({
		components: { BaseSwitch },
		setup() {
			const value = ref(false)
			return { args, value }
		},
		template: '<BaseSwitch v-model="value" v-bind="args" />',
	}),
}

/** Отключенный включенный */
export const DisabledChecked: Story = {
	args: {
		isDisabled: true,
	},
	render: args => ({
		components: { BaseSwitch },
		setup() {
			const value = ref(true)
			return { args, value }
		},
		template: '<BaseSwitch v-model="value" v-bind="args" />',
	}),
}

/** Без лейбла */
export const WithoutLabel: Story = {
	render: () => ({
		components: { BaseSwitch },
		setup() {
			const value = ref(false)
			return { value }
		},
		template: '<BaseSwitch v-model="value" />',
	}),
}

/** Несколько переключателей */
export const Group: Story = {
	parameters: {
		docs: {
			source: {
				code: `<BaseSwitch v-model="notifications" label="Уведомления" />\n<BaseSwitch v-model="darkMode" label="Тёмная тема" />\n<BaseSwitch v-model="sounds" label="Звуки" />\n<BaseSwitch v-model="analytics" label="Аналитика" />`,
			},
		},
	},
	render: () => ({
		components: { BaseSwitch },
		setup() {
			const notifications = ref(true)
			const darkMode = ref(false)
			const sounds = ref(true)
			const analytics = ref(false)
			return { notifications, darkMode, sounds, analytics }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:12px;">
				<BaseSwitch v-model="notifications" label="Уведомления" />
				<BaseSwitch v-model="darkMode" label="Тёмная тема" />
				<BaseSwitch v-model="sounds" label="Звуки" />
				<BaseSwitch v-model="analytics" label="Аналитика" />
			</div>
		`,
	}),
}

/** Группа с отключенными */
export const GroupWithDisabled: Story = {
	parameters: {
		docs: {
			source: {
				code: `<BaseSwitch v-model="opt1" label="Доступный" />\n<BaseSwitch v-model="opt2" label="Недоступный" is-disabled />\n<BaseSwitch v-model="opt3" label="Недоступный включённый" is-disabled />`,
			},
		},
	},
	render: () => ({
		components: { BaseSwitch },
		setup() {
			const opt1 = ref(true)
			const opt2 = ref(false)
			const opt3 = ref(true)
			return { opt1, opt2, opt3 }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:12px;">
				<BaseSwitch v-model="opt1" label="Доступный" />
				<BaseSwitch v-model="opt2" label="Недоступный" is-disabled />
				<BaseSwitch v-model="opt3" label="Недоступный включённый" is-disabled />
			</div>
		`,
	}),
}

/** Слот default */
export const WithSlotContent: Story = {
	parameters: {
		docs: {
			source: {
				code: `<BaseSwitch v-model="value"><span style="color: var(--color-text-muted); font-size: 13px;">Дополнительное описание</span></BaseSwitch>`,
			},
		},
	},
	render: () => ({
		components: { BaseSwitch },
		setup() {
			const value = ref(false)
			return { value }
		},
		template: `
			<BaseSwitch v-model="value" label="Уведомления">
				<span style="color:var(--color-text-muted);font-size:13px;margin-left:4px;">— получать push-уведомления</span>
			</BaseSwitch>
		`,
	}),
}

/** Слот label */
export const WithSlotLabel: Story = {
	parameters: {
		docs: {
			source: {
				code: `<BaseSwitch v-model="value">\n  <template #label><strong>Кастомный лейбл</strong></template>\n</BaseSwitch>`,
			},
		},
	},
	render: () => ({
		components: { BaseSwitch },
		setup() {
			const value = ref(false)
			return { value }
		},
		template: `
			<BaseSwitch v-model="value">
				<template #label><strong style="font-size:15px;">Кастомный лейбл</strong></template>
			</BaseSwitch>
		`,
	}),
}

/** Слот error */
export const WithSlotError: Story = {
	parameters: {
		docs: {
			source: {
				code: `<BaseSwitch v-model="value" error=" ">\n  <template #error><em>Кастомное сообщение ошибки</em></template>\n</BaseSwitch>`,
			},
		},
	},
	render: () => ({
		components: { BaseSwitch },
		setup() {
			const value = ref(false)
			return { value }
		},
		template: `
			<BaseSwitch v-model="value" label="Согласие" error=" ">
				<template #error><em style="color:var(--color-error);font-size:12px;">Необходимо принять условия</em></template>
			</BaseSwitch>
		`,
	}),
}

// ── Интерактивные состояния (hover / active / focus) ──

export const HoverState: Story = {
	render: () => ({
		components: { BaseSwitch },
		setup() {
			return { args: {} }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:12px;">
				<BaseSwitch :model-value="false" label="Off (hover)" class="base-switch--hover" />
				<BaseSwitch :model-value="true" label="On (hover)" class="base-switch--hover" />
			</div>
		`,
	}),
}

export const ActiveState: Story = {
	render: () => ({
		components: { BaseSwitch },
		setup() {
			return { args: {} }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:12px;">
				<BaseSwitch :model-value="false" label="Off (active)" class="base-switch--active" />
				<BaseSwitch :model-value="true" label="On (active)" class="base-switch--active" />
			</div>
		`,
	}),
}

export const FocusState: Story = {
	render: () => ({
		components: { BaseSwitch },
		setup() {
			return { args: {} }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:12px;">
				<BaseSwitch :model-value="false" label="Off (focus)" class="base-switch--focus" />
				<BaseSwitch :model-value="true" label="On (focus)" class="base-switch--focus" />
			</div>
		`,
	}),
}

/** Все интерактивные состояния рядом */
export const InteractiveStates: Story = {
	render: () => ({
		components: { BaseSwitch },
		setup() {
			return { args: {} }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:16px;">
				<div style="display:flex;gap:24px;align-items:center;">
					<span style="width:60px;font-size:12px;color:var(--color-text-muted);">Normal</span>
					<BaseSwitch :model-value="false" label="Off" />
					<BaseSwitch :model-value="true" label="On" />
				</div>
				<div style="display:flex;gap:24px;align-items:center;">
					<span style="width:60px;font-size:12px;color:var(--color-text-muted);">Hover</span>
					<BaseSwitch :model-value="false" label="Off" class="base-switch--hover" />
					<BaseSwitch :model-value="true" label="On" class="base-switch--hover" />
				</div>
				<div style="display:flex;gap:24px;align-items:center;">
					<span style="width:60px;font-size:12px;color:var(--color-text-muted);">Active</span>
					<BaseSwitch :model-value="false" label="Off" class="base-switch--active" />
					<BaseSwitch :model-value="true" label="On" class="base-switch--active" />
				</div>
				<div style="display:flex;gap:24px;align-items:center;">
					<span style="width:60px;font-size:12px;color:var(--color-text-muted);">Focus</span>
					<BaseSwitch :model-value="false" label="Off" class="base-switch--focus" />
					<BaseSwitch :model-value="true" label="On" class="base-switch--focus" />
				</div>
				<div style="display:flex;gap:24px;align-items:center;">
					<span style="width:60px;font-size:12px;color:var(--color-text-muted);">Disabled</span>
					<BaseSwitch :model-value="false" label="Off" is-disabled />
					<BaseSwitch :model-value="true" label="On" is-disabled />
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
		components: { BaseSwitch },
		setup() {
			const value = ref(false)
			return { value }
		},
		template: '<BaseSwitch v-model="value" label="Тёмная тема" />',
	}),
}

/** Интерактивный */
export const Interactive: Story = {
	render: args => ({
		components: { BaseSwitch },
		setup() {
			const value = ref(false)
			return { args, value }
		},
		template: `
			<div>
				<BaseSwitch v-model="value" v-bind="args" />
				<p style="margin-top:8px;color:var(--color-text-muted);">Включено: {{ value }}</p>
			</div>
		`,
	}),
}
