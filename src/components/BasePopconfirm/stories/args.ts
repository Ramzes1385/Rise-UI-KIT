import { fn } from 'storybook/test'
import type { Meta } from '@storybook/vue3-vite'
import type BasePopconfirm from '../ui/BasePopconfirm.vue'

export const args = {
	title: 'Снять серию с публикации?',
	description: 'Подписчики перестанут её видеть. Вернуть можно в любой момент.',
	confirmLabel: 'Снять',
	position: 'top',
	isDanger: false,
	variant: 'default',
	sizeScale: 100,
	onConfirm: fn(),
	onCancel: fn(),
} satisfies Meta<typeof BasePopconfirm>['args']
