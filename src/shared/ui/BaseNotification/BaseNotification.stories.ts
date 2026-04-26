/**
 * Stories для компонента BaseNotification.
 * Демонстрирует все типы уведомлений.
 */

import type { Meta, StoryObj } from '@storybook/vue3'

import BaseNotification from './BaseNotification.vue'

const meta: Meta<typeof BaseNotification> = {
	title: 'UI/BaseNotification',
	component: BaseNotification,

	argTypes: {
		title: { control: 'text' },
		description: { control: 'text' },
		type: {
			control: 'inline-radio',
			options: ['success', 'error', 'warning', 'info'],
		},
		duration: { control: 'number' },
		onClose: { table: { disable: true } },
	},

	args: {
		title: 'Уведомление',
		description: 'Описание уведомления',
		type: 'info',
	},
}

export default meta
type Story = StoryObj<typeof BaseNotification>

/** Базовое уведомление */
export const Default: Story = {}

/** Все типы */
export const Types: Story = {
	render: args => ({
		components: { BaseNotification },
		setup() {
			return { args }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:12px;max-width:400px;">
				<BaseNotification v-for="t in ['success','error','warning','info']"
					:key="t"
					v-bind="args"
					:type="t"
					:title="t"
				/>
			</div>
		`,
	}),
}

/** Только заголовок */
export const TitleOnly: Story = {
	args: {
		title: 'Сохранено',
		description: '',
		type: 'success',
	},
}

/** С описанием */
export const WithDescription: Story = {
	args: {
		title: 'Ошибка',
		description: 'Не удалось сохранить изменения. Попробуйте позже.',
		type: 'error',
	},
}

/** Интерактивное */
export const Interactive: Story = {}
