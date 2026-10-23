import { fn } from 'storybook/test'
import type { Meta } from '@storybook/vue3-vite'
import type BaseConfirm from '../ui/BaseConfirm.vue'

export const args = {
	isOpen: false,
	title: 'Опубликовать серию?',
	description: 'Серия 3 станет доступна подписчикам сообщества, они получат уведомление.',
	confirmLabel: 'Опубликовать',
	cancelLabel: 'Отмена',
	isDanger: false,
	variant: 'default',
	sizeScale: 100,
	onClose: fn(),
	onConfirm: fn(),
	onCancel: fn(),
	'onUpdate:isOpen': fn(),
} satisfies Meta<typeof BaseConfirm>['args']
