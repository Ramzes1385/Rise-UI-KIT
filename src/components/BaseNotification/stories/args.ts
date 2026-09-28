import { fn } from 'storybook/test'
import { STORY_DURATION } from './shared'
import type { Meta } from '@storybook/vue3-vite'
import type BaseNotification from '../ui/BaseNotification.vue'

export const args = {
	title: 'Изменения сохранены',
	description: 'Проект «Сайт студии» обновлён.',
	type: 'success',
	variant: 'default',
	position: 'top-right',
	duration: STORY_DURATION,
	sizeScale: 100,
	isPersistent: false,
	isContained: true,
	onClose: fn(),
	onRemove: fn(),
} satisfies Meta<typeof BaseNotification>['args']
