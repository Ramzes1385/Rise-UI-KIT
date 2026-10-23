import { MESSAGES } from './shared'
import type { Meta } from '@storybook/vue3-vite'
import type BaseResult from '../ui/BaseResult.vue'

export const args = {
	status: 'success',
	variant: 'default',
	title: MESSAGES.success.title,
	description: MESSAGES.success.description,
	titleTag: 'h2',
	isLive: false,
	sizeScale: 100,
} satisfies Meta<typeof BaseResult>['args']
