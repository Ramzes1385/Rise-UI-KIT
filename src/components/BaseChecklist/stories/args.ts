import { fn } from 'storybook/test'
import { ONBOARDING } from './shared'
import type { Meta } from '@storybook/vue3-vite'
import type BaseChecklist from '../ui/BaseChecklist.vue'

export const args = {
	items: ONBOARDING,
	completed: ['install'],
	title: undefined,
	isDisabled: false,
	variant: 'default',
	sizeScale: 100,
	'onUpdate:completed': fn(),
	onAction: fn(),
} satisfies Meta<typeof BaseChecklist>['args']
