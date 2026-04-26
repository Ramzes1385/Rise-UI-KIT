/**
 * Stories для компонента BasePagination.
 * Демонстрирует все варианты и состояния.
 */

import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'

import BasePagination from './BasePagination.vue'

const meta: Meta<typeof BasePagination> = {
	title: 'UI/BasePagination',
	component: BasePagination,

	argTypes: {
		total: { control: 'number' },
		pageSize: { control: 'number' },
		maxVisible: { control: 'number' },
		variant: {
			control: 'inline-radio',
			options: ['default', 'arrows'],
		},
		sizeScale: {
			control: 'number',
			description: 'Масштаб размера (100 = 100%, 150 = 150%, 75 = 75%)',
		},
		modelValue: { table: { disable: true } },
		'onUpdate:modelValue': { table: { disable: true } },
		onChange: { table: { disable: true } },
	},

	args: {
		total: 100,
		pageSize: 10,
		maxVisible: 5,
		variant: 'default',
		sizeScale: 100,
	},
}

export default meta
type Story = StoryObj<typeof BasePagination>

/** Базовая пагинация */
export const Default: Story = {
	render: args => ({
		components: { BasePagination },
		setup() {
			const page = ref(1)
			return { args, page }
		},
		template: '<BasePagination v-model="page" v-bind="args" />',
	}),
}

/** Вариант со стрелками */
export const Arrows: Story = {
	args: {
		variant: 'arrows',
	},
	render: args => ({
		components: { BasePagination },
		setup() {
			const page = ref(1)
			return { args, page }
		},
		template: '<BasePagination v-model="page" v-bind="args" />',
	}),
}

/** Мало элементов */
export const FewPages: Story = {
	args: {
		total: 25,
		pageSize: 10,
	},
	render: args => ({
		components: { BasePagination },
		setup() {
			const page = ref(1)
			return { args, page }
		},
		template: '<BasePagination v-model="page" v-bind="args" />',
	}),
}

/** Интерактивная */
export const Interactive: Story = {
	render: args => ({
		components: { BasePagination },
		setup() {
			const page = ref(1)
			return { args, page }
		},
		template: `
			<div>
				<BasePagination v-model="page" v-bind="args" />
				<p style="margin-top:8px;color:var(--color-text-muted);">Страница: {{ page }}</p>
			</div>
		`,
	}),
}
