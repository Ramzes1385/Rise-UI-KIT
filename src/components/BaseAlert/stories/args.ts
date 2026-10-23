import { MESSAGES } from './shared'
import { fn } from 'storybook/test'
import type BaseAlert from '../ui/BaseAlert.vue'
import type { Meta } from '@storybook/vue3-vite'

export const args = {
	type: 'info',
	variant: 'default',
	title: MESSAGES.info.title,
	description: MESSAGES.info.description,
	isClosable: false,
	sizeScale: 100,
	onClose: fn(),
} satisfies Meta<typeof BaseAlert>['args']
