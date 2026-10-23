import { fn } from 'storybook/test'
import { REASONING_SAMPLE } from './shared'
import type { Meta } from '@storybook/vue3-vite'
import type BaseReasoning from '../ui/BaseReasoning.vue'

export const args = {
	content: REASONING_SAMPLE,
	isStreaming: false,
	duration: 12,
	isOpen: false,
	hasAutoToggle: true,
	variant: 'default',
	sizeScale: 100,
	'onUpdate:isOpen': fn(),
} satisfies Meta<typeof BaseReasoning>['args']
