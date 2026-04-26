/**
 * Stories для компонента BaseEditor.
 * Демонстрирует все состояния.
 */

import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'

import BaseEditor from './BaseEditor.vue'

import { EDITOR_VARIANTS } from './BaseEditor.types'

const meta: Meta<typeof BaseEditor> = {
	title: 'UI/BaseEditor',
	component: BaseEditor,

	argTypes: {
		placeholder: { control: 'text' },
		variant: {
			control: 'select',
			options: EDITOR_VARIANTS,
		},
		color: {
			control: 'object',
			description: 'Кастомный цвет { bg: { base, hover... }, text: { base, hover... } }',
		},
		isReadonly: { control: 'boolean' },
		hasToolbar: { control: 'boolean' },
		isAutofocus: { control: 'boolean' },
		sizeScale: {
			control: { type: 'range', min: 50, max: 200, step: 10 },
			description: 'Масштаб размера (50–200%, по умолчанию 100)',
		},
		modelValue: { table: { disable: true } },
		'onUpdate:modelValue': { table: { disable: true } },
		onFocus: { table: { disable: true } },
		onBlur: { table: { disable: true } },
	},

	args: {
		placeholder: 'Начните вводить текст...',
		variant: 'default',
		isReadonly: false,
		hasToolbar: true,
		isAutofocus: false,
		sizeScale: 100,
	},
}

export default meta
type Story = StoryObj<typeof BaseEditor>

/** Базовый редактор */
export const Default: Story = {
	render: args => ({
		components: { BaseEditor },
		setup() {
			const content = ref('<p>Привет, <strong>мир</strong>!</p>')
			return { args, content }
		},
		template: '<BaseEditor v-model="content" v-bind="args" />',
	}),
}

/** Без панели инструментов */
export const NoToolbar: Story = {
	args: {
		hasToolbar: false,
	},
	render: args => ({
		components: { BaseEditor },
		setup() {
			const content = ref('<p>Простой текст</p>')
			return { args, content }
		},
		template: '<BaseEditor v-model="content" v-bind="args" />',
	}),
}

/** Только чтение */
export const Readonly: Story = {
	args: {
		isReadonly: true,
	},
	render: args => ({
		components: { BaseEditor },
		setup() {
			const content = ref('<p>Только для чтения</p>')
			return { args, content }
		},
		template: '<BaseEditor v-model="content" v-bind="args" />',
	}),
}

/** Все варианты */
export const Variants: Story = {
	render: args => ({
		components: { BaseEditor },
		setup() {
			const content = ref('')
			return { args, content }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:40px;">
				<div v-for="v in ['default','ghost','outline','shadow','soft']" :key="v">
					<p style="margin-bottom:8px;font-size:12px;color:var(--color-text-muted);">Variant: {{ v }}</p>
					<BaseEditor v-model="content" v-bind="args" :variant="v" />
				</div>
			</div>
		`,
	}),
}

/** Интерактивный */
export const Interactive: Story = {
	render: args => ({
		components: { BaseEditor },
		setup() {
			const content = ref('')
			return { args, content }
		},
		template: `
			<div>
				<BaseEditor v-model="content" v-bind="args" />
				<p style="margin-top:8px;color:var(--color-text-muted);font-size:12px;">HTML: {{ content }}</p>
			</div>
		`,
	}),
}
